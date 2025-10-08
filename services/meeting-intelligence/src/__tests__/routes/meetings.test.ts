/**
 * Tests for meetings routes
 * Tests API endpoints, authentication, validation, and error handling
 */

import express from 'express';
import request from 'supertest';
import { authMiddleware } from '../../middleware/auth';
import meetingsRouter from '../../routes/meetings';
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

// Mock RecallAIService
jest.mock('../../services/RecallAIService', () => ({
  RecallAIService: jest.fn().mockImplementation(() => ({
    createBot: jest.fn().mockResolvedValue({
      id: 'test-bot-id',
      name: 'Test Bot',
      bot_token: 'test-token',
    }),
  })),
}));

const mockAuthMiddleware = authMiddleware as jest.MockedFunction<
  typeof authMiddleware
>;

describe('Meetings Routes', () => {
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

    app.use('/api/v1/meetings', authMiddleware, meetingsRouter);
  });

  describe('GET /api/v1/meetings/client/:clientId', () => {
    it('should get meetings for authenticated user', async () => {
      // Mock successful database response
      const mockMeetings = [
        {
          id: 'test-meeting-id',
          title: 'Test Meeting',
          client_id: 'test-client-id',
          start_time: new Date().toISOString(),
          status: 'scheduled',
        },
      ];

      // Setup the mock to return the expected data
      mockSupabaseClient.mockQuery.range.mockResolvedValue({
        data: mockMeetings,
        error: null,
        count: 1,
      });

      const response = await request(app)
        .get('/api/v1/meetings/client/test-client-id')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeDefined();
      expect(Array.isArray(response.body.data)).toBe(true);
    });

    it('should handle query parameters', async () => {
      // Mock successful database response
      mockSupabaseClient.mockQuery.range.mockResolvedValue({
        data: [],
        error: null,
        count: 0,
      });

      const response = await request(app)
        .get(
          '/api/v1/meetings/client/test-client-id?status=active&limit=10&page=1'
        )
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeDefined();
    });

    it('should require authentication', async () => {
      // Mock auth middleware to reject
      mockAuthMiddleware.mockImplementation(async (req, res, _next) => {
        res.status(401).json({
          error: 'Unauthorized',
          message: 'Authentication required',
        });
      });

      await request(app)
        .get('/api/v1/meetings/client/test-client-id')
        .expect(401);
    });
  });

  describe('GET /api/v1/meetings/:id', () => {
    it('should get specific meeting by ID', async () => {
      const meetingId = 'test-meeting-id';
      const mockMeeting = {
        id: meetingId,
        title: 'Test Meeting',
        client_id: 'test-client-id',
        start_time: new Date().toISOString(),
        status: 'scheduled',
        clients: { user_id: 'test-user-id' },
      };

      // Setup the mock to return the expected data
      mockSupabaseClient.mockQuery.single.mockResolvedValue({
        data: mockMeeting,
        error: null,
      });

      const response = await request(app)
        .get(`/api/v1/meetings/${meetingId}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeDefined();
    });

    it('should handle invalid meeting ID', async () => {
      const meetingId = 'invalid-meeting-id';

      // Setup the mock to return error
      mockSupabaseClient.mockQuery.single.mockResolvedValue({
        data: null,
        error: { message: 'Meeting not found' },
      });

      const response = await request(app)
        .get(`/api/v1/meetings/${meetingId}`)
        .expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('NotFound');
    });

    it('should validate UUID format', async () => {
      const response = await request(app)
        .get('/api/v1/meetings/not-a-uuid')
        .expect(404);

      expect(response.body.success).toBe(false);
    });
  });

  describe('POST /api/v1/meetings', () => {
    it('should create new meeting with valid data', async () => {
      const meetingData = {
        title: 'Test Meeting',
        description: 'Test meeting description',
        start_time: new Date().toISOString(),
        platform: 'zoom',
        client_id: 'test-client-id',
        meeting_url: 'https://zoom.us/j/123456789',
        participants: ['user1@example.com', 'user2@example.com'],
      };

      const mockMeeting = {
        id: 'test-meeting-id',
        ...meetingData,
        status: 'scheduled',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      // Mock successful database insert
      mockSupabaseClient.mockQuery.single.mockResolvedValue({
        data: mockMeeting,
        error: null,
      });

      // Mock successful bot creation update
      mockSupabaseClient.mockQuery.eq.mockResolvedValue({
        data: mockMeeting,
        error: null,
      });

      const response = await request(app)
        .post('/api/v1/meetings')
        .send(meetingData)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeDefined();
    });

    it('should validate required fields', async () => {
      const invalidData = {
        title: '',
        startTime: 'invalid-date',
      };

      const response = await request(app)
        .post('/api/v1/meetings')
        .send(invalidData)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('ValidationError');
    });

    it('should validate date formats', async () => {
      const invalidData = {
        title: 'Test Meeting',
        startTime: 'not-a-date',
        client_id: 'test-client-id',
      };

      const response = await request(app)
        .post('/api/v1/meetings')
        .send(invalidData)
        .expect(400);

      expect(response.body.success).toBe(false);
    });

    it('should validate end time is after start time', async () => {
      const invalidData = {
        title: 'Test Meeting',
        startTime: '2024-01-01T11:00:00Z',
        endTime: '2024-01-01T10:00:00Z',
        client_id: 'test-client-id',
      };

      const response = await request(app)
        .post('/api/v1/meetings')
        .send(invalidData)
        .expect(400);

      expect(response.body.success).toBe(false);
    });
  });

  describe('PUT /api/v1/meetings/:id', () => {
    it('should update meeting with valid data', async () => {
      const meetingId = 'test-meeting-id';
      const updateData = {
        title: 'Updated Meeting Title',
        description: 'Updated description',
      };

      const mockMeeting = {
        id: meetingId,
        title: 'Test Meeting',
        client_id: 'test-client-id',
        clients: { user_id: 'test-user-id' },
      };

      // Mock successful fetch and update
      mockSupabaseClient.mockQuery.single
        .mockResolvedValueOnce({
          data: mockMeeting,
          error: null,
        })
        .mockResolvedValueOnce({
          data: { ...mockMeeting, ...updateData },
          error: null,
        });

      const response = await request(app)
        .put(`/api/v1/meetings/${meetingId}`)
        .send(updateData)
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
        .put(`/api/v1/meetings/${meetingId}`)
        .send({ title: 'Updated Title' })
        .expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('NotFound');
    });

    it('should validate update data', async () => {
      const meetingId = 'test-meeting-id';
      const invalidData = {
        start_time: 'invalid-date',
      };

      const response = await request(app)
        .put(`/api/v1/meetings/${meetingId}`)
        .send(invalidData)
        .expect(400);

      expect(response.body.success).toBe(false);
    });
  });

  describe('DELETE /api/v1/meetings/:id', () => {
    it('should delete meeting successfully', async () => {
      const meetingId = 'test-meeting-id';

      const mockMeeting = {
        id: meetingId,
        title: 'Test Meeting',
        client_id: 'test-client-id',
        clients: { user_id: 'test-user-id' },
      };

      // Mock successful fetch and delete
      mockSupabaseClient.mockQuery.single.mockResolvedValue({
        data: mockMeeting,
        error: null,
      });

      mockSupabaseClient.mockQuery.eq.mockResolvedValue({
        data: null,
        error: null,
      });

      const response = await request(app)
        .delete(`/api/v1/meetings/${meetingId}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toContain('Meeting deleted');
    });

    it('should handle meeting not found', async () => {
      const meetingId = 'non-existent-meeting-id';

      // Mock meeting not found
      mockSupabaseClient.mockQuery.single.mockResolvedValue({
        data: null,
        error: { message: 'Meeting not found' },
      });

      const response = await request(app)
        .delete(`/api/v1/meetings/${meetingId}`)
        .expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('NotFound');
    });

    it('should validate UUID format', async () => {
      const response = await request(app)
        .delete('/api/v1/meetings/not-a-uuid')
        .expect(404);

      expect(response.body.success).toBe(false);
    });
  });

  describe('Error handling', () => {
    it('should handle malformed JSON', async () => {
      const response = await request(app)
        .post('/api/v1/meetings')
        .set('Content-Type', 'application/json')
        .send('{"invalid": json}')
        .expect(400);

      expect(response.body.success).toBe(false);
    });
  });

  describe('Logging', () => {
    it('should log successful operations', async () => {
      // Mock successful response
      mockSupabaseClient.mockQuery.range.mockResolvedValue({
        data: [],
        error: null,
        count: 0,
      });

      await request(app)
        .get('/api/v1/meetings/client/test-client-id')
        .expect(200);

      expect(logger.info).toHaveBeenCalledWith(
        'Meetings retrieved',
        expect.objectContaining({
          userId: 'test-user-id',
          clientId: 'test-client-id',
        })
      );
    });

    it('should log errors', async () => {
      // Mock error response
      mockSupabaseClient.mockQuery.single.mockResolvedValue({
        data: null,
        error: { message: 'Database error' },
      });

      await request(app).get('/api/v1/meetings/invalid-id').expect(404);

      expect(logger.error).toHaveBeenCalledWith(
        'Meeting fetch error',
        expect.objectContaining({
          error: expect.any(String),
        })
      );
    });
  });
});
