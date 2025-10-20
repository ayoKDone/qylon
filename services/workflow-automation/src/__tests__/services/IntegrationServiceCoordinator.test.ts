import {
  CoordinationContext,
  IntegrationAction,
  IntegrationServiceCoordinator,
} from '../../services/IntegrationServiceCoordinator';

// Local type definitions for testing
interface IntegrationConfig {
  id: string;
  userId: string;
  clientId: string;
  type: IntegrationType;
  name: string;
  status: string;
  credentials: Record<string, any>;
  settings: Record<string, any>;
  lastSync?: string;
  createdAt: string;
  updatedAt: string;
}

enum IntegrationType {
  CRM_SALESFORCE = 'crm_salesforce',
  CRM_HUBSPOT = 'crm_hubspot',
  CRM_PIPEDRIVE = 'crm_pipedrive',
}

// Mock dependencies
jest.mock('@supabase/supabase-js');
jest.mock('../../utils/logger');

// Create mock data for integration configs
let mockIntegrationConfigData: any = null;
let mockStatisticsData: any[] = [];
let mockError: any = null;

const mockSupabase = {
  from: jest.fn(() => ({
    select: jest.fn().mockImplementation((columns?: string) => {
      // If select is called directly (without eq), return statistics data
      if (columns && typeof columns === 'string' && columns.includes('type, status')) {
        return Promise.resolve({ data: mockStatisticsData, error: null });
      }
      // For healthCheck pattern (select with 'id')
      if (columns && typeof columns === 'string' && columns.includes('id')) {
        return {
          limit: jest.fn().mockImplementation((_limit: number) => {
            return Promise.resolve({ data: [], error: mockError });
          }),
        };
      }
      return {
        eq: jest.fn().mockReturnThis(),
        single: jest.fn().mockImplementation(() => {
          return Promise.resolve({
            data: mockIntegrationConfigData,
            error: null,
          });
        }),
      };
    }),
    eq: jest.fn().mockReturnThis(),
    single: jest.fn().mockImplementation(() => {
      return Promise.resolve({
        data: mockIntegrationConfigData,
        error: null,
      });
    }),
  })),
};

// Mock fetch
global.fetch = jest.fn();

jest.mock('@supabase/supabase-js', () => ({
  createClient: jest.fn(() => mockSupabase),
}));

describe('IntegrationServiceCoordinator', () => {
  let coordinator: IntegrationServiceCoordinator;
  let mockIntegrationConfig: IntegrationConfig;
  let mockAction: IntegrationAction;
  let mockContext: CoordinationContext;

  beforeEach(() => {
    jest.clearAllMocks();
    mockIntegrationConfigData = null;
    mockStatisticsData = [];
    mockError = null;
    coordinator = new IntegrationServiceCoordinator();
    // Clear the cache
    coordinator.clearCache();

    mockIntegrationConfig = {
      id: 'integration-123',
      userId: 'user-123',
      clientId: 'client-123',
      type: IntegrationType.CRM_SALESFORCE,
      name: 'Salesforce CRM',
      status: 'active' as any,
      credentials: {
        accessToken: 'access-token-123',
        refreshToken: 'refresh-token-123',
        instanceUrl: 'https://test.salesforce.com',
      },
      settings: {
        syncInterval: 300000,
        autoSync: true,
      },
      lastSync: '2024-01-01T10:00:00Z',
      createdAt: '2024-01-01T09:00:00Z',
      updatedAt: '2024-01-01T09:00:00Z',
    };

    mockAction = {
      id: 'action-123',
      type: 'create_contact',
      integrationType: IntegrationType.CRM_SALESFORCE,
      config: {},
      data: {
        email: 'test@example.com',
        firstName: 'John',
        lastName: 'Doe',
        company: 'Test Company',
        phone: '+1234567890',
      },
    };

    mockContext = {
      workflowId: 'workflow-123',
      executionId: 'execution-123',
      clientId: 'client-123',
      userId: 'user-123',
      correlationId: 'correlation-123',
      causationId: 'causation-123',
    };
  });
  describe('coordinateIntegrationActions', () => {
    it('should coordinate multiple integration actions successfully', async () => {
      // Mock integration config fetch - set the data that will be returned by single()
      mockIntegrationConfigData = {
        id: mockIntegrationConfig.id,
        user_id: mockIntegrationConfig.userId,
        client_id: mockIntegrationConfig.clientId,
        type: mockIntegrationConfig.type,
        name: mockIntegrationConfig.name,
        status: mockIntegrationConfig.status,
        credentials: mockIntegrationConfig.credentials,
        settings: mockIntegrationConfig.settings,
        last_sync: mockIntegrationConfig.lastSync,
        created_at: mockIntegrationConfig.createdAt,
        updated_at: mockIntegrationConfig.updatedAt,
      };

      // Mock successful API responses
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => ({
          success: true,
          data: {
            id: 'contact-123',
            email: 'test@example.com',
            firstName: 'John',
            lastName: 'Doe',
          },
        }),
      });

      const actions = [mockAction];
      const results = await coordinator.coordinateIntegrationActions(actions, mockContext);

      expect(results).toHaveLength(1);
      expect(results[0].success).toBe(true);
      expect(results[0].actionId).toBe(mockAction.id);
      expect(results[0].integrationType).toBe(mockAction.integrationType);
      expect(results[0].result).toBeDefined();
      expect(results[0].duration).toBeGreaterThan(0);
    });

    it('should handle integration action failures gracefully', async () => {
      // Mock integration config fetch
      mockIntegrationConfigData = {
        id: mockIntegrationConfig.id,
        user_id: mockIntegrationConfig.userId,
        client_id: mockIntegrationConfig.clientId,
        type: mockIntegrationConfig.type,
        name: mockIntegrationConfig.name,
        status: mockIntegrationConfig.status,
        credentials: mockIntegrationConfig.credentials,
        settings: mockIntegrationConfig.settings,
        last_sync: mockIntegrationConfig.lastSync,
        created_at: mockIntegrationConfig.createdAt,
        updated_at: mockIntegrationConfig.updatedAt,
      };

      // Mock failed API response
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: false,
        status: 400,
        statusText: 'Bad Request',
        json: async () => ({
          message: 'Invalid contact data',
        }),
      });

      const actions = [mockAction];
      const results = await coordinator.coordinateIntegrationActions(actions, mockContext);

      expect(results).toHaveLength(1);
      expect(results[0].success).toBe(false);
      expect(results[0].actionId).toBe(mockAction.id);
      expect(results[0].error).toContain('Invalid contact data');
    });

    it('should handle missing integration configuration', async () => {
      // Override the global mock to return no integration config
      mockSupabase.from.mockImplementationOnce((_tableName: string) => {
        const chain = createMockChain();
        chain.single.mockResolvedValue({
          data: null,
          error: { message: 'No rows found' },
        });
        return chain;
      });

      const actions = [mockAction];
      const results = await coordinator.coordinateIntegrationActions(actions, mockContext);

      expect(results).toHaveLength(1);
      expect(results[0].success).toBe(false);
      expect(results[0].error).toContain('Integration not configured');
    });

    it('should retry failed actions with exponential backoff', async () => {
      // Mock integration config fetch
      mockIntegrationConfigData = {
        id: mockIntegrationConfig.id,
        user_id: mockIntegrationConfig.userId,
        client_id: mockIntegrationConfig.clientId,
        type: mockIntegrationConfig.type,
        name: mockIntegrationConfig.name,
        status: mockIntegrationConfig.status,
        credentials: mockIntegrationConfig.credentials,
        settings: mockIntegrationConfig.settings,
        last_sync: mockIntegrationConfig.lastSync,
        created_at: mockIntegrationConfig.createdAt,
        updated_at: mockIntegrationConfig.updatedAt,
      };

      // Mock retryable error first, then success
      (global.fetch as jest.Mock)
        .mockRejectedValueOnce(new Error('Network timeout'))
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({
            success: true,
            data: { id: 'contact-123' },
          }),
        });

      const actionWithRetry = {
        ...mockAction,
        maxRetries: 2,
      };

      const actions = [actionWithRetry];
      const results = await coordinator.coordinateIntegrationActions(actions, mockContext);

      expect(results).toHaveLength(1);
      expect(results[0].success).toBe(true);
      expect(results[0].retryCount).toBe(1);
      expect(global.fetch).toHaveBeenCalledTimes(2);
    });
  });

  describe('executeIntegrationAction', () => {
    it('should execute create_contact action successfully', async () => {
      // Mock integration config fetch
      mockIntegrationConfigData = {
        id: mockIntegrationConfig.id,
        user_id: mockIntegrationConfig.userId,
        client_id: mockIntegrationConfig.clientId,
        type: mockIntegrationConfig.type,
        name: mockIntegrationConfig.name,
        status: mockIntegrationConfig.status,
        credentials: mockIntegrationConfig.credentials,
        settings: mockIntegrationConfig.settings,
        last_sync: mockIntegrationConfig.lastSync,
        created_at: mockIntegrationConfig.createdAt,
        updated_at: mockIntegrationConfig.updatedAt,
      };

      // Mock successful contact creation
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => ({
          success: true,
          data: {
            id: 'contact-123',
            email: 'test@example.com',
            firstName: 'John',
            lastName: 'Doe',
          },
        }),
      });

      const result = await (coordinator as any).executeIntegrationAction(mockAction, mockContext);

      expect(result.success).toBe(true);
      expect(result.actionId).toBe(mockAction.id);
      expect(result.result).toBeDefined();
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/v1/crm/contacts'),
        expect.objectContaining({
          method: 'POST',
          headers: expect.objectContaining({
            'Content-Type': 'application/json',
            Authorization: expect.stringContaining('Bearer'),
          }),
          body: expect.stringContaining('test@example.com'),
        }),
      );
    });

    it('should execute update_contact action successfully', async () => {
      const updateAction = {
        ...mockAction,
        type: 'update_contact' as const,
        data: {
          id: 'contact-123',
          email: 'updated@example.com',
          firstName: 'Jane',
          lastName: 'Doe',
        },
      };

      // Mock integration config fetch
      mockIntegrationConfigData = {
        id: mockIntegrationConfig.id,
        user_id: mockIntegrationConfig.userId,
        client_id: mockIntegrationConfig.clientId,
        type: mockIntegrationConfig.type,
        name: mockIntegrationConfig.name,
        status: mockIntegrationConfig.status,
        credentials: mockIntegrationConfig.credentials,
        settings: mockIntegrationConfig.settings,
        last_sync: mockIntegrationConfig.lastSync,
        created_at: mockIntegrationConfig.createdAt,
        updated_at: mockIntegrationConfig.updatedAt,
      };

      // Mock successful contact update
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => ({
          success: true,
          data: {
            id: 'contact-123',
            email: 'updated@example.com',
            firstName: 'Jane',
            lastName: 'Doe',
          },
        }),
      });

      const result = await (coordinator as any).executeIntegrationAction(updateAction, mockContext);

      expect(result.success).toBe(true);
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/v1/crm/contacts/contact-123'),
        expect.objectContaining({
          method: 'PUT',
        }),
      );
    });

    it('should execute sync_data action successfully', async () => {
      const syncAction = {
        ...mockAction,
        type: 'sync_data' as const,
        data: {
          meetingId: 'meeting-123',
          participants: ['user1', 'user2'],
          transcript: 'Meeting transcript...',
        },
      };

      // Mock integration config fetch
      mockIntegrationConfigData = {
        id: mockIntegrationConfig.id,
        user_id: mockIntegrationConfig.userId,
        client_id: mockIntegrationConfig.clientId,
        type: mockIntegrationConfig.type,
        name: mockIntegrationConfig.name,
        status: mockIntegrationConfig.status,
        credentials: mockIntegrationConfig.credentials,
        settings: mockIntegrationConfig.settings,
        last_sync: mockIntegrationConfig.lastSync,
        created_at: mockIntegrationConfig.createdAt,
        updated_at: mockIntegrationConfig.updatedAt,
      };

      // Mock successful sync
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => ({
          success: true,
          data: {
            syncedRecords: 5,
            duration: 1500,
          },
        }),
      });

      const result = await (coordinator as any).executeIntegrationAction(syncAction, mockContext);

      expect(result.success).toBe(true);
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/v1/sync'),
        expect.objectContaining({
          method: 'POST',
        }),
      );
    });

    it('should handle unknown action types', async () => {
      const unknownAction = {
        ...mockAction,
        type: 'unknown_action' as any,
      };

      // Mock integration config fetch
      mockIntegrationConfigData = {
        id: mockIntegrationConfig.id,
        user_id: mockIntegrationConfig.userId,
        client_id: mockIntegrationConfig.clientId,
        type: mockIntegrationConfig.type,
        name: mockIntegrationConfig.name,
        status: mockIntegrationConfig.status,
        credentials: mockIntegrationConfig.credentials,
        settings: mockIntegrationConfig.settings,
        last_sync: mockIntegrationConfig.lastSync,
        created_at: mockIntegrationConfig.createdAt,
        updated_at: mockIntegrationConfig.updatedAt,
      };

      const result = await (coordinator as any).executeIntegrationAction(
        unknownAction,
        mockContext,
      );

      expect(result.success).toBe(false);
      expect(result.error).toContain('Unknown action type');
    });
  });

  describe('getIntegrationConfig', () => {
    it('should return cached integration config', async () => {
      // Add to cache
      (coordinator as any).setCachedIntegrationConfig(
        `${IntegrationType.CRM_SALESFORCE}:client-123`,
        mockIntegrationConfig,
      );

      const config = await (coordinator as any).getIntegrationConfig(
        IntegrationType.CRM_SALESFORCE,
        'client-123',
      );

      expect(config).toEqual(mockIntegrationConfig);
      expect(mockSupabase.from).not.toHaveBeenCalled();
    });

    it('should fetch from database when not cached', async () => {
      mockIntegrationConfigData = {
        id: mockIntegrationConfig.id,
        user_id: mockIntegrationConfig.userId,
        client_id: mockIntegrationConfig.clientId,
        type: mockIntegrationConfig.type,
        name: mockIntegrationConfig.name,
        status: mockIntegrationConfig.status,
        credentials: mockIntegrationConfig.credentials,
        settings: mockIntegrationConfig.settings,
        last_sync: mockIntegrationConfig.lastSync,
        created_at: mockIntegrationConfig.createdAt,
        updated_at: mockIntegrationConfig.updatedAt,
      };

      const config = await (coordinator as any).getIntegrationConfig(
        IntegrationType.CRM_SALESFORCE,
        'client-123',
      );

      expect(config).toEqual(mockIntegrationConfig);
      expect(mockSupabase.from).toHaveBeenCalled();
    });

    it('should return null when integration not found', async () => {
      // Override the global mock to return no integration config
      mockSupabase.from.mockImplementationOnce((_tableName: string) => {
        const chain = createMockChain();
        chain.single.mockResolvedValue({
          data: null,
          error: { message: 'No rows found' },
        });
        return chain;
      });

      const config = await (coordinator as any).getIntegrationConfig(
        IntegrationType.CRM_SALESFORCE,
        'client-123',
      );

      expect(config).toBeNull();
    });
  });

  describe('isRetryableError', () => {
    it('should identify retryable errors', () => {
      const retryableErrors = [
        new Error('Network timeout'),
        new Error('Connection failed'),
        new Error('Rate limit exceeded'),
        new Error('service unavailable'),
      ];

      retryableErrors.forEach(error => {
        const isRetryable = coordinator.isRetryableError(error);
        expect(isRetryable).toBe(true);
      });
    });

    it('should identify non-retryable errors', () => {
      const nonRetryableErrors = [
        new Error('Invalid credentials'),
        new Error('Permission denied'),
        new Error('Validation failed'),
        new Error('Resource not found'),
      ];

      nonRetryableErrors.forEach(error => {
        const isRetryable = coordinator.isRetryableError(error);
        expect(isRetryable).toBe(false);
      });
    });
  });

  describe('getCoordinationStatistics', () => {
    it('should return coordination statistics', async () => {
      mockStatisticsData = [
        { type: IntegrationType.CRM_SALESFORCE, status: 'active' },
        { type: IntegrationType.CRM_HUBSPOT, status: 'active' },
        { type: IntegrationType.CRM_PIPEDRIVE, status: 'inactive' },
      ];

      const stats = await coordinator.getCoordinationStatistics();

      expect(stats.totalIntegrations).toBe(3);
      expect(stats.activeIntegrations).toBe(2);
      expect(stats.integrationTypes[IntegrationType.CRM_SALESFORCE]).toBe(1);
      expect(stats.integrationTypes[IntegrationType.CRM_HUBSPOT]).toBe(1);
      expect(stats.integrationTypes[IntegrationType.CRM_PIPEDRIVE]).toBe(1);
    });

    it('should handle database errors in statistics', async () => {
      // Override the global mock for this specific test
      mockSupabase.from.mockImplementationOnce(() => ({
        select: jest.fn().mockResolvedValue({
          data: null,
          error: { message: 'Database error' },
        }),
      }));

      const stats = await coordinator.getCoordinationStatistics();

      expect(stats.totalIntegrations).toBe(0);
      expect(stats.activeIntegrations).toBe(0);
      expect(stats.integrationTypes).toEqual({});
    });
  });

  describe('healthCheck', () => {
    it('should return true when database is accessible', async () => {
      // Mock data is already set up in the mock implementation

      const isHealthy = await coordinator.healthCheck();
      expect(isHealthy).toBe(true);
    });

    it('should return false when database is not accessible', async () => {
      // Override the global mock for this specific test
      mockSupabase.from.mockImplementationOnce(() => ({
        select: jest.fn().mockReturnThis(),
        limit: jest.fn().mockResolvedValue({
          data: null,
          error: { message: 'Connection failed' },
        }),
      }));

      const isHealthy = await coordinator.healthCheck();
      expect(isHealthy).toBe(false);
    });
  });

  describe('clearCache', () => {
    it('should clear coordination cache', () => {
      // Add some data to cache
      (coordinator as any).coordinationCache.set('test-key', [mockIntegrationConfig]);
      (coordinator as any).cacheExpiry.set('test-key', Date.now() + 1000);

      coordinator.clearCache();

      expect((coordinator as any).coordinationCache.size).toBe(0);
      expect((coordinator as any).cacheExpiry.size).toBe(0);
    });
  });
});
