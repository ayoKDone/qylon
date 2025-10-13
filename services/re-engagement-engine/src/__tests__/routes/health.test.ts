import request from 'supertest';
import app from '../../index';

describe('Health Routes', () => {
  describe('GET /health', () => {
    it('should return health status', async () => {
      const response = await request(app)
        .get('/health')
        .expect(200);

      expect(response.body).toMatchObject({
        success: true,
        data: {
          service: 're-engagement-engine',
          status: 'healthy',
          features: {
            emailSequences: 'available',
            behaviorTracking: 'available',
            conversionRecovery: 'available',
          },
        },
      });
    });
  });

  describe('GET /health/ready', () => {
    it('should return ready status when all required env vars are present', async () => {
      const response = await request(app)
        .get('/health/ready')
        .expect(200);

      expect(response.body).toMatchObject({
        success: true,
        data: {
          status: 'ready',
        },
      });
    });
  });

  describe('GET /health/live', () => {
    it('should return live status', async () => {
      const response = await request(app)
        .get('/health/live')
        .expect(200);

      expect(response.body).toMatchObject({
        success: true,
        data: {
          status: 'alive',
        },
      });
    });
  });

  describe('GET /health/detailed', () => {
    it('should return detailed health status', async () => {
      const response = await request(app)
        .get('/health/detailed')
        .expect(200);

      expect(response.body).toMatchObject({
        success: true,
        data: {
          service: 're-engagement-engine',
          status: 'healthy',
          features: {
            emailSequences: 'available',
            behaviorTracking: 'available',
            conversionRecovery: 'available',
          },
        },
      });
    });
  });
});
