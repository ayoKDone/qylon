/**
 * Analytics Routes Tests
 * API Routes Integration Tests
 */

import express from 'express';
import request from 'supertest';
import { AuthMiddleware } from '../../middleware/auth';
import { AnalyticsRoutes } from '../../routes/analytics';
import { AnalyticsService } from '../../services/AnalyticsService';

// Mock the services
jest.mock('../../services/AnalyticsService');
jest.mock('../../middleware/auth');

describe('Analytics Routes', () => {
  let app: express.Application;
  let mockAnalyticsService: jest.Mocked<AnalyticsService>;
  let mockAuthMiddleware: jest.Mocked<AuthMiddleware>;

  beforeEach(() => {
    jest.clearAllMocks();

    // Create mock instances
    mockAnalyticsService = {
      trackEvent: jest.fn(),
      trackConversion: jest.fn(),
      getAnalyticsEvents: jest.fn(),
      getConversionEvents: jest.fn(),
      getUserAnalytics: jest.fn(),
      getClientAnalytics: jest.fn(),
      getAnalyticsDashboard: jest.fn(),
      getFunnelTracking: jest.fn(),
      getConversionOptimization: jest.fn(),
      getPersonalization: jest.fn()
    } as any;

    mockAuthMiddleware = {
      authenticate: jest.fn((req, res, next) => next()),
      requireAdmin: jest.fn((req, res, next) => next()),
      requireRole: jest.fn(() => (req, res, next) => next()),
      optionalAuth: jest.fn((req, res, next) => next()),
      validateClientAccess: jest.fn((req, res, next) => next()),
      validateUserAccess: jest.fn((req, res, next) => next())
    } as any;

    // Create Express app
    app = express();
    app.use(express.json());

    // Create routes
    const analyticsRoutes = new AnalyticsRoutes(mockAnalyticsService, mockAuthMiddleware);
    app.use('/api/v1/analytics', analyticsRoutes.getRouter());
  });

  describe('POST /api/v1/analytics/events', () => {
    it('should track an event successfully', async () => {
      const eventData = {
        user_id: 'test-user-id',
        client_id: 'test-client-id',
        event_type: 'page_view',
        event_name: 'homepage_visit',
        event_data: { page: '/home' }
      };

      const mockEvent = {
        id: 'event-id',
        ...eventData,
        timestamp: new Date().toISOString(),
        created_at: new Date().toISOString()
      };

      mockAnalyticsService.trackEvent.mockResolvedValue(mockEvent);

      const response = await request(app)
        .post('/api/v1/analytics/events')
        .send(eventData)
        .expect(201);

      expect(response.body).toEqual({
        success: true,
        data: mockEvent,
        timestamp: expect.any(String)
      });
      expect(mockAnalyticsService.trackEvent).toHaveBeenCalledWith(eventData);
    });

    it('should return 400 for invalid event data', async () => {
      const invalidEventData = {
        user_id: 'invalid-uuid',
        client_id: 'test-client-id',
        event_type: 'page_view',
        event_name: 'homepage_visit'
      };

      const response = await request(app)
        .post('/api/v1/analytics/events')
        .send(invalidEventData)
        .expect(400);

      expect(response.body.error).toBe('VALIDATION_ERROR');
      expect(response.body.message).toBe('Invalid request body');
    });
  });

  describe('GET /api/v1/analytics/events', () => {
    it('should get analytics events successfully', async () => {
      const mockEvents = [
        {
          id: 'event-1',
          user_id: 'test-user-id',
          event_type: 'page_view',
          event_name: 'homepage_visit',
          timestamp: '2024-01-15T10:00:00Z'
        }
      ];

      mockAnalyticsService.getAnalyticsEvents.mockResolvedValue(mockEvents);

      const response = await request(app)
        .get('/api/v1/analytics/events')
        .query({ user_id: 'test-user-id' })
        .expect(200);

      expect(response.body).toEqual({
        success: true,
        data: mockEvents,
        timestamp: expect.any(String)
      });
      expect(mockAnalyticsService.getAnalyticsEvents).toHaveBeenCalledWith({
        user_id: 'test-user-id'
      });
    });
  });

  describe('POST /api/v1/analytics/conversions', () => {
    it('should track a conversion successfully', async () => {
      const conversionData = {
        user_id: 'test-user-id',
        client_id: 'test-client-id',
        conversion_type: 'signup',
        conversion_value: 100
      };

      const mockConversion = {
        id: 'conversion-id',
        ...conversionData,
        converted_at: new Date().toISOString(),
        created_at: new Date().toISOString()
      };

      mockAnalyticsService.trackConversion.mockResolvedValue(mockConversion);

      const response = await request(app)
        .post('/api/v1/analytics/conversions')
        .send(conversionData)
        .expect(201);

      expect(response.body).toEqual({
        success: true,
        data: mockConversion,
        timestamp: expect.any(String)
      });
      expect(mockAnalyticsService.trackConversion).toHaveBeenCalledWith(conversionData);
    });
  });

  describe('GET /api/v1/analytics/users/:userId', () => {
    it('should get user analytics successfully', async () => {
      const userId = 'test-user-id';
      const mockUserAnalytics = {
        user_id: userId,
        total_events: 10,
        total_conversions: 2,
        conversion_rate: 20,
        segments: ['segment-1'],
        active_experiments: ['exp-1'],
        last_activity: new Date('2024-01-15T10:00:00Z')
      };

      mockAnalyticsService.getUserAnalytics.mockResolvedValue(mockUserAnalytics);

      const response = await request(app)
        .get(`/api/v1/analytics/users/${userId}`)
        .expect(200);

      expect(response.body).toEqual({
        success: true,
        data: mockUserAnalytics,
        timestamp: expect.any(String)
      });
      expect(mockAnalyticsService.getUserAnalytics).toHaveBeenCalledWith(userId);
    });
  });

  describe('GET /api/v1/analytics/clients/:clientId', () => {
    it('should get client analytics successfully', async () => {
      const clientId = 'test-client-id';
      const mockClientAnalytics = {
        client_id: clientId,
        total_users: 5,
        active_users: 3,
        total_events: 50,
        total_conversions: 10,
        conversion_rate: 20,
        top_funnels: [
          { funnel_name: 'onboarding', completion_rate: 80 }
        ],
        active_experiments: 2
      };

      mockAnalyticsService.getClientAnalytics.mockResolvedValue(mockClientAnalytics);

      const response = await request(app)
        .get(`/api/v1/analytics/clients/${clientId}`)
        .expect(200);

      expect(response.body).toEqual({
        success: true,
        data: mockClientAnalytics,
        timestamp: expect.any(String)
      });
      expect(mockAnalyticsService.getClientAnalytics).toHaveBeenCalledWith(clientId);
    });
  });

  describe('GET /api/v1/analytics/dashboard', () => {
    it('should get analytics dashboard successfully', async () => {
      const mockDashboard = {
        total_events: 100,
        total_conversions: 20,
        conversion_rate: 20,
        active_experiments: 3,
        top_events: [
          { event_type: 'page_view', count: 50 }
        ],
        conversion_trends: [
          { date: '2024-01-15', conversions: 5 }
        ],
        funnel_performance: [
          { funnel_name: 'onboarding', completion_rate: 75 }
        ]
      };

      mockAnalyticsService.getAnalyticsDashboard.mockResolvedValue(mockDashboard);

      const response = await request(app)
        .get('/api/v1/analytics/dashboard')
        .expect(200);

      expect(response.body).toEqual({
        success: true,
        data: mockDashboard,
        timestamp: expect.any(String)
      });
      expect(mockAnalyticsService.getAnalyticsDashboard).toHaveBeenCalledWith(undefined);
    });
  });

  describe('POST /api/v1/analytics/funnels/steps', () => {
    it('should create a funnel step successfully', async () => {
      const funnelStepData = {
        user_id: 'test-user-id',
        client_id: 'test-client-id',
        funnel_name: 'onboarding',
        step_number: 1,
        step_name: 'welcome'
      };

      const mockFunnelStep = {
        id: 'funnel-step-id',
        ...funnelStepData,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      const mockFunnelTracking = {
        createFunnelStep: jest.fn().mockResolvedValue(mockFunnelStep)
      };

      mockAnalyticsService.getFunnelTracking.mockReturnValue(mockFunnelTracking as any);

      const response = await request(app)
        .post('/api/v1/analytics/funnels/steps')
        .send(funnelStepData)
        .expect(201);

      expect(response.body).toEqual({
        success: true,
        data: mockFunnelStep,
        timestamp: expect.any(String)
      });
      expect(mockFunnelTracking.createFunnelStep).toHaveBeenCalledWith(funnelStepData);
    });
  });

  describe('PUT /api/v1/analytics/funnels/steps/:id', () => {
    it('should complete a funnel step successfully', async () => {
      const stepId = 'funnel-step-id';
      const completionData = {
        time_spent_seconds: 60,
        metadata: { completed: true }
      };

      const mockCompletedStep = {
        id: stepId,
        user_id: 'test-user-id',
        completed_at: new Date().toISOString(),
        ...completionData
      };

      const mockFunnelTracking = {
        completeFunnelStep: jest.fn().mockResolvedValue(mockCompletedStep)
      };

      mockAnalyticsService.getFunnelTracking.mockReturnValue(mockFunnelTracking as any);

      const response = await request(app)
        .put(`/api/v1/analytics/funnels/steps/${stepId}`)
        .send(completionData)
        .expect(200);

      expect(response.body).toEqual({
        success: true,
        data: mockCompletedStep,
        timestamp: expect.any(String)
      });
      expect(mockFunnelTracking.completeFunnelStep).toHaveBeenCalledWith({
        funnel_step_id: stepId,
        ...completionData
      });
    });
  });

  describe('POST /api/v1/analytics/experiments', () => {
    it('should create an experiment successfully', async () => {
      const experimentData = {
        name: 'Test Experiment',
        experiment_type: 'onboarding',
        target_audience: { user_role: 'user' },
        success_metrics: { conversion_rate: 0.1 },
        variants: [
          {
            variant_name: 'Control',
            traffic_percentage: 50,
            configuration: { button_color: 'blue' },
            is_control: true
          },
          {
            variant_name: 'Variant A',
            traffic_percentage: 50,
            configuration: { button_color: 'red' },
            is_control: false
          }
        ]
      };

      const mockExperiment = {
        id: 'experiment-id',
        ...experimentData,
        status: 'draft',
        created_by: 'test-user-id',
        created_at: new Date().toISOString()
      };

      const mockConversionOptimization = {
        createExperiment: jest.fn().mockResolvedValue(mockExperiment)
      };

      mockAnalyticsService.getConversionOptimization.mockReturnValue(mockConversionOptimization as any);

      const response = await request(app)
        .post('/api/v1/analytics/experiments')
        .send(experimentData)
        .expect(201);

      expect(response.body).toEqual({
        success: true,
        data: mockExperiment,
        timestamp: expect.any(String)
      });
      expect(mockConversionOptimization.createExperiment).toHaveBeenCalledWith(
        experimentData,
        'test-user-id'
      );
    });
  });

  describe('GET /api/v1/analytics/experiments', () => {
    it('should get experiments successfully', async () => {
      const mockExperiments = [
        {
          id: 'exp-1',
          name: 'Experiment 1',
          status: 'active',
          experiment_type: 'onboarding'
        }
      ];

      const mockConversionOptimization = {
        getExperiments: jest.fn().mockResolvedValue(mockExperiments)
      };

      mockAnalyticsService.getConversionOptimization.mockReturnValue(mockConversionOptimization as any);

      const response = await request(app)
        .get('/api/v1/analytics/experiments')
        .query({ status: 'active' })
        .expect(200);

      expect(response.body).toEqual({
        success: true,
        data: mockExperiments,
        timestamp: expect.any(String)
      });
      expect(mockConversionOptimization.getExperiments).toHaveBeenCalledWith({
        status: 'active'
      });
    });
  });

  describe('POST /api/v1/analytics/experiments/:experimentId/start', () => {
    it('should start an experiment successfully', async () => {
      const experimentId = 'test-experiment-id';
      const mockStartedExperiment = {
        id: experimentId,
        name: 'Test Experiment',
        status: 'active',
        start_date: new Date().toISOString()
      };

      const mockConversionOptimization = {
        startExperiment: jest.fn().mockResolvedValue(mockStartedExperiment)
      };

      mockAnalyticsService.getConversionOptimization.mockReturnValue(mockConversionOptimization as any);

      const response = await request(app)
        .post(`/api/v1/analytics/experiments/${experimentId}/start`)
        .expect(200);

      expect(response.body).toEqual({
        success: true,
        data: mockStartedExperiment,
        timestamp: expect.any(String)
      });
      expect(mockConversionOptimization.startExperiment).toHaveBeenCalledWith(experimentId);
    });
  });

  describe('POST /api/v1/analytics/personalization/triggers', () => {
    it('should create a personalization trigger successfully', async () => {
      const triggerData = {
        name: 'Test Trigger',
        trigger_type: 'event_based',
        conditions: { event_type: 'page_view' },
        actions: { send_email: true }
      };

      const mockTrigger = {
        id: 'trigger-id',
        ...triggerData,
        is_active: true,
        created_by: 'test-user-id',
        created_at: new Date().toISOString()
      };

      const mockPersonalization = {
        createPersonalizationTrigger: jest.fn().mockResolvedValue(mockTrigger)
      };

      mockAnalyticsService.getPersonalization.mockReturnValue(mockPersonalization as any);

      const response = await request(app)
        .post('/api/v1/analytics/personalization/triggers')
        .send(triggerData)
        .expect(201);

      expect(response.body).toEqual({
        success: true,
        data: mockTrigger,
        timestamp: expect.any(String)
      });
      expect(mockPersonalization.createPersonalizationTrigger).toHaveBeenCalledWith(
        triggerData,
        'test-user-id'
      );
    });
  });

  describe('GET /api/v1/analytics/segments', () => {
    it('should get user segments successfully', async () => {
      const mockSegments = [
        {
          id: 'segment-1',
          name: 'Active Users',
          user_count: 100,
          is_active: true
        }
      ];

      const mockPersonalization = {
        getUserSegments: jest.fn().mockResolvedValue(mockSegments)
      };

      mockAnalyticsService.getPersonalization.mockReturnValue(mockPersonalization as any);

      const response = await request(app)
        .get('/api/v1/analytics/segments')
        .query({ is_active: 'true' })
        .expect(200);

      expect(response.body).toEqual({
        success: true,
        data: mockSegments,
        timestamp: expect.any(String)
      });
      expect(mockPersonalization.getUserSegments).toHaveBeenCalledWith(true);
    });
  });

  describe('Error handling', () => {
    it('should handle service errors gracefully', async () => {
      const eventData = {
        user_id: 'test-user-id',
        client_id: 'test-client-id',
        event_type: 'page_view',
        event_name: 'homepage_visit'
      };

      const mockError = new Error('Service error');
      mockAnalyticsService.trackEvent.mockRejectedValue(mockError);

      const response = await request(app)
        .post('/api/v1/analytics/events')
        .send(eventData)
        .expect(500);

      expect(response.body).toEqual({
        error: 'INTERNAL_SERVER_ERROR',
        message: 'An unexpected error occurred',
        timestamp: expect.any(String)
      });
    });
  });
});
