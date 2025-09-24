/**
 * Test Helpers and Utilities
 *
 * Comprehensive testing utilities for the Qylon platform.
 * Provides reusable functions for creating mocks, assertions, and test data.
 */

import { Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';

// Type definitions for test utilities
export interface MockRequest extends Partial<Request> {
  headers?: Record<string, string>;
  body?: any;
  params?: Record<string, string>;
  query?: Record<string, any>;
  user?: any;
}

export interface MockResponse extends Partial<Response> {
  status: jest.MockedFunction<any>;
  json: jest.MockedFunction<any>;
  send: jest.MockedFunction<any>;
  end: jest.MockedFunction<any>;
  cookie: jest.MockedFunction<any>;
  clearCookie: jest.MockedFunction<any>;
  redirect: jest.MockedFunction<any>;
  locals: Record<string, any>;
}

export interface TestUser {
  id: string;
  email: string;
  name: string;
  role: string;
  created_at: string;
  updated_at: string;
}

export interface TestClient {
  id: string;
  name: string;
  user_id: string;
  created_at: string;
  updated_at: string;
}

export interface TestMeeting {
  id: string;
  title: string;
  client_id: string;
  start_time: string;
  end_time: string;
  status: string;
  created_at: string;
  updated_at: string;
}

export interface TestEvent {
  id: string;
  type: string;
  aggregateId: string;
  aggregateType: string;
  version: number;
  payload: any;
  metadata: {
    userId: string;
    timestamp: string;
    correlationId: string;
  };
  createdAt: string;
}

export interface TestWorkflowStep {
  id: string;
  name: string;
  type: string;
  status: string;
  input: any;
  output: any;
  error: any;
  startedAt: string | null;
  completedAt: string | null;
}

export interface TestContent {
  id: string;
  title: string;
  type: string;
  content: string;
  client_id: string;
  meeting_id: string;
  created_at: string;
  updated_at: string;
}

export interface TestNotification {
  id: string;
  user_id: string;
  type: string;
  title: string;
  message: string;
  read: boolean;
  created_at: string;
}

export interface TestAnalytics {
  id: string;
  event_type: string;
  user_id: string;
  client_id: string;
  properties: any;
  timestamp: string;
}

export interface TestIntegration {
  id: string;
  name: string;
  type: string;
  client_id: string;
  config: any;
  status: string;
  created_at: string;
  updated_at: string;
}

export interface TestFile {
  fieldname: string;
  originalname: string;
  encoding: string;
  mimetype: string;
  size: number;
  buffer: Buffer;
}

export interface TestEnvironment {
  NODE_ENV: string;
  LOG_LEVEL: string;
  SUPABASE_URL: string;
  SUPABASE_ANON_KEY: string;
  SUPABASE_SERVICE_ROLE_KEY: string;
  JWT_SECRET: string;
  REDIS_URL: string;
  MONGODB_URL: string;
}

// Test data generators
export class TestDataGenerator {
  static generateId(): string {
    return uuidv4();
  }

  static generateEmail(): string {
    return `test-${this.generateId().substring(0, 8)}@example.com`;
  }

  static generateTimestamp(): string {
    return new Date().toISOString();
  }

  static generateFutureTimestamp(hoursFromNow = 1): string {
    return new Date(Date.now() + hoursFromNow * 3600000).toISOString();
  }

  static generatePastTimestamp(hoursAgo = 1): string {
    return new Date(Date.now() - hoursAgo * 3600000).toISOString();
  }

  static generateJWT(payload: any = {}): string {
    const header = { alg: 'HS256', typ: 'JWT' };
    const defaultPayload = {
      sub: this.generateId(),
      email: this.generateEmail(),
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + 3600,
      ...payload,
    };

    const encodedHeader = Buffer.from(JSON.stringify(header)).toString(
      'base64url'
    );
    const encodedPayload = Buffer.from(JSON.stringify(defaultPayload)).toString(
      'base64url'
    );
    const signature = 'test-signature';

    return `${encodedHeader}.${encodedPayload}.${signature}`;
  }

  static generateUser(overrides: Partial<TestUser> = {}): TestUser {
    const id = this.generateId();
    return {
      id,
      email: this.generateEmail(),
      name: `Test User ${id.substring(0, 8)}`,
      role: 'user',
      created_at: this.generateTimestamp(),
      updated_at: this.generateTimestamp(),
      ...overrides,
    };
  }

  static generateClient(overrides: Partial<TestClient> = {}): TestClient {
    const id = this.generateId();
    return {
      id,
      name: `Test Client ${id.substring(0, 8)}`,
      user_id: this.generateId(),
      created_at: this.generateTimestamp(),
      updated_at: this.generateTimestamp(),
      ...overrides,
    };
  }

  static generateMeeting(overrides: Partial<TestMeeting> = {}): TestMeeting {
    const id = this.generateId();
    const startTime = this.generateTimestamp();
    const endTime = this.generateFutureTimestamp(1);

    return {
      id,
      title: `Test Meeting ${id.substring(0, 8)}`,
      client_id: this.generateId(),
      start_time: startTime,
      end_time: endTime,
      status: 'scheduled',
      created_at: this.generateTimestamp(),
      updated_at: this.generateTimestamp(),
      ...overrides,
    };
  }

  static generateEvent(
    type: string,
    payload: any = {},
    overrides: Partial<TestEvent> = {}
  ): TestEvent {
    const id = this.generateId();
    return {
      id,
      type,
      aggregateId: this.generateId(),
      aggregateType: 'test-aggregate',
      version: 1,
      payload,
      metadata: {
        userId: this.generateId(),
        timestamp: this.generateTimestamp(),
        correlationId: this.generateId(),
      },
      createdAt: this.generateTimestamp(),
      ...overrides,
    };
  }

  static generateWorkflowStep(
    overrides: Partial<TestWorkflowStep> = {}
  ): TestWorkflowStep {
    const id = this.generateId();
    return {
      id,
      name: `Test Step ${id.substring(0, 8)}`,
      type: 'action',
      status: 'pending',
      input: {},
      output: {},
      error: null,
      startedAt: null,
      completedAt: null,
      ...overrides,
    };
  }

  static generateContent(overrides: Partial<TestContent> = {}): TestContent {
    const id = this.generateId();
    return {
      id,
      title: `Test Content ${id.substring(0, 8)}`,
      type: 'meeting_summary',
      content: 'Test content body',
      client_id: this.generateId(),
      meeting_id: this.generateId(),
      created_at: this.generateTimestamp(),
      updated_at: this.generateTimestamp(),
      ...overrides,
    };
  }

  static generateNotification(
    overrides: Partial<TestNotification> = {}
  ): TestNotification {
    const id = this.generateId();
    return {
      id,
      user_id: this.generateId(),
      type: 'meeting_reminder',
      title: `Test Notification ${id.substring(0, 8)}`,
      message: 'Test notification message',
      read: false,
      created_at: this.generateTimestamp(),
      ...overrides,
    };
  }

  static generateAnalytics(
    overrides: Partial<TestAnalytics> = {}
  ): TestAnalytics {
    const id = this.generateId();
    return {
      id,
      event_type: 'meeting_created',
      user_id: this.generateId(),
      client_id: this.generateId(),
      properties: {},
      timestamp: this.generateTimestamp(),
      ...overrides,
    };
  }

  static generateIntegration(
    overrides: Partial<TestIntegration> = {}
  ): TestIntegration {
    const id = this.generateId();
    return {
      id,
      name: `Test Integration ${id.substring(0, 8)}`,
      type: 'calendar',
      client_id: this.generateId(),
      config: {},
      status: 'active',
      created_at: this.generateTimestamp(),
      updated_at: this.generateTimestamp(),
      ...overrides,
    };
  }

  static generateFile(overrides: Partial<TestFile> = {}): TestFile {
    return {
      fieldname: 'file',
      originalname: 'test.txt',
      encoding: '7bit',
      mimetype: 'text/plain',
      size: 1024,
      buffer: Buffer.from('test file content'),
      ...overrides,
    };
  }

  static generateEnvironment(
    overrides: Partial<TestEnvironment> = {}
  ): TestEnvironment {
    return {
      NODE_ENV: 'test',
      LOG_LEVEL: 'error',
      SUPABASE_URL: 'http://localhost:54321',
      SUPABASE_ANON_KEY: 'test-anon-key',
      SUPABASE_SERVICE_ROLE_KEY: 'test-service-role-key',
      JWT_SECRET: 'test-jwt-secret',
      REDIS_URL: 'redis://localhost:6379',
      MONGODB_URL: 'mongodb://localhost:27017/qylon_test',
      ...overrides,
    };
  }
}

// Mock creators
export class MockCreator {
  static createRequest(overrides: Partial<MockRequest> = {}): MockRequest {
    return {
      headers: {
        'content-type': 'application/json',
        authorization: `Bearer ${TestDataGenerator.generateJWT()}`,
        ...overrides.headers,
      },
      body: {},
      params: {},
      query: {},
      user: null,
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
      statusCode: 200,
    };

    // Make status method set statusCode
    res.status = jest.fn(code => {
      res.statusCode = code;
      return res;
    });

    return res;
  }

  static createDBResponse(data: any = null, error: any = null) {
    return {
      data,
      error,
      count: data ? (Array.isArray(data) ? data.length : 1) : null,
    };
  }

  static createAPIResponse(data: any = null, error: any = null, status = 200) {
    return {
      success: !error,
      data,
      error: error?.message || error,
      status,
      timestamp: TestDataGenerator.generateTimestamp(),
    };
  }
}

// Test assertions
export class TestAssertions {
  static expectValidUUID(value: string): void {
    const uuidRegex =
      /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    expect(uuidRegex.test(value)).toBe(true);
  }

  static expectValidJWT(value: string): void {
    const jwtRegex = /^[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+$/;
    expect(jwtRegex.test(value)).toBe(true);
  }

  static expectValidISO8601(value: string): void {
    const iso8601Regex = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d{3})?Z?$/;
    expect(iso8601Regex.test(value)).toBe(true);
    expect(!isNaN(Date.parse(value))).toBe(true);
  }

  static expectValidResponse(response: any): void {
    expect(response).toHaveProperty('success');
    expect(response).toHaveProperty('timestamp');
    expect(typeof response.success).toBe('boolean');
    expect(TestAssertions.expectValidISO8601(response.timestamp));
  }

  static expectValidErrorResponse(response: any): void {
    expect(response).toHaveProperty('success');
    expect(response).toHaveProperty('error');
    expect(response).toHaveProperty('timestamp');
    expect(response.success).toBe(false);
    expect(typeof response.error).toBe('string');
    expect(TestAssertions.expectValidISO8601(response.timestamp));
  }

  static expectValidUser(user: any): void {
    expect(user).toHaveProperty('id');
    expect(user).toHaveProperty('email');
    expect(user).toHaveProperty('name');
    expect(user).toHaveProperty('role');
    expect(user).toHaveProperty('created_at');
    expect(user).toHaveProperty('updated_at');
    TestAssertions.expectValidUUID(user.id);
    expect(typeof user.email).toBe('string');
    expect(user.email).toContain('@');
    expect(typeof user.name).toBe('string');
    expect(typeof user.role).toBe('string');
    TestAssertions.expectValidISO8601(user.created_at);
    TestAssertions.expectValidISO8601(user.updated_at);
  }

  static expectValidClient(client: any): void {
    expect(client).toHaveProperty('id');
    expect(client).toHaveProperty('name');
    expect(client).toHaveProperty('user_id');
    expect(client).toHaveProperty('created_at');
    expect(client).toHaveProperty('updated_at');
    TestAssertions.expectValidUUID(client.id);
    expect(typeof client.name).toBe('string');
    TestAssertions.expectValidUUID(client.user_id);
    TestAssertions.expectValidISO8601(client.created_at);
    TestAssertions.expectValidISO8601(client.updated_at);
  }

  static expectValidMeeting(meeting: any): void {
    expect(meeting).toHaveProperty('id');
    expect(meeting).toHaveProperty('title');
    expect(meeting).toHaveProperty('client_id');
    expect(meeting).toHaveProperty('start_time');
    expect(meeting).toHaveProperty('end_time');
    expect(meeting).toHaveProperty('status');
    expect(meeting).toHaveProperty('created_at');
    expect(meeting).toHaveProperty('updated_at');
    TestAssertions.expectValidUUID(meeting.id);
    expect(typeof meeting.title).toBe('string');
    TestAssertions.expectValidUUID(meeting.client_id);
    TestAssertions.expectValidISO8601(meeting.start_time);
    TestAssertions.expectValidISO8601(meeting.end_time);
    expect(typeof meeting.status).toBe('string');
    TestAssertions.expectValidISO8601(meeting.created_at);
    TestAssertions.expectValidISO8601(meeting.updated_at);
  }
}

// Test utilities
export class TestUtils {
  static async waitFor(ms: number = 100): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  static createMockTimers() {
    jest.useFakeTimers();
    return {
      advanceTime: (ms: number) => jest.advanceTimersByTime(ms),
      restore: () => jest.useRealTimers(),
    };
  }

  static mockConsole() {
    const originalConsole = { ...console };
    // eslint-disable-next-line no-console
    console.log = jest.fn();
    // eslint-disable-next-line no-console
    console.error = jest.fn();
    // eslint-disable-next-line no-console
    console.warn = jest.fn();
    // eslint-disable-next-line no-console
    console.info = jest.fn();

    return {
      restore: () => {
        Object.assign(console, originalConsole);
      },
    };
  }

  static mockProcessEnv(env: Record<string, string>) {
    const originalEnv = { ...process.env };
    Object.assign(process.env, env);

    return {
      restore: () => {
        Object.assign(process.env, originalEnv);
      },
    };
  }

  static createMockLogger() {
    return {
      info: jest.fn(),
      error: jest.fn(),
      warn: jest.fn(),
      debug: jest.fn(),
    };
  }

  static createMockDatabase() {
    return {
      query: jest.fn(),
      insert: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      select: jest.fn().mockReturnThis(),
      from: jest.fn().mockReturnThis(),
      where: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      single: jest.fn(),
    };
  }

  static createMockRedis() {
    return {
      get: jest.fn(),
      set: jest.fn(),
      del: jest.fn(),
      exists: jest.fn(),
      expire: jest.fn(),
      connect: jest.fn(),
      disconnect: jest.fn(),
    };
  }

  static createMockSupabase() {
    return {
      auth: {
        getUser: jest.fn(),
        signInWithPassword: jest.fn(),
        signUp: jest.fn(),
        signOut: jest.fn(),
        refreshSession: jest.fn(),
      },
      from: jest.fn(() => ({
        select: jest.fn().mockReturnThis(),
        insert: jest.fn().mockReturnThis(),
        update: jest.fn().mockReturnThis(),
        delete: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn(),
      })),
    };
  }
}

// Test decorators
export function withMockTimers(testFn: () => void | Promise<void>) {
  return async () => {
    const timers = TestUtils.createMockTimers();
    try {
      await testFn();
    } finally {
      timers.restore();
    }
  };
}

export function withMockConsole(testFn: () => void | Promise<void>) {
  return async () => {
    const console = TestUtils.mockConsole();
    try {
      await testFn();
    } finally {
      console.restore();
    }
  };
}

export function withMockEnv(
  env: Record<string, string>,
  testFn: () => void | Promise<void>
) {
  return async () => {
    const envMock = TestUtils.mockProcessEnv(env);
    try {
      await testFn();
    } finally {
      envMock.restore();
    }
  };
}

// Test data factories
export class TestDataFactory {
  static createUserArray(
    count: number,
    overrides: Partial<TestUser> = {}
  ): TestUser[] {
    return Array.from({ length: count }, () =>
      TestDataGenerator.generateUser(overrides)
    );
  }

  static createClientArray(
    count: number,
    overrides: Partial<TestClient> = {}
  ): TestClient[] {
    return Array.from({ length: count }, () =>
      TestDataGenerator.generateClient(overrides)
    );
  }

  static createMeetingArray(
    count: number,
    overrides: Partial<TestMeeting> = {}
  ): TestMeeting[] {
    return Array.from({ length: count }, () =>
      TestDataGenerator.generateMeeting(overrides)
    );
  }

  static createEventArray(
    count: number,
    type: string,
    overrides: Partial<TestEvent> = {}
  ): TestEvent[] {
    return Array.from({ length: count }, () =>
      TestDataGenerator.generateEvent(type, {}, overrides)
    );
  }

  static createWorkflowStepArray(
    count: number,
    overrides: Partial<TestWorkflowStep> = {}
  ): TestWorkflowStep[] {
    return Array.from({ length: count }, () =>
      TestDataGenerator.generateWorkflowStep(overrides)
    );
  }

  static createContentArray(
    count: number,
    overrides: Partial<TestContent> = {}
  ): TestContent[] {
    return Array.from({ length: count }, () =>
      TestDataGenerator.generateContent(overrides)
    );
  }

  static createNotificationArray(
    count: number,
    overrides: Partial<TestNotification> = {}
  ): TestNotification[] {
    return Array.from({ length: count }, () =>
      TestDataGenerator.generateNotification(overrides)
    );
  }

  static createAnalyticsArray(
    count: number,
    overrides: Partial<TestAnalytics> = {}
  ): TestAnalytics[] {
    return Array.from({ length: count }, () =>
      TestDataGenerator.generateAnalytics(overrides)
    );
  }

  static createIntegrationArray(
    count: number,
    overrides: Partial<TestIntegration> = {}
  ): TestIntegration[] {
    return Array.from({ length: count }, () =>
      TestDataGenerator.generateIntegration(overrides)
    );
  }
}

export default {
  TestDataGenerator,
  MockCreator,
  TestAssertions,
  TestUtils,
  TestDataFactory,
  withMockTimers,
  withMockConsole,
  withMockEnv,
};
