import request from 'supertest';
import { app } from '../../index';

describe('Authentication Middleware', () => {
  describe('Protected Routes', () => {
    it('should reject requests without authorization header', async () => {
      await request(app)
        .get('/api/meetings')
        .expect(401)
        .expect((res) => {
          expect(res.body).toHaveProperty('error', 'Authorization header required');
        });
    });

    it('should reject requests with invalid token', async () => {
      await request(app)
        .get('/api/meetings')
        .set('Authorization', 'Bearer invalid-token')
        .expect(401)
        .expect((res) => {
          expect(res.body).toHaveProperty('error', 'Invalid token');
        });
    });

    it('should accept requests with valid token', async () => {
      // Mock valid token
      const validToken = 'mock-valid-token';

      await request(app)
        .get('/api/meetings')
        .set('Authorization', `Bearer ${validToken}`)
        .expect(200);
    });
  });

  describe('Rate Limiting', () => {
    it('should enforce rate limits', async () => {
      const promises = [];

      // Make 100 requests quickly
      for (let i = 0; i < 100; i++) {
        promises.push(
          request(app)
            .get('/api/health')
            .set('Authorization', 'Bearer valid-token')
        );
      }

      const responses = await Promise.all(promises);
      const rateLimitedResponses = responses.filter(res => res.status === 429);

      expect(rateLimitedResponses.length).toBeGreaterThan(0);
    });
  });
});
