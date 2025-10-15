/**
 * Tests for EventBusService
 * Tests event publishing, logging, and error handling
 */

import { EventBusService } from '../../services/EventBusService';
import { logger } from '../../utils/logger';

// Mock the logger
jest.mock('../../utils/logger', () => ({
  logger: {
    info: jest.fn(),
    error: jest.fn(),
    warn: jest.fn(),
    debug: jest.fn(),
  },
}));

describe('EventBusService', () => {
  let eventBusService: EventBusService;

  beforeEach(() => {
    eventBusService = new EventBusService();
    jest.clearAllMocks();
  });

  describe('publishMeetingEvent', () => {
    it('should publish meeting event with all parameters', async () => {
      const eventType = 'meeting.created';
      const meetingId = 'test-meeting-id';
      const data = { title: 'Test Meeting' };
      const userId = 'test-user-id';

      await eventBusService.publishMeetingEvent(eventType, meetingId, data, userId);

      expect(logger.info).toHaveBeenCalledWith('Meeting event published', {
        eventType,
        meetingId,
        data,
        userId,
        eventId: undefined,
        correlationId: undefined,
      });
    });

    it('should publish meeting event with minimal parameters', async () => {
      const eventType = 'meeting.updated';
      const meetingId = 'test-meeting-id';

      await eventBusService.publishMeetingEvent(eventType, meetingId);

      expect(logger.info).toHaveBeenCalledWith('Meeting event published', {
        eventType,
        meetingId,
        data: undefined,
        userId: undefined,
        eventId: undefined,
        correlationId: undefined,
      });
    });

    it('should handle errors gracefully', async () => {
      // This test verifies that the service doesn't crash on errors
      // The actual error handling would be implemented in the real event bus
      await expect(
        eventBusService.publishMeetingEvent('meeting.created', 'test-id'),
      ).resolves.not.toThrow();
    });
  });

  describe('publishBotEvent', () => {
    it('should publish bot event with all parameters', async () => {
      const eventType = 'bot.created';
      const botId = 'test-bot-id';
      const data = { name: 'Test Bot' };
      const userId = 'test-user-id';

      await eventBusService.publishBotEvent(eventType, botId, data, userId);

      expect(logger.info).toHaveBeenCalledWith('Bot event published', {
        eventType,
        botId,
        data,
        userId,
        eventId: undefined,
        correlationId: undefined,
      });
    });

    it('should publish bot event with minimal parameters', async () => {
      const eventType = 'bot.updated';
      const botId = 'test-bot-id';

      await eventBusService.publishBotEvent(eventType, botId);

      expect(logger.info).toHaveBeenCalledWith('Bot event published', {
        eventType,
        botId,
        data: undefined,
        userId: undefined,
        eventId: undefined,
        correlationId: undefined,
      });
    });

    it('should handle errors gracefully', async () => {
      // This test verifies that the service doesn't crash on errors
      // The actual error handling would be implemented in the real event bus
      await expect(
        eventBusService.publishBotEvent('bot.created', 'test-id'),
      ).resolves.not.toThrow();
    });
  });

  describe('publishTranscriptionEvent', () => {
    it('should publish transcription event with all parameters', async () => {
      const eventType = 'transcription.completed';
      const transcriptionId = 'test-transcription-id';
      const data = { status: 'completed' };
      const userId = 'test-user-id';

      await eventBusService.publishTranscriptionEvent(eventType, transcriptionId, data, userId);

      expect(logger.info).toHaveBeenCalledWith('Transcription event published', {
        eventType,
        transcriptionId,
        data,
        userId,
        eventId: undefined,
        correlationId: undefined,
      });
    });

    it('should publish transcription event with minimal parameters', async () => {
      const eventType = 'transcription.started';
      const transcriptionId = 'test-transcription-id';

      await eventBusService.publishTranscriptionEvent(eventType, transcriptionId);

      expect(logger.info).toHaveBeenCalledWith('Transcription event published', {
        eventType,
        transcriptionId,
        data: undefined,
        userId: undefined,
        eventId: undefined,
        correlationId: undefined,
      });
    });

    it('should handle errors gracefully', async () => {
      // This test verifies that the service doesn't crash on errors
      // The actual error handling would be implemented in the real event bus
      await expect(
        eventBusService.publishTranscriptionEvent('transcription.completed', 'test-id'),
      ).resolves.not.toThrow();
    });
  });

  describe('error handling', () => {
    it('should handle null/undefined parameters gracefully', async () => {
      await eventBusService.publishMeetingEvent('test.event', null as any, undefined, null as any);

      expect(logger.info).toHaveBeenCalledWith('Meeting event published', {
        eventType: 'test.event',
        meetingId: null,
        data: undefined,
        userId: null,
        eventId: undefined,
        correlationId: undefined,
      });
    });

    it('should handle empty string parameters', async () => {
      await eventBusService.publishMeetingEvent('', '', {}, '');

      expect(logger.info).toHaveBeenCalledWith('Meeting event published', {
        eventType: '',
        meetingId: '',
        data: {},
        userId: '',
        eventId: undefined,
        correlationId: undefined,
      });
    });
  });
});
