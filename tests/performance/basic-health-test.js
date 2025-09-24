/**
 * Basic Health Test for Qylon Platform
 *
 * Simple health check test that verifies basic functionality
 * without requiring all services to be running.
 */

import { check, sleep } from 'k6';
import http from 'k6/http';

// Test configuration
export const options = {
  stages: [
    { duration: '30s', target: 1 }, // Single user for 30 seconds
  ],
  thresholds: {
    http_req_duration: ['p(95)<2000'], // 95% of requests should be below 2s
    http_req_failed: ['rate<0.1'], // Error rate should be less than 10%
  },
};

export default function () {
  // Test basic health endpoint
  const healthResponse = http.get('http://localhost:3000/health');

  check(healthResponse, {
    'health endpoint responds': r => r.status === 200 || r.status === 503,
    'health response time is acceptable': r => r.timings.duration < 2000,
  });

  // Test integration management service directly
  const integrationResponse = http.get('http://localhost:3006/health');

  check(integrationResponse, {
    'integration service is healthy': r => r.status === 200,
    'integration response time is acceptable': r => r.timings.duration < 1000,
  });

  sleep(1);
}
