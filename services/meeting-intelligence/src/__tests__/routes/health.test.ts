/**
 * Tests for health routes
 * Tests health check endpoints, dependency checks, and error handling
 */

import express from 'express';
import request from 'supertest';
import healthRouter from '../../routes/health';

// Mock dependencies
jest.mock('@supabase/supabase-js', () => ({
  createClient: jest.fn(() => ({
    from: jest.fn(() => ({
      select: jest.fn(() => ({
        limit: jest.fn().mockResolvedValue({ data: [], error: null }),
      })),
    })),
  })),
}));

jest.mock('../../services/OpenAIService', () => ({
  OpenAIService: jest.fn().mockImplementation(() => ({
    healthCheck: jest.fn().mockResolvedValue(true),
  })),
}));

jest.mock('../../services/RecallAIService', () => ({
  RecallAIService: jest.fn().mockImplementation(() => ({
    healthCheck: jest.fn().mockResolvedValue(true),
  })),
}));

jest.mock('../../utils/logger', () => ({
  logger: {
    info: jest.fn(),
    error: jest.fn(),
    warn: jest.fn(),
    debug: jest.fn(),
  },
}));

describe('Health Routes', () => {
  let app: express.Application;

  beforeEach(() => {
    app = express();
    app.use('/health', healthRouter);
    jest.clearAllMocks();
  });

  describe('GET /health', () => {
    it('should return basic health status', async () => {
      const response = await request(app)
        .get('/health')
        .expect(200);

      expect(response.body).toEqual({
        success: true,
        status: 'healthy',
        timestamp: expect.any(String),
        service: 'meeting-intelligence',
        version: expect.any(String),
      });
    });
  });

  describe('GET /health/detailed', () => {
    it('should return detailed health status with all dependencies healthy', async () => {
      const response = await request(app)
        .get('/health/detailed')
        .expect(200);

      expect(response.body).toEqual({
        status: 'healthy',
        timestamp: expect.any(String),
        service: 'meeting-intelligence',
        version: expect.any(String),
        dependencies: {
          database: {
            status: 'healthy',
            responseTime: expect.any(Number),
          },
          openAI: {
            status: 'healthy',
            responseTime: 0,
          },
          recallAI: {
            status: 'healthy',
            responseTime: expect.any(Number),
          },
        },
      });
    });
  });

  describe('GET /health/ready', () => {
    it('should return ready status when database is healthy', async () => {
      const response = await request(app)
        .get('/health/ready')
        .expect(200);

      expect(response.body).toEqual({
        status: 'ready',
        success: true,
        timestamp: expect.any(String),
      });
    });
  });

  describe('GET /health/live', () => {
    it('should return alive status', async () => {
      const response = await request(app)
        .get('/health/live')
        .expect(200);

      expect(response.body).toEqual({
        status: 'alive',
        success: true,
        timestamp: expect.any(String),
      });
    });
  });

  describe('error handling', () => {
    it('should handle missing environment variables gracefully', async () => {
      // Temporarily remove environment variables
      const originalSupabaseUrl = process.env.SUPABASE_URL;
      const originalSupabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

      delete process.env.SUPABASE_URL;
      delete process.env.SUPABASE_SERVICE_ROLE_KEY;

      const response = await request(app)
        .get('/health')
        .expect(200);

      expect(response.body.success).toBe(true);

      // Restore environment variables
      process.env.SUPABASE_URL = originalSupabaseUrl;
      process.env.SUPABASE_SERVICE_ROLE_KEY = originalSupabaseKey;
    });
  });
});
