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

        it('should return 400 when updating to an email already in use', async () => {
            // Create another user with a known email
            await request(app).post('/api/auth/register').send({
                displayName: 'Other User',
                email: 'other@test.com',
                password: 'Password123',
                phone: '1234567890'
            });

            const response = await request(app)
                .put('/api/users/profile')
                .set('Authorization', `Bearer ${customerToken}`)
                .send({ email: 'other@test.com' });

            expect(response.status).toBe(400);
            expect(response.body).toHaveProperty('message', 'Email already in use');
        });

        it('should return 400 when no fields are provided', async () => {
            const response = await request(app)
                .put('/api/users/profile')
                .set('Authorization', `Bearer ${customerToken}`)
                .send({});

            // The validator or controller should reject empty updates
            // Note: validators will fire 422 if schema-validated, or controller returns 400
            expect([400, 422]).toContain(response.status);
        });
    });

    describe('PUT /api/change-password/:userId', () => {
        it('should change password with correct current password', async () => {
            const response = await request(app)
                .put(`/api/change-password/${customerUser._id}`)
                .set('Authorization', `Bearer ${customerToken}`)
                .send({
                    currentPassword: 'Password123',
                    newPassword: 'NewPassword456',
                    confirmPassword: 'NewPassword456'
                });

            expect(response.status).toBe(200);
            expect(response.body).toHaveProperty('message', 'Password changed successfully');
        });

        it('should return 400 when current password is incorrect', async () => {
            const response = await request(app)
                .put(`/api/change-password/${customerUser._id}`)
                .set('Authorization', `Bearer ${customerToken}`)
                .send({
                    currentPassword: 'WrongPassword123',
                    newPassword: 'NewPassword456',
                    confirmPassword: 'NewPassword456'
                });

            expect(response.status).toBe(400);
            expect(response.body).toHaveProperty('message', 'Current password is incorrect');
        });
    });

    describe('PATCH /api/deactivate', () => {
        it('should deactivate own account', async () => {
            const response = await request(app)
                .patch('/api/deactivate')
                .set('Authorization', `Bearer ${customerToken}`);

            expect(response.status).toBe(200);
            expect(response.body).toHaveProperty('message', 'Account deactivated successfully');

            const updatedUser = await User.findById(customerUser._id);
            expect(updatedUser.isActive).toBe(false);
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

        it('should deny customer access to list all users (RBAC)', async () => {
            const response = await request(app)
                .get('/api/users')
                .set('Authorization', `Bearer ${customerToken}`);

            expect(response.status).toBe(403);
        });

        it('should allow admin to delete a user (soft delete)', async () => {
            const response = await request(app)
                .delete(`/api/users/${customerUser._id}`)
                .set('Authorization', `Bearer ${adminToken}`);

            expect(response.status).toBe(200); // Controller uses 200 for soft delete
            expect(response.body).toHaveProperty('message', 'User deleted successfully');

            const updatedUser = await User.findById(customerUser._id);
            expect(updatedUser.isActive).toBe(false);
        });

        it('should deny customer from deleting users (RBAC)', async () => {
            const response = await request(app)
                .delete(`/api/users/${customerUser._id}`)
                .set('Authorization', `Bearer ${customerToken}`);

            expect(response.status).toBe(403);
        });
    });
});
