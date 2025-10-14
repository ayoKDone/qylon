/**
 * Jest Test Setup
 * Analytics & A/B Testing Backend Tests
 */


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
      single: jest.fn().mockResolvedValue({ data: null, error: null }),
      auth: {
        getUser: jest.fn().mockResolvedValue({ data: { user: null }, error: null })
      },
      rpc: jest.fn().mockResolvedValue({ data: null, error: null })
    }))
  }))
}));

// Mock environment variables
process.env.SUPABASE_URL = 'https://test.supabase.co';
process.env.SUPABASE_SERVICE_ROLE_KEY = 'test-service-role-key';
process.env.NODE_ENV = 'test';
process.env.LOG_LEVEL = 'error';

// Global test timeout
jest.setTimeout(30000);

// Mock console methods to reduce noise in tests
global.console = {
  ...console,
  log: jest.fn(),
  debug: jest.fn(),
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
};

// Clean up after each test
afterEach(() => {
  jest.clearAllMocks();
});

// Global test utilities
(global as any).testUtils = {
  createMockUser: () => ({
    id: 'test-user-id',
    email: 'test@example.com',
    role: 'user',
    client_id: 'test-client-id'
  }),

  createMockClient: () => ({
    id: 'test-client-id',
    user_id: 'test-user-id',
    name: 'Test Client',
    status: 'active'
  }),

  createMockEvent: () => ({
    id: 'test-event-id',
    user_id: 'test-user-id',
    client_id: 'test-client-id',
    event_type: 'page_view',
    event_name: 'homepage_visit',
    event_data: { page: '/home' },
    timestamp: new Date().toISOString()
  }),

  createMockConversion: () => ({
    id: 'test-conversion-id',
    user_id: 'test-user-id',
    client_id: 'test-client-id',
    conversion_type: 'signup',
    conversion_value: 100,
    converted_at: new Date().toISOString()
  }),

  createMockFunnelStep: () => ({
    id: 'test-funnel-step-id',
    user_id: 'test-user-id',
    client_id: 'test-client-id',
    funnel_name: 'onboarding',
    step_number: 1,
    step_name: 'welcome',
    completed_at: new Date().toISOString()
  }),

  createMockExperiment: () => ({
    id: 'test-experiment-id',
    name: 'Test Experiment',
    experiment_type: 'onboarding',
    status: 'active',
    created_by: 'test-user-id'
  }),

  createMockPersonalizationTrigger: () => ({
    id: 'test-trigger-id',
    name: 'Test Trigger',
    trigger_type: 'event_based',
    conditions: { event_type: 'page_view' },
    actions: { send_email: true },
    is_active: true,
    created_by: 'test-user-id'
  }),

  createMockUserSegment: () => ({
    id: 'test-segment-id',
    name: 'Test Segment',
    segment_criteria: { user_role: 'user' },
    user_count: 0,
    is_active: true,
    created_by: 'test-user-id'
  })
};
