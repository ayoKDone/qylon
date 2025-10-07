import axios, { AxiosInstance } from 'axios';
import { logger } from '../utils/logger';

interface EventPayload {
  aggregateId: string;
  aggregateType: string;
  eventType: string;
  eventData: Record<string, any>;
  userId: string;
  correlationId?: string;
  causationId?: string;
  metadata?: Record<string, any>;
}

export class EventBusService {
  private eventSourcingClient: AxiosInstance;

  constructor() {
    this.eventSourcingClient = axios.create({
      baseURL: process.env.EVENT_SOURCING_URL || 'http://localhost:3009',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${process.env.INTER_SERVICE_TOKEN}`,
        'User-Agent': 'Qylon-MeetingIntelligence/1.0.0',
      },
    });

    // Add request interceptor for logging
    this.eventSourcingClient.interceptors.request.use(
      config => {
        logger.debug('Publishing event to Event Sourcing', {
          url: config.url,
          method: config.method,
          data: config.data,
        });
        return config;
      },
      error => {
        logger.error('Event Sourcing API request error', {
          error: error.message,
        });
        return Promise.reject(error);
      }
    );

    // Add response interceptor for logging
    this.eventSourcingClient.interceptors.response.use(
      response => {
        logger.debug('Event Sourcing API response', {
          status: response.status,
          url: response.config.url,
          data: response.data,
        });
        return response;
      },
      error => {
        logger.error('Event Sourcing API response error', {
          status: error.response?.status,
          url: error.config?.url,
          message: error.message,
          data: error.response?.data,
        });
        return Promise.reject(error);
      }
    );
  }

  private async publishEvent(payload: EventPayload): Promise<void> {
    try {
      const response = await this.eventSourcingClient.post(
        '/api/v1/events',
        payload
      );
      if (response.status !== 201) {
        throw new Error(`Failed to publish event: ${response.statusText}`);
      }
      logger.info('Event published successfully to Event Sourcing', {
        eventId: response.data.event.id,
        eventType: payload.eventType,
        aggregateId: payload.aggregateId,
      });
    } catch (error: any) {
      logger.error('Error publishing event to Event Sourcing', {
        eventType: payload.eventType,
        aggregateId: payload.aggregateId,
        error: error.message,
        details: error.response?.data,
      });
      throw error;
    }
  }

  async publishMeetingEvent(
    eventType: string,
    meetingId: string,
    eventData: Record<string, any>,
    userId: string,
    correlationId?: string,
    causationId?: string,
    metadata?: Record<string, any>
  ): Promise<void> {
    await this.publishEvent({
      aggregateId: meetingId,
      aggregateType: 'meeting',
      eventType,
      eventData,
      userId,
      correlationId,
      causationId,
      metadata,
    });
  }

  async publishTranscriptionEvent(
    eventType: string,
    transcriptId: string,
    eventData: Record<string, any>,
    userId: string,
    correlationId?: string,
    causationId?: string,
    metadata?: Record<string, any>
  ): Promise<void> {
    await this.publishEvent({
      aggregateId: transcriptId,
      aggregateType: 'transcript',
      eventType,
      eventData,
      userId,
      correlationId,
      causationId,
      metadata,
    });
  }

  async publishBotEvent(
    eventType: string,
    botId: string,
    eventData: Record<string, any>,
    userId: string,
    correlationId?: string,
    causationId?: string,
    metadata?: Record<string, any>
  ): Promise<void> {
    await this.publishEvent({
      aggregateId: botId,
      aggregateType: 'bot',
      eventType,
      eventData,
      userId,
      correlationId,
      causationId,
      metadata,
    });
  }
}
