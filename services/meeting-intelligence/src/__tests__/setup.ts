// Test setup file for Jest
import dotenv from 'dotenv';

// Load test environment variables
dotenv.config({ path: '.env.test' });

// Mock environment variables for testing
process.env.SUPABASE_URL =
  process.env.SUPABASE_URL || 'https://test.supabase.co';
process.env.SUPABASE_SERVICE_ROLE_KEY =
  process.env.SUPABASE_SERVICE_ROLE_KEY || 'test-service-role-key';
process.env.RECALL_AI_API_KEY =
  process.env.RECALL_AI_API_KEY || 'test-recall-api-key';
process.env.MEETING_INTELLIGENCE_RECALL_AI_API_KEY =
  process.env.MEETING_INTELLIGENCE_RECALL_AI_API_KEY || 'test-recall-api-key';
process.env.MEETING_INTELLIGENCE_RECALL_AI_BASE_URL =
  process.env.MEETING_INTELLIGENCE_RECALL_AI_BASE_URL ||
  'https://test.recall.ai/api/v1';
process.env.MEETING_INTELLIGENCE_RECALL_AI_WEBHOOK_SECRET =
  process.env.MEETING_INTELLIGENCE_RECALL_AI_WEBHOOK_SECRET ||
  'test-webhook-secret';
process.env.MEETING_INTELLIGENCE_OPENAI_API_KEY =
  process.env.MEETING_INTELLIGENCE_OPENAI_API_KEY || 'test-openai-api-key';
process.env.INTER_SERVICE_TOKEN =
  process.env.INTER_SERVICE_TOKEN || 'test-inter-service-token';
process.env.WORKFLOW_AUTOMATION_URL =
  process.env.WORKFLOW_AUTOMATION_URL || 'http://localhost:3005';
process.env.INTEGRATION_MANAGEMENT_URL =
  process.env.INTEGRATION_MANAGEMENT_URL || 'http://localhost:3006';
process.env.NOTIFICATION_SERVICE_URL =
  process.env.NOTIFICATION_SERVICE_URL || 'http://localhost:3007';
process.env.API_GATEWAY_URL =
  process.env.API_GATEWAY_URL || 'http://localhost:3000';

// Mock Supabase client
jest.mock('@supabase/supabase-js', () => ({
  createClient: jest.fn(() => ({
    from: jest.fn(() => ({
      select: jest.fn().mockReturnThis(),
      insert: jest.fn().mockReturnThis(),
      update: jest.fn().mockReturnThis(),
      delete: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      neq: jest.fn().mockReturnThis(),
      gt: jest.fn().mockReturnThis(),
      gte: jest.fn().mockReturnThis(),
      lt: jest.fn().mockReturnThis(),
      lte: jest.fn().mockReturnThis(),
      like: jest.fn().mockReturnThis(),
      ilike: jest.fn().mockReturnThis(),
      is: jest.fn().mockReturnThis(),
      in: jest.fn().mockReturnThis(),
      contains: jest.fn().mockReturnThis(),
      containedBy: jest.fn().mockReturnThis(),
      rangeGt: jest.fn().mockReturnThis(),
      rangeGte: jest.fn().mockReturnThis(),
      rangeLt: jest.fn().mockReturnThis(),
      rangeLte: jest.fn().mockReturnThis(),
      rangeAdjacent: jest.fn().mockReturnThis(),
      overlaps: jest.fn().mockReturnThis(),
      textSearch: jest.fn().mockReturnThis(),
      match: jest.fn().mockReturnThis(),
      not: jest.fn().mockReturnThis(),
      or: jest.fn().mockReturnThis(),
      filter: jest.fn().mockReturnThis(),
      order: jest.fn().mockReturnThis(),
      limit: jest.fn().mockReturnThis(),
      range: jest.fn().mockReturnThis(),
      abortSignal: jest.fn().mockReturnThis(),
      single: jest.fn().mockResolvedValue({ data: null, error: null }),
      maybeSingle: jest.fn().mockResolvedValue({ data: null, error: null }),
      csv: jest.fn().mockResolvedValue({ data: null, error: null }),
      geojson: jest.fn().mockResolvedValue({ data: null, error: null }),
      explain: jest.fn().mockResolvedValue({ data: null, error: null }),
      rollback: jest.fn().mockResolvedValue({ data: null, error: null }),
      returns: jest.fn().mockReturnThis(),
      then: jest.fn().mockResolvedValue({ data: [], error: null }),
    })),
    auth: {
      getUser: jest.fn().mockResolvedValue({
        data: { user: { id: 'test-user-id' } },
        error: null,
      }),
      getSession: jest.fn().mockResolvedValue({
        data: { session: { user: { id: 'test-user-id' } } },
        error: null,
      }),
      signInWithPassword: jest.fn().mockResolvedValue({
        data: { user: { id: 'test-user-id' } },
        error: null,
      }),
      signUp: jest.fn().mockResolvedValue({
        data: { user: { id: 'test-user-id' } },
        error: null,
      }),
      signOut: jest.fn().mockResolvedValue({ error: null }),
      onAuthStateChange: jest.fn().mockReturnValue({
        data: { subscription: { unsubscribe: jest.fn() } },
      }),
    },
    rpc: jest.fn().mockResolvedValue({ data: null, error: null }),
    storage: {
      from: jest.fn(() => ({
        upload: jest.fn().mockResolvedValue({ data: null, error: null }),
        download: jest.fn().mockResolvedValue({ data: null, error: null }),
        remove: jest.fn().mockResolvedValue({ data: null, error: null }),
        list: jest.fn().mockResolvedValue({ data: [], error: null }),
        getPublicUrl: jest
          .fn()
          .mockReturnValue({ data: { publicUrl: 'https://test.url' } }),
      })),
    },
  })),
}));

// Mock fetch for external API calls
global.fetch = jest.fn(() =>
  Promise.resolve({
    ok: true,
    status: 200,
    json: () => Promise.resolve({ success: true, data: {} }),
    text: () => Promise.resolve('success'),
    headers: new Headers(),
    statusText: 'OK',
  })
) as jest.Mock;

// Mock crypto for webhook signature verification
global.crypto = {
  subtle: {
    importKey: jest.fn(),
    sign: jest.fn(),
  },
} as any;

// Mock Buffer
global.Buffer = Buffer;

// Mock console methods to prevent noise during tests
global.console = {
  ...console,
  log: jest.fn(),
  debug: jest.fn(),
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
};
