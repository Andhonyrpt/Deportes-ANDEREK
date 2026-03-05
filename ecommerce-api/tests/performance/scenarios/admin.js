import http from 'k6/http';
import { check, sleep } from 'k6';

export function adminOperations(baseUrl, token) {
    if (!token) return;

    let productId = '64a7b5c4f2a1b2c3d4e5f600'; // Fallback

    // Fetch a real product dynamically to avoid 404s
    const prodRes = http.get(`${baseUrl}/products?limit=10`, {
        headers: { 'x-load-test': 'true' }
    });
    if (prodRes.status === 200) {
        try {
            const body = prodRes.json();
            if (body.products && body.products.length > 0) {
                productId = body.products[Math.floor(Math.random() * body.products.length)]._id;
            }
        } catch (e) { }
    }

    const payload = JSON.stringify({
        price: Math.floor(Math.random() * 500) + 10,
        stock: Math.floor(Math.random() * 100),
    });

    const params = {
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
            'x-load-test': 'true'
        },
    };

    // Simulate heavy update operation (Internal Management)
    const updateRes = http.put(`${baseUrl}/products/${productId}`, payload, params);

    check(updateRes, {
        'PUT /products duration < 1s': (r) => r.timings.duration < 1000,
    });

    // Simulate fetching complex reports
    const reportRes = http.get(`${baseUrl}/orders?limit=100&sortBy=totalAmount`, params);

    check(reportRes, {
        'GET /orders (reports) duration < 1s': (r) => r.timings.duration < 1000,
    });

    sleep(1);
}
