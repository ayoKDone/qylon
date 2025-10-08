/**
 * Test Helpers and Utilities
 *
 * Comprehensive test utilities for the Qylon platform.
 * Provides mock creators, data generators, assertions, and test utilities.
 */

import * as jwt from 'jsonwebtoken';
// Simple UUID v4 generator to avoid ES module issues
function generateUUID(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

// Types for test data
export interface MockUser {
  id: string;
  email: string;
  name: string;
  role?: string;
  created_at?: string;
  updated_at?: string;
}

export interface MockClient {
  id: string;
  user_id: string;
  name: string;
  email?: string;
  created_at?: string;
  updated_at?: string;
}

export interface MockMeeting {
  id: string;
  client_id: string;
  title: string;
  description?: string;
  start_time: string;
  end_time?: string;
  status: string;
  created_at?: string;
  updated_at?: string;
}

export interface MockContent {
  id: string;
  meeting_id?: string;
  template_id?: string;
  title: string;
  content: string;
  content_type: string;
  status: string;
  created_at?: string;
  updated_at?: string;
}

export interface MockNotification {
  id: string;
  user_id: string;
  title: string;
  message: string;
  type: string;
  read: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface MockEvent {
  id: string;
  type: string;
  data: any;
  timestamp: string;
  source: string;
}

export interface MockRequest {
  headers: Record<string, string>;
  body: any;
  params: Record<string, string>;
  query: Record<string, string>;
  user?: MockUser;
  method?: string;
  url?: string;
}

export interface MockResponse {
  status: jest.MockedFunction<(code: number) => MockResponse>;
  json: jest.MockedFunction<(data: any) => MockResponse>;
  send: jest.MockedFunction<(data: any) => MockResponse>;
  end: jest.MockedFunction<() => MockResponse>;
  set: jest.MockedFunction<(key: string, value: string) => MockResponse>;
  cookie: jest.MockedFunction<(name: string, value: string, options?: any) => MockResponse>;
  clearCookie: jest.MockedFunction<(name: string) => MockResponse>;
  redirect: jest.MockedFunction<(url: string) => MockResponse>;
  locals: Record<string, any>;
}

/**
 * Mock Creator - Creates mock objects for testing
 */
export class MockCreator {
  static createRequest(overrides: Partial<MockRequest> = {}): MockRequest {
    return {
      headers: {},
      body: {},
      params: {},
      query: {},
      method: 'GET',
      url: '/test',
      ...overrides,
    };
  }

  static createResponse(): MockResponse {
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
      send: jest.fn().mockReturnThis(),
      end: jest.fn().mockReturnThis(),
      set: jest.fn().mockReturnThis(),
      cookie: jest.fn().mockReturnThis(),
      clearCookie: jest.fn().mockReturnThis(),
      redirect: jest.fn().mockReturnThis(),
      locals: {},
    };
    return res;
  }

  static createSupabaseClient() {
    return {
      auth: {
        getUser: jest.fn(),
        signInWithPassword: jest.fn(),
        signUp: jest.fn(),
        signOut: jest.fn(),
        refreshSession: jest.fn(),
      },
      from: jest.fn().mockReturnThis(),
      select: jest.fn().mockReturnThis(),
      insert: jest.fn().mockReturnThis(),
      update: jest.fn().mockReturnThis(),
      delete: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      order: jest.fn().mockReturnThis(),
      limit: jest.fn().mockReturnThis(),
      single: jest.fn(),
    };
  }

  static createRedisClient() {
    return {
      get: jest.fn(),
      set: jest.fn(),
      del: jest.fn(),
      exists: jest.fn(),
      expire: jest.fn(),
      ttl: jest.fn(),
      keys: jest.fn(),
      flushall: jest.fn(),
    };
  }

  static createLogger() {
    return {
      info: jest.fn(),
      warn: jest.fn(),
      error: jest.fn(),
      debug: jest.fn(),
      child: jest.fn().mockReturnThis(),
    };
  }
}

/**
 * Test Data Generator - Generates realistic test data
 */
export class TestDataGenerator {
  static generateId(): string {
    return generateUUID();
  }

  static generateEmail(): string {
    const domains = ['example.com', 'test.com', 'demo.org'];
    const names = ['user', 'test', 'demo', 'admin', 'john', 'jane'];
    const domain = domains[Math.floor(Math.random() * domains.length)];
    const name = names[Math.floor(Math.random() * names.length)];
    const number = Math.floor(Math.random() * 1000);
    return `${name}${number}@${domain}`;
  }

  static generateTimestamp(): string {
    return new Date().toISOString();
  }

  static generateJWT(payload: any = {}): string {
    const defaultPayload = {
      sub: this.generateId(),
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + 3600, // 1 hour
      ...payload,
    };

    return jwt.sign(defaultPayload, 'test-secret-key');
  }

  static generateUser(overrides: Partial<MockUser> = {}): MockUser {
    return {
      id: this.generateId(),
      email: this.generateEmail(),
      name: 'Test User',
      role: 'user',
      created_at: this.generateTimestamp(),
      updated_at: this.generateTimestamp(),
      ...overrides,
    };
  }

  static generateClient(overrides: Partial<MockClient> = {}): MockClient {
    return {
      id: this.generateId(),
      user_id: this.generateId(),
      name: 'Test Client',
      email: this.generateEmail(),
      created_at: this.generateTimestamp(),
      updated_at: this.generateTimestamp(),
      ...overrides,
    };
  }

  static generateMeeting(overrides: Partial<MockMeeting> = {}): MockMeeting {
    const startTime = new Date();
    const endTime = new Date(startTime.getTime() + 60 * 60 * 1000); // 1 hour later

    return {
      id: this.generateId(),
      client_id: this.generateId(),
      title: 'Test Meeting',
      description: 'Test meeting description',
      start_time: startTime.toISOString(),
      end_time: endTime.toISOString(),
      status: 'scheduled',
      created_at: this.generateTimestamp(),
      updated_at: this.generateTimestamp(),
      ...overrides,
    };
  }

  static generateContent(overrides: Partial<MockContent> = {}): MockContent {
    return {
      id: this.generateId(),
      meeting_id: this.generateId(),
      template_id: this.generateId(),
      title: 'Test Content',
      content: 'Test content body',
      content_type: 'meeting_summary',
      status: 'draft',
      created_at: this.generateTimestamp(),
      updated_at: this.generateTimestamp(),
      ...overrides,
    };
  }

  static generateNotification(overrides: Partial<MockNotification> = {}): MockNotification {
    return {
      id: this.generateId(),
      user_id: this.generateId(),
      title: 'Test Notification',
      message: 'Test notification message',
      type: 'info',
      read: false,
      created_at: this.generateTimestamp(),
      updated_at: this.generateTimestamp(),
      ...overrides,
    };
  }

  static generateEvent(
    type: string,
    data: any = {},
    overrides: Partial<MockEvent> = {}
  ): MockEvent {
    return {
      id: this.generateId(),
      type,
      data,
      timestamp: this.generateTimestamp(),
      source: 'test',
      ...overrides,
    };
  }
}

/**
 * Test Assertions - Custom assertion helpers
 */
export class TestAssertions {
  static expectValidUUID(value: string): void {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    expect(value).toMatch(uuidRegex);
  }

  static expectValidISO8601(value: string): void {
    const date = new Date(value);
    expect(date.toISOString()).toBe(value);
  }

  static expectValidJWT(token: string): void {
    expect(token).toBeDefined();
    expect(typeof token).toBe('string');
    expect(token.split('.')).toHaveLength(3);

    try {
      const decoded = jwt.decode(token);
      expect(decoded).toBeDefined();
    } catch {
      expect(true).toBe(false); // This should not happen with valid JWT
    }
  }

  static expectValidEmail(email: string): void {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    expect(email).toMatch(emailRegex);
  }

  static expectValidResponse(response: any): void {
    expect(response).toBeDefined();
    expect(response.success).toBeDefined();
    expect(response.timestamp).toBeDefined();
    this.expectValidISO8601(response.timestamp);
  }

  static expectErrorResponse(response: any, expectedError?: string): void {
    expect(response).toBeDefined();
    expect(response.success).toBe(false);
    expect(response.error).toBeDefined();
    if (expectedError) {
      expect(response.error).toContain(expectedError);
    }
    expect(response.timestamp).toBeDefined();
    this.expectValidISO8601(response.timestamp);
  }
}

/**
 * Test Utils - General test utilities
 */
export class TestUtils {
  static createMockLogger() {
    return {
      info: jest.fn(),
      warn: jest.fn(),
      error: jest.fn(),
      debug: jest.fn(),
      child: jest.fn().mockReturnThis(),
    };
  }

  static createMockSupabase() {
    return MockCreator.createSupabaseClient();
  }

  static createMockRedis() {
    return MockCreator.createRedisClient();
  }

  static createMockJWT() {
    return {
      sign: jest.fn().mockReturnValue('mock-jwt-token'),
      verify: jest.fn().mockReturnValue({ sub: 'test-user-id' }),
      decode: jest.fn().mockReturnValue({ sub: 'test-user-id' }),
    };
  }

  static waitFor(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  static mockAsyncFunction<T>(returnValue: T, delay: number = 0) {
    return jest
      .fn()
      .mockImplementation(
        () => new Promise(resolve => setTimeout(() => resolve(returnValue), delay))
      );
  }

  static mockAsyncError(error: Error, delay: number = 0) {
    return jest
      .fn()
      .mockImplementation(() => new Promise((_, reject) => setTimeout(() => reject(error), delay)));
  }

  static createMockDatabase() {
    return {
      query: jest.fn(),
      transaction: jest.fn(),
      close: jest.fn(),
    };
  }

  static createMockCache() {
    return {
      get: jest.fn(),
      set: jest.fn(),
      del: jest.fn(),
      exists: jest.fn(),
      expire: jest.fn(),
      ttl: jest.fn(),
    };
  }
}

// Export all utilities as default
export default {
  MockCreator,
  TestDataGenerator,
  TestAssertions,
  TestUtils,
};
