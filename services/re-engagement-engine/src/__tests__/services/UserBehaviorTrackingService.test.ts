import { UserBehaviorTrackingService } from '../../services/UserBehaviorTrackingService';
import { UserBehaviorEvent } from '../../types';

// Mock the Supabase client module
const mockSupabaseClient = {
  from: jest.fn(),
};

// Builder to simulate Supabase query chaining
const buildChain = (
  final: any,
  terminal: 'single' | 'order' | 'range' | 'limit' | 'eq' | 'eq2' = 'single',
) => {
  const chain: any = {
    select: jest.fn().mockReturnThis(),
    insert: jest.fn().mockReturnThis(),
    update: jest.fn().mockReturnThis(),
    delete: jest.fn().mockReturnThis(),
    eq: jest.fn().mockReturnThis(),
    lt: jest.fn().mockReturnThis(),
    order: jest.fn().mockReturnThis(),
    range: jest.fn().mockReturnThis(),
    single: jest.fn().mockReturnThis(),
    limit: jest.fn().mockReturnThis(),
  };
  if (terminal === 'eq2') {
    let count = 0;
    chain.eq = jest.fn().mockImplementation(() => {
      count++;
      if (count >= 2) {
        return Promise.resolve(final);
      }
      return chain;
    });
    return chain;
  }
  if (terminal === 'eq') {
    chain.eq = jest.fn().mockImplementation(() => Promise.resolve(final));
    return chain;
  }
  chain[terminal].mockResolvedValue(final);
  return chain;
};

jest.mock('@supabase/supabase-js', () => ({
  createClient: jest.fn(() => mockSupabaseClient),
}));

describe('UserBehaviorTrackingService', () => {
  let behaviorTrackingService: UserBehaviorTrackingService;

  beforeEach(() => {
    jest.clearAllMocks();
    behaviorTrackingService = new UserBehaviorTrackingService(
      'https://test.supabase.co',
      'test-key',
    );
  });

  describe('trackEvent', () => {
    it('should track a user behavior event successfully', async () => {
      const userId = 'test-user-id';
      const clientId = 'test-client-id';
      const eventType = 'page_view';
      const eventData = { page: '/dashboard', duration: 120 };

      const mockEvent: UserBehaviorEvent = {
        id: 'event-id',
        userId,
        clientId,
        eventType,
        eventData,
        timestamp: '2023-01-01T00:00:00Z',
        metadata: {},
      };

      // Mock event insertion
      mockSupabaseClient.from.mockReturnValueOnce(
        buildChain({ data: mockEvent, error: null }, 'single'),
      );

      // Mock behavior profile update (existing profile)
      mockSupabaseClient.from.mockReturnValueOnce(
        buildChain(
          {
            data: {
              id: 'profile-id',
              userId,
              clientId,
              engagementScore: 0.5,
              lastActivityAt: '2023-01-01T00:00:00Z',
              preferredChannels: [],
              behaviorPatterns: [],
              riskFactors: [],
            },
            error: null,
          },
          'single',
        ),
      );

      // Mock profile update
      mockSupabaseClient.from.mockReturnValueOnce(buildChain({ error: null }, 'eq'));

      const result = await behaviorTrackingService.trackEvent(
        userId,
        eventType,
        eventData,
        undefined,
        undefined,
        undefined,
        clientId,
      );

      expect(result).toEqual(mockEvent);
    });

    it('should create new behavior profile when none exists', async () => {
      const userId = 'test-user-id';
      const clientId = 'test-client-id';
      const eventType = 'page_view';
      const eventData = { page: '/dashboard', duration: 120 };

      const mockEvent: UserBehaviorEvent = {
        id: 'event-id',
        userId,
        clientId,
        eventType,
        eventData,
        timestamp: '2023-01-01T00:00:00Z',
        metadata: {},
      };

      // Mock event insertion
      mockSupabaseClient.from.mockReturnValueOnce(
        buildChain({ data: mockEvent, error: null }, 'single'),
      );

      // Mock behavior profile not found
      mockSupabaseClient.from.mockReturnValueOnce(
        buildChain({ data: null, error: { code: 'PGRST116' } }, 'single'),
      );

      // Mock profile creation
      mockSupabaseClient.from.mockReturnValueOnce(
        buildChain(
          {
            data: {
              id: 'profile-id',
              userId,
              clientId,
              engagementScore: 0.1,
              lastActivityAt: '2023-01-01T00:00:00Z',
              preferredChannels: [],
              behaviorPatterns: [],
              riskFactors: [],
            },
            error: null,
          },
          'single',
        ),
      );

      const result = await behaviorTrackingService.trackEvent(
        userId,
        eventType,
        eventData,
        undefined,
        undefined,
        undefined,
        clientId,
      );

      expect(result).toEqual(mockEvent);
    });
  });

  describe('getBehaviorProfile', () => {
    it('should get user behavior profile', async () => {
      const userId = 'test-user-id';
      const clientId = 'test-client-id';
      const mockProfile = {
        id: 'profile-id',
        userId,
        clientId,
        engagementScore: 0.75,
        lastActivityAt: '2023-01-01T00:00:00Z',
        riskFactors: [],
        behaviorPatterns: [],
        createdAt: '2023-01-01T00:00:00Z',
        updatedAt: '2023-01-01T00:00:00Z',
      };

      // Mock the profile query
      mockSupabaseClient.from.mockReturnValueOnce(
        buildChain({ data: mockProfile, error: null }, 'single'),
      );

      const result = await behaviorTrackingService.getBehaviorProfile(userId, clientId);

      expect(result).toEqual(mockProfile);
    });

    it('should return null when profile not found', async () => {
      const userId = 'test-user-id';

      // Mock the profile query to return null
      mockSupabaseClient.from.mockReturnValueOnce(
        buildChain({ data: null, error: { code: 'PGRST116' } }, 'single'),
      );

      const result = await behaviorTrackingService.getBehaviorProfile(userId);

      expect(result).toBeNull();
    });
  });

  describe('getBehaviorEvents', () => {
    it('should get behavior events for a user', async () => {
      const userId = 'test-user-id';
      const clientId = 'test-client-id';
      const mockEvents = [
        {
          id: 'event-1',
          userId,
          clientId,
          eventType: 'page_view',
          eventData: { page: '/dashboard' },
          timestamp: '2023-01-01T00:00:00Z',
          metadata: {},
        },
      ];

      // Mock the events query
      mockSupabaseClient.from.mockReturnValueOnce(
        buildChain({ data: mockEvents, error: null }, 'range'),
      );

      const result = await behaviorTrackingService.getBehaviorEvents(
        userId,
        clientId,
        'page_view',
        0,
        10,
      );

      expect(result).toEqual(mockEvents);
    });
  });

  describe('getAtRiskUsers', () => {
    it('should get users at risk of churning', async () => {
      const clientId = 'test-client-id';
      const mockAtRiskUsers = [
        {
          id: 'profile-1',
          userId: 'user-1',
          clientId,
          engagementScore: 0.2,
          riskFactors: ['low_engagement'],
          lastActivityAt: '2023-01-01T00:00:00Z',
        },
      ];

      // Mock the at-risk users query
      mockSupabaseClient.from.mockReturnValueOnce(
        buildChain({ data: mockAtRiskUsers, error: null }, 'limit'),
      );

      const result = await behaviorTrackingService.getAtRiskUsers(clientId, 0.3, 10);

      expect(result).toEqual(mockAtRiskUsers);
    });
  });

  describe('getBehaviorAnalytics', () => {
    it('should get behavior analytics', async () => {
      const userId = 'test-user-id';
      const clientId = 'test-client-id';
      const mockProfiles = [
        {
          id: 'profile-1',
          userId: 'user-1',
          clientId,
          engagementScore: 0.75,
          riskFactors: [],
          lastActivityAt: '2023-01-01T00:00:00Z',
        },
        {
          id: 'profile-2',
          userId: 'user-2',
          clientId,
          engagementScore: 0.25,
          riskFactors: ['low_engagement'],
          lastActivityAt: '2023-01-01T00:00:00Z',
        },
      ];

      // Mock the profiles query
      mockSupabaseClient.from.mockReturnValueOnce(
        buildChain({ data: mockProfiles as any, error: null }, 'eq2'),
      );

      const result = await behaviorTrackingService.getBehaviorAnalytics(userId, clientId);

      expect(result).toBeDefined();
      expect(result.totalUsers).toBe(2);
      expect(result.averageEngagementScore).toBe(0.5);
    });
  });

  describe('resolveRiskFactor', () => {
    it('should resolve a risk factor', async () => {
      const userId = 'test-user-id';
      const factor = 'low_engagement';
      const clientId = 'test-client-id';

      // Mock the risk factor resolution
      mockSupabaseClient.from.mockReturnValueOnce(buildChain({ error: null }, 'eq2'));

      await expect(
        behaviorTrackingService.resolveRiskFactor(userId, factor, clientId),
      ).resolves.not.toThrow();
    });
  });
});
