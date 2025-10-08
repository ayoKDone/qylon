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

// Mock the shared database module
jest.mock('../../config/database', () => {
  const mockQuery = {
    select: jest.fn().mockReturnThis(),
    insert: jest.fn().mockReturnThis(),
    update: jest.fn().mockReturnThis(),
    delete: jest.fn().mockReturnThis(),
    eq: jest.fn().mockReturnThis(),
    neq: jest.fn().mockReturnThis(),
    gt: jest.fn().mockReturnThis(),
    gte: jest.fn().mockReturnThis(),
    lt: jest.fn().mockReturnThis(),
    lte: jest.fn().mockReturnThis(),
    like: jest.fn().mockReturnThis(),
    ilike: jest.fn().mockReturnThis(),
    is: jest.fn().mockReturnThis(),
    in: jest.fn().mockReturnThis(),
    contains: jest.fn().mockReturnThis(),
    containedBy: jest.fn().mockReturnThis(),
    rangeGt: jest.fn().mockReturnThis(),
    rangeGte: jest.fn().mockReturnThis(),
    rangeLt: jest.fn().mockReturnThis(),
    rangeLte: jest.fn().mockReturnThis(),
    rangeAdjacent: jest.fn().mockReturnThis(),
    overlaps: jest.fn().mockReturnThis(),
    textSearch: jest.fn().mockReturnThis(),
    match: jest.fn().mockReturnThis(),
    order: jest.fn().mockReturnThis(),
    limit: jest.fn().mockReturnThis(),
    range: jest.fn().mockReturnThis(),
    single: jest.fn(),
    then: jest.fn(),
  };

  const mockClient = {
    from: jest.fn(() => mockQuery),
    auth: {
      getUser: jest.fn().mockResolvedValue({
        data: { user: { id: 'test-user-id', email: 'test@example.com' } },
        error: null,
      }),
    },
    mockQuery, // Expose for test setup
  };

  return {
    supabase: mockClient,
  };
});

const mockAuthMiddleware = authMiddleware as jest.MockedFunction<
  typeof authMiddleware
>;

describe('Transcriptions Routes', () => {
  let app: express.Application;
  let mockSupabaseClient: any;

  beforeEach(() => {
    app = express();
    app.use(express.json());

    // Get the mocked Supabase client from the database module
    const { supabase } = require('../../config/database');
    mockSupabaseClient = supabase;

    // Reset all mocks
    jest.clearAllMocks();

    // Mock auth middleware to pass through
    mockAuthMiddleware.mockImplementation(async (req, res, next) => {
      (req as any).user = {
        id: 'test-user-id',
        email: 'test@example.com',
        role: 'user',
      };
      next();
    });

    app.use('/api/v1/transcriptions', authMiddleware, transcriptionsRouter);
  });

  describe('POST /api/v1/transcriptions/process', () => {
    it('should process meeting recording and generate transcription', async () => {
      const processData = {
        meeting_id: 'test-meeting-id',
        recording_url: 'https://example.com/recording.mp3',
        language: 'en',
        options: {
          speaker_diarization: true,
          confidence_threshold: 0.8,
        },
      };

      const mockMeeting = {
        id: 'test-meeting-id',
        title: 'Test Meeting',
        client_id: 'test-client-id',
        clients: { user_id: 'test-user-id' },
      };

      const mockTranscription = {
        id: 'test-transcription-id',
        meeting_id: 'test-meeting-id',
        content: 'Test transcription content',
        language: 'en',
        confidence: 0.95,
        processing_status: 'in_progress',
      };

      // Mock successful meeting fetch
      mockSupabaseClient.mockQuery.single.mockResolvedValueOnce({
        data: mockMeeting,
        error: null,
      });

      // Mock successful meeting update
      mockSupabaseClient.mockQuery.eq.mockResolvedValue({
        data: mockMeeting,
        error: null,
      });

      // Mock successful transcription creation
      mockSupabaseClient.mockQuery.single.mockResolvedValueOnce({
        data: mockTranscription,
        error: null,
      });

      const response = await request(app)
        .post('/api/v1/transcriptions/process')
        .send(processData)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeDefined();
    });

    it('should handle missing meeting ID', async () => {
      const processData = {
        recording_url: 'https://example.com/recording.mp3',
        language: 'en',
      };

      const response = await request(app)
        .post('/api/v1/transcriptions/process')
        .send(processData)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('ValidationError');
    });

    it('should validate audio URL format', async () => {
      const processData = {
        meeting_id: 'test-meeting-id',
        recording_url: 'invalid-url',
        language: 'en',
      };

      const response = await request(app)
        .post('/api/v1/transcriptions/process')
        .send(processData)
        .expect(400);

      expect(response.body.success).toBe(false);
    });

    it('should validate language parameter', async () => {
      const processData = {
        meeting_id: 'test-meeting-id',
        recording_url: 'https://example.com/recording.mp3',
        language: 'invalid-language',
      };

      const response = await request(app)
        .post('/api/v1/transcriptions/process')
        .send(processData)
        .expect(400);

      expect(response.body.success).toBe(false);
    });
  });

  describe('GET /api/v1/transcriptions/meeting/:meetingId', () => {
    it('should get transcription for meeting', async () => {
      const meetingId = 'test-meeting-id';
      const mockMeeting = {
        id: meetingId,
        title: 'Test Meeting',
        client_id: 'test-client-id',
        clients: { user_id: 'test-user-id' },
      };

      const mockTranscription = {
        id: 'test-transcription-id',
        meeting_id: meetingId,
        content: 'Test transcription content',
        language: 'en',
        confidence: 0.95,
        processing_status: 'completed',
      };

      // Mock successful meeting fetch
      mockSupabaseClient.mockQuery.single.mockResolvedValueOnce({
        data: mockMeeting,
        error: null,
      });

      // Mock successful transcription fetch
      mockSupabaseClient.mockQuery.single.mockResolvedValueOnce({
        data: mockTranscription,
        error: null,
      });

      const response = await request(app)
        .get(`/api/v1/transcriptions/meeting/${meetingId}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeDefined();
    });

    it('should handle meeting not found', async () => {
      const meetingId = 'non-existent-meeting-id';

      // Mock meeting not found
      mockSupabaseClient.mockQuery.single.mockResolvedValue({
        data: null,
        error: { message: 'Meeting not found' },
      });

      const response = await request(app)
        .get(`/api/v1/transcriptions/meeting/${meetingId}`)
        .expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('NotFound');
    });

    it('should validate meeting ID format', async () => {
      const response = await request(app)
        .get('/api/v1/transcriptions/meeting/not-a-uuid')
        .expect(404);

      expect(response.body.success).toBe(false);
    });
  });

  describe('Error handling', () => {
    it('should handle malformed JSON', async () => {
      const response = await request(app)
        .post('/api/v1/transcriptions/process')
        .set('Content-Type', 'application/json')
        .send('{"invalid": json}')
        .expect(400);

      expect(response.body.success).toBe(false);
    });
  });

  describe('Authentication', () => {
    it('should require authentication for all endpoints', async () => {
      // Mock auth middleware to reject
      mockAuthMiddleware.mockImplementation(async (req, res, _next) => {
        res.status(401).json({
          error: 'Unauthorized',
          message: 'Authentication required',
        });
      });

      await request(app)
        .post('/api/v1/transcriptions/process')
        .send({
          meeting_id: 'test-meeting-id',
          recording_url: 'https://example.com/recording.mp3',
        })
        .expect(401);
    });

    it('should pass user context to handlers', async () => {
      const processData = {
        meeting_id: 'test-meeting-id',
        recording_url: 'https://example.com/recording.mp3',
        language: 'en',
      };

      const mockMeeting = {
        id: 'test-meeting-id',
        title: 'Test Meeting',
        client_id: 'test-client-id',
        clients: { user_id: 'test-user-id' },
      };

      // Mock successful responses
      mockSupabaseClient.mockQuery.single.mockResolvedValueOnce({
        data: mockMeeting,
        error: null,
      });

      mockSupabaseClient.mockQuery.eq.mockResolvedValue({
        data: mockMeeting,
        error: null,
      });

      mockSupabaseClient.mockQuery.single.mockResolvedValueOnce({
        data: {
          id: 'test-transcription-id',
          meeting_id: 'test-meeting-id',
          content: 'Test transcription content',
          language: 'en',
          confidence: 0.95,
          processing_status: 'in_progress',
        },
        error: null,
      });

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
        meeting_id: 'test-meeting-id',
        recording_url: 'https://example.com/recording.mp3',
        language: 'en',
      };

      const mockMeeting = {
        id: 'test-meeting-id',
        title: 'Test Meeting',
        client_id: 'test-client-id',
        clients: { user_id: 'test-user-id' },
      };

      // Mock successful responses
      mockSupabaseClient.mockQuery.single.mockResolvedValueOnce({
        data: mockMeeting,
        error: null,
      });

      mockSupabaseClient.mockQuery.eq.mockResolvedValue({
        data: mockMeeting,
        error: null,
      });

      mockSupabaseClient.mockQuery.single.mockResolvedValueOnce({
        data: {
          id: 'test-transcription-id',
          meeting_id: 'test-meeting-id',
          content: 'Test transcription content',
          language: 'en',
          confidence: 0.95,
          processing_status: 'in_progress',
        },
        error: null,
      });

      await request(app)
        .post('/api/v1/transcriptions/process')
        .send(processData)
        .expect(201);

      expect(logger.info).toHaveBeenCalledWith(
        'Transcription processing started',
        expect.objectContaining({
          meetingId: 'test-meeting-id',
          userId: 'test-user-id',
        })
      );
    });

    it('should log errors with context', async () => {
      // Mock error response
      mockSupabaseClient.mockQuery.single.mockResolvedValue({
        data: null,
        error: { message: 'Database error' },
      });

      await request(app)
        .get('/api/v1/transcriptions/meeting/invalid-id')
        .expect(404);

      expect(logger.error).toHaveBeenCalledWith(
        'Transcription retrieval failed',
        expect.objectContaining({
          error: expect.any(String),
        })
      );
    });
  });
});
