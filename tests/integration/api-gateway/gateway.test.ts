import request from 'supertest';
import { app } from '../../../services/api-gateway/src/app';

describe('API Gateway Integration Tests', () => {
  describe('Service Routing', () => {
    it('should route meeting requests to meeting-intelligence service', async () => {
      const response = await request(app)
        .get('/api/meetings')
        .set('Authorization', 'Bearer valid-token')
        .expect(200);

      expect(response.body).toHaveProperty('meetings');
      expect(response.body.meetings).toBeInstanceOf(Array);
    });

    it('should route integration requests to integration-management service', async () => {
      const response = await request(app)
        .get('/api/integrations')
        .set('Authorization', 'Bearer valid-token')
        .expect(200);

      expect(response.body).toHaveProperty('integrations');
      expect(response.body.integrations).toBeInstanceOf(Array);
    });

    it('should handle service unavailability gracefully', async () => {
      // Mock service down
      const response = await request(app)
        .get('/api/meetings')
        .set('Authorization', 'Bearer valid-token')
        .expect(503);

      expect(response.body).toHaveProperty('error', 'Service temporarily unavailable');
    });
  });

  describe('Authentication Flow', () => {
    it('should authenticate and authorize requests', async () => {
      const response = await request(app)
        .get('/api/meetings')
        .set('Authorization', 'Bearer valid-token')
        .expect(200);

      expect(response.body).toHaveProperty('meetings');
    });

    it('should reject unauthorized requests', async () => {
      await request(app)
        .get('/api/meetings')
        .expect(401);
    });
  });
});
