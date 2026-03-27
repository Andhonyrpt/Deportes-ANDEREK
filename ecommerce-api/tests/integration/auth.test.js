import request from 'supertest';
import { describe, it, expect, beforeEach } from 'vitest';
import { app } from '../../server.js';
import User from '../../src/models/user.js';
import jwt from 'jsonwebtoken';

describe('Auth Integration Tests (Cookie Based)', () => {

    beforeEach(async () => {
        // Clean up users before each test
        await User.deleteMany({});
    });

    describe('POST /api/auth/register', () => {
        it('should register a new user successfully', async () => {
            const userData = {
                displayName: 'Integration Test User',
                email: 'integration@example.com',
                password: 'Password123',
                phone: '1234567890'
            };

            const response = await request(app)
                .post('/api/auth/register')
                .send(userData);

            expect(response.status).toBe(201);
            expect(response.body).toHaveProperty('email', userData.email);
            
            const user = await User.findOne({ email: userData.email });
            expect(user).toBeTruthy();
        });
    });

    describe('POST /api/auth/login', () => {
        beforeEach(async () => {
            await request(app).post('/api/auth/register').send({
                displayName: 'Login User',
                email: 'login@example.com',
                password: 'Password123',
                phone: '1234567890'
            });
        });

        it('should login successfully and set HttpOnly cookies', async () => {
            const response = await request(app)
                .post('/api/auth/login')
                .send({
                    email: 'login@example.com',
                    password: 'Password123'
                });

            expect(response.status).toBe(200);
            
            // Verificación de cookies
            const cookies = response.headers['set-cookie'];
            expect(cookies).toBeDefined();
            expect(cookies.some(c => c.includes('authToken'))).toBe(true);
            expect(cookies.some(c => c.includes('refreshToken'))).toBe(true);
            expect(cookies.some(c => c.includes('HttpOnly'))).toBe(true);

            expect(response.body).toHaveProperty('user');
            expect(response.body.user).toHaveProperty('displayName', 'Login User');
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
    });

    describe('POST /api/auth/refresh', () => {
        let validRefreshToken;

        beforeEach(async () => {
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

            // Extraer cookie de refresh
            const cookies = loginRes.headers['set-cookie'];
            validRefreshToken = cookies.find(c => c.startsWith('refreshToken=')).split(';')[0];
        });

        it('should refresh tokens using cookie', async () => {
            const response = await request(app)
                .post('/api/auth/refresh')
                .set('Cookie', [validRefreshToken]);

            expect(response.status).toBe(200);
            const cookies = response.headers['set-cookie'];
            expect(cookies.some(c => c.includes('authToken'))).toBe(true);
        });
    });

    describe('POST /api/auth/logout', () => {
        it('should clear cookies on logout', async () => {
            const response = await request(app).post('/api/auth/logout');
            expect(response.status).toBe(200);
            
            const cookies = response.headers['set-cookie'];
            expect(cookies.some(c => c.includes('authToken=;'))).toBe(true);
            expect(cookies.some(c => c.includes('refreshToken=;'))).toBe(true);
        });
    });
});
