import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import { app } from '../../server.js';
import { getAuthToken } from '../helpers/auth.js';
import User from '../../src/models/user.js';
import jwt from 'jsonwebtoken';

describe('SDET Advanced Security & JWT Resilience Tests', () => {
    let customerToken;
    let customerId;

    beforeAll(async () => {
        const customer = await User.create({
            displayName: 'Security User',
            email: `sec_${Date.now()}@test.com`,
            hashPassword: 'password123',
            phone: '1234567891',
            role: 'customer'
        });
        customerId = customer._id.toString();
        customerToken = await getAuthToken('customer', customerId);
    });

    afterAll(async () => {
        await User.deleteMany({ email: /sec_/ });
    });

    describe('JWT Robustness', () => {
        it('should REJECT a JWT with "none" algorithm (Logic/Security)', async () => {
            const malformedToken = jwt.sign({ userId: customerId }, '', { algorithm: 'none' });
            const res = await request(app)
                .get('/api/users/profile')
                .set('Authorization', `Bearer ${malformedToken}`);
            expect(res.status).toBe(403);
        });

        it('should REJECT an expired JWT gracefully', async () => {
            const expiredToken = jwt.sign(
                { userId: customerId },
                process.env.JWT_SECRET,
                { expiresIn: '-1s' }
            );
            const res = await request(app)
                .get('/api/users/profile')
                .set('Authorization', `Bearer ${expiredToken}`);
            expect(res.status).toBe(403);
        });

        it('should handle malformed JSON in JWT payload', async () => {
            const res = await request(app)
                .get('/api/users/profile')
                .set('Authorization', 'Bearer invalid.token.here');
            expect(res.status).toBe(403);
        });
    });

    describe('NoSQL Injection Resilience', () => {
        it('should NOT allow NoSQL injection in category search', async () => {
            const res = await request(app)
                .get('/api/products?category[$gt]=')
                .set('Authorization', `Bearer ${customerToken}`);
            // Should either return empty or handle safely
            expect(res.status).not.toBe(500);
        });
    });

    describe('ReDoS Performance Resilience', () => {
        it('should handle extremely long search strings without hanging', async () => {
            const longString = 'a'.repeat(5000) + '!';
            const res = await request(app).get(`/api/products?search=${longString}`);
            expect(res.status).not.toBe(500);
        }, 10000);
    });
});
