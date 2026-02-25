import { describe, it, expect, vi, beforeEach } from 'vitest';
import { register, login } from '../../src/controllers/authController.js';
import User from '../../src/models/user.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { createMockReqRes } from '../helpers/createMockReqRes.js';

// Mock dependencies
vi.mock('../../src/models/user.js');
vi.mock('bcrypt');
vi.mock('jsonwebtoken');

describe('authController Unit Tests', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe('register', () => {
        it('should register a new user and return 201', async () => {
            const userData = {
                displayName: 'Test User',
                email: 'test@example.com',
                password: 'password123',
                phone: '1234567890'
            };

            const { req, res, next } = createMockReqRes({ body: userData });

            // Mock checkUserExist (which uses User.findOne)
            User.findOne.mockResolvedValue(null);

            // Mock bcrypt.hash
            bcrypt.hash.mockResolvedValue('hashedPassword');

            // Mock User instance and save
            // When using vi.mock(), the default export is a mock function that can be used as a constructor.
            // We can mock the save method on the prototype or on the instance returned by the constructor.
            const saveMock = vi.fn().mockResolvedValue(true);
            User.prototype.save = saveMock;

            await register(req, res, next);

            // Check if next was called with an error (useful for debugging)
            if (next.mock.calls.length > 0) {
                console.error('Next was called with error:', next.mock.calls[0][0]);
            }

            expect(User.findOne).toHaveBeenCalledWith({ email: userData.email });
            expect(bcrypt.hash).toHaveBeenCalledWith(userData.password, 10);
            expect(res.status).toHaveBeenCalledWith(201);
            expect(res.json).toHaveBeenCalledWith({
                displayName: userData.displayName,
                email: userData.email,
                phone: userData.phone
            });
        });

        it('should return 400 if user already exists', async () => {
            const userData = { email: 'test@example.com' };
            const { req, res, next } = createMockReqRes({ body: userData });

            User.findOne.mockResolvedValue({ email: userData.email });

            await register(req, res, next);

            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({ message: 'User already exist' });
        });
    });

    describe('login', () => {
        it('should login successfully and return tokens', async () => {
            const credentials = { email: 'test@example.com', password: 'password123' };
            const mockUser = {
                _id: 'mockId',
                email: credentials.email,
                hashPassword: 'hashedPassword',
                displayName: 'Test User',
                role: 'customer'
            };

            const { req, res, next } = createMockReqRes({ body: credentials });

            User.findOne.mockResolvedValue(mockUser);
            bcrypt.compare.mockResolvedValue(true);
            jwt.sign.mockReturnValue('mockToken');

            await login(req, res, next);

            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith({
                token: 'mockToken',
                refreshToken: 'mockToken'
            });
        });

        it('should return 400 for invalid credentials', async () => {
            const credentials = { email: 'test@example.com', password: 'wrongpassword' };
            const mockUser = { email: credentials.email, hashPassword: 'hashedPassword' };

            const { req, res, next } = createMockReqRes({ body: credentials });

            User.findOne.mockResolvedValue(mockUser);
            bcrypt.compare.mockResolvedValue(false);

            await login(req, res, next);

            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({ message: 'Invalid credentials' });
        });
    });
});
