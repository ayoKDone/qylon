/**
 * K6 Load Testing Script
 *
 * Comprehensive load testing for the Qylon platform.
 * Tests system performance under various load conditions.
 */

import { check, sleep } from 'k6';
import http from 'k6/http';
import { Counter, Rate, Trend } from 'k6/metrics';

// Custom metrics
const errorRate = new Rate('error_rate');
const responseTime = new Trend('response_time');
const requestCount = new Counter('request_count');

// Test configuration
export const options = {
  stages: [
    // Ramp up
    { duration: '2m', target: 100 }, // Ramp up to 100 users over 2 minutes
    { duration: '5m', target: 100 }, // Stay at 100 users for 5 minutes
    { duration: '2m', target: 200 }, // Ramp up to 200 users over 2 minutes
    { duration: '5m', target: 200 }, // Stay at 200 users for 5 minutes
    { duration: '2m', target: 500 }, // Ramp up to 500 users over 2 minutes
    { duration: '5m', target: 500 }, // Stay at 500 users for 5 minutes
    { duration: '2m', target: 1000 }, // Ramp up to 1000 users over 2 minutes
    { duration: '10m', target: 1000 }, // Stay at 1000 users for 10 minutes
    // Ramp down
    { duration: '2m', target: 0 }, // Ramp down to 0 users over 2 minutes
  ],

  thresholds: {
    // Response time thresholds
    http_req_duration: ['p(95)<2000'], // 95% of requests should be below 2s
    http_req_duration: ['p(99)<5000'], // 99% of requests should be below 5s

    // Error rate thresholds
    http_req_failed: ['rate<0.01'], // Error rate should be less than 1%

    // Custom metric thresholds
    error_rate: ['rate<0.01'],
    response_time: ['p(95)<2000'],
  },

  // Test tags
  tags: {
    environment: 'staging',
    test_type: 'load_test',
  },
};

// Test data
const BASE_URL = __ENV.BASE_URL || 'http://localhost:3000';
const API_BASE_URL = `${BASE_URL}/api/v1`;

// Test users
const testUsers = [
  { email: 'user1@test.com', password: 'TestPassword123!' },
  { email: 'user2@test.com', password: 'TestPassword123!' },
  { email: 'user3@test.com', password: 'TestPassword123!' },
  { email: 'user4@test.com', password: 'TestPassword123!' },
  { email: 'user5@test.com', password: 'TestPassword123!' },
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
  console.log('Setting up load test...');

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

  // Test scenario 1: User Dashboard
  testUserDashboard(headers);
  sleep(1);

  // Test scenario 2: Client Management
  testClientManagement(headers);
  sleep(1);

  // Test scenario 3: Meeting Management
  testMeetingManagement(headers);
  sleep(1);

  // Test scenario 4: Content Creation
  testContentCreation(headers);
  sleep(1);

  // Test scenario 5: Analytics
  testAnalytics(headers);
  sleep(1);
}

// Test scenarios
function testUserDashboard(headers) {
  // Get user profile
  const profileResponse = http.get(`${API_BASE_URL}/users/profile`, {
    headers,
    tags: { endpoint: 'user_profile' },
  });

  const profileSuccess = check(profileResponse, {
    'profile status is 200': r => r.status === 200,
    'profile response time < 1s': r => r.timings.duration < 1000,
  });

  errorRate.add(!profileSuccess);
  responseTime.add(profileResponse.timings.duration);
  requestCount.add(1);

  // Get dashboard data
  const dashboardResponse = http.get(`${API_BASE_URL}/dashboard`, {
    headers,
    tags: { endpoint: 'dashboard' },
  });

  const dashboardSuccess = check(dashboardResponse, {
    'dashboard status is 200': r => r.status === 200,
    'dashboard response time < 2s': r => r.timings.duration < 2000,
  });

  errorRate.add(!dashboardSuccess);
  responseTime.add(dashboardResponse.timings.duration);
  requestCount.add(1);
}

function testClientManagement(headers) {
  // Get clients list
  const clientsResponse = http.get(`${API_BASE_URL}/clients`, {
    headers,
    tags: { endpoint: 'clients_list' },
  });

  const clientsSuccess = check(clientsResponse, {
    'clients status is 200': r => r.status === 200,
    'clients response time < 1s': r => r.timings.duration < 1000,
  });

  errorRate.add(!clientsSuccess);
  responseTime.add(clientsResponse.timings.duration);
  requestCount.add(1);

  // Create new client (10% of the time)
  if (Math.random() < 0.1) {
    const clientPayload = JSON.stringify({
      name: `Test Client ${generateRandomString(8)}`,
      email: `client${generateRandomString(8)}@test.com`,
      phone: '+1234567890',
    });

    const createResponse = http.post(`${API_BASE_URL}/clients`, clientPayload, {
      headers,
      tags: { endpoint: 'clients_create' },
    });

    const createSuccess = check(createResponse, {
      'create client status is 201': r => r.status === 201,
      'create client response time < 2s': r => r.timings.duration < 2000,
    });

    errorRate.add(!createSuccess);
    responseTime.add(createResponse.timings.duration);
    requestCount.add(1);
  }
}

function testMeetingManagement(headers) {
  // Get meetings list
  const meetingsResponse = http.get(`${API_BASE_URL}/meetings`, {
    headers,
    tags: { endpoint: 'meetings_list' },
  });

  const meetingsSuccess = check(meetingsResponse, {
    'meetings status is 200': r => r.status === 200,
    'meetings response time < 1s': r => r.timings.duration < 1000,
  });

  errorRate.add(!meetingsSuccess);
  responseTime.add(meetingsResponse.timings.duration);
  requestCount.add(1);

  // Create new meeting (5% of the time)
  if (Math.random() < 0.05) {
    const meetingPayload = JSON.stringify({
      title: `Test Meeting ${generateRandomString(8)}`,
      client_id: 'test-client-id',
      start_time: generateRandomDate(),
      end_time: generateRandomDate(),
      type: 'video_call',
      description: 'Test meeting description',
    });

    const createResponse = http.post(
      `${API_BASE_URL}/meetings`,
      meetingPayload,
      {
        headers,
        tags: { endpoint: 'meetings_create' },
      }
    );

    const createSuccess = check(createResponse, {
      'create meeting status is 201': r => r.status === 201,
      'create meeting response time < 2s': r => r.timings.duration < 2000,
    });

    errorRate.add(!createSuccess);
    responseTime.add(createResponse.timings.duration);
    requestCount.add(1);
  }
}

function testContentCreation(headers) {
  // Get content list
  const contentResponse = http.get(`${API_BASE_URL}/content`, {
    headers,
    tags: { endpoint: 'content_list' },
  });

  const contentSuccess = check(contentResponse, {
    'content status is 200': r => r.status === 200,
    'content response time < 1s': r => r.timings.duration < 1000,
  });

  errorRate.add(!contentSuccess);
  responseTime.add(contentResponse.timings.duration);
  requestCount.add(1);

  // Generate content (3% of the time)
  if (Math.random() < 0.03) {
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
        tags: { endpoint: 'content_generate' },
      }
    );

    const generateSuccess = check(generateResponse, {
      'generate content status is 200': r => r.status === 200,
      'generate content response time < 10s': r => r.timings.duration < 10000,
    });

    errorRate.add(!generateSuccess);
    responseTime.add(generateResponse.timings.duration);
    requestCount.add(1);
  }
}

function testAnalytics(headers) {
  // Get analytics data
  const analyticsResponse = http.get(`${API_BASE_URL}/analytics/dashboard`, {
    headers,
    tags: { endpoint: 'analytics_dashboard' },
  });

  const analyticsSuccess = check(analyticsResponse, {
    'analytics status is 200': r => r.status === 200,
    'analytics response time < 3s': r => r.timings.duration < 3000,
  });

  errorRate.add(!analyticsSuccess);
  responseTime.add(analyticsResponse.timings.duration);
  requestCount.add(1);

  // Track event (20% of the time)
  if (Math.random() < 0.2) {
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
        tags: { endpoint: 'analytics_track' },
      }
    );

    const trackSuccess = check(trackResponse, {
      'track event status is 200': r => r.status === 200,
      'track event response time < 1s': r => r.timings.duration < 1000,
    });

    errorRate.add(!trackSuccess);
    responseTime.add(trackResponse.timings.duration);
    requestCount.add(1);
  }
}

export function teardown(data) {
  console.log('Load test completed');
  console.log(`Total requests: ${requestCount.count}`);
  console.log(`Error rate: ${errorRate.rate}`);
  console.log(`Average response time: ${responseTime.avg}ms`);
}
