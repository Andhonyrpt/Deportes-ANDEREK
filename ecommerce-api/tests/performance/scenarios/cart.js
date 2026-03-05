import http from 'k6/http';
import { check, sleep } from 'k6';

export function addToCart(baseUrl, token) {
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
        productId: productId,
        quantity: Math.floor(Math.random() * 3) + 1 // Add 1 to 3 items
    });

    const params = {
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
            'x-load-test': 'true' // Bypass rate limiters
        },
    };

    const res = http.post(`${baseUrl}/cart`, payload, params);

    // Depending on API logic, might return 200, 201 or 400 (if fake ID doesn't exist). 
    // Testing the application load boundary regardless of business validation.
    check(res, {
        'POST /cart duration < 1s': (r) => r.timings.duration < 1000,
    });

    sleep(Math.random() * 2 + 1); // Think time before next action
}
