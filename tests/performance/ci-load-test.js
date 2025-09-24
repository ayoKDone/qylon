/**
 * CI Load Testing Script
 *
 * Simplified load test for CI/CD pipeline that doesn't require
 * all services to be running or authentication.
 */

import { check, sleep } from 'k6';
import http from 'k6/http';

// Test configuration
export const options = {
  stages: [
    { duration: '30s', target: 5 }, // Ramp up to 5 users over 30 seconds
    { duration: '1m', target: 5 },  // Stay at 5 users for 1 minute
    { duration: '30s', target: 0 }, // Ramp down to 0 users over 30 seconds
  ],
  thresholds: {
    http_req_duration: ['p(95)<2000'], // 95% of requests should be below 2s
    http_req_failed: ['rate<0.1'],     // Error rate should be less than 10%
  },
};

export default function () {
  // Test basic health endpoint (accepts 200 or 503)
  const healthResponse = http.get('http://localhost:3000/health');

  check(healthResponse, {
    'health endpoint responds': (r) => r.status === 200 || r.status === 503,
    'health response time is acceptable': (r) => r.timings.duration < 2000,
  });

  // Test integration management service if available
  const integrationResponse = http.get('http://localhost:3006/health');

  check(integrationResponse, {
    'integration service responds': (r) => r.status === 200 || r.status === 404,
    'integration response time is acceptable': (r) => r.timings.duration < 1000,
  });

  sleep(1);
}
