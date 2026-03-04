import http from 'k6/http';
import { check, sleep } from 'k6';

export function browseProducts(baseUrl) {
    const res = http.get(`${baseUrl}/products`, {
        headers: { 'x-load-test': 'true' }
    });

    check(res, {
        'GET /products is status 200': (r) => r.status === 200,
        'GET /products duration < 1s': (r) => r.timings.duration < 1000,
    });

    // Think time
    sleep(Math.random() * 2 + 1); // Random sleep between 1-3 seconds
}
