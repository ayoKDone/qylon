/**
 * K6 Stress Testing Script
 *
 * Stress testing for the Qylon platform to determine breaking points.
 * Tests system behavior under extreme load conditions.
 */

import { check, sleep } from 'k6';
import http from 'k6/http';
import { Counter, Rate, Trend } from 'k6/metrics';

// Custom metrics
const errorRate = new Rate('error_rate');
const responseTime = new Trend('response_time');
const requestCount = new Counter('request_count');
const systemLoad = new Trend('system_load');

// Test configuration
export const options = {
  stages: [
    // Gradual increase to find breaking point
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
    // Sustained high load
    { duration: '5m', target: 2000 },
    // Recovery test
    { duration: '2m', target: 100 },
    { duration: '2m', target: 0 },
  ],

  thresholds: {
    // More lenient thresholds for stress testing
    http_req_duration: ['p(95)<5000'],
    http_req_duration: ['p(99)<10000'],
    http_req_failed: ['rate<0.1'], // Allow up to 10% error rate
    error_rate: ['rate<0.1'],
  },

  tags: {
    environment: 'staging',
    test_type: 'stress_test',
  },
};

// Test data
const BASE_URL = __ENV.BASE_URL || 'http://localhost:3000';
const API_BASE_URL = `${BASE_URL}/api/v1`;

// Test users
const testUsers = [
  { email: 'stress1@test.com', password: 'TestPassword123!' },
  { email: 'stress2@test.com', password: 'TestPassword123!' },
  { email: 'stress3@test.com', password: 'TestPassword123!' },
  { email: 'stress4@test.com', password: 'TestPassword123!' },
  { email: 'stress5@test.com', password: 'TestPassword123!' },
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
  console.log('Setting up stress test...');

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

  // Randomly select test scenario
  const scenario = Math.floor(Math.random() * 5);

  switch (scenario) {
    case 0:
      testHeavyReadOperations(headers);
      break;
    case 1:
      testHeavyWriteOperations(headers);
      break;
    case 2:
      testComplexQueries(headers);
      break;
    case 3:
      testFileOperations(headers);
      break;
    case 4:
      testConcurrentOperations(headers);
      break;
  }

  sleep(0.1); // Minimal sleep to maximize load
}

// Stress test scenarios
function testHeavyReadOperations(headers) {
  // Multiple concurrent read operations
  const promises = [];

  for (let i = 0; i < 10; i++) {
    const promise = http.get(`${API_BASE_URL}/dashboard`, {
      headers,
      tags: { endpoint: 'dashboard', operation: 'heavy_read' },
    });
    promises.push(promise);
  }

  // Get analytics data
  const analyticsResponse = http.get(`${API_BASE_URL}/analytics/dashboard`, {
    headers,
    tags: { endpoint: 'analytics', operation: 'heavy_read' },
  });

  const analyticsSuccess = check(analyticsResponse, {
    'analytics status is 200': r => r.status === 200,
    'analytics response time < 5s': r => r.timings.duration < 5000,
  });

  errorRate.add(!analyticsSuccess);
  responseTime.add(analyticsResponse.timings.duration);
  requestCount.add(1);

  // Get large dataset
  const largeDataResponse = http.get(`${API_BASE_URL}/meetings?limit=1000`, {
    headers,
    tags: { endpoint: 'meetings_large', operation: 'heavy_read' },
  });

  const largeDataSuccess = check(largeDataResponse, {
    'large data status is 200': r => r.status === 200,
    'large data response time < 10s': r => r.timings.duration < 10000,
  });

  errorRate.add(!largeDataSuccess);
  responseTime.add(largeDataResponse.timings.duration);
  requestCount.add(1);
}

function testHeavyWriteOperations(headers) {
  // Multiple concurrent write operations
  for (let i = 0; i < 5; i++) {
    const clientPayload = JSON.stringify({
      name: `Stress Client ${generateRandomString(8)}`,
      email: `stress${generateRandomString(8)}@test.com`,
      phone: '+1234567890',
    });

    const createResponse = http.post(`${API_BASE_URL}/clients`, clientPayload, {
      headers,
      tags: { endpoint: 'clients_create', operation: 'heavy_write' },
    });

    const createSuccess = check(createResponse, {
      'create client status is 201': r => r.status === 201,
      'create client response time < 5s': r => r.timings.duration < 5000,
    });

    errorRate.add(!createSuccess);
    responseTime.add(createResponse.timings.duration);
    requestCount.add(1);
  }

  // Create multiple meetings
  for (let i = 0; i < 3; i++) {
    const meetingPayload = JSON.stringify({
      title: `Stress Meeting ${generateRandomString(8)}`,
      client_id: 'test-client-id',
      start_time: generateRandomDate(),
      end_time: generateRandomDate(),
      type: 'video_call',
      description: 'Stress test meeting description',
    });

    const createResponse = http.post(
      `${API_BASE_URL}/meetings`,
      meetingPayload,
      {
        headers,
        tags: { endpoint: 'meetings_create', operation: 'heavy_write' },
      }
    );

    const createSuccess = check(createResponse, {
      'create meeting status is 201': r => r.status === 201,
      'create meeting response time < 5s': r => r.timings.duration < 5000,
    });

    errorRate.add(!createSuccess);
    responseTime.add(createResponse.timings.duration);
    requestCount.add(1);
  }
}

function testComplexQueries(headers) {
  // Complex search queries
  const searchQueries = [
    'meetings?search=important&status=scheduled&date_from=2024-01-01&date_to=2024-12-31',
    'clients?search=company&sort=name&order=desc&limit=100',
    'content?type=meeting_summary&date_from=2024-01-01&limit=50',
    'analytics?metric=meetings&period=monthly&group_by=client',
  ];

  searchQueries.forEach(query => {
    const response = http.get(`${API_BASE_URL}/${query}`, {
      headers,
      tags: { endpoint: 'complex_query', operation: 'search' },
    });

    const success = check(response, {
      'complex query status is 200': r => r.status === 200,
      'complex query response time < 10s': r => r.timings.duration < 10000,
    });

    errorRate.add(!success);
    responseTime.add(response.timings.duration);
    requestCount.add(1);
  });

  // Aggregation queries
  const aggregationResponse = http.get(
    `${API_BASE_URL}/analytics/aggregations`,
    {
      headers,
      tags: { endpoint: 'aggregations', operation: 'complex_query' },
    }
  );

  const aggregationSuccess = check(aggregationResponse, {
    'aggregation status is 200': r => r.status === 200,
    'aggregation response time < 15s': r => r.timings.duration < 15000,
  });

  errorRate.add(!aggregationSuccess);
  responseTime.add(aggregationResponse.timings.duration);
  requestCount.add(1);
}

function testFileOperations(headers) {
  // File upload simulation
  const filePayload = JSON.stringify({
    name: `stress_file_${generateRandomString(8)}.txt`,
    content: 'A'.repeat(10000), // 10KB of data
    type: 'text/plain',
  });

  const uploadResponse = http.post(
    `${API_BASE_URL}/files/upload`,
    filePayload,
    {
      headers,
      tags: { endpoint: 'file_upload', operation: 'file_ops' },
    }
  );

  const uploadSuccess = check(uploadResponse, {
    'file upload status is 200': r => r.status === 200,
    'file upload response time < 10s': r => r.timings.duration < 10000,
  });

  errorRate.add(!uploadSuccess);
  responseTime.add(uploadResponse.timings.duration);
  requestCount.add(1);

  // File download simulation
  const downloadResponse = http.get(
    `${API_BASE_URL}/files/download/test-file-id`,
    {
      headers,
      tags: { endpoint: 'file_download', operation: 'file_ops' },
    }
  );

  const downloadSuccess = check(downloadResponse, {
    'file download status is 200': r => r.status === 200,
    'file download response time < 5s': r => r.timings.duration < 5000,
  });

  errorRate.add(!downloadSuccess);
  responseTime.add(downloadResponse.timings.duration);
  requestCount.add(1);
}

function testConcurrentOperations(headers) {
  // Simulate concurrent operations that might cause race conditions
  const operations = [
    // Update user profile
    () => {
      const profilePayload = JSON.stringify({
        name: `Updated User ${generateRandomString(8)}`,
        preferences: {
          timezone: 'America/New_York',
          notifications: true,
        },
      });

      return http.put(`${API_BASE_URL}/users/profile`, profilePayload, {
        headers,
        tags: { endpoint: 'profile_update', operation: 'concurrent' },
      });
    },

    // Update client information
    () => {
      const clientPayload = JSON.stringify({
        name: `Updated Client ${generateRandomString(8)}`,
        phone: '+1987654321',
      });

      return http.put(`${API_BASE_URL}/clients/test-client-id`, clientPayload, {
        headers,
        tags: { endpoint: 'client_update', operation: 'concurrent' },
      });
    },

    // Create meeting
    () => {
      const meetingPayload = JSON.stringify({
        title: `Concurrent Meeting ${generateRandomString(8)}`,
        client_id: 'test-client-id',
        start_time: generateRandomDate(),
        end_time: generateRandomDate(),
        type: 'video_call',
      });

      return http.post(`${API_BASE_URL}/meetings`, meetingPayload, {
        headers,
        tags: { endpoint: 'meeting_create', operation: 'concurrent' },
      });
    },

    // Track analytics event
    () => {
      const eventPayload = JSON.stringify({
        event_type: 'stress_test_event',
        properties: {
          test_type: 'concurrent_operations',
          timestamp: new Date().toISOString(),
        },
      });

      return http.post(`${API_BASE_URL}/analytics/events`, eventPayload, {
        headers,
        tags: { endpoint: 'analytics_track', operation: 'concurrent' },
      });
    },
  ];

  // Execute operations concurrently
  operations.forEach(operation => {
    const response = operation();

    const success = check(response, {
      'concurrent operation status is 200 or 201': r =>
        r.status === 200 || r.status === 201,
      'concurrent operation response time < 5s': r => r.timings.duration < 5000,
    });

    errorRate.add(!success);
    responseTime.add(response.timings.duration);
    requestCount.add(1);
  });
}

export function teardown(data) {
  console.log('Stress test completed');
  console.log(`Total requests: ${requestCount.count}`);
  console.log(`Error rate: ${errorRate.rate}`);
  console.log(`Average response time: ${responseTime.avg}ms`);
  console.log(
    `95th percentile response time: ${responseTime.percentile(95)}ms`
  );
  console.log(
    `99th percentile response time: ${responseTime.percentile(99)}ms`
  );
}
