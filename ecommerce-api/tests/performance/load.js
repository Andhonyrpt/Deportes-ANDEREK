import { browseProducts } from './scenarios/browse.js';
import { registerAndLogin } from './scenarios/auth.js';
import { sleep } from 'k6';

// Load Test: Simulate normal and peak expected user traffic
export const options = {
    stages: [
        { duration: '30s', target: 20 },  // Ramp up to 20 users
        { duration: '1m', target: 20 },   // Stay at 20 users for 1 min (normal traffic)
        { duration: '30s', target: 50 },  // Ramp up to 50 users (peak traffic)
        { duration: '1m', target: 50 },   // Stay at peak for 1 min
        { duration: '30s', target: 0 },   // Ramp down to 0 users
    ],
    thresholds: {
        http_req_duration: ['p(95)<1000', 'p(99)<1500'], // SLA constraint
        http_req_failed: ['rate<0.01'],
    },
};

const BASE_URL = __ENV.API_URL || 'http://localhost:3000/api/v1';

export default function () {
    browseProducts(BASE_URL);
    // Introduce random probability so not all users register at once
    if (Math.random() > 0.7) {
        registerAndLogin(BASE_URL);
    }
    sleep(1);
}
