import request from 'supertest';
import { describe, it, expect, beforeEach } from 'vitest';
import { app } from '../../server.js';
import User from '../../src/models/user.js';
import { getAuthToken } from '../helpers/auth.js';

describe('User Integration Tests', () => {
    let adminToken;
    let customerToken;
    let customerUser;

    beforeEach(async () => {
        await User.deleteMany({});

        adminToken = await getAuthToken('admin');

        // Create a specific customer for these tests
        const customerEmail = 'customer@test.com';
        customerToken = await getAuthToken('customer');
        customerUser = await User.findOne({ email: customerEmail });
    });

    describe('GET /api/users/profile', () => {
        it('should return the logged-in user profile', async () => {
            const response = await request(app)
                .get('/api/users/profile')
                .set('Authorization', `Bearer ${customerToken}`);

            expect(response.status).toBe(200);
            expect(response.body.user).toHaveProperty('email', customerUser.email);
            expect(response.body.user).toHaveProperty('displayName', customerUser.displayName);
        });

        it('should return 401 if not authenticated', async () => {
            const response = await request(app).get('/api/users/profile');
            expect(response.status).toBe(401);
        });
    });

    describe('PUT /api/users/profile', () => {
        it('should update profile successfully', async () => {
            const updateData = {
                displayName: 'Updated Name',
                phone: '0987654321'
            };

            const response = await request(app)
                .put('/api/users/profile')
                .set('Authorization', `Bearer ${customerToken}`)
                .send(updateData);

            expect(response.status).toBe(200);
            expect(response.body.user).toHaveProperty('displayName', 'Updated Name');
            expect(response.body.user).toHaveProperty('phone', '0987654321');
        });
    });

    describe('Admin Operations', () => {
        it('should allow admin to list all users', async () => {
            const response = await request(app)
                .get('/api/users')
                .set('Authorization', `Bearer ${adminToken}`);

            expect(response.status).toBe(200);
            expect(response.body).toHaveProperty('users');
            expect(response.body.users.length).toBeGreaterThanOrEqual(2); // Admin and Customer
        });

        it('should allow admin to delete a user', async () => {
            const response = await request(app)
                .delete(`/api/users/${customerUser._id}`)
                .set('Authorization', `Bearer ${adminToken}`);

            expect(response.status).toBe(200); // Controller uses 200 for soft delete
            expect(response.body).toHaveProperty('message', 'User deleted successfully');

            const updatedUser = await User.findById(customerUser._id);
            expect(updatedUser.isActive).toBe(false);
        });
    });
});
