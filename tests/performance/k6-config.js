/**
 * K6 Performance Testing Configuration
 *
 * Configuration and utilities for K6 performance testing.
 */

import { check } from 'k6';
import { Counter, Rate, Trend } from 'k6/metrics';

// Custom metrics for performance monitoring
export const customMetrics = {
  errorRate: new Rate('error_rate'),
  responseTime: new Trend('response_time'),
  requestCount: new Counter('request_count'),
  throughput: new Counter('throughput'),
  systemLoad: new Trend('system_load'),
  memoryUsage: new Trend('memory_usage'),
  cpuUsage: new Trend('cpu_usage'),
};

// Common test configurations
export const testConfigs = {
  // Load test configuration
  loadTest: {
    stages: [
      { duration: '2m', target: 100 },
      { duration: '5m', target: 100 },
      { duration: '2m', target: 200 },
      { duration: '5m', target: 200 },
      { duration: '2m', target: 500 },
      { duration: '5m', target: 500 },
      { duration: '2m', target: 1000 },
      { duration: '10m', target: 1000 },
      { duration: '2m', target: 0 },
    ],
    thresholds: {
      http_req_duration: ['p(95)<2000', 'p(99)<5000'],
      http_req_failed: ['rate<0.01'],
      error_rate: ['rate<0.01'],
      response_time: ['p(95)<2000'],
    },
  },

  // Stress test configuration
  stressTest: {
    stages: [
      { duration: '1m', target: 100 },
      { duration: '2m', target: 200 },
      { duration: '2m', target: 400 },
      { duration: '2m', target: 600 },
      { duration: '2m', target: 800 },
      { duration: '2m', target: 1000 },
      { duration: '2m', target: 1200 },
      { duration: '2m', target: 1400 },
      { duration: '2m', target: 1600 },
      { duration: '2m', target: 1800 },
      { duration: '2m', target: 2000 },
      { duration: '5m', target: 2000 },
      { duration: '2m', target: 100 },
      { duration: '2m', target: 0 },
    ],
    thresholds: {
      http_req_duration: ['p(95)<5000', 'p(99)<10000'],
      http_req_failed: ['rate<0.1'],
      error_rate: ['rate<0.1'],
    },
  },

  // Spike test configuration
  spikeTest: {
    stages: [
      { duration: '2m', target: 100 },
      { duration: '1m', target: 100 },
      { duration: '30s', target: 2000 },
      { duration: '1m', target: 2000 },
      { duration: '30s', target: 100 },
      { duration: '2m', target: 100 },
      { duration: '30s', target: 1500 },
      { duration: '1m', target: 1500 },
      { duration: '30s', target: 100 },
      { duration: '2m', target: 100 },
      { duration: '30s', target: 3000 },
      { duration: '1m', target: 3000 },
      { duration: '30s', target: 100 },
      { duration: '2m', target: 100 },
      { duration: '1m', target: 0 },
    ],
    thresholds: {
      http_req_duration: ['p(95)<10000', 'p(99)<20000'],
      http_req_failed: ['rate<0.2'],
      error_rate: ['rate<0.2'],
    },
  },

  // Volume test configuration
  volumeTest: {
    stages: [
      { duration: '5m', target: 100 },
      { duration: '30m', target: 100 },
      { duration: '5m', target: 0 },
    ],
    thresholds: {
      http_req_duration: ['p(95)<3000', 'p(99)<5000'],
      http_req_failed: ['rate<0.01'],
      error_rate: ['rate<0.01'],
    },
  },
};

// Common test data
export const testData = {
  users: [
    { email: 'user1@test.com', password: 'TestPassword123!' },
    { email: 'user2@test.com', password: 'TestPassword123!' },
    { email: 'user3@test.com', password: 'TestPassword123!' },
    { email: 'user4@test.com', password: 'TestPassword123!' },
    { email: 'user5@test.com', password: 'TestPassword123!' },
  ],

  clients: [
    { name: 'Test Client 1', email: 'client1@test.com', phone: '+1234567890' },
    { name: 'Test Client 2', email: 'client2@test.com', phone: '+1234567891' },
    { name: 'Test Client 3', email: 'client3@test.com', phone: '+1234567892' },
  ],

  meetings: [
    { title: 'Test Meeting 1', type: 'video_call', duration: 60 },
    { title: 'Test Meeting 2', type: 'phone_call', duration: 30 },
    { title: 'Test Meeting 3', type: 'in_person', duration: 90 },
  ],
};

// Utility functions
export function generateRandomString(length) {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

export function generateRandomDate() {
  const now = new Date();
  const future = new Date(now.getTime() + (Math.random() * 30 + 1) * 24 * 60 * 60 * 1000);
  return future.toISOString();
}

export function generateRandomUser() {
  const randomIndex = Math.floor(Math.random() * testData.users.length);
  return testData.users[randomIndex];
}

export function generateRandomClient() {
  const randomIndex = Math.floor(Math.random() * testData.clients.length);
  return testData.clients[randomIndex];
}

export function generateRandomMeeting() {
  const randomIndex = Math.floor(Math.random() * testData.meetings.length);
  return testData.meetings[randomIndex];
}

// Authentication helper
export function authenticateUser(user, baseUrl) {
  const loginPayload = JSON.stringify({
    email: user.email,
    password: user.password,
  });

  const loginResponse = http.post(`${baseUrl}/api/v1/auth/login`, loginPayload, {
    headers: { 'Content-Type': 'application/json' },
    tags: { endpoint: 'auth_login' },
  });

  const success = check(loginResponse, {
    'login status is 200': r => r.status === 200,
    'login response has token': r => r.json('data.accessToken') !== undefined,
  });

  if (success) {
    return loginResponse.json('data.accessToken');
  }

  return null;
}

// Performance monitoring helpers
export function recordMetrics(response, customMetrics) {
  const success = response.status >= 200 && response.status < 300;

  customMetrics.errorRate.add(!success);
  customMetrics.responseTime.add(response.timings.duration);
  customMetrics.requestCount.add(1);
  customMetrics.throughput.add(1);

  return success;
}

export function checkResponse(response, checks) {
  const results = check(response, checks);
  recordMetrics(response, customMetrics);
  return results;
}

// Test scenario helpers
export function testHealthCheck(baseUrl) {
  const response = http.get(`${baseUrl}/health`, {
    tags: { endpoint: 'health' },
  });

  return checkResponse(response, {
    'health status is 200': r => r.status === 200,
    'health response time < 1s': r => r.timings.duration < 1000,
  });
}

export function testUserProfile(headers, baseUrl) {
  const response = http.get(`${baseUrl}/api/v1/users/profile`, {
    headers,
    tags: { endpoint: 'user_profile' },
  });

  return checkResponse(response, {
    'profile status is 200': r => r.status === 200,
    'profile response time < 2s': r => r.timings.duration < 2000,
  });
}

export function testDashboard(headers, baseUrl) {
  const response = http.get(`${baseUrl}/api/v1/dashboard`, {
    headers,
    tags: { endpoint: 'dashboard' },
  });

  return checkResponse(response, {
    'dashboard status is 200': r => r.status === 200,
    'dashboard response time < 3s': r => r.timings.duration < 3000,
  });
}

export function testClientsList(headers, baseUrl) {
  const response = http.get(`${baseUrl}/api/v1/clients`, {
    headers,
    tags: { endpoint: 'clients_list' },
  });

  return checkResponse(response, {
    'clients status is 200': r => r.status === 200,
    'clients response time < 2s': r => r.timings.duration < 2000,
  });
}

export function testMeetingsList(headers, baseUrl) {
  const response = http.get(`${baseUrl}/api/v1/meetings`, {
    headers,
    tags: { endpoint: 'meetings_list' },
  });

  return checkResponse(response, {
    'meetings status is 200': r => r.status === 200,
    'meetings response time < 2s': r => r.timings.duration < 2000,
  });
}

export function testAnalytics(headers, baseUrl) {
  const response = http.get(`${baseUrl}/api/v1/analytics/dashboard`, {
    headers,
    tags: { endpoint: 'analytics_dashboard' },
  });

  return checkResponse(response, {
    'analytics status is 200': r => r.status === 200,
    'analytics response time < 5s': r => r.timings.duration < 5000,
  });
}

// Performance reporting
export function generatePerformanceReport(customMetrics) {
  return {
    totalRequests: customMetrics.requestCount.count,
    errorRate: customMetrics.errorRate.rate,
    averageResponseTime: customMetrics.responseTime.avg,
    p95ResponseTime: customMetrics.responseTime.percentile(95),
    p99ResponseTime: customMetrics.responseTime.percentile(99),
    maxResponseTime: customMetrics.responseTime.max,
    minResponseTime: customMetrics.responseTime.min,
    throughput: customMetrics.throughput.count,
  };
}

// Test environment configuration
export const environments = {
  local: {
    baseUrl: 'http://localhost:3000',
    apiBaseUrl: 'http://localhost:3000/api/v1',
  },
  staging: {
    baseUrl: 'https://staging.qylon.com',
    apiBaseUrl: 'https://staging.qylon.com/api/v1',
  },
  production: {
    baseUrl: 'https://app.qylon.com',
    apiBaseUrl: 'https://app.qylon.com/api/v1',
  },
};

export function getEnvironment() {
  const env = __ENV.ENVIRONMENT || 'local';
  return environments[env] || environments.local;
}

// Test tags for organization
export const testTags = {
  environment: __ENV.ENVIRONMENT || 'local',
  testType: __ENV.TEST_TYPE || 'performance',
  version: __ENV.VERSION || '1.0.0',
  build: __ENV.BUILD || 'unknown',
};
