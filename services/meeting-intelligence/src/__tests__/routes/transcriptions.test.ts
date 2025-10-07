/**
 * Tests for transcriptions routes
 * Tests transcription API endpoints, validation, and error handling
 */

import express from 'express';
import request from 'supertest';
import { authMiddleware } from '../../middleware/auth';
import transcriptionsRouter from '../../routes/transcriptions';
import { logger } from '../../utils/logger';

// Mock dependencies
jest.mock('../../middleware/auth');
jest.mock('../../utils/logger', () => ({
  logger: {
    info: jest.fn(),
    error: jest.fn(),
    warn: jest.fn(),
    debug: jest.fn(),
  },
}));

const mockAuthMiddleware = authMiddleware as jest.MockedFunction<
  typeof authMiddleware
>;

describe('Transcriptions Routes', () => {
  let app: express.Application;

  beforeEach(() => {
    app = express();
    app.use(express.json({ limit: '50mb' }));

    // Mock auth middleware to pass through
    mockAuthMiddleware.mockImplementation(async (req, res, next) => {
      req.user = {
        id: 'test-user-id',
        email: 'test@example.com',
        role: 'user',
      };
      next();
    });

    app.use('/api/v1/transcriptions', authMiddleware, transcriptionsRouter);
    jest.clearAllMocks();
  });

  describe('POST /api/v1/transcriptions/process', () => {
    it('should process meeting recording and generate transcription', async () => {
      const processData = {
        meetingId: 'test-meeting-id',
        audioUrl: 'https://example.com/audio.wav',
        language: 'en',
      };

      const response = await request(app)
        .post('/api/v1/transcriptions/process')
        .send(processData)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeDefined();
    });

    it('should handle missing meeting ID', async () => {
      const processData = {
        audioUrl: 'https://example.com/audio.wav',
        language: 'en',
      };

      const response = await request(app)
        .post('/api/v1/transcriptions/process')
        .send(processData)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toContain('ValidationError');
    });

    it('should validate audio URL format', async () => {
      const processData = {
        meetingId: 'test-meeting-id',
        audioUrl: 'invalid-url',
        language: 'en',
      };

      const response = await request(app)
        .post('/api/v1/transcriptions/process')
        .send(processData)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toContain('ValidationError');
    });

    it('should validate language parameter', async () => {
      const processData = {
        meetingId: 'test-meeting-id',
        audioUrl: 'https://example.com/audio.wav',
        language: 'invalid-language',
      };

      const response = await request(app)
        .post('/api/v1/transcriptions/process')
        .send(processData)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toContain('ValidationError');
    });
  });

  describe('GET /api/v1/transcriptions/meeting/:meetingId', () => {
    it('should get transcription for meeting', async () => {
      const meetingId = 'test-meeting-id';

      const response = await request(app)
        .get(`/api/v1/transcriptions/meeting/${meetingId}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeDefined();
    });

    it('should handle meeting not found', async () => {
      const meetingId = 'non-existent-meeting-id';

      const response = await request(app)
        .get(`/api/v1/transcriptions/meeting/${meetingId}`)
        .expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toContain('Meeting not found');
    });

    it('should validate meeting ID format', async () => {
      const response = await request(app)
        .get('/api/v1/transcriptions/meeting/not-a-uuid')
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toContain('Invalid meeting ID format');
    });
  });

  describe('Error handling', () => {
    it('should handle malformed JSON', async () => {
      const response = await request(app)
        .post('/api/v1/transcriptions/process')
        .set('Content-Type', 'application/json')
        .send('invalid json')
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toContain('Invalid JSON');
    });
  });

  describe('Authentication', () => {
    it('should require authentication for all endpoints', async () => {
      // Mock auth middleware to reject
      mockAuthMiddleware.mockImplementationOnce(async (req, res, _next) => {
        res.status(401).json({ error: 'Unauthorized' });
      });

      await request(app)
        .get('/api/v1/transcriptions/meeting/test-meeting-id')
        .expect(401);
    });

    it('should pass user context to handlers', async () => {
      const processData = {
        meetingId: 'test-meeting-id',
        audioUrl: 'https://example.com/audio.wav',
        language: 'en',
      };

      await request(app)
        .post('/api/v1/transcriptions/process')
        .send(processData)
        .expect(201);

      // Verify user context was passed
      expect(mockAuthMiddleware).toHaveBeenCalled();
    });
  });

  describe('Logging', () => {
    it('should log successful operations', async () => {
      const processData = {
        meetingId: 'test-meeting-id',
        audioUrl: 'https://example.com/audio.wav',
        language: 'en',
      };

      await request(app)
        .post('/api/v1/transcriptions/process')
        .send(processData)
        .expect(201);

      expect(logger.info).toHaveBeenCalledWith(
        'Transcription processing started',
        expect.objectContaining({
          userId: 'test-user-id',
          meetingId: 'test-meeting-id',
        })
      );
    });

    it('should log errors with context', async () => {
      await request(app)
        .get('/api/v1/transcriptions/meeting/invalid-id')
        .expect(400);

      expect(logger.error).toHaveBeenCalledWith(
        'Transcription retrieval failed',
        expect.objectContaining({
          error: expect.any(String),
          meetingId: 'invalid-id',
        })
      );
    });
  });
});
