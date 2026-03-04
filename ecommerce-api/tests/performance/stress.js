import { browseProducts } from './scenarios/browse.js';
import { registerAndLogin } from './scenarios/auth.js';
import { sleep } from 'k6';

// Stress Test: Push the API to identify its breaking point
export const options = {
    stages: [
        { duration: '10s', target: 50 },  // Ramp to 50
        { duration: '20s', target: 50 },  // Stay at 50
        { duration: '10s', target: 150 }, // Ramp to 150
        { duration: '20s', target: 150 }, // Stay at 150
        { duration: '10s', target: 300 }, // Ramp to 300 (Extreme load)
        { duration: '20s', target: 300 }, // Stay at 300
        { duration: '10s', target: 0 },   // Scale down
    ],
    thresholds: {
        // SLA: Expect response time < 1s for 95% of requests.
        http_req_duration: ['p(95)<1000', 'p(99)<2000'],
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
