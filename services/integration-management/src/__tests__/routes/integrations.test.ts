import express from 'express';
import request from 'supertest';
import { errorHandler } from '../../middleware/errorHandler';
import integrationsRoutes from '../../routes/integrations';

// Mock authentication middleware
jest.mock('../../middleware/auth', () => ({
  authenticateToken: jest.fn((req: any, _res: any, next: any) => {
    req.user = {
      id: 'test-user-id',
      email: 'test@example.com',
      role: 'user',
      clientId: 'test-client-id',
    };
    next();
  }),
  requireClientAccess: jest.fn((req: any, _res: any, next: any) => {
    req.body.clientId = 'test-client-id';
    next();
  }),
}));

// Mock rate limiter
jest.mock('../../middleware/rateLimiter', () => ({
  rateLimiter: jest.fn(() => (_req: any, _res: any, next: any) => next()),
  integrationRateLimiter: jest.fn(
    () => (_req: any, _res: any, next: any) => next()
  ),
  syncRateLimiter: jest.fn((_req: any, _res: any, next: any) => next()),
}));

// Mock services
jest.mock('../../services/SalesforceService');
jest.mock('../../services/HubSpotService');
jest.mock('../../services/PipedriveService');
jest.mock('../../services/SlackService');
jest.mock('../../services/DiscordService');
jest.mock('../../services/TeamsService');

import { HubSpotService } from '../../services/HubSpotService';
import { SalesforceService } from '../../services/SalesforceService';
import { SlackService } from '../../services/SlackService';

const MockedSalesforceService = SalesforceService as jest.MockedClass<
  typeof SalesforceService
>;
const MockedHubSpotService = HubSpotService as jest.MockedClass<
  typeof HubSpotService
>;
const MockedSlackService = SlackService as jest.MockedClass<
  typeof SlackService
>;

describe('Integrations Routes', () => {
  let app: express.Application;

  beforeEach(() => {
    app = express();
    app.use(express.json());
    app.use('/api/v1/integrations', integrationsRoutes);
    app.use(errorHandler);

    // Clear all mocks
    jest.clearAllMocks();
  });

  describe('GET /api/v1/integrations', () => {
    it('should return list of integrations', async () => {
      const response = await request(app)
        .get('/api/v1/integrations')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeDefined();
      expect(response.body.timestamp).toBeDefined();
    });

    it('should filter integrations by type', async () => {
      const response = await request(app)
        .get('/api/v1/integrations?type=crm_salesforce')
        .expect(200);

      expect(response.body.success).toBe(true);
    });

    it('should filter integrations by status', async () => {
      const response = await request(app)
        .get('/api/v1/integrations?status=active')
        .expect(200);

      expect(response.body.success).toBe(true);
    });
  });

  describe('GET /api/v1/integrations/:integrationId', () => {
    it('should return specific integration', async () => {
      const response = await request(app)
        .get('/api/v1/integrations/test-integration-id')
        .expect(200);

      expect(response.body.success).toBe(true);
    });

    it('should return 404 for non-existent integration', async () => {
      const response = await request(app)
        .get('/api/v1/integrations/non-existent-id')
        .expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toContain('not found');
    });
  });

  describe('POST /api/v1/integrations', () => {
    it('should create new integration with valid data', async () => {
      const integrationData = {
        clientId: 'test-client-id',
        type: 'crm_salesforce',
        name: 'Test Salesforce Integration',
        credentials: {
          clientId: 'test-client-id',
          clientSecret: 'test-client-secret',
          username: 'test@example.com',
          password: 'test-password',
          securityToken: 'test-security-token',
        },
        settings: {},
      };

      const response = await request(app)
        .post('/api/v1/integrations')
        .send(integrationData)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data.type).toBe('crm_salesforce');
      expect(response.body.data.name).toBe('Test Salesforce Integration');
    });

    it('should return 400 for missing required fields', async () => {
      const invalidData = {
        clientId: 'test-client-id',
        name: 'Test Integration',
        // Missing type and credentials
      };

      const response = await request(app)
        .post('/api/v1/integrations')
        .send(invalidData)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toContain('Missing required fields');
    });

    it('should return 400 for invalid integration type', async () => {
      const invalidData = {
        clientId: 'test-client-id',
        type: 'invalid_type',
        name: 'Test Integration',
        credentials: {},
      };

      const response = await request(app)
        .post('/api/v1/integrations')
        .send(invalidData)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toContain('Invalid integration type');
    });
  });

  describe('PUT /api/v1/integrations/:integrationId', () => {
    it('should update integration', async () => {
      const updateData = {
        name: 'Updated Integration Name',
        settings: { newSetting: 'value' },
      };

      const response = await request(app)
        .put('/api/v1/integrations/test-integration-id')
        .send(updateData)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.name).toBe('Updated Integration Name');
    });

    it('should return 404 for non-existent integration', async () => {
      const updateData = {
        name: 'Updated Integration Name',
      };

      const response = await request(app)
        .put('/api/v1/integrations/non-existent-id')
        .send(updateData)
        .expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toContain('not found');
    });
  });

  describe('DELETE /api/v1/integrations/:integrationId', () => {
    it('should delete integration', async () => {
      const response = await request(app)
        .delete('/api/v1/integrations/test-integration-id')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeNull();
    });

    it('should return 404 for non-existent integration', async () => {
      const response = await request(app)
        .delete('/api/v1/integrations/non-existent-id')
        .expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toContain('not found');
    });
  });

  describe('POST /api/v1/integrations/:integrationId/test', () => {
    it('should test Salesforce integration connection', async () => {
      const mockHealthCheck = {
        status: 'healthy',
        details: {
          integrationType: 'crm_salesforce',
          authenticated: true,
          lastCheck: new Date().toISOString(),
        },
      };

      MockedSalesforceService.prototype.healthCheck = jest
        .fn()
        .mockResolvedValue(mockHealthCheck);

      const response = await request(app)
        .post('/api/v1/integrations/test-integration-id/test')
        .send({ clientId: 'test-client-id' })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.success).toBe(true);
      expect(response.body.data.message).toContain('Connection successful');
    });

    it('should test HubSpot integration connection', async () => {
      const mockHealthCheck = {
        status: 'healthy',
        details: {
          integrationType: 'crm_hubspot',
          authenticated: true,
          lastCheck: new Date().toISOString(),
        },
      };

      MockedHubSpotService.prototype.healthCheck = jest
        .fn()
        .mockResolvedValue(mockHealthCheck);

      const response = await request(app)
        .post('/api/v1/integrations/test-integration-id/test')
        .send({ clientId: 'test-client-id' })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.success).toBe(true);
    });

    it('should test Slack integration connection', async () => {
      const mockHealthCheck = {
        status: 'healthy',
        details: {
          integrationType: 'communication_slack',
          authenticated: true,
          lastCheck: new Date().toISOString(),
        },
      };

      MockedSlackService.prototype.healthCheck = jest
        .fn()
        .mockResolvedValue(mockHealthCheck);

      const response = await request(app)
        .post('/api/v1/integrations/test-integration-id/test')
        .send({ clientId: 'test-client-id' })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.success).toBe(true);
    });

    it('should return 404 for non-existent integration', async () => {
      const response = await request(app)
        .post('/api/v1/integrations/non-existent-id/test')
        .send({ clientId: 'test-client-id' })
        .expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toContain('not found');
    });
  });

  describe('POST /api/v1/integrations/:integrationId/sync', () => {
    it('should sync Salesforce contacts', async () => {
      const mockSyncResult = {
        success: true,
        recordsProcessed: 10,
        recordsCreated: 5,
        recordsUpdated: 3,
        recordsFailed: 2,
        errors: [],
        duration: 5000,
        timestamp: new Date().toISOString(),
      };

      MockedSalesforceService.prototype.syncContacts = jest
        .fn()
        .mockResolvedValue(mockSyncResult);

      const response = await request(app)
        .post('/api/v1/integrations/test-integration-id/sync')
        .send({
          clientId: 'test-client-id',
          syncType: 'contacts',
        })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.success).toBe(true);
      expect(response.body.data.recordsProcessed).toBe(10);
    });

    it('should sync Salesforce opportunities', async () => {
      const mockSyncResult = {
        success: true,
        recordsProcessed: 5,
        recordsCreated: 2,
        recordsUpdated: 2,
        recordsFailed: 1,
        errors: [],
        duration: 3000,
        timestamp: new Date().toISOString(),
      };

      MockedSalesforceService.prototype.syncOpportunities = jest
        .fn()
        .mockResolvedValue(mockSyncResult);

      const response = await request(app)
        .post('/api/v1/integrations/test-integration-id/sync')
        .send({
          clientId: 'test-client-id',
          syncType: 'opportunities',
        })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.success).toBe(true);
      expect(response.body.data.recordsProcessed).toBe(5);
    });

    it('should sync all data when syncType is "all"', async () => {
      const mockSyncResult = {
        success: true,
        recordsProcessed: 15,
        recordsCreated: 7,
        recordsUpdated: 5,
        recordsFailed: 3,
        errors: [],
        duration: 8000,
        timestamp: new Date().toISOString(),
      };

      MockedSalesforceService.prototype.syncContacts = jest
        .fn()
        .mockResolvedValue(mockSyncResult);

      const response = await request(app)
        .post('/api/v1/integrations/test-integration-id/sync')
        .send({
          clientId: 'test-client-id',
          syncType: 'all',
        })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.success).toBe(true);
    });

    it('should return 400 for invalid sync type', async () => {
      const response = await request(app)
        .post('/api/v1/integrations/test-integration-id/sync')
        .send({
          clientId: 'test-client-id',
          syncType: 'invalid_type',
        })
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toContain('Invalid sync type');
    });

    it('should return 404 for non-existent integration', async () => {
      const response = await request(app)
        .post('/api/v1/integrations/non-existent-id/sync')
        .send({
          clientId: 'test-client-id',
          syncType: 'contacts',
        })
        .expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toContain('not found');
    });
  });

  describe('GET /api/v1/integrations/:integrationId/metrics', () => {
    it('should return integration metrics', async () => {
      const response = await request(app)
        .get('/api/v1/integrations/test-integration-id/metrics')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeDefined();
      expect(response.body.data.totalSyncs).toBeDefined();
      expect(response.body.data.successRate).toBeDefined();
    });

    it('should return 404 for non-existent integration', async () => {
      const response = await request(app)
        .get('/api/v1/integrations/non-existent-id/metrics')
        .expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toContain('not found');
    });
  });
});
