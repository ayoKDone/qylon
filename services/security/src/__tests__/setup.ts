// Test setup file
import dotenv from 'dotenv';

// Load test environment variables
dotenv.config({ path: '.env.test' });

// Mock environment variables for testing
process.env['SUPABASE_URL'] = 'https://test.supabase.co';
process.env['SUPABASE_SERVICE_ROLE_KEY'] = 'test-service-role-key';
process.env['JWT_SECRET'] = 'test-jwt-secret';
process.env['NODE_ENV'] = 'test';

// Global test timeout
jest.setTimeout(10000);
