import request from 'supertest';
import express from 'express';
import { rateLimiter, authRateLimiter, userRateLimiter } from '../middleware/rateLimiter';

describe('Rate Limiter Middleware', () => {
  let app: express.Application;

  beforeEach(() => {
    app = express();
    app.use(express.json());
  });

  describe('rateLimiter', () => {
    it('should allow requests within limit', async () => {
      app.use('/test', rateLimiter, (req, res) => {
        res.json({ success: true });
      });

      const response = await request(app).get('/test');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
    });

    it('should include rate limit headers', async () => {
      app.use('/test', rateLimiter, (req, res) => {
        res.json({ success: true });
      });

      const response = await request(app).get('/test');

      expect(response.headers['x-ratelimit-limit']).toBeDefined();
      expect(response.headers['x-ratelimit-remaining']).toBeDefined();
      expect(response.headers['x-ratelimit-reset']).toBeDefined();
    });
  });

  describe('authRateLimiter', () => {
    it('should have stricter limits for auth endpoints', async () => {
      app.use('/auth', authRateLimiter, (req, res) => {
        res.json({ success: true });
      });

      // Make multiple requests to test rate limiting
      const promises = Array(6)
        .fill(null)
        .map(() => request(app).post('/auth/login'));

      const responses = await Promise.all(promises);

      // First 5 should succeed, 6th should be rate limited
      const successCount = responses.filter(r => r.status === 200).length;
      const rateLimitedCount = responses.filter(r => r.status === 429).length;

      expect(successCount).toBe(5);
      expect(rateLimitedCount).toBe(1);
    });

    it('should return proper rate limit error response', async () => {
      app.use('/auth', authRateLimiter, (req, res) => {
        res.json({ success: true });
      });

      // Exceed rate limit
      for (let i = 0; i < 6; i++) {
        await request(app).post('/auth/login');
      }

      const response = await request(app).post('/auth/login');

      expect(response.status).toBe(429);
      expect(response.body.error).toBe('Too Many Requests');
      expect(response.body.message).toContain('Too many authentication attempts');
      expect(response.body.retryAfter).toBeDefined();
    });
  });

  describe('userRateLimiter', () => {
    it('should use IP-based limiting for unauthenticated requests', async () => {
      app.use('/test', userRateLimiter, (req, res) => {
        res.json({ success: true });
      });

      const response = await request(app).get('/test');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
    });

    it('should use higher limits for authenticated users', async () => {
      // Mock authenticated user
      app.use((req, res, next) => {
        (req as any).user = { id: 'user-123' };
        next();
      });

      app.use('/test', userRateLimiter, (req, res) => {
        res.json({ success: true });
      });

      const response = await request(app).get('/test');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
    });
  });
});
