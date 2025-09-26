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

const mockAuthMiddleware = authMiddleware as jest.MockedFunction<
  typeof authMiddleware
>;

describe('Meetings Routes', () => {
  let app: express.Application;

  beforeEach(() => {
    app = express();
    app.use(express.json());

    // Mock auth middleware to pass through
    mockAuthMiddleware.mockImplementation(async (req, res, next) => {
      req.user = {
        id: 'test-user-id',
        email: 'test@example.com',
        role: 'user',
      };
      next();
    });

    app.use('/api/meetings', authMiddleware, meetingsRouter);
    jest.clearAllMocks();
  });

  describe('GET /api/meetings/client/:clientId', () => {
    it('should get meetings for authenticated user', async () => {
      const response = await request(app)
        .get('/api/meetings/client/test-client-id')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeDefined();
      expect(Array.isArray(response.body.data)).toBe(true);
    });

    it('should handle query parameters', async () => {
      const response = await request(app)
        .get(
          '/api/meetings/client/test-client-id?status=active&limit=10&page=1'
        )
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeDefined();
    });

    it('should require authentication', async () => {
      // Mock auth middleware to reject
      mockAuthMiddleware.mockImplementationOnce(async (req, res, _next) => {
        res.status(401).json({ error: 'Unauthorized' });
      });

      await request(app).get('/api/meetings/client/test-client-id').expect(401);
    });
  });

  describe('GET /api/meetings/:id', () => {
    it('should get specific meeting by ID', async () => {
      const meetingId = 'test-meeting-id';

      const response = await request(app)
        .get(`/api/meetings/${meetingId}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeDefined();
      expect(response.body.data.id).toBe(meetingId);
    });

    it('should handle invalid meeting ID', async () => {
      const response = await request(app)
        .get('/api/meetings/invalid-id')
        .expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toContain('Meeting not found');
    });

    it('should validate UUID format', async () => {
      const response = await request(app)
        .get('/api/meetings/not-a-uuid')
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toContain('Invalid meeting ID format');
    });
  });

  describe('POST /api/meetings', () => {
    it('should create new meeting with valid data', async () => {
      const meetingData = {
        title: 'Test Meeting',
        description: 'Test meeting description',
        startTime: '2024-01-01T10:00:00Z',
        endTime: '2024-01-01T11:00:00Z',
        clientId: 'test-client-id',
        platform: 'zoom',
        meetingUrl: 'https://zoom.us/j/123456789',
      };

      const response = await request(app)
        .post('/api/meetings')
        .send(meetingData)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeDefined();
      expect(response.body.data.title).toBe(meetingData.title);
      expect(response.body.data.clientId).toBe(meetingData.clientId);
    });

    it('should validate required fields', async () => {
      const invalidData = {
        title: '',
        startTime: 'invalid-date',
      };

      const response = await request(app)
        .post('/api/meetings')
        .send(invalidData)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toContain('Validation failed');
    });

    it('should validate date formats', async () => {
      const invalidData = {
        title: 'Test Meeting',
        startTime: 'not-a-date',
        endTime: 'also-not-a-date',
        clientId: 'test-client-id',
      };

      const response = await request(app)
        .post('/api/meetings')
        .send(invalidData)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toContain('Invalid date format');
    });

    it('should validate end time is after start time', async () => {
      const invalidData = {
        title: 'Test Meeting',
        startTime: '2024-01-01T11:00:00Z',
        endTime: '2024-01-01T10:00:00Z', // End before start
        clientId: 'test-client-id',
      };

      const response = await request(app)
        .post('/api/meetings')
        .send(invalidData)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toContain(
        'End time must be after start time'
      );
    });
  });

  describe('PUT /api/meetings/:id', () => {
    it('should update meeting with valid data', async () => {
      const meetingId = 'test-meeting-id';
      const updateData = {
        title: 'Updated Meeting Title',
        description: 'Updated description',
      };

      const response = await request(app)
        .put(`/api/meetings/${meetingId}`)
        .send(updateData)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeDefined();
      expect(response.body.data.title).toBe(updateData.title);
    });

    it('should handle meeting not found', async () => {
      const meetingId = 'non-existent-meeting-id';
      const updateData = {
        title: 'Updated Title',
      };

      const response = await request(app)
        .put(`/api/meetings/${meetingId}`)
        .send(updateData)
        .expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toContain('Meeting not found');
    });

    it('should validate update data', async () => {
      const meetingId = 'test-meeting-id';
      const invalidData = {
        startTime: 'invalid-date',
      };

      const response = await request(app)
        .put(`/api/meetings/${meetingId}`)
        .send(invalidData)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toContain('Validation failed');
    });
  });

  describe('DELETE /api/meetings/:id', () => {
    it('should delete meeting successfully', async () => {
      const meetingId = 'test-meeting-id';

      const response = await request(app)
        .delete(`/api/meetings/${meetingId}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toContain('Meeting deleted');
    });

    it('should handle meeting not found', async () => {
      const meetingId = 'non-existent-meeting-id';

      const response = await request(app)
        .delete(`/api/meetings/${meetingId}`)
        .expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toContain('Meeting not found');
    });

    it('should validate UUID format', async () => {
      const response = await request(app)
        .delete('/api/meetings/not-a-uuid')
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toContain('Invalid meeting ID format');
    });
  });

  describe('Error handling', () => {
    it('should handle malformed JSON', async () => {
      const response = await request(app)
        .post('/api/meetings')
        .set('Content-Type', 'application/json')
        .send('invalid json')
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toContain('Invalid JSON');
    });
  });

  describe('Logging', () => {
    it('should log successful operations', async () => {
      await request(app).get('/api/meetings').expect(200);

      expect(logger.info).toHaveBeenCalledWith(
        'Meetings retrieved',
        expect.objectContaining({
          userId: 'test-user-id',
          count: expect.any(Number),
        })
      );
    });

    it('should log errors', async () => {
      await request(app).get('/api/meetings/invalid-id').expect(404);

      expect(logger.error).toHaveBeenCalledWith(
        'Meeting retrieval failed',
        expect.objectContaining({
          error: expect.any(String),
          meetingId: 'invalid-id',
        })
      );
    });
  });
});
