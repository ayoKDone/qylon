import { check, sleep } from 'k6';
import http from 'k6/http';

export let options = {
  stages: [
    { duration: '1m', target: 100 }, // Normal load
    { duration: '30s', target: 1000 }, // Spike to 1000 users
    { duration: '1m', target: 100 }, // Back to normal
    { duration: '30s', target: 1000 }, // Another spike
    { duration: '1m', target: 100 }, // Back to normal
    { duration: '2m', target: 0 }, // Ramp down
  ],
  thresholds: {
    http_req_duration: ['p(95)<2000'], // 95% of requests must complete below 2000ms
    http_req_failed: ['rate<0.3'], // Error rate must be below 30%
  },
};

export default function () {
  // Test system behavior under sudden load spikes
  let response = http.get('http://localhost:3000/health');
  check(response, {
    'System handles spike load': r => r.status === 200,
    'Spike response time acceptable': r => r.timings.duration < 2000,
  });

  sleep(0.1);
}
