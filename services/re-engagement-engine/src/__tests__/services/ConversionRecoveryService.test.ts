import { ConversionRecoveryService } from '../../services/ConversionRecoveryService';
import { CreateRecoveryCampaignRequest, RecoveryResult } from '../../types';

// Mock the Supabase client module
const mockSupabaseClient = {
  from: jest.fn(),
  raw: jest.fn((sql: string) => sql), // Mock raw SQL function
};

jest.mock('@supabase/supabase-js', () => ({
  createClient: jest.fn(() => mockSupabaseClient),
}));

// Mock OpenAI
jest.mock('openai', () => {
  return {
    __esModule: true,
    default: jest.fn().mockImplementation(() => ({
      chat: {
        completions: {
          create: jest.fn().mockResolvedValue({
            choices: [{ message: { content: 'Generated content' } }],
          }),
        },
      },
    })),
  };
});

describe('ConversionRecoveryService', () => {
  let conversionRecoveryService: ConversionRecoveryService;

  beforeEach(() => {
    jest.clearAllMocks();
    conversionRecoveryService = new ConversionRecoveryService(
      'https://test.supabase.co',
      'test-key',
      'test-openai-key',
    );
  });

  describe('createRecoveryCampaign', () => {
    it('should create a new recovery campaign successfully', async () => {
      const userId = 'test-user-id';
      const request: CreateRecoveryCampaignRequest = {
        name: 'Test Campaign',
        description: 'Test description',
        targetSegment: 'abandoned_checkout',
        recoveryStrategy: 'email_sequence',
        clientId: 'test-client-id',
      };

      const mockCampaign = {
        id: 'campaign-id',
        name: request.name,
        description: request.description,
        targetSegment: request.targetSegment,
        recoveryStrategy: request.recoveryStrategy,
        isActive: true,
        userId,
        clientId: request.clientId,
        successMetrics: {
          targetConversionRate: 0,
          currentConversionRate: 0,
          totalRecovered: 0,
          totalAttempted: 0,
          averageRecoveryTime: 0,
          costPerRecovery: 0,
        },
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      // Mock the insert operation
      mockSupabaseClient.from.mockReturnValue({
        insert: jest.fn().mockReturnValue({
          select: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({ data: mockCampaign, error: null }),
          }),
        }),
      });

      const result = await conversionRecoveryService.createRecoveryCampaign(userId, request);

      expect(result).toEqual(mockCampaign);
      expect(mockSupabaseClient.from).toHaveBeenCalledWith('conversion_recovery_campaigns');
    });

    it('should throw error when campaign creation fails', async () => {
      const userId = 'test-user-id';
      const request: CreateRecoveryCampaignRequest = {
        name: 'Test Campaign',
        description: 'Test description',
        targetSegment: 'abandoned_checkout',
        recoveryStrategy: 'email_sequence',
        clientId: 'test-client-id',
      };

      // Mock the insert operation to fail
      mockSupabaseClient.from.mockReturnValue({
        insert: jest.fn().mockReturnValue({
          select: jest.fn().mockReturnValue({
            single: jest
              .fn()
              .mockResolvedValue({ data: null, error: { message: 'Database error' } }),
          }),
        }),
      });

      await expect(
        conversionRecoveryService.createRecoveryCampaign(userId, request),
      ).rejects.toThrow('Failed to create recovery campaign: Database error');
    });
  });

  describe('getRecoveryCampaigns', () => {
    it('should get recovery campaigns for a user', async () => {
      const userId = 'test-user-id';
      const clientId = 'test-client-id';
      const mockCampaigns = [
        {
          id: 'campaign-1',
          name: 'Campaign 1',
          targetSegment: 'abandoned_checkout',
          recoveryStrategy: 'email_sequence',
          isActive: true,
          userId,
          clientId,
          successMetrics: {
            targetConversionRate: 0,
            currentConversionRate: 0,
            totalRecovered: 0,
            totalAttempted: 0,
            averageRecoveryTime: 0,
            costPerRecovery: 0,
          },
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      ];

      // Mock the select operation with proper chaining that handles conditional queries
      const mockQuery = {
        eq: jest.fn().mockReturnThis(),
        order: jest.fn().mockReturnThis(),
      };

      // The order method should return an object that also has eq method
      const mockOrderResult = {
        eq: jest.fn().mockResolvedValue({ data: mockCampaigns, error: null }),
      };

      mockQuery.eq.mockReturnValue(mockQuery);
      mockQuery.order.mockReturnValue(mockOrderResult);

      mockSupabaseClient.from.mockReturnValue({
        select: jest.fn().mockReturnValue(mockQuery),
      });

      const result = await conversionRecoveryService.getRecoveryCampaigns(userId, clientId);

      expect(result).toEqual(mockCampaigns);
    });
  });

  describe('getRecoveryCampaign', () => {
    it('should get a specific recovery campaign', async () => {
      const campaignId = 'test-campaign-id';
      const userId = 'test-user-id';
      const mockCampaign = {
        id: campaignId,
        name: 'Test Campaign',
        targetSegment: 'abandoned_checkout',
        recoveryStrategy: 'email_sequence',
        isActive: true,
        userId,
        successMetrics: {
          targetConversionRate: 0,
          currentConversionRate: 0,
          totalRecovered: 0,
          totalAttempted: 0,
          averageRecoveryTime: 0,
          costPerRecovery: 0,
        },
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      // Mock the select operation
      mockSupabaseClient.from.mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            eq: jest.fn().mockReturnValue({
              single: jest.fn().mockResolvedValue({ data: mockCampaign, error: null }),
            }),
          }),
        }),
      });

      const result = await conversionRecoveryService.getRecoveryCampaign(campaignId, userId);

      expect(result).toEqual(mockCampaign);
    });

    it('should return null when campaign not found', async () => {
      const campaignId = 'non-existent-id';
      const userId = 'test-user-id';

      // Mock the select operation to return not found
      mockSupabaseClient.from.mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            eq: jest.fn().mockReturnValue({
              single: jest.fn().mockResolvedValue({ data: null, error: { code: 'PGRST116' } }),
            }),
          }),
        }),
      });

      const result = await conversionRecoveryService.getRecoveryCampaign(campaignId, userId);

      expect(result).toBeNull();
    });
  });

  describe('updateRecoveryCampaign', () => {
    it('should update a recovery campaign successfully', async () => {
      const campaignId = 'test-campaign-id';
      const userId = 'test-user-id';
      const updateRequest = {
        name: 'Updated Campaign',
        isActive: false,
      };

      const mockUpdatedCampaign = {
        id: campaignId,
        name: 'Updated Campaign',
        targetSegment: 'abandoned_checkout',
        recoveryStrategy: 'email_sequence',
        isActive: false,
        userId,
        successMetrics: {
          targetConversionRate: 0,
          currentConversionRate: 0,
          totalRecovered: 0,
          totalAttempted: 0,
          averageRecoveryTime: 0,
          costPerRecovery: 0,
        },
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      // Mock the update operation
      mockSupabaseClient.from.mockReturnValue({
        update: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            eq: jest.fn().mockReturnValue({
              select: jest.fn().mockReturnValue({
                single: jest.fn().mockResolvedValue({ data: mockUpdatedCampaign, error: null }),
              }),
            }),
          }),
        }),
      });

      const result = await conversionRecoveryService.updateRecoveryCampaign(
        campaignId,
        userId,
        updateRequest,
      );

      expect(result).toEqual(mockUpdatedCampaign);
    });
  });

  describe('deleteRecoveryCampaign', () => {
    it('should delete a recovery campaign successfully', async () => {
      const campaignId = 'test-campaign-id';
      const userId = 'test-user-id';

      // Mock the delete operation
      mockSupabaseClient.from.mockReturnValue({
        delete: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            eq: jest.fn().mockResolvedValue({ error: null }),
          }),
        }),
      });

      await expect(
        conversionRecoveryService.deleteRecoveryCampaign(campaignId, userId),
      ).resolves.not.toThrow();
    });
  });

  describe('executeRecoveryCampaign', () => {
    it('should execute a recovery campaign successfully', async () => {
      const campaignId = 'test-campaign-id';
      const targetUserId = 'test-user-id';
      const userId = 'test-user-id';
      const clientId = 'test-client-id';

      const mockCampaign = {
        id: campaignId,
        name: 'Test Campaign',
        targetSegment: 'abandoned_checkout',
        recoveryStrategy: 'email_sequence',
        isActive: true,
        userId,
        clientId,
        successMetrics: {
          targetConversionRate: 0,
          currentConversionRate: 0,
          totalRecovered: 0,
          totalAttempted: 0,
          averageRecoveryTime: 0,
          costPerRecovery: 0,
        },
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      const mockExecution = {
        id: 'execution-id',
        campaignId,
        userId: targetUserId,
        clientId,
        status: 'pending',
        strategy: 'email_sequence',
        startDate: new Date().toISOString(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      // Create a comprehensive mock that handles all the database calls
      let callCount = 0;
      mockSupabaseClient.from.mockImplementation(() => {
        callCount++;

        // First call: getRecoveryCampaign
        if (callCount === 1) {
          return {
            select: jest.fn().mockReturnValue({
              eq: jest.fn().mockReturnValue({
                eq: jest.fn().mockReturnValue({
                  single: jest.fn().mockResolvedValue({ data: mockCampaign, error: null }),
                }),
              }),
            }),
          };
        }

        // Subsequent calls: user behavior profile, user data, execution creation, etc.
        return {
          select: jest.fn().mockReturnValue({
            eq: jest.fn().mockReturnValue({
              eq: jest.fn().mockReturnValue({
                single: jest.fn().mockResolvedValue({ data: null, error: { code: 'PGRST116' } }),
                limit: jest.fn().mockResolvedValue({ data: [], error: null }),
              }),
              single: jest.fn().mockResolvedValue({
                data: { email: 'test@example.com', full_name: 'Test User' },
                error: null,
              }),
            }),
          }),
          insert: jest.fn().mockReturnValue({
            select: jest.fn().mockReturnValue({
              single: jest.fn().mockResolvedValue({ data: mockExecution, error: null }),
            }),
          }),
          update: jest.fn().mockReturnValue({
            eq: jest.fn().mockResolvedValue({ error: null }),
          }),
        };
      });

      const result = await conversionRecoveryService.executeRecoveryCampaign(
        campaignId,
        targetUserId,
        userId,
        clientId,
      );

      expect(result).toEqual(mockExecution);
    });

    it('should throw error when campaign not found', async () => {
      const campaignId = 'non-existent-id';
      const targetUserId = 'test-user-id';
      const userId = 'test-user-id';
      const clientId = 'test-client-id';

      // Mock the campaign query to return null
      mockSupabaseClient.from.mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            eq: jest.fn().mockReturnValue({
              single: jest.fn().mockResolvedValue({ data: null, error: { code: 'PGRST116' } }),
            }),
          }),
        }),
      });

      await expect(
        conversionRecoveryService.executeRecoveryCampaign(
          campaignId,
          targetUserId,
          userId,
          clientId,
        ),
      ).rejects.toThrow('Recovery campaign not found');
    });

    it('should throw error when campaign is not active', async () => {
      const campaignId = 'test-campaign-id';
      const targetUserId = 'test-user-id';
      const userId = 'test-user-id';
      const clientId = 'test-client-id';

      const mockCampaign = {
        id: campaignId,
        name: 'Test Campaign',
        targetSegment: 'abandoned_checkout',
        recoveryStrategy: 'email_sequence',
        isActive: false, // Not active
        userId,
        clientId,
        successMetrics: {
          targetConversionRate: 0,
          currentConversionRate: 0,
          totalRecovered: 0,
          totalAttempted: 0,
          averageRecoveryTime: 0,
          costPerRecovery: 0,
        },
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      // Mock the campaign query
      mockSupabaseClient.from.mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            eq: jest.fn().mockReturnValue({
              single: jest.fn().mockResolvedValue({ data: mockCampaign, error: null }),
            }),
          }),
        }),
      });

      await expect(
        conversionRecoveryService.executeRecoveryCampaign(
          campaignId,
          targetUserId,
          userId,
          clientId,
        ),
      ).rejects.toThrow('Recovery campaign is not active');
    });
  });

  describe('completeRecoveryExecution', () => {
    it('should complete a recovery execution successfully', async () => {
      const executionId = 'test-execution-id';
      const result: RecoveryResult = {
        outcome: 'converted',
        conversionValue: 150.0,
        feedback: 'User successfully re-engaged',
        followUpRequired: false,
        completedAt: new Date().toISOString(),
      };

      // Mock execution data for the test
      const mockExecutionData = {
        campaign_id: 'campaign-id',
      };

      // Create a comprehensive mock for this test
      let callCount = 0;
      mockSupabaseClient.from.mockImplementation(() => {
        callCount++;

        // First call: update execution
        if (callCount === 1) {
          return {
            update: jest.fn().mockReturnValue({
              eq: jest.fn().mockResolvedValue({ error: null }),
            }),
          };
        }

        // Second call: get execution to find campaign (in updateCampaignMetrics)
        if (callCount === 2) {
          return {
            select: jest.fn().mockReturnValue({
              eq: jest.fn().mockReturnValue({
                single: jest.fn().mockResolvedValue({ data: mockExecutionData, error: null }),
              }),
            }),
          };
        }

        // Third call: update campaign metrics
        return {
          update: jest.fn().mockReturnValue({
            eq: jest.fn().mockResolvedValue({ error: null }),
          }),
        };
      });

      await expect(
        conversionRecoveryService.completeRecoveryExecution(executionId, result),
      ).resolves.not.toThrow();
    });
  });

  describe('getRecoveryExecutions', () => {
    it('should get recovery executions for a campaign', async () => {
      const campaignId = 'test-campaign-id';
      const userId = 'test-user-id';
      const mockExecutions = [
        {
          id: 'execution-1',
          campaignId,
          userId,
          status: 'completed',
          strategy: 'email_sequence',
          startDate: new Date().toISOString(),
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      ];

      // Mock the select operation
      mockSupabaseClient.from.mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            eq: jest.fn().mockReturnValue({
              order: jest.fn().mockResolvedValue({ data: mockExecutions, error: null }),
            }),
          }),
        }),
      });

      const result = await conversionRecoveryService.getRecoveryExecutions(campaignId, userId);

      expect(result).toEqual(mockExecutions);
    });
  });

  describe('getRecoveryAnalytics', () => {
    it('should get recovery analytics', async () => {
      const userId = 'test-user-id';
      const clientId = 'test-client-id';
      const mockCampaigns = [
        {
          id: 'campaign-1',
          name: 'Campaign 1',
          targetSegment: 'abandoned_checkout',
          recoveryStrategy: 'email_sequence',
          isActive: true,
          userId,
          clientId,
          successMetrics: {
            targetConversionRate: 0,
            currentConversionRate: 0,
            totalRecovered: 5,
            totalAttempted: 20,
            averageRecoveryTime: 2.5,
            costPerRecovery: 10.0,
          },
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      ];

      // Mock the select operation
      mockSupabaseClient.from.mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            eq: jest.fn().mockResolvedValue({ data: mockCampaigns, error: null }),
          }),
        }),
      });

      const result = await conversionRecoveryService.getRecoveryAnalytics(userId, clientId);

      expect(result).toBeDefined();
      expect(result.totalCampaigns).toBe(1);
      expect(result.activeCampaigns).toBe(1);
      expect(result.totalRecovered).toBe(5);
      expect(result.averageRecoveryRate).toBe(25); // 5/20 * 100
    });
  });
});
