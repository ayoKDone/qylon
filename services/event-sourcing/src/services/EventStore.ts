import { createClient } from '@supabase/supabase-js';
import { Event, EventStore as IEventStore } from '../models/Event';
import { logger } from '../../utils/logger';
import { v4 as uuidv4 } from 'uuid';

export class SupabaseEventStore implements IEventStore {
  private supabase;

  constructor() {
    this.supabase = createClient(
      process.env.SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );
  }

  async saveEvent(event: Event): Promise<void> {
    try {
      const eventRecord = {
        id: event.id,
        aggregate_id: event.aggregateId,
        aggregate_type: event.aggregateType,
        event_type: event.eventType,
        event_data: event.eventData,
        event_version: event.eventVersion,
        timestamp: event.timestamp.toISOString(),
        user_id: event.userId,
        correlation_id: event.correlationId,
        causation_id: event.causationId,
        metadata: event.metadata,
      };

      const { error } = await this.supabase.from('events').insert(eventRecord);

      if (error) {
        logger.error('Failed to save event', {
          eventId: event.id,
          aggregateId: event.aggregateId,
          eventType: event.eventType,
          error: error.message,
        });
        throw new Error(`Failed to save event: ${error.message}`);
      }

      logger.info('Event saved successfully', {
        eventId: event.id,
        aggregateId: event.aggregateId,
        eventType: event.eventType,
        version: event.eventVersion,
      });
    } catch (error) {
      logger.error('Event save error', {
        eventId: event.id,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      throw error;
    }
  }

  async getEvents(
    aggregateId: string,
    fromVersion: number = 0
  ): Promise<Event[]> {
    try {
      const { data, error } = await this.supabase
        .from('events')
        .select('*')
        .eq('aggregate_id', aggregateId)
        .gte('event_version', fromVersion)
        .order('event_version', { ascending: true });

      if (error) {
        logger.error('Failed to get events', {
          aggregateId,
          fromVersion,
          error: error.message,
        });
        throw new Error(`Failed to get events: ${error.message}`);
      }

      const events = data?.map(this.mapToEvent) || [];

      logger.info('Events retrieved', {
        aggregateId,
        fromVersion,
        count: events.length,
      });

      return events;
    } catch (error) {
      logger.error('Get events error', {
        aggregateId,
        fromVersion,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      throw error;
    }
  }

  async getEventsByType(
    eventType: string,
    limit: number = 100
  ): Promise<Event[]> {
    try {
      const { data, error } = await this.supabase
        .from('events')
        .select('*')
        .eq('event_type', eventType)
        .order('timestamp', { ascending: false })
        .limit(limit);

      if (error) {
        logger.error('Failed to get events by type', {
          eventType,
          limit,
          error: error.message,
        });
        throw new Error(`Failed to get events by type: ${error.message}`);
      }

      const events = data?.map(this.mapToEvent) || [];

      logger.info('Events by type retrieved', {
        eventType,
        limit,
        count: events.length,
      });

      return events;
    } catch (error) {
      logger.error('Get events by type error', {
        eventType,
        limit,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      throw error;
    }
  }

  async getEventsByCorrelationId(correlationId: string): Promise<Event[]> {
    try {
      const { data, error } = await this.supabase
        .from('events')
        .select('*')
        .eq('correlation_id', correlationId)
        .order('timestamp', { ascending: true });

      if (error) {
        logger.error('Failed to get events by correlation ID', {
          correlationId,
          error: error.message,
        });
        throw new Error(
          `Failed to get events by correlation ID: ${error.message}`
        );
      }

      const events = data?.map(this.mapToEvent) || [];

      logger.info('Events by correlation ID retrieved', {
        correlationId,
        count: events.length,
      });

      return events;
    } catch (error) {
      logger.error('Get events by correlation ID error', {
        correlationId,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      throw error;
    }
  }

  private mapToEvent(record: any): Event {
    return {
      id: record.id,
      aggregateId: record.aggregate_id,
      aggregateType: record.aggregate_type,
      eventType: record.event_type,
      eventData: record.event_data,
      eventVersion: record.event_version,
      timestamp: new Date(record.timestamp),
      userId: record.user_id,
      correlationId: record.correlation_id,
      causationId: record.causation_id,
      metadata: record.metadata,
    };
  }
}

export class EventBuilder {
  private event: Partial<Event>;

  constructor() {
    this.event = {
      id: uuidv4(),
      eventVersion: 1,
      timestamp: new Date(),
    };
  }

  withAggregate(aggregateId: string, aggregateType: string): EventBuilder {
    this.event.aggregateId = aggregateId;
    this.event.aggregateType = aggregateType;
    return this;
  }

  withEventType(eventType: string): EventBuilder {
    this.event.eventType = eventType;
    return this;
  }

  withEventData(eventData: Record<string, any>): EventBuilder {
    this.event.eventData = eventData;
    return this;
  }

  withVersion(version: number): EventBuilder {
    this.event.eventVersion = version;
    return this;
  }

  withUser(userId: string): EventBuilder {
    this.event.userId = userId;
    return this;
  }

  withCorrelation(correlationId: string, causationId?: string): EventBuilder {
    this.event.correlationId = correlationId;
    this.event.causationId = causationId;
    return this;
  }

  withMetadata(metadata: Record<string, any>): EventBuilder {
    this.event.metadata = metadata;
    return this;
  }

  build(): Event {
    if (
      !this.event.aggregateId ||
      !this.event.aggregateType ||
      !this.event.eventType ||
      !this.event.userId
    ) {
      throw new Error('Missing required event fields');
    }

    return this.event as Event;
  }
}
