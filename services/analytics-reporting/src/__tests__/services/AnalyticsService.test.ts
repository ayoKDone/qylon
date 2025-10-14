/**
 * AnalyticsService Tests
 * Tests for the main analytics service orchestrator
 */

import { AnalyticsService } from '../../services/AnalyticsService';

// Mock Supabase client
jest.mock('@supabase/supabase-js', () => ({
  createClient: jest.fn(() => ({
    from: jest.fn(() => ({
      select: jest.fn().mockReturnThis(),
      insert: jest.fn().mockReturnThis(),
      update: jest.fn().mockReturnThis(),
      delete: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      gte: jest.fn().mockReturnThis(),
      lte: jest.fn().mockReturnThis(),
      order: jest.fn().mockReturnThis(),
      limit: jest.fn().mockReturnThis(),
      range: jest.fn().mockReturnThis(),
      single: jest.fn().mockResolvedValue({ data: { id: 'test-id' }, error: null }),
      auth: {
        getUser: jest.fn().mockResolvedValue({ data: { user: null }, error: null })
      },
      rpc: jest.fn().mockResolvedValue({ data: [], error: null })
    }))
  }))
}));

describe('AnalyticsService', () => {
  let analyticsService: AnalyticsService;

  beforeEach(() => {
    jest.clearAllMocks();
    analyticsService = new AnalyticsService(
      'https://test.supabase.co',
      'test-service-role-key'
    );
  });

  describe('constructor', () => {
    it('should initialize with valid parameters', () => {
      expect(analyticsService).toBeInstanceOf(AnalyticsService);
    });
  });

  describe('trackEvent', () => {
    it('should track analytics event successfully', async () => {
      const eventData = {
        user_id: 'test-user-id',
        client_id: 'test-client-id',
        event_type: 'page_view',
        event_name: 'homepage_visit',
        event_data: { page: '/home' }
      };

      const result = await analyticsService.trackEvent(eventData);
      expect(result).toBeDefined();
      expect(result.id).toBe('test-id');
    });

    it('should handle tracking with empty data', async () => {
      const invalidEventData = {
        user_id: '',
        client_id: '',
        event_type: '',
        event_name: '',
        event_data: {}
      };

      const result = await analyticsService.trackEvent(invalidEventData);
      expect(result).toBeDefined();
    });
  });

  describe('trackConversion', () => {
    it('should track conversion event successfully', async () => {
      const conversionData = {
        user_id: 'test-user-id',
        client_id: 'test-client-id',
        conversion_type: 'signup',
        conversion_value: 100
      };

      const result = await analyticsService.trackConversion(conversionData);
      expect(result).toBeDefined();
      expect(result.id).toBe('test-id');
    });

    it('should handle conversion tracking with empty data', async () => {
      const invalidConversionData = {
        user_id: '',
        client_id: '',
        conversion_type: '',
        conversion_value: -1
      };

      const result = await analyticsService.trackConversion(invalidConversionData);
      expect(result).toBeDefined();
    });
  });

  describe('getAnalyticsEvents', () => {
    it('should retrieve analytics events successfully', async () => {
      const filters = {
        user_id: 'test-user-id',
        event_type: 'page_view',
        start_date: new Date('2024-01-01'),
        end_date: new Date('2024-12-31')
      };

      const result = await analyticsService.getAnalyticsEvents(filters);
      expect(Array.isArray(result)).toBe(true);
    });

    it('should handle empty filters', async () => {
      const result = await analyticsService.getAnalyticsEvents({});
      expect(Array.isArray(result)).toBe(true);
    });
  });

  describe('getConversionEvents', () => {
    it('should retrieve conversion events successfully', async () => {
      const filters = {
        user_id: 'test-user-id',
        conversion_type: 'signup',
        start_date: new Date('2024-01-01'),
        end_date: new Date('2024-12-31')
      };

      const result = await analyticsService.getConversionEvents(filters);
      expect(Array.isArray(result)).toBe(true);
    });

    it('should handle empty filters', async () => {
      const result = await analyticsService.getConversionEvents({});
      expect(Array.isArray(result)).toBe(true);
    });
  });

  describe('getUserAnalytics', () => {
    it('should retrieve user analytics successfully', async () => {
      const result = await analyticsService.getUserAnalytics('test-user-id');
      expect(result).toBeDefined();
      expect(result.user_id).toBe('test-user-id');
    });

    it('should handle empty user ID', async () => {
      const result = await analyticsService.getUserAnalytics('');
      expect(result).toBeDefined();
      expect(result.user_id).toBe('');
    });
  });

  describe('getClientAnalytics', () => {
    it('should retrieve client analytics successfully', async () => {
      const result = await analyticsService.getClientAnalytics('test-client-id');
      expect(result).toBeDefined();
      expect(result.client_id).toBe('test-client-id');
    });

    it('should handle empty client ID', async () => {
      const result = await analyticsService.getClientAnalytics('');
      expect(result).toBeDefined();
      expect(result.client_id).toBe('');
    });
  });

  describe('getAnalyticsDashboard', () => {
    it('should retrieve dashboard data successfully', async () => {
      const result = await analyticsService.getAnalyticsDashboard('test-client-id');
      expect(result).toBeDefined();
      expect(result.total_events).toBeDefined();
    });

    it('should handle empty client ID', async () => {
      const result = await analyticsService.getAnalyticsDashboard('');
      expect(result).toBeDefined();
      expect(result.total_events).toBeDefined();
    });
  });
});
