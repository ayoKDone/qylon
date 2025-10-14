import request from 'supertest';
import app from '../../index';

describe('Health Routes', () => {
  describe('GET /health', () => {
    it('should return 200 and health status', async () => {
      const response = await request(app)
        .get('/health')
        .expect(200);

      expect(response.body).toHaveProperty('status', 'healthy');
      expect(response.body).toHaveProperty('timestamp');
      expect(response.body).toHaveProperty('uptime');
      expect(response.body).toHaveProperty('version');
    });

    it('should include service information', async () => {
      const response = await request(app)
        .get('/health')
        .expect(200);

      expect(response.body).toHaveProperty('service', 'api-gateway');
      expect(response.body).toHaveProperty('environment');
      expect(response.body).toHaveProperty('version', '1.0.0');
    });
  });

  describe('GET /health/detailed', () => {
    it('should return detailed health information', async () => {
      const response = await request(app)
        .get('/health/detailed')
        .expect(200);

      expect(response.body).toHaveProperty('status');
      expect(response.body).toHaveProperty('services');
      expect(response.body.services).toBeInstanceOf(Array);
      expect(response.body).toHaveProperty('system');
      expect(response.body).toHaveProperty('responseTime');
    });
  });
});
