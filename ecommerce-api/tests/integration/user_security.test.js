import request from 'supertest';
import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { app } from '../../server.js';
import User from '../../src/models/user.js';
import jwt from 'jsonwebtoken';

describe('User Security & Hardening', () => {
    let user1;
    let token1;

    beforeAll(async () => {
        await User.deleteMany({});
        user1 = await User.create({
            displayName: 'Normal User',
            email: 'user@example.com',
            hashPassword: 'password123',
            role: 'customer',
            isActive: true,
            phone: '1234567890'
        });
        token1 = jwt.sign({ userId: user1._id, role: user1.role }, process.env.JWT_SECRET);
    });

    afterAll(async () => {
        await User.deleteMany({});
    });

    it('should NOT allow a user to escalate their role via profile update', async () => {
        const response = await request(app)
            .put('/api/users/profile')
            .set('Authorization', `Bearer ${token1}`)
            .send({
                role: 'admin'
            });

        // The field should just be ignored or disallowed
        const updatedUser = await User.findById(user1._id);
        expect(updatedUser.role).toBe('customer');
    });

    it('should NOT allow a user to change isActive status via profile update', async () => {
        const response = await request(app)
            .put('/api/users/profile')
            .set('Authorization', `Bearer ${token1}`)
            .send({
                isActive: false
            });

        const updatedUser = await User.findById(user1._id);
        expect(updatedUser.isActive).toBe(true);
    });
});
