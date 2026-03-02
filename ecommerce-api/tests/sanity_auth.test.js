import { describe, it, expect } from 'vitest';
import request from 'supertest';
import { app } from '../src/../server.js';

describe('Auth Status Sanity Check', () => {
    it('should return 401 when NO token provided', async () => {
        const res = await request(app).get('/api/cart/user/someid');
        expect(res.status).toBe(401);
    });

    it('should return 403 when INVALID token provided', async () => {
        const res = await request(app)
            .get('/api/cart/user/someid')
            .set('Authorization', 'Bearer invalid.token.here');
        expect(res.status).toBe(403);
    });
});
