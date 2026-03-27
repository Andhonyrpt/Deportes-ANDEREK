import request from 'supertest';
import { describe, it, expect } from 'vitest';
import { app } from '../../server.js';
import jwt from 'jsonwebtoken';

describe('Authentication Security Tests (Cookie Based)', () => {

    it('should REJECT a JWT with "alg: none" in cookie', async () => {
        const payload = { userId: '654321654321654321654321', role: 'customer' };
        const header = Buffer.from(JSON.stringify({ alg: 'none', typ: 'JWT' })).toString('base64url');
        const body = Buffer.from(JSON.stringify(payload)).toString('base64url');
        const token = `${header}.${body}.`;

        const response = await request(app)
            .get('/api/users/profile')
            .set('Cookie', [`authToken=${token}`]);

        expect(response.status).toBe(403);
    });

    it('should REJECT an expired token in cookie', async () => {
        const expiredToken = jwt.sign(
            { userId: '654321654321654321654321', role: 'customer' },
            process.env.JWT_SECRET || 'secret',
            { expiresIn: '-1s' }
        );

        const response = await request(app)
            .get('/api/users/profile')
            .set('Cookie', [`authToken=${expiredToken}`]);

        expect(response.status).toBe(403);
    });

    it('should REJECT a token signed with a different secret', async () => {
        const fakeToken = jwt.sign(
            { userId: '654321654321654321654321', role: 'customer' },
            'WRONG_SECRET_123456789'
        );

        const response = await request(app)
            .get('/api/users/profile')
            .set('Cookie', [`authToken=${fakeToken}`]);

        expect(response.status).toBe(403);
    });
});
