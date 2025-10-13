import { ConversionRecoveryService } from '../../services/ConversionRecoveryService';
import { CreateRecoveryCampaignRequest, RecoveryResult } from '../../types';

describe('ConversionRecoveryService', () => {
  let conversionRecoveryService: ConversionRecoveryService;
  let mockSupabase: any;
  let mockOpenAI: any;

  beforeEach(() => {
    jest.clearAllMocks();

    // Mock Supabase client
    mockSupabase = {
      from: jest.fn(() => ({
        select: jest.fn().mockReturnThis(),
        insert: jest.fn().mockReturnThis(),
        update: jest.fn().mockReturnThis(),
        delete: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        order: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({ data: null, error: null }),
      })),
      raw: jest.fn((query) => query),
    };

    // Mock OpenAI
    mockOpenAI = {
      chat: {
        completions: {
          create: jest.fn().mockResolvedValue({
            choices: [{
              message: {
                content: 'Mock personalized recovery content for testing'
              }
            }]
          })
        }
      }
    };

    conversionRecoveryService = new ConversionRecoveryService(
      'https://test.supabase.co',
      'test-service-role-key',
      'test-openai-key'
    );
  });

  describe('createRecoveryCampaign', () => {
    it('should create a new recovery campaign successfully', async () => {
      const userId = 'test-user-id';
      const request: CreateRecoveryCampaignRequest = {
        name: 'Test Recovery Campaign',
        description: 'Test description',
        targetSegment: 'low_engagement',
        recoveryStrategy: 'email_sequence',
        clientId: 'test-client-id',
      };

      const mockCampaign = {
        id: 'campaign-id',
        name: 'Test Recovery Campaign',
        description: 'Test description',
        targetSegment: 'low_engagement',
        recoveryStrategy: 'email_sequence',
        isActive: true,
        userId,
        clientId: 'test-client-id',
        successMetrics: {
          targetConversionRate: 0,
          currentConversionRate: 0,
          totalRecovered: 0,
          totalAttempted: 0,
          averageRecoveryTime: 0,
          costPerRecovery: 0,
        },
        createdAt: '2023-01-01T00:00:00Z',
        updatedAt: '2023-01-01T00:00:00Z',
      };

      mockSupabase.from().insert().select().single()
        .mockResolvedValueOnce({ data: mockCampaign, error: null });

      const result = await conversionRecoveryService.createRecoveryCampaign(userId, request);

      expect(result).toEqual(mockCampaign);
      expect(mockSupabase.from).toHaveBeenCalledWith('conversion_recovery_campaigns');
    });

    it('should throw error when campaign creation fails', async () => {
      const userId = 'test-user-id';
      const request: CreateRecoveryCampaignRequest = {
        name: 'Test Recovery Campaign',
        description: 'Test description',
        targetSegment: 'low_engagement',
        recoveryStrategy: 'email_sequence',
      };

      mockSupabase.from().insert().select().single()
        .mockResolvedValueOnce({ data: null, error: { message: 'Database error' } });

      await expect(conversionRecoveryService.createRecoveryCampaign(userId, request))
        .rejects.toThrow('Failed to create recovery campaign: Database error');
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
          targetSegment: 'low_engagement',
          recoveryStrategy: 'email_sequence',
        },
        {
          id: 'campaign-2',
          name: 'Campaign 2',
          targetSegment: 'inactive_users',
          recoveryStrategy: 'incentive_offer',
        },
      ];

      mockSupabase.from().select().eq().eq().order()
        .mockResolvedValueOnce({ data: mockCampaigns, error: null });

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
        targetSegment: 'low_engagement',
        recoveryStrategy: 'email_sequence',
        isActive: true,
      };

      mockSupabase.from().select().eq().eq().single()
        .mockResolvedValueOnce({ data: mockCampaign, error: null });

      const result = await conversionRecoveryService.getRecoveryCampaign(campaignId, userId);

      expect(result).toEqual(mockCampaign);
    });

    it('should return null when campaign not found', async () => {
      const campaignId = 'non-existent-id';
      const userId = 'test-user-id';

      mockSupabase.from().select().eq().eq().single()
        .mockResolvedValueOnce({ data: null, error: { code: 'PGRST116' } });

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
        isActive: false,
        targetSegment: 'low_engagement',
        recoveryStrategy: 'email_sequence',
      };

      mockSupabase.from().update().eq().eq().select().single()
        .mockResolvedValueOnce({ data: mockUpdatedCampaign, error: null });

      const result = await conversionRecoveryService.updateRecoveryCampaign(
        campaignId,
        userId,
        updateRequest
      );

      expect(result).toEqual(mockUpdatedCampaign);
    });
  });

  describe('deleteRecoveryCampaign', () => {
    it('should delete a recovery campaign successfully', async () => {
      const campaignId = 'test-campaign-id';
      const userId = 'test-user-id';

      mockSupabase.from().delete().eq().eq()
        .mockResolvedValueOnce({ error: null });

      await expect(conversionRecoveryService.deleteRecoveryCampaign(campaignId, userId))
        .resolves.not.toThrow();

      expect(mockSupabase.from).toHaveBeenCalledWith('conversion_recovery_campaigns');
    });
  });

  describe('executeRecoveryCampaign', () => {
    it('should execute a recovery campaign successfully', async () => {
      const campaignId = 'test-campaign-id';
      const targetUserId = 'target-user-id';
      const userId = 'test-user-id';
      const clientId = 'test-client-id';

      const mockCampaign = {
        id: campaignId,
        name: 'Test Campaign',
        targetSegment: 'low_engagement',
        recoveryStrategy: 'email_sequence',
        isActive: true,
      };

      const mockUser = {
        full_name: 'Test User',
        company_name: 'Test Company',
        industry: 'technology',
      };

      const mockProfile = {
        engagement_score: 20,
        last_activity_at: '2023-01-01T00:00:00Z',
        risk_factors: [
          { factor: 'low_engagement' }
        ],
      };

      const mockExecution = {
        id: 'execution-id',
        campaignId,
        userId: targetUserId,
        clientId,
        status: 'pending',
        strategy: 'email_sequence',
        startDate: '2023-01-01T00:00:00Z',
        createdAt: '2023-01-01T00:00:00Z',
        updatedAt: '2023-01-01T00:00:00Z',
      };

      // Mock getRecoveryCampaign
      mockSupabase.from().select().eq().eq().single()
        .mockResolvedValueOnce({ data: mockCampaign, error: null });

      // Mock user data
      mockSupabase.from().select().eq().single()
        .mockResolvedValueOnce({ data: mockUser, error: null });

      // Mock behavior profile
      mockSupabase.from().select().eq().eq().single()
        .mockResolvedValueOnce({ data: mockProfile, error: null });

      // Mock execution creation
      mockSupabase.from().insert().select().single()
        .mockResolvedValueOnce({ data: mockExecution, error: null });

      // Mock execution update
      mockSupabase.from().update().eq()
        .mockResolvedValueOnce({ error: null });

      const result = await conversionRecoveryService.executeRecoveryCampaign(
        campaignId,
        targetUserId,
        userId,
        clientId
      );

      expect(result).toEqual(mockExecution);
    });

    it('should throw error when campaign not found', async () => {
      const campaignId = 'non-existent-id';
      const targetUserId = 'target-user-id';
      const userId = 'test-user-id';

      mockSupabase.from().select().eq().eq().single()
        .mockResolvedValueOnce({ data: null, error: { code: 'PGRST116' } });

      await expect(conversionRecoveryService.executeRecoveryCampaign(
        campaignId,
        targetUserId,
        userId
      )).rejects.toThrow('Recovery campaign not found');
    });

    it('should throw error when campaign is not active', async () => {
      const campaignId = 'test-campaign-id';
      const targetUserId = 'target-user-id';
      const userId = 'test-user-id';

      const mockCampaign = {
        id: campaignId,
        name: 'Test Campaign',
        targetSegment: 'low_engagement',
        recoveryStrategy: 'email_sequence',
        isActive: false,
      };

      mockSupabase.from().select().eq().eq().single()
        .mockResolvedValueOnce({ data: mockCampaign, error: null });

      await expect(conversionRecoveryService.executeRecoveryCampaign(
        campaignId,
        targetUserId,
        userId
      )).rejects.toThrow('Recovery campaign is not active');
    });
  });

  describe('completeRecoveryExecution', () => {
    it('should complete a recovery execution successfully', async () => {
      const executionId = 'test-execution-id';
      const result: RecoveryResult = {
        outcome: 'converted',
        conversionValue: 100,
        feedback: 'User was successfully re-engaged',
        followUpRequired: false,
        completedAt: '2023-01-01T00:00:00Z',
      };

      const mockExecution = {
        campaign_id: 'campaign-id',
      };

      // Mock get execution
      mockSupabase.from().select().eq().single()
        .mockResolvedValueOnce({ data: mockExecution, error: null });

      // Mock update execution
      mockSupabase.from().update().eq()
        .mockResolvedValueOnce({ error: null });

      // Mock update campaign metrics
      mockSupabase.from().update().eq()
        .mockResolvedValueOnce({ error: null });

      await expect(conversionRecoveryService.completeRecoveryExecution(executionId, result))
        .resolves.not.toThrow();

      expect(mockSupabase.from).toHaveBeenCalledWith('conversion_recovery_executions');
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
        },
        {
          id: 'execution-2',
          campaignId,
          userId,
          status: 'active',
          strategy: 'incentive_offer',
        },
      ];

      mockSupabase.from().select().eq().eq().order()
        .mockResolvedValueOnce({ data: mockExecutions, error: null });

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
          isActive: true,
          successMetrics: {
            totalRecovered: 5,
            totalAttempted: 10,
            averageRecoveryTime: 7,
            costPerRecovery: 25,
          },
        },
        {
          id: 'campaign-2',
          isActive: false,
          successMetrics: {
            totalRecovered: 3,
            totalAttempted: 8,
            averageRecoveryTime: 5,
            costPerRecovery: 30,
          },
        },
      ];

      mockSupabase.from().select().eq().eq()
        .mockResolvedValueOnce({ data: mockCampaigns, error: null });

      const result = await conversionRecoveryService.getRecoveryAnalytics(userId, clientId);

      expect(result).toBeDefined();
      expect(result.totalCampaigns).toBe(2);
      expect(result.activeCampaigns).toBe(1);
      expect(result.totalRecovered).toBe(8);
      expect(result.averageRecoveryRate).toBe(44.44); // 8/18 * 100
      expect(result.averageRecoveryTime).toBe(6);
      expect(result.costPerRecovery).toBe(27.5);
    });
  });
});
