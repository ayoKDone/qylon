// Test setup file for Jest
import { jest } from '@jest/globals';

// Mock environment variables
process.env.SUPABASE_URL = 'https://test.supabase.co';
process.env.SUPABASE_SERVICE_ROLE_KEY = 'test-service-role-key';
process.env.RECALL_AI_API_KEY = 'test-recall-ai-key';
process.env.MEETING_INTELLIGENCE_RECALL_AI_API_KEY = 'test-recall-ai-key';
process.env.MEETING_INTELLIGENCE_RECALL_AI_BASE_URL = 'https://test.recall.ai/api/v1';
process.env.MEETING_INTELLIGENCE_RECALL_AI_WEBHOOK_SECRET = 'whsec_test_secret';
process.env.MEETING_INTELLIGENCE_OPENAI_API_KEY = 'sk-test-openai-key';
process.env.INTER_SERVICE_TOKEN = 'test-inter-service-token';
process.env.WORKFLOW_AUTOMATION_URL = 'http://localhost:3005';
process.env.INTEGRATION_MANAGEMENT_URL = 'http://localhost:3006';
process.env.NOTIFICATION_SERVICE_URL = 'http://localhost:3007';
process.env.API_GATEWAY_URL = 'https://test-api-gateway.com';

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
      single: jest.fn().mockResolvedValue({ data: null, error: null } as any),
      maybeSingle: jest.fn().mockResolvedValue({ data: null, error: null } as any),
      csv: jest.fn().mockResolvedValue({ data: '', error: null } as any),
      geojson: jest.fn().mockResolvedValue({ data: null, error: null } as any),
      explain: jest.fn().mockResolvedValue({ data: null, error: null } as any),
      rollback: jest.fn().mockResolvedValue({ data: null, error: null } as any),
      returns: jest.fn().mockReturnThis(),
      then: jest.fn().mockResolvedValue({ data: [], error: null } as any)
    })),
    auth: {
      getUser: jest.fn().mockResolvedValue({ data: { user: { id: 'test-user-id' } }, error: null } as any),
      getSession: jest.fn().mockResolvedValue({ data: { session: { user: { id: 'test-user-id' } } }, error: null } as any)
    },
    rpc: jest.fn().mockResolvedValue({ data: null, error: null } as any),
    storage: {
      from: jest.fn(() => ({
        upload: jest.fn().mockResolvedValue({ data: null, error: null } as any),
        download: jest.fn().mockResolvedValue({ data: null, error: null } as any),
        remove: jest.fn().mockResolvedValue({ data: null, error: null } as any),
        list: jest.fn().mockResolvedValue({ data: [], error: null } as any),
        getPublicUrl: jest.fn().mockReturnValue({ data: { publicUrl: 'https://test-url.com' } } as any)
      }))
    }
  }))
}));

// Mock fetch for external API calls
global.fetch = jest.fn(() =>
  Promise.resolve({
    ok: true,
    status: 200,
    json: () => Promise.resolve({ success: true }),
    text: () => Promise.resolve('success'),
    headers: new Headers(),
    statusText: 'OK'
  } as any)
) as any;

// Mock crypto for webhook signature verification
Object.defineProperty(global, 'crypto', {
  value: {
    createHmac: jest.fn(() => ({
      update: jest.fn().mockReturnThis(),
      digest: jest.fn().mockReturnValue('mock-signature')
    })),
    timingSafeEqual: jest.fn().mockReturnValue(true)
  }
});

// Mock Buffer
global.Buffer = Buffer;

// Mock console methods to reduce noise in tests
global.console = {
  ...console,
  log: jest.fn(),
  debug: jest.fn(),
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn()
};
