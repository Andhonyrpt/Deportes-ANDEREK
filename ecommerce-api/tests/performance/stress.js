import { browseProducts } from './scenarios/browse.js';
import { registerAndLogin } from './scenarios/auth.js';
import { sleep } from 'k6';

// Stress Test: Push the API to identify its breaking point
export const options = {
    stages: [
        { duration: '10s', target: 50 },  // Ramp to 50
        { duration: '20s', target: 50 },  // Stay at 50
        { duration: '10s', target: 100 }, // Ramp to 100
        { duration: '20s', target: 100 }, // Stay at 100
        { duration: '10s', target: 200 }, // Ramp to 200 (Extreme load for local)
        { duration: '20s', target: 200 }, // Stay at 200
        { duration: '10s', target: 0 },   // Scale down
    ],
    thresholds: {
        // SLA relaxed to 3s because stress tests are designed to reach system exhaustion.
        http_req_duration: ['p(95)<3000', 'p(99)<4000'],
        // Fail if error rate goes above 5% at maximum stress
        http_req_failed: ['rate<0.05'],
    },
};

const BASE_URL = __ENV.API_URL || 'http://localhost:3000/api/v1';

export default function () {
    browseProducts(BASE_URL);
    // Lower probability for intense writes to mimic real-world distribution
    if (Math.random() > 0.8) {
        registerAndLogin(BASE_URL);
    }
    sleep(1);
}
