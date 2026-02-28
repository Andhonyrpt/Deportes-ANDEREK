import request from 'supertest';
import { describe, it, expect } from 'vitest';
import { app } from '../../server.js';
import jwt from 'jsonwebtoken';

describe('Authentication Security Tests', () => {

    it('should REJECT a JWT with "alg: none" (Algorithm Confusion)', async () => {
        const payload = { userId: '654321654321654321654321', role: 'customer' };

        // Constructing an "alg: none" token manually
        const header = Buffer.from(JSON.stringify({ alg: 'none', typ: 'JWT' })).toString('base64url');
        const body = Buffer.from(JSON.stringify(payload)).toString('base64url');
        const token = `${header}.${body}.`; // The trailing dot is for the empty signature

        const response = await request(app)
            .get('/api/users/profile')
            .set('Authorization', `Bearer ${token}`);

        // The authMiddleware returns 403 Forbidden if jwt.verify fails
        expect(response.status).toBe(403);
    });

    it('should REJECT an expired token', async () => {
        const expiredToken = jwt.sign(
            { userId: '654321654321654321654321', role: 'customer' },
            process.env.JWT_SECRET || 'secret',
            { expiresIn: '-1s' }
        );

        const response = await request(app)
            .get('/api/users/profile')
            .set('Authorization', `Bearer ${expiredToken}`);

        expect(response.status).toBe(403);
    });

    it('should REJECT a token signed with a different secret', async () => {
        const fakeToken = jwt.sign(
            { userId: '654321654321654321654321', role: 'customer' },
            'WRONG_SECRET_123456789'
        );

        const response = await request(app)
            .get('/api/users/profile')
            .set('Authorization', `Bearer ${fakeToken}`);

        expect(response.status).toBe(403);
    });
});
