import { check, sleep } from 'k6';
import http from 'k6/http';
import { Rate } from 'k6/metrics';

// Custom metrics
const errorRate = new Rate('errors');

export let options = {
    stages: [
        { duration: '2m', target: 100 }, // Ramp up to 100 users
        { duration: '5m', target: 100 }, // Stay at 100 users
        { duration: '2m', target: 200 }, // Ramp up to 200 users
        { duration: '5m', target: 200 }, // Stay at 200 users
        { duration: '2m', target: 0 },   // Ramp down
    ],
    thresholds: {
        http_req_duration: ['p(95)<500'], // 95% of requests must complete below 500ms
        http_req_failed: ['rate<0.1'],    // Error rate must be below 10%
        errors: ['rate<0.1'],             // Custom error rate must be below 10%
    },
};

export default function () {
    // Test API Gateway health
    let response = http.get('http://localhost:3000/health');
    let success = check(response, {
        'API Gateway health check status is 200': (r) => r.status === 200,
        'API Gateway response time < 500ms': (r) => r.timings.duration < 500,
    });
    errorRate.add(!success);

    // Test Meeting Intelligence service
    response = http.get('http://localhost:3003/health');
    success = check(response, {
        'Meeting Intelligence health check status is 200': (r) => r.status === 200,
        'Meeting Intelligence response time < 500ms': (r) => r.timings.duration < 500,
    });
    errorRate.add(!success);

    // Test Integration Management service
    response = http.get('http://localhost:3006/health');
    success = check(response, {
        'Integration Management health check status is 200': (r) => r.status === 200,
        'Integration Management response time < 500ms': (r) => r.timings.duration < 500,
    });
    errorRate.add(!success);

    // Test frontend
    response = http.get('http://localhost:3002/');
    success = check(response, {
        'Frontend status is 200': (r) => r.status === 200,
        'Frontend response time < 1000ms': (r) => r.timings.duration < 1000,
    });
    errorRate.add(!success);

    sleep(1);
}
