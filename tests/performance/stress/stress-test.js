import { check, sleep } from 'k6';
import http from 'k6/http';

export let options = {
    stages: [
        { duration: '1m', target: 500 }, // Ramp up to 500 users
        { duration: '3m', target: 500 }, // Stay at 500 users
        { duration: '1m', target: 1000 }, // Ramp up to 1000 users
        { duration: '3m', target: 1000 }, // Stay at 1000 users
        { duration: '2m', target: 0 },   // Ramp down
    ],
    thresholds: {
        http_req_duration: ['p(95)<1000'], // 95% of requests must complete below 1000ms
        http_req_failed: ['rate<0.2'],     // Error rate must be below 20%
    },
};

export default function () {
    // Test critical endpoints under stress
    let response = http.get('http://localhost:3000/api/health');
    check(response, {
        'API Gateway stress test status is 200': (r) => r.status === 200,
        'API Gateway stress test response time < 1000ms': (r) => r.timings.duration < 1000,
    });

    // Test database operations under stress
    response = http.get('http://localhost:3000/api/meetings');
    check(response, {
        'Meetings API stress test status is 200': (r) => r.status === 200,
        'Meetings API stress test response time < 1000ms': (r) => r.timings.duration < 1000,
    });

    sleep(0.5);
}
