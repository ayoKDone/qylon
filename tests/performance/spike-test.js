/**
 * K6 Spike Testing Script
 *
 * Spike testing for the Qylon platform to test system behavior
 * under sudden load spikes and recovery.
 */

import { check, sleep } from 'k6';
import http from 'k6/http';
import { Counter, Rate, Trend } from 'k6/metrics';

// Custom metrics
const errorRate = new Rate('error_rate');
const responseTime = new Trend('response_time');
const requestCount = new Counter('request_count');
const spikeRecoveryTime = new Trend('spike_recovery_time');

// Test configuration
export const options = {
  stages: [
    // Normal load
    { duration: '2m', target: 100 },
    { duration: '1m', target: 100 },

    // Sudden spike
    { duration: '30s', target: 2000 },
    { duration: '1m', target: 2000 },

    // Recovery
    { duration: '30s', target: 100 },
    { duration: '2m', target: 100 },

    // Another spike
    { duration: '30s', target: 1500 },
    { duration: '1m', target: 1500 },

    // Recovery
    { duration: '30s', target: 100 },
    { duration: '2m', target: 100 },

    // Extreme spike
    { duration: '30s', target: 3000 },
    { duration: '1m', target: 3000 },

    // Final recovery
    { duration: '30s', target: 100 },
    { duration: '2m', target: 100 },

    // Ramp down
    { duration: '1m', target: 0 },
  ],

  thresholds: {
    // More lenient thresholds for spike testing
    http_req_duration: ['p(95)<10000'],
    http_req_duration: ['p(99)<20000'],
    http_req_failed: ['rate<0.2'], // Allow up to 20% error rate during spikes
    error_rate: ['rate<0.2'],
  },

  tags: {
    environment: 'staging',
    test_type: 'spike_test',
  },
};

// Test data
const BASE_URL = __ENV.BASE_URL || 'http://localhost:3000';
const API_BASE_URL = `${BASE_URL}/api/v1`;

// Test users
const testUsers = [
  { email: 'spike1@test.com', password: 'TestPassword123!' },
  { email: 'spike2@test.com', password: 'TestPassword123!' },
  { email: 'spike3@test.com', password: 'TestPassword123!' },
  { email: 'spike4@test.com', password: 'TestPassword123!' },
  { email: 'spike5@test.com', password: 'TestPassword123!' },
];

// Helper functions
function generateRandomUser() {
  const randomIndex = Math.floor(Math.random() * testUsers.length);
  return testUsers[randomIndex];
}

function generateRandomString(length) {
  const chars =
    'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

function generateRandomDate() {
  const now = new Date();
  const future = new Date(
    now.getTime() + (Math.random() * 30 + 1) * 24 * 60 * 60 * 1000
  );
  return future.toISOString();
}

// Authentication helper
function authenticateUser(user) {
  const loginPayload = JSON.stringify({
    email: user.email,
    password: user.password,
  });

  const loginResponse = http.post(`${API_BASE_URL}/auth/login`, loginPayload, {
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

// Main test scenarios
export function setup() {
  console.log('Setting up spike test...');

  // Verify system is ready
  const healthResponse = http.get(`${BASE_URL}/health`);
  check(healthResponse, {
    'system is healthy': r => r.status === 200,
  });

  return {
    baseUrl: BASE_URL,
    apiBaseUrl: API_BASE_URL,
  };
}

export default function (data) {
  const user = generateRandomUser();
  const token = authenticateUser(user);

  if (!token) {
    console.error('Failed to authenticate user');
    return;
  }

  const headers = {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`,
  };

  // Determine current load level
  const currentVUs = __VU;
  const isSpike = currentVUs > 500;

  if (isSpike) {
    // During spikes, focus on critical operations
    testCriticalOperations(headers);
  } else {
    // During normal load, test full functionality
    testNormalOperations(headers);
  }

  // Minimal sleep during spikes, normal sleep otherwise
  sleep(isSpike ? 0.1 : 1);
}

// Test scenarios
function testCriticalOperations(headers) {
  // Focus on essential operations during spikes

  // Health check
  const healthResponse = http.get(`${BASE_URL}/health`, {
    tags: { endpoint: 'health', operation: 'critical' },
  });

  const healthSuccess = check(healthResponse, {
    'health status is 200': r => r.status === 200,
    'health response time < 5s': r => r.timings.duration < 5000,
  });

  errorRate.add(!healthSuccess);
  responseTime.add(healthResponse.timings.duration);
  requestCount.add(1);

  // User authentication
  const profileResponse = http.get(`${API_BASE_URL}/users/profile`, {
    headers,
    tags: { endpoint: 'user_profile', operation: 'critical' },
  });

  const profileSuccess = check(profileResponse, {
    'profile status is 200': r => r.status === 200,
    'profile response time < 10s': r => r.timings.duration < 10000,
  });

  errorRate.add(!profileSuccess);
  responseTime.add(profileResponse.timings.duration);
  requestCount.add(1);

  // Basic dashboard
  const dashboardResponse = http.get(`${API_BASE_URL}/dashboard`, {
    headers,
    tags: { endpoint: 'dashboard', operation: 'critical' },
  });

  const dashboardSuccess = check(dashboardResponse, {
    'dashboard status is 200': r => r.status === 200,
    'dashboard response time < 15s': r => r.timings.duration < 15000,
  });

  errorRate.add(!dashboardSuccess);
  responseTime.add(dashboardResponse.timings.duration);
  requestCount.add(1);
}

function testNormalOperations(headers) {
  // Test full functionality during normal load

  // User dashboard
  testUserDashboard(headers);

  // Client management
  testClientManagement(headers);

  // Meeting management
  testMeetingManagement(headers);

  // Content operations
  testContentOperations(headers);

  // Analytics
  testAnalytics(headers);
}

function testUserDashboard(headers) {
  const profileResponse = http.get(`${API_BASE_URL}/users/profile`, {
    headers,
    tags: { endpoint: 'user_profile', operation: 'normal' },
  });

  const profileSuccess = check(profileResponse, {
    'profile status is 200': r => r.status === 200,
    'profile response time < 2s': r => r.timings.duration < 2000,
  });

  errorRate.add(!profileSuccess);
  responseTime.add(profileResponse.timings.duration);
  requestCount.add(1);

  const dashboardResponse = http.get(`${API_BASE_URL}/dashboard`, {
    headers,
    tags: { endpoint: 'dashboard', operation: 'normal' },
  });

  const dashboardSuccess = check(dashboardResponse, {
    'dashboard status is 200': r => r.status === 200,
    'dashboard response time < 3s': r => r.timings.duration < 3000,
  });

  errorRate.add(!dashboardSuccess);
  responseTime.add(dashboardResponse.timings.duration);
  requestCount.add(1);
}

function testClientManagement(headers) {
  const clientsResponse = http.get(`${API_BASE_URL}/clients`, {
    headers,
    tags: { endpoint: 'clients_list', operation: 'normal' },
  });

  const clientsSuccess = check(clientsResponse, {
    'clients status is 200': r => r.status === 200,
    'clients response time < 2s': r => r.timings.duration < 2000,
  });

  errorRate.add(!clientsSuccess);
  responseTime.add(clientsResponse.timings.duration);
  requestCount.add(1);

  // Create client (10% of the time)
  if (Math.random() < 0.1) {
    const clientPayload = JSON.stringify({
      name: `Normal Client ${generateRandomString(8)}`,
      email: `client${generateRandomString(8)}@test.com`,
      phone: '+1234567890',
    });

    const createResponse = http.post(`${API_BASE_URL}/clients`, clientPayload, {
      headers,
      tags: { endpoint: 'clients_create', operation: 'normal' },
    });

    const createSuccess = check(createResponse, {
      'create client status is 201': r => r.status === 201,
      'create client response time < 3s': r => r.timings.duration < 3000,
    });

    errorRate.add(!createSuccess);
    responseTime.add(createResponse.timings.duration);
    requestCount.add(1);
  }
}

function testMeetingManagement(headers) {
  const meetingsResponse = http.get(`${API_BASE_URL}/meetings`, {
    headers,
    tags: { endpoint: 'meetings_list', operation: 'normal' },
  });

  const meetingsSuccess = check(meetingsResponse, {
    'meetings status is 200': r => r.status === 200,
    'meetings response time < 2s': r => r.timings.duration < 2000,
  });

  errorRate.add(!meetingsSuccess);
  responseTime.add(meetingsResponse.timings.duration);
  requestCount.add(1);

  // Create meeting (5% of the time)
  if (Math.random() < 0.05) {
    const meetingPayload = JSON.stringify({
      title: `Normal Meeting ${generateRandomString(8)}`,
      client_id: 'test-client-id',
      start_time: generateRandomDate(),
      end_time: generateRandomDate(),
      type: 'video_call',
      description: 'Normal test meeting description',
    });

    const createResponse = http.post(
      `${API_BASE_URL}/meetings`,
      meetingPayload,
      {
        headers,
        tags: { endpoint: 'meetings_create', operation: 'normal' },
      }
    );

    const createSuccess = check(createResponse, {
      'create meeting status is 201': r => r.status === 201,
      'create meeting response time < 3s': r => r.timings.duration < 3000,
    });

    errorRate.add(!createSuccess);
    responseTime.add(createResponse.timings.duration);
    requestCount.add(1);
  }
}

function testContentOperations(headers) {
  const contentResponse = http.get(`${API_BASE_URL}/content`, {
    headers,
    tags: { endpoint: 'content_list', operation: 'normal' },
  });

  const contentSuccess = check(contentResponse, {
    'content status is 200': r => r.status === 200,
    'content response time < 2s': r => r.timings.duration < 2000,
  });

  errorRate.add(!contentSuccess);
  responseTime.add(contentResponse.timings.duration);
  requestCount.add(1);

  // Generate content (2% of the time)
  if (Math.random() < 0.02) {
    const contentPayload = JSON.stringify({
      type: 'meeting_summary',
      meeting_id: 'test-meeting-id',
      prompt: 'Generate a summary of this meeting',
    });

    const generateResponse = http.post(
      `${API_BASE_URL}/content/generate`,
      contentPayload,
      {
        headers,
        tags: { endpoint: 'content_generate', operation: 'normal' },
      }
    );

    const generateSuccess = check(generateResponse, {
      'generate content status is 200': r => r.status === 200,
      'generate content response time < 15s': r => r.timings.duration < 15000,
    });

    errorRate.add(!generateSuccess);
    responseTime.add(generateResponse.timings.duration);
    requestCount.add(1);
  }
}

function testAnalytics(headers) {
  const analyticsResponse = http.get(`${API_BASE_URL}/analytics/dashboard`, {
    headers,
    tags: { endpoint: 'analytics_dashboard', operation: 'normal' },
  });

  const analyticsSuccess = check(analyticsResponse, {
    'analytics status is 200': r => r.status === 200,
    'analytics response time < 5s': r => r.timings.duration < 5000,
  });

  errorRate.add(!analyticsSuccess);
  responseTime.add(analyticsResponse.timings.duration);
  requestCount.add(1);

  // Track event (15% of the time)
  if (Math.random() < 0.15) {
    const eventPayload = JSON.stringify({
      event_type: 'page_view',
      properties: {
        page: 'dashboard',
        timestamp: new Date().toISOString(),
      },
    });

    const trackResponse = http.post(
      `${API_BASE_URL}/analytics/events`,
      eventPayload,
      {
        headers,
        tags: { endpoint: 'analytics_track', operation: 'normal' },
      }
    );

    const trackSuccess = check(trackResponse, {
      'track event status is 200': r => r.status === 200,
      'track event response time < 2s': r => r.timings.duration < 2000,
    });

    errorRate.add(!trackSuccess);
    responseTime.add(trackResponse.timings.duration);
    requestCount.add(1);
  }
}

export function teardown(data) {
  console.log('Spike test completed');
  console.log(`Total requests: ${requestCount.count}`);
  console.log(`Error rate: ${errorRate.rate}`);
  console.log(`Average response time: ${responseTime.avg}ms`);
  console.log(
    `95th percentile response time: ${responseTime.percentile(95)}ms`
  );
  console.log(
    `99th percentile response time: ${responseTime.percentile(99)}ms`
  );
  console.log(`Maximum response time: ${responseTime.max}ms`);
  console.log(`Minimum response time: ${responseTime.min}ms`);
}
