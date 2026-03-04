import http from 'k6/http';
import { check, sleep } from 'k6';
import { generateRandomUser } from '../utils/helpers.js';

export function registerAndLogin(baseUrl) {
    const user = generateRandomUser();
    const headers = {
        'Content-Type': 'application/json',
        'x-load-test': 'true'
    };

    // 1. Register
    const registerRes = http.post(
        `${baseUrl}/auth/register`,
        JSON.stringify(user),
        { headers }
    );

    check(registerRes, {
        'POST /auth/register status 200/201': (r) => r.status === 200 || r.status === 201,
        'POST /auth/register duration < 1s': (r) => r.timings.duration < 1000,
    });

    sleep(1);

    // 2. Login
    const loginRes = http.post(
        `${baseUrl}/auth/login`,
        JSON.stringify({ email: user.email, password: user.password }),
        { headers }
    );

    const isLoginSuccessful = check(loginRes, {
        'POST /auth/login status 200': (r) => r.status === 200,
        'POST /auth/login duration < 1s': (r) => r.timings.duration < 1000,
    });

    sleep(1);

    if (isLoginSuccessful) {
        try {
            const body = loginRes.json();
            // Depending on the API's standard response format
            return body.token || (body.data && body.data.token);
        } catch (e) {
            return null;
        }
    }

    return null;
}
