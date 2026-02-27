import request from 'supertest';
import { describe, it, expect, beforeAll, beforeEach, afterAll } from 'vitest';
import mongoose from 'mongoose';
import { app } from '../../server.js';
import User from '../../src/models/user.js';
import jwt from 'jsonwebtoken';

describe('Auth Integration Tests', () => {

    beforeEach(async () => {
        // Clean up users before each test
        await User.deleteMany({});
    });

    describe('POST /api/auth/register', () => {
        it('should register a new user successfully', async () => {
            const userData = {
                displayName: 'Integration Test User',
                email: 'integration@example.com',
                password: 'Password123', // Must contain numbers and letters according to validators
                phone: '1234567890'
            };

            const response = await request(app)
                .post('/api/auth/register')
                .send(userData);

            expect(response.status).toBe(201);
            expect(response.body).toHaveProperty('email', userData.email);
            expect(response.body).toHaveProperty('displayName', userData.displayName);
            expect(response.body).not.toHaveProperty('hashPassword');

            // Verify in DB
            const user = await User.findOne({ email: userData.email });
            expect(user).toBeTruthy();
            expect(user.role).toBe('guest'); // Default role in controller
        });

        it('should return 400 if user already exists', async () => {
            const userData = {
                displayName: 'Integration Test User',
                email: 'duplicate@example.com',
                password: 'Password123',
                phone: '1234567890'
            };

            // Register once
            await request(app).post('/api/auth/register').send(userData);

            // Try to register again
            const response = await request(app)
                .post('/api/auth/register')
                .send(userData);

            expect(response.status).toBe(400);
            expect(response.body).toHaveProperty('message', 'User already exist');
        });

        it('should return 422 for invalid email format', async () => {
            const response = await request(app)
                .post('/api/auth/register')
                .send({
                    displayName: 'Test',
                    email: 'invalid-email',
                    password: 'Password123',
                    phone: '1234567890'
                });

            expect(response.status).toBe(422);
            expect(response.body).toHaveProperty('errors');
        });

        it('should return 422 for password without numbers', async () => {
            const response = await request(app)
                .post('/api/auth/register')
                .send({
                    displayName: 'Test User',
                    email: 'test@example.com',
                    password: 'NoNumbersHere',
                    phone: '1234567890'
                });

            expect(response.status).toBe(422);
            expect(response.body).toHaveProperty('errors');
        });

        it('should return 422 for invalid phone number (not 10 digits)', async () => {
            const response = await request(app)
                .post('/api/auth/register')
                .send({
                    displayName: 'Test User',
                    email: 'test@example.com',
                    password: 'Password123',
                    phone: '123' // too short
                });

            expect(response.status).toBe(422);
            expect(response.body).toHaveProperty('errors');
        });
    });

    describe('POST /api/auth/login', () => {
        beforeEach(async () => {
            // Seed a user for login tests
            const userData = {
                displayName: 'Login User',
                email: 'login@example.com',
                password: 'Password123',
                phone: '1234567890'
            };
            await request(app).post('/api/auth/register').send(userData);
        });

        it('should login successfully with valid credentials', async () => {
            const response = await request(app)
                .post('/api/auth/login')
                .send({
                    email: 'login@example.com',
                    password: 'Password123'
                });

            expect(response.status).toBe(200);
            expect(response.body).toHaveProperty('token');
            expect(response.body).toHaveProperty('refreshToken');
        });

        it('should return 400 for incorrect password', async () => {
            const response = await request(app)
                .post('/api/auth/login')
                .send({
                    email: 'login@example.com',
                    password: 'WrongPassword123'
                });

            expect(response.status).toBe(400);
            expect(response.body).toHaveProperty('message', 'Invalid credentials');
        });

        it('should return 400 for non-existent user', async () => {
            const response = await request(app)
                .post('/api/auth/login')
                .send({
                    email: 'nonexistent@example.com',
                    password: 'Password123'
                });

            expect(response.status).toBe(400);
            expect(response.body).toHaveProperty('message', "User doesn't exist. You have to sign in");
        });

        it('should return 422 for empty body', async () => {
            const response = await request(app)
                .post('/api/auth/login')
                .send({});

            expect(response.status).toBe(422);
            expect(response.body).toHaveProperty('errors');
        });
    });

    describe('GET /api/auth/check-email', () => {
        it('should return taken: true for a registered email', async () => {
            // Create a user first
            await request(app).post('/api/auth/register').send({
                displayName: 'Check Email User',
                email: 'check@example.com',
                password: 'Password123',
                phone: '1234567890'
            });

            const response = await request(app)
                .get('/api/auth/check-email')
                .query({ email: 'check@example.com' });

            expect(response.status).toBe(200);
            expect(response.body).toHaveProperty('taken', true);
        });

        it('should return taken: false for an unregistered email', async () => {
            const response = await request(app)
                .get('/api/auth/check-email')
                .query({ email: 'free@example.com' });

            expect(response.status).toBe(200);
            expect(response.body).toHaveProperty('taken', false);
        });

        it('should return 422 for missing email query param', async () => {
            const response = await request(app)
                .get('/api/auth/check-email');

            expect(response.status).toBe(422);
        });
    });

    describe('POST /api/auth/refresh', () => {
        let validRefreshToken;

        beforeEach(async () => {
            // Register and login to get a valid refresh token
            await request(app).post('/api/auth/register').send({
                displayName: 'Refresh User',
                email: 'refresh@example.com',
                password: 'Password123',
                phone: '1234567890'
            });

            const loginRes = await request(app).post('/api/auth/login').send({
                email: 'refresh@example.com',
                password: 'Password123'
            });

            validRefreshToken = loginRes.body.refreshToken;
        });

        it('should return a new access token with a valid refresh token', async () => {
            const response = await request(app)
                .post('/api/auth/refresh')
                .send({ refreshToken: validRefreshToken });

            expect(response.status).toBe(200);
            expect(response.body).toHaveProperty('token');
            expect(response.body).toHaveProperty('refreshToken', validRefreshToken); // same refresh
            expect(typeof response.body.token).toBe('string');
        });

        it('should return 401 if no refresh token is provided', async () => {
            const response = await request(app)
                .post('/api/auth/refresh')
                .send({});

            expect(response.status).toBe(401);
            expect(response.body).toHaveProperty('message', 'No refresh token provider');
        });

        it('should return 403 for a malformed (invalid) refresh token', async () => {
            const response = await request(app)
                .post('/api/auth/refresh')
                .send({ refreshToken: 'this.is.not.valid' });

            expect(response.status).toBe(403);
            expect(response.body).toHaveProperty('message', 'Invalid refresh token');
        });

        it('should return 403 for an expired refresh token', async () => {
            // Sign a token that is already expired
            const expiredToken = jwt.sign(
                { userId: '507f1f77bcf86cd799439011', displayName: 'User', role: 'customer' },
                process.env.REFRESH_TOKEN_SECRET,
                { expiresIn: '-1s' } // expired 1 second ago
            );

            const response = await request(app)
                .post('/api/auth/refresh')
                .send({ refreshToken: expiredToken });

            expect(response.status).toBe(403);
            expect(response.body).toHaveProperty('message', 'Invalid refresh token');
        });
    });
});
