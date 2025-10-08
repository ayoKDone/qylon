/**
 * Test setup file for Meeting Intelligence Service
 * Configures Jest environment and global test utilities
 * This file is not a test file - it's a setup file
 */

import { config } from 'dotenv';

// Load environment variables for testing
config({ path: '.env.test' });

// Set test environment variables
process.env.NODE_ENV = 'test';
process.env.SUPABASE_URL = process.env.SUPABASE_URL || 'http://localhost:54321';
process.env.SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || 'test-key';
process.env.RECALL_AI_API_KEY = process.env.RECALL_AI_API_KEY || 'test-recall-key';
process.env.OPENAI_API_KEY = process.env.OPENAI_API_KEY || 'test-openai-key';
process.env.JWT_SECRET = process.env.JWT_SECRET || 'test-jwt-secret';

// Global test timeout
jest.setTimeout(30000);

// Mock console methods to reduce noise in tests
global.console = {
  ...console,
  // Uncomment to suppress console.log in tests
  // log: jest.fn(),
  // debug: jest.fn(),
  // info: jest.fn(),
  // warn: jest.fn(),
  // error: jest.fn(),
};

// Global test utilities
global.testUtils = {
  generateUUID: () => 'test-uuid-' + Math.random().toString(36).substr(2, 9),
  generateTimestamp: () => new Date().toISOString(),
  createMockUser: () => ({
    id: 'test-user-id',
    email: 'test@example.com',
    role: 'user',
  }),
  createMockClient: () => ({
    id: 'test-client-id',
    name: 'Test Client',
    user_id: 'test-user-id',
  }),
  createMockMeeting: () => ({
    id: 'test-meeting-id',
    title: 'Test Meeting',
    client_id: 'test-client-id',
    start_time: new Date().toISOString(),
    status: 'scheduled',
  }),
};

// Cleanup after each test
afterEach(() => {
  jest.clearAllMocks();
});

// Global teardown
afterAll(() => {
  // Clean up any global resources
});
