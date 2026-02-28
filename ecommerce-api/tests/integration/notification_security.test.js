import request from 'supertest';
import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { app } from '../../server.js';
import User from '../../src/models/user.js';
import Notification from '../../src/models/notification.js';
import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';

describe('Notification Security (IDOR)', () => {
    let user1, user2, admin;
    let token1, token2, adminToken;
    let notificationUser1;

    beforeAll(async () => {
        // Clear collections
        await User.deleteMany({});
        await Notification.deleteMany({});

        // Create users
        user1 = await User.create({
            displayName: 'User 1',
            email: 'user1@example.com',
            hashPassword: 'hashedpassword',
            role: 'customer',
            phone: '1234567890'
        });
        user2 = await User.create({
            displayName: 'User 2',
            email: 'user2@example.com',
            hashPassword: 'hashedpassword',
            role: 'customer',
            phone: '0987654321'
        });
        admin = await User.create({
            displayName: 'Admin User',
            email: 'admin@example.com',
            hashPassword: 'hashedpassword',
            role: 'admin',
            phone: '1122334455'
        });

        token1 = jwt.sign({ userId: user1._id, role: user1.role }, process.env.JWT_SECRET);
        token2 = jwt.sign({ userId: user2._id, role: user2.role }, process.env.JWT_SECRET);
        adminToken = jwt.sign({ userId: admin._id, role: admin.role }, process.env.JWT_SECRET);

        // Create a notification for user 1
        notificationUser1 = await Notification.create({
            user: user1._id,
            message: 'Secret notification for user 1',
            isRead: false
        });
    });

    afterAll(async () => {
        await User.deleteMany({});
        await Notification.deleteMany({});
    });

    it('should NOT allow user 2 to view user 1 notification by ID', async () => {
        const response = await request(app)
            .get(`/api/notifications/${notificationUser1._id}`)
            .set('Authorization', `Bearer ${token2}`);

        expect(response.status).toBe(403);
        expect(response.body.message).toContain('Forbidden');
    });

    it('should NOT allow user 2 to list notifications for user 1', async () => {
        const response = await request(app)
            .get(`/api/notifications/user/${user1._id}`)
            .set('Authorization', `Bearer ${token2}`);

        expect(response.status).toBe(403);
    });

    it('should NOT allow user 2 to mark as read user 1 notification', async () => {
        const response = await request(app)
            .patch(`/api/notifications/${notificationUser1._id}/mark-read`)
            .set('Authorization', `Bearer ${token2}`);

        expect(response.status).toBe(403);
    });

    it('should NOT allow user 2 to delete user 1 notification', async () => {
        const response = await request(app)
            .delete(`/api/notifications/${notificationUser1._id}`)
            .set('Authorization', `Bearer ${token2}`);

        expect(response.status).toBe(403);
    });

    it('should ALLOW user 1 to view their own notification', async () => {
        const response = await request(app)
            .get(`/api/notifications/${notificationUser1._id}`)
            .set('Authorization', `Bearer ${token1}`);

        expect(response.status).toBe(200);
        expect(response.body.message).toBe(notificationUser1.message);
    });

    it('should ALLOW admin to view any notification', async () => {
        const response = await request(app)
            .get(`/api/notifications/${notificationUser1._id}`)
            .set('Authorization', `Bearer ${adminToken}`);

        expect(response.status).toBe(200);
    });
});
