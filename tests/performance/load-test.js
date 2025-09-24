/**
 * K6 Load Testing Script
 *
 * Basic load testing for the Qylon platform.
 * Tests system performance under load conditions without requiring full authentication.
 */

import { check, sleep } from 'k6';
import http from 'k6/http';

// Test configuration
export const options = {
  stages: [
    { duration: '10s', target: 5 }, // Ramp up to 5 users over 10 seconds
    { duration: '30s', target: 5 }, // Stay at 5 users for 30 seconds
    { duration: '10s', target: 0 }, // Ramp down to 0 users over 10 seconds
  ],

  thresholds: {
    // Response time thresholds
    http_req_duration: ['p(95)<2000'], // 95% of requests should be below 2s
    http_req_failed: ['rate<0.1'], // Error rate should be less than 10%
  },

  // Test tags
  tags: {
    environment: 'local',
    test_type: 'basic_load_test',
  },
};

// Test data
const BASE_URL = __ENV.BASE_URL || 'http://localhost:3000';
const INTEGRATION_SERVICE_URL =
  __ENV.INTEGRATION_SERVICE_URL || 'http://localhost:3006';

// Main test scenarios
export function setup() {
  console.log('Setting up basic load test...');

  // Verify system is ready
  const healthResponse = http.get(`${BASE_URL}/health`);
  check(healthResponse, {
    'API Gateway health endpoint responds': r =>
      r.status === 200 || r.status === 503, // Allow 503 for partial deployment
    'API Gateway health response time is acceptable': r =>
      r.timings.duration < 2000,
  });

  return {
    baseUrl: BASE_URL,
    integrationServiceUrl: INTEGRATION_SERVICE_URL,
  };
}

export default function (data) {
  // Test API Gateway health endpoint
  const apiGatewayHealth = http.get(`${data.baseUrl}/health`);
  check(apiGatewayHealth, {
    'API Gateway health endpoint responds': r =>
      r.status === 200 || r.status === 503, // Allow 503 for partial deployment
    'API Gateway health response time is acceptable': r =>
      r.timings.duration < 2000,
  });
  sleep(1);

  // Test Integration Management Service health directly
  const integrationServiceHealth = http.get(
    `${data.integrationServiceUrl}/health`
  );
  check(integrationServiceHealth, {
    'Integration Service health endpoint responds': r => r.status === 200,
    'Integration Service health response time is acceptable': r =>
      r.timings.duration < 2000,
  });
  sleep(1);
}

export function teardown(data) {
  console.log('Basic load test completed');
}
