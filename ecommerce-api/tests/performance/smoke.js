import { browseProducts } from './scenarios/browse.js';
import { registerAndLogin } from './scenarios/auth.js';
import { sleep } from 'k6';

// Smoke Test: Validate the API functions under minimal load
export const options = {
    vus: 1, // 1 Virtual User
    duration: '30s', // Run for 30 seconds
    thresholds: {
        http_req_duration: ['p(95)<1000'], // 95% of requests must complete below 1s
        http_req_failed: ['rate<0.01'], // Ensure error rate is < 1%
    },
};

const BASE_URL = __ENV.API_URL || 'http://localhost:3000/api/v1';

export default function () {
    browseProducts(BASE_URL);
    registerAndLogin(BASE_URL);
    sleep(1);
}
