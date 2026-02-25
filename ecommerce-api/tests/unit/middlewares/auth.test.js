import { describe, it, expect, vi, beforeEach } from 'vitest';
import jwt from 'jsonwebtoken';
import authMiddleware from '../../../src/middlewares/authMiddleware.js';
import { createMockReqRes } from '../../helpers/createMockReqRes.js';

vi.mock('jsonwebtoken', () => ({
    default: {
        verify: vi.fn(),
    },
}));

describe('Auth Middleware Unit Tests', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        process.env.JWT_SECRET = 'test_secret';
    });

    it('should return 401 if no authorization header is present', () => {
        const { req, res, next } = createMockReqRes();
        req.headers = {}; // No header

        authMiddleware(req, res, next);

        expect(res.status).toHaveBeenCalledWith(401);
        expect(res.json).toHaveBeenCalledWith({ message: 'Unauthorized' });
        expect(next).not.toHaveBeenCalled();
    });

    it('should return 403 if token is invalid or expired', () => {
        const { req, res, next } = createMockReqRes();
        req.headers = { authorization: 'Bearer invalid_token' };

        // Mock jwt.verify to call callback with error
        jwt.verify.mockImplementation((token, secret, callback) => {
            callback(new Error('Invalid token'), null);
        });

        authMiddleware(req, res, next);

        expect(res.status).toHaveBeenCalledWith(403);
        expect(res.json).toHaveBeenCalledWith({ message: 'Forbidden' });
        expect(next).not.toHaveBeenCalled();
    });

    it('should call next and set req.user if token is valid (customer)', () => {
        const { req, res, next } = createMockReqRes();
        req.headers = { authorization: 'Bearer valid_token' };
        const decoded = { userId: '123', email: 'test@test.com', role: 'customer' };

        jwt.verify.mockImplementation((token, secret, callback) => {
            callback(null, decoded);
        });

        authMiddleware(req, res, next);

        expect(req.user).toEqual(decoded);
        expect(req.userIsAdmin).toBeUndefined();
        expect(next).toHaveBeenCalled();
    });

    it('should set req.userIsAdmin true if token is valid (admin)', () => {
        const { req, res, next } = createMockReqRes();
        req.headers = { authorization: 'Bearer admin_token' };
        const decoded = { userId: '456', email: 'admin@test.com', role: 'admin' };

        jwt.verify.mockImplementation((token, secret, callback) => {
            callback(null, decoded);
        });

        authMiddleware(req, res, next);

        expect(req.user).toEqual(decoded);
        expect(req.userIsAdmin).toBe(true);
        expect(next).toHaveBeenCalled();
    });
});
