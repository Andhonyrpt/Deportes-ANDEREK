import { browseProducts } from './scenarios/browse.js';
import { registerAndLogin } from './scenarios/auth.js';
import { sleep } from 'k6';

// Spike Test: Mass traffic surge in a short window
export const options = {
    stages: [
        { duration: '10s', target: 10 },   // Baseline traffic
        { duration: '30s', target: 10 },
        { duration: '10s', target: 400 },  // Sudden spike up to 400 VUs
        { duration: '40s', target: 400 },  // Hold the traffic surge
        { duration: '10s', target: 10 },   // Sudden drop
        { duration: '20s', target: 10 },
        { duration: '10s', target: 0 },
    ],
    thresholds: {
        // Slightly looser SLA during an absolute spike, but ideally <1s
        http_req_duration: ['p(95)<1300'],
        http_req_failed: ['rate<0.05'],
    },
};

const BASE_URL = __ENV.API_URL || 'http://localhost:3000/api/v1';

export default function () {
    browseProducts(BASE_URL);
    if (Math.random() > 0.9) {
        registerAndLogin(BASE_URL);
    }
    sleep(1);
}
