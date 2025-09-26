/**
 * Simple K6 Load Testing Script
 *
 * Basic load testing for the Qylon platform without authentication.
 * Tests system performance under basic load conditions.
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
    { duration: '1m', target: 10 }, // Ramp up to 10 users over 1 minute
    { duration: '2m', target: 10 }, // Stay at 10 users for 2 minutes
    { duration: '1m', target: 0 }, // Ramp down to 0 users over 1 minute
  ],

  thresholds: {
    // Response time thresholds
    http_req_duration: ['p(95)<2000'], // 95% of requests should be below 2s
    http_req_duration: ['p(99)<5000'], // 99% of requests should be below 5s

    // Error rate thresholds
    http_req_failed: ['rate<0.1'], // Error rate should be less than 10%

    // Custom metric thresholds
    error_rate: ['rate<0.1'],
    response_time: ['p(95)<2000'],
  },

  // Test tags
  tags: {
    environment: 'local',
    test_type: 'simple_load_test',
  },
};

// Test data
const BASE_URL = __ENV.BASE_URL || 'http://localhost:3000';

// Main test scenarios
export function setup() {
  console.log('Setting up simple load test...');

  // Verify system is ready
  const healthResponse = http.get(`${BASE_URL}/health`);
  const healthCheck = check(healthResponse, {
    'system is healthy': r => r.status === 200,
  });

  if (!healthCheck) {
    console.error('System health check failed');
    return null;
  }

  return {
    baseUrl: BASE_URL,
  };
}

export default function (data) {
  if (!data) {
    console.error('Setup failed, skipping test');
    return;
  }

  // Test scenario 1: Health Check
  testHealthCheck(data.baseUrl);
  sleep(1);

  // Test scenario 2: API Gateway Health
  testAPIHealth(data.baseUrl);
  sleep(1);
}

// Test scenarios
function testHealthCheck(baseUrl) {
  // Get health status
  const healthResponse = http.get(`${baseUrl}/health`, {
    tags: { endpoint: 'health' },
  });

  const healthSuccess = check(healthResponse, {
    'health status is 200': r => r.status === 200,
    'health response time < 1s': r => r.timings.duration < 1000,
  });

  errorRate.add(!healthSuccess);
  responseTime.add(healthResponse.timings.duration);
  requestCount.add(1);
}

function testAPIHealth(baseUrl) {
  // Test API Gateway health endpoint
  const apiHealthResponse = http.get(`${baseUrl}/health`, {
    tags: { endpoint: 'api_health' },
  });

  const apiHealthSuccess = check(apiHealthResponse, {
    'api health status is 200': r => r.status === 200,
    'api health response time < 2s': r => r.timings.duration < 2000,
  });

  errorRate.add(!apiHealthSuccess);
  responseTime.add(apiHealthResponse.timings.duration);
  requestCount.add(1);
}

export function teardown(data) {
  console.log('Simple load test completed');
  console.log(`Total requests: ${requestCount.count}`);
  console.log(`Error rate: ${errorRate.rate}`);
  console.log(`Average response time: ${responseTime.avg}ms`);
}
