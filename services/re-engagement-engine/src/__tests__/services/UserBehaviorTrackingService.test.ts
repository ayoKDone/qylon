import { UserBehaviorTrackingService } from '../../services/UserBehaviorTrackingService';
import { UserBehaviorEvent, UserBehaviorProfile } from '../../types';

describe('UserBehaviorTrackingService', () => {
  let behaviorTrackingService: UserBehaviorTrackingService;
  let mockSupabase: any;

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
        range: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        lt: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({ data: null, error: null }),
      })),
      raw: jest.fn((query) => query),
    };

    behaviorTrackingService = new UserBehaviorTrackingService(
      'https://test.supabase.co',
      'test-service-role-key'
    );
  });

  describe('trackEvent', () => {
    it('should track a user behavior event successfully', async () => {
      const userId = 'test-user-id';
      const eventType = 'login';
      const eventData = { timestamp: '2023-01-01T00:00:00Z' };
      const sessionId = 'test-session-id';
      const clientId = 'test-client-id';

      const mockEvent: UserBehaviorEvent = {
        id: 'event-id',
        userId,
        clientId,
        eventType,
        eventData,
        sessionId,
        timestamp: '2023-01-01T00:00:00Z',
        metadata: {},
      };

      // Mock event creation
      mockSupabase.from().insert().select().single()
        .mockResolvedValueOnce({ data: mockEvent, error: null });

      // Mock behavior profile update (existing profile)
      const mockProfile: UserBehaviorProfile = {
        id: 'profile-id',
        userId,
        clientId,
        engagementScore: 50,
        lastActivityAt: '2023-01-01T00:00:00Z',
        totalSessions: 5,
        averageSessionDuration: 30,
        preferredChannels: ['email'],
        behaviorPatterns: [],
        riskFactors: [],
        createdAt: '2023-01-01T00:00:00Z',
        updatedAt: '2023-01-01T00:00:00Z',
      };

      mockSupabase.from().select().eq().eq().single()
        .mockResolvedValueOnce({ data: mockProfile, error: null });

      mockSupabase.from().update().eq()
        .mockResolvedValueOnce({ error: null });

      const result = await behaviorTrackingService.trackEvent(
        userId,
        eventType,
        eventData,
        sessionId,
        undefined,
        undefined,
        clientId
      );

      expect(result).toEqual(mockEvent);
      expect(mockSupabase.from).toHaveBeenCalledWith('user_behavior_events');
    });

    it('should create new behavior profile when none exists', async () => {
      const userId = 'test-user-id';
      const eventType = 'login';
      const eventData = { timestamp: '2023-01-01T00:00:00Z' };

      const mockEvent: UserBehaviorEvent = {
        id: 'event-id',
        userId,
        eventType,
        eventData,
        timestamp: '2023-01-01T00:00:00Z',
        metadata: {},
      };

      // Mock event creation
      mockSupabase.from().insert().select().single()
        .mockResolvedValueOnce({ data: mockEvent, error: null });

      // Mock behavior profile not found
      mockSupabase.from().select().eq().eq().single()
        .mockResolvedValueOnce({ data: null, error: { code: 'PGRST116' } });

      // Mock new profile creation
      const mockNewProfile: UserBehaviorProfile = {
        id: 'new-profile-id',
        userId,
        engagementScore: 10,
        lastActivityAt: '2023-01-01T00:00:00Z',
        totalSessions: 0,
        averageSessionDuration: 0,
        preferredChannels: [],
        behaviorPatterns: [],
        riskFactors: [],
        createdAt: '2023-01-01T00:00:00Z',
        updatedAt: '2023-01-01T00:00:00Z',
      };

      mockSupabase.from().insert().select().single()
        .mockResolvedValueOnce({ data: mockNewProfile, error: null });

      mockSupabase.from().update().eq()
        .mockResolvedValueOnce({ error: null });

      const result = await behaviorTrackingService.trackEvent(
        userId,
        eventType,
        eventData
      );

      expect(result).toEqual(mockEvent);
    });
  });

  describe('getBehaviorProfile', () => {
    it('should get user behavior profile', async () => {
      const userId = 'test-user-id';
      const clientId = 'test-client-id';

      const mockProfile: UserBehaviorProfile = {
        id: 'profile-id',
        userId,
        clientId,
        engagementScore: 75,
        lastActivityAt: '2023-01-01T00:00:00Z',
        totalSessions: 10,
        averageSessionDuration: 45,
        preferredChannels: ['email', 'push'],
        behaviorPatterns: [
          {
            pattern: 'login_hour_9',
            frequency: 5,
            lastOccurrence: '2023-01-01T00:00:00Z',
            confidence: 80,
          },
        ],
        riskFactors: [],
        createdAt: '2023-01-01T00:00:00Z',
        updatedAt: '2023-01-01T00:00:00Z',
      };

      mockSupabase.from().select().eq().eq().single()
        .mockResolvedValueOnce({ data: mockProfile, error: null });

      const result = await behaviorTrackingService.getBehaviorProfile(userId, clientId);

      expect(result).toEqual(mockProfile);
    });

    it('should return null when profile not found', async () => {
      const userId = 'test-user-id';

      mockSupabase.from().select().eq().eq().single()
        .mockResolvedValueOnce({ data: null, error: { code: 'PGRST116' } });

      const result = await behaviorTrackingService.getBehaviorProfile(userId);

      expect(result).toBeNull();
    });
  });

  describe('getBehaviorEvents', () => {
    it('should get behavior events for a user', async () => {
      const userId = 'test-user-id';
      const clientId = 'test-client-id';
      const eventType = 'login';
      const limit = 50;
      const offset = 0;

      const mockEvents: UserBehaviorEvent[] = [
        {
          id: 'event-1',
          userId,
          clientId,
          eventType,
          eventData: { timestamp: '2023-01-01T00:00:00Z' },
          timestamp: '2023-01-01T00:00:00Z',
          metadata: {},
        },
        {
          id: 'event-2',
          userId,
          clientId,
          eventType,
          eventData: { timestamp: '2023-01-01T01:00:00Z' },
          timestamp: '2023-01-01T01:00:00Z',
          metadata: {},
        },
      ];

      mockSupabase.from().select().eq().eq().eq().order().range()
        .mockResolvedValueOnce({ data: mockEvents, error: null });

      const result = await behaviorTrackingService.getBehaviorEvents(
        userId,
        clientId,
        eventType,
        limit,
        offset
      );

      expect(result).toEqual(mockEvents);
    });
  });

  describe('getAtRiskUsers', () => {
    it('should get users at risk of churning', async () => {
      const clientId = 'test-client-id';
      const minRiskScore = 30;
      const limit = 100;

      const mockAtRiskUsers: UserBehaviorProfile[] = [
        {
          id: 'profile-1',
          userId: 'user-1',
          clientId,
          engagementScore: 20,
          lastActivityAt: '2023-01-01T00:00:00Z',
          totalSessions: 2,
          averageSessionDuration: 15,
          preferredChannels: [],
          behaviorPatterns: [],
          riskFactors: [
            {
              factor: 'low_engagement',
              severity: 'high',
              description: 'User has very low engagement score',
              detectedAt: '2023-01-01T00:00:00Z',
            },
          ],
          createdAt: '2023-01-01T00:00:00Z',
          updatedAt: '2023-01-01T00:00:00Z',
        },
      ];

      mockSupabase.from().select().eq().lt().order().limit()
        .mockResolvedValueOnce({ data: mockAtRiskUsers, error: null });

      const result = await behaviorTrackingService.getAtRiskUsers(
        clientId,
        minRiskScore,
        limit
      );

      expect(result).toEqual(mockAtRiskUsers);
    });
  });

  describe('getBehaviorAnalytics', () => {
    it('should get behavior analytics', async () => {
      const userId = 'test-user-id';
      const clientId = 'test-client-id';

      const mockProfiles: UserBehaviorProfile[] = [
        {
          id: 'profile-1',
          userId: 'user-1',
          clientId,
          engagementScore: 80,
          lastActivityAt: '2023-01-01T00:00:00Z',
          totalSessions: 10,
          averageSessionDuration: 45,
          preferredChannels: ['email'],
          behaviorPatterns: [
            {
              pattern: 'login_hour_9',
              frequency: 5,
              lastOccurrence: '2023-01-01T00:00:00Z',
              confidence: 80,
            },
          ],
          riskFactors: [],
          createdAt: '2023-01-01T00:00:00Z',
          updatedAt: '2023-01-01T00:00:00Z',
        },
        {
          id: 'profile-2',
          userId: 'user-2',
          clientId,
          engagementScore: 20,
          lastActivityAt: '2023-01-01T00:00:00Z',
          totalSessions: 2,
          averageSessionDuration: 15,
          preferredChannels: [],
          behaviorPatterns: [],
          riskFactors: [
            {
              factor: 'low_engagement',
              severity: 'high',
              description: 'User has very low engagement score',
              detectedAt: '2023-01-01T00:00:00Z',
            },
          ],
          createdAt: '2023-01-01T00:00:00Z',
          updatedAt: '2023-01-01T00:00:00Z',
        },
      ];

      mockSupabase.from().select().eq().eq()
        .mockResolvedValueOnce({ data: mockProfiles, error: null });

      const result = await behaviorTrackingService.getBehaviorAnalytics(
        userId,
        clientId
      );

      expect(result).toBeDefined();
      expect(result.totalUsers).toBe(2);
      expect(result.activeUsers).toBe(1);
      expect(result.averageEngagementScore).toBe(50);
      expect(result.topRiskFactors).toHaveLength(1);
      expect(result.behaviorPatterns).toHaveLength(1);
    });
  });

  describe('resolveRiskFactor', () => {
    it('should resolve a risk factor', async () => {
      const userId = 'test-user-id';
      const factor = 'low_engagement';
      const clientId = 'test-client-id';

      mockSupabase.from().update().eq().eq()
        .mockResolvedValueOnce({ error: null });

      await expect(behaviorTrackingService.resolveRiskFactor(userId, factor, clientId))
        .resolves.not.toThrow();

      expect(mockSupabase.from).toHaveBeenCalledWith('user_behavior_profiles');
    });
  });
});
