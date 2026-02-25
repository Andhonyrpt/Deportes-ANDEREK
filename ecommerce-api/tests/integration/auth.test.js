import request from 'supertest';
import { describe, it, expect, beforeAll, beforeEach, afterAll } from 'vitest';
import mongoose from 'mongoose';
import { app } from '../../server.js';
import User from '../../src/models/user.js';

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
    });
});
