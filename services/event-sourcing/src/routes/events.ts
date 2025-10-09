import { Request, Response, Router } from 'express';
import { asyncHandler } from '../middleware/errorHandler';
import { AggregateTypes, QylonEventTypes } from '../models/Event';
import { EventBuilder, SupabaseEventStore } from '../services/EventStore';
import { EventSubscriber } from '../services/EventSubscriber';
import { logger } from '../utils/logger';

const router: Router = Router();
const eventStore = new SupabaseEventStore();

// EventSubscriber will be injected from the main service
let eventSubscriber: EventSubscriber | null = null;

export function setEventSubscriber(subscriber: EventSubscriber): void {
  eventSubscriber = subscriber;
}

// Create event
router.post(
  '/',
  asyncHandler(async (req: Request, res: Response): Promise<void> => {
    try {
      const {
        aggregateId,
        aggregateType,
        eventType,
        eventData,
        eventVersion,
        correlationId,
        causationId,
        metadata,
      } = req.body;

      const userId = (req as any).user?.id;

      if (!userId) {
        res.status(401).json({
          error: 'Unauthorized',
          message: 'User ID not found',
          timestamp: new Date().toISOString(),
        });
        return;
      }

      if (!aggregateId || !aggregateType || !eventType || !eventData) {
        res.status(400).json({
          error: 'Bad Request',
          message: 'Missing required fields: aggregateId, aggregateType, eventType, eventData',
          timestamp: new Date().toISOString(),
        });
        return;
      }

      // Validate event type
      if (!Object.values(QylonEventTypes).includes(eventType as QylonEventTypes)) {
        res.status(400).json({
          error: 'Bad Request',
          message: 'Invalid event type',
          timestamp: new Date().toISOString(),
        });
        return;
      }

      // Validate aggregate type
      if (!Object.values(AggregateTypes).includes(aggregateType)) {
        res.status(400).json({
          error: 'Bad Request',
          message: 'Invalid aggregate type',
          timestamp: new Date().toISOString(),
        });
        return;
      }

      const event = new EventBuilder()
        .withAggregate(aggregateId, aggregateType)
        .withEventType(eventType)
        .withEventData(eventData)
        .withUser(userId)
        .withVersion(eventVersion || 1);

      if (correlationId) {
        event.withCorrelation(correlationId, causationId);
      }

      if (metadata) {
        event.withMetadata(metadata);
      }

      const builtEvent = event.build();
      await eventStore.saveEvent(builtEvent);

      // Trigger workflow automation if EventSubscriber is available
      if (eventSubscriber) {
        try {
          await eventSubscriber.processEvent(builtEvent);
        } catch (error: any) {
          logger.error('Failed to process event for workflow triggers', {
            eventId: builtEvent.id,
            eventType: builtEvent.eventType,
            error: error.message,
          });
          // Don't fail the event creation if workflow processing fails
        }
      }

      logger.info('Event created successfully', {
        eventId: builtEvent.id,
        aggregateId,
        eventType,
        userId,
      });

      res.status(201).json({
        success: true,
        event: {
          id: builtEvent.id,
          aggregateId: builtEvent.aggregateId,
          aggregateType: builtEvent.aggregateType,
          eventType: builtEvent.eventType,
          eventVersion: builtEvent.eventVersion,
          timestamp: builtEvent.timestamp,
          correlationId: builtEvent.correlationId,
        },
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      logger.error('Event creation error', {
        error: error instanceof Error ? error.message : 'Unknown error',
        userId: (req as any).user?.id,
      });
      throw error;
    }
  }),
);

// Get events for an aggregate
router.get(
  '/aggregate/:aggregateId',
  asyncHandler(async (req: Request, res: Response): Promise<void> => {
    try {
      const { aggregateId } = req.params;
      const { fromVersion } = req.query;
      const userId = (req as any).user?.id;

      if (!userId) {
        res.status(401).json({
          error: 'Unauthorized',
          message: 'User ID not found',
          timestamp: new Date().toISOString(),
        });
        return;
      }

      const events = await eventStore.getEvents(
        aggregateId,
        fromVersion ? parseInt(fromVersion as string) : 0,
      );

      logger.info('Events retrieved for aggregate', {
        aggregateId,
        fromVersion,
        count: events.length,
        userId,
      });

      res.status(200).json({
        success: true,
        aggregateId,
        events: events.map(event => ({
          id: event.id,
          eventType: event.eventType,
          eventData: event.eventData,
          eventVersion: event.eventVersion,
          timestamp: event.timestamp,
          correlationId: event.correlationId,
        })),
        count: events.length,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      logger.error('Get events error', {
        aggregateId: req.params.aggregateId,
        error: error instanceof Error ? error.message : 'Unknown error',
        userId: (req as any).user?.id,
      });
      throw error;
    }
  }),
);

// Get events by type
router.get(
  '/type/:eventType',
  asyncHandler(async (req: Request, res: Response): Promise<void> => {
    try {
      const { eventType } = req.params;
      const { limit } = req.query;
      const userId = (req as any).user?.id;

      if (!userId) {
        res.status(401).json({
          error: 'Unauthorized',
          message: 'User ID not found',
          timestamp: new Date().toISOString(),
        });
        return;
      }

      // Validate event type
      if (!Object.values(QylonEventTypes).includes(eventType as QylonEventTypes)) {
        res.status(400).json({
          error: 'Bad Request',
          message: 'Invalid event type',
          timestamp: new Date().toISOString(),
        });
        return;
      }

      const events = await eventStore.getEventsByType(
        eventType,
        limit ? parseInt(limit as string) : 100,
      );

      logger.info('Events retrieved by type', {
        eventType,
        limit,
        count: events.length,
        userId,
      });

      res.status(200).json({
        success: true,
        eventType,
        events: events.map(event => ({
          id: event.id,
          aggregateId: event.aggregateId,
          aggregateType: event.aggregateType,
          eventData: event.eventData,
          eventVersion: event.eventVersion,
          timestamp: event.timestamp,
          correlationId: event.correlationId,
        })),
        count: events.length,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      logger.error('Get events by type error', {
        eventType: req.params.eventType,
        error: error instanceof Error ? error.message : 'Unknown error',
        userId: (req as any).user?.id,
      });
      throw error;
    }
  }),
);

// Get events by correlation ID
router.get(
  '/correlation/:correlationId',
  asyncHandler(async (req: Request, res: Response): Promise<void> => {
    try {
      const { correlationId } = req.params;
      const userId = (req as any).user?.id;

      if (!userId) {
        res.status(401).json({
          error: 'Unauthorized',
          message: 'User ID not found',
          timestamp: new Date().toISOString(),
        });
        return;
      }

      const events = await eventStore.getEventsByCorrelationId(correlationId);

      logger.info('Events retrieved by correlation ID', {
        correlationId,
        count: events.length,
        userId,
      });

      res.status(200).json({
        success: true,
        correlationId,
        events: events.map(event => ({
          id: event.id,
          aggregateId: event.aggregateId,
          aggregateType: event.aggregateType,
          eventType: event.eventType,
          eventData: event.eventData,
          eventVersion: event.eventVersion,
          timestamp: event.timestamp,
        })),
        count: events.length,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      logger.error('Get events by correlation ID error', {
        correlationId: req.params.correlationId,
        error: error instanceof Error ? error.message : 'Unknown error',
        userId: (req as any).user?.id,
      });
      throw error;
    }
  }),
);

// Get available event types
router.get(
  '/types',
  asyncHandler(async (req: Request, res: Response): Promise<void> => {
    try {
      const userId = (req as any).user?.id;

      if (!userId) {
        res.status(401).json({
          error: 'Unauthorized',
          message: 'User ID not found',
          timestamp: new Date().toISOString(),
        });
        return;
      }

      res.status(200).json({
        success: true,
        eventTypes: Object.values(QylonEventTypes),
        aggregateTypes: Object.values(AggregateTypes),
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      logger.error('Get event types error', {
        error: error instanceof Error ? error.message : 'Unknown error',
        userId: (req as any).user?.id,
      });
      throw error;
    }
  }),
);

export default router;
