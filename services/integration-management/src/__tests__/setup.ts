// Test environment setup
process.env['NODE_ENV'] = 'test';
process.env['SUPABASE_URL'] =
  process.env['SUPABASE_URL'] || 'http://localhost:54321';
process.env['SUPABASE_SERVICE_ROLE_KEY'] =
  process.env['SUPABASE_SERVICE_ROLE_KEY'] || 'test-key';
process.env['JWT_SECRET'] = process.env['JWT_SECRET'] || 'test-jwt-secret';
process.env['OPENAI_API_KEY'] =
  process.env['OPENAI_API_KEY'] || 'test-openai-key';
process.env['PORT'] = '3006';

// Mock console methods to reduce noise in tests
global.console = {
  ...console,
  log: jest.fn(),
  debug: jest.fn(),
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
};

// Set test timeout
jest.setTimeout(30000);
