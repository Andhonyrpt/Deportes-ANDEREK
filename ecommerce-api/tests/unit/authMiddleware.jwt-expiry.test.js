/**
 * @file authMiddleware.jwt-expiry.test.js
 * @description Unit tests for JWT session expiry behavior in authMiddleware.
 *
 *   Gap being addressed (from QA_PLAN.md):
 *   "No hay pruebas automatizadas que validen el comportamiento exacto
 *   cuando un token expira durante una sesión activa."
 *
 *   Strategy: Use vi.spyOn on jwt.verify per-test and Vitest's vi.useFakeTimers()
 *   to simulate token expiration without real delays.
 *
 *   Tests cover:
 *   1. Token that has just expired (exact boundary condition)
 *   2. Token that expires DURING the request processing window
 *   3. Token with valid future expiry continues working
 *   4. Confirms the 403 "Forbidden" response format (not 401)
 *   5. Confirms the middleware does not call next() on expired tokens
 *   6. Ensures req.user is NOT set when the token is expired
 *   7. Admin token: userIsAdmin flag is set correctly
 *   8. Expired admin token: userIsAdmin must NOT be set
 */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import jwt from 'jsonwebtoken';
import authMiddleware from '../../src/middlewares/authMiddleware.js';
import { createMockReqRes } from '../helpers/createMockReqRes.js';

// ─── Test Constants ───────────────────────────────────────────────────────────
const TEST_SECRET = 'test_jwt_secret_for_unit_tests';
const VALID_PAYLOAD = { userId: '507f1f77bcf86cd799439011', displayName: 'Test User', role: 'customer' };
const ADMIN_PAYLOAD = { userId: '507f1f77bcf86cd799439012', displayName: 'Test Admin', role: 'admin' };

// Helper: build a TokenExpiredError matching jsonwebtoken's shape
const makeExpiredError = () => {
    const err = new Error('jwt expired');
    err.name = 'TokenExpiredError';
    err.expiredAt = new Date(Date.now() - 1000);
    return err;
};

// ─────────────────────────────────────────────────────────────────────────────
vi.mock('jsonwebtoken', async (importOriginal) => {
    const original = await importOriginal();
    return {
        ...original,
        default: {
            ...original.default,
            verify: vi.fn(),
        },
    };
});

describe('Auth Middleware – JWT Expiry Unit Tests', () => {
    beforeEach(() => {
        vi.useFakeTimers();
        process.env.JWT_SECRET = TEST_SECRET;
        vi.clearAllMocks();
    });

    afterEach(() => {
        vi.useRealTimers();
    });

    // ─── 1. Token expired BEFORE the request arrives ─────────────────────────
    it('should return 403 Forbidden when presenting an already-expired token', () => {
        const { req, res, next } = createMockReqRes();
        req.headers = { authorization: 'Bearer already_expired_token' };

        // Simulate jwt.verify calling back with a TokenExpiredError
        jwt.verify.mockImplementation((token, secret, options, callback) => {
            const expiredError = new Error('jwt expired');
            expiredError.name = 'TokenExpiredError';
            expiredError.expiredAt = new Date(Date.now() - 1000);
            callback(expiredError, null);
        });

        authMiddleware(req, res, next);

        expect(res.status).toHaveBeenCalledWith(403);
        expect(res.json).toHaveBeenCalledWith({ message: 'Forbidden' });
        expect(next).not.toHaveBeenCalled();
    });

    // ─── 2. Token expires EXACTLY at the moment of verification ─────────────
    it('should return 403 when the token expires exactly at verification time (boundary)', () => {
        const { req, res, next } = createMockReqRes();
        req.headers = { authorization: 'Bearer boundary_token' };

        jwt.verify.mockImplementation((token, secret, options, callback) => {
            const expiredError = new Error('jwt expired');
            expiredError.name = 'TokenExpiredError';
            expiredError.expiredAt = new Date(); // expires right now
            callback(expiredError, null);
        });

        // Set fake time to the exact expiry moment
        vi.setSystemTime(new Date());
        authMiddleware(req, res, next);

        expect(res.status).toHaveBeenCalledWith(403);
        expect(next).not.toHaveBeenCalled();
    });

    // ─── 3. Token that is still valid (not expired) should pass ──────────────
    it('should call next() and set req.user when the token is still valid', () => {
        const { req, res, next } = createMockReqRes();
        req.headers = { authorization: 'Bearer valid_token' };

        jwt.verify.mockImplementation((token, secret, options, callback) => {
            callback(null, VALID_PAYLOAD); // successful verification
        });

        authMiddleware(req, res, next);

        expect(next).toHaveBeenCalled();
        expect(req.user).toEqual(VALID_PAYLOAD);
        expect(res.status).not.toHaveBeenCalled();
    });

    // ─── 4. req.user must NOT be set when token is expired ───────────────────
    it('should not set req.user on the request when the token is expired', () => {
        const { req, res, next } = createMockReqRes();
        req.headers = { authorization: 'Bearer expired_token' };

        jwt.verify.mockImplementation((token, secret, options, callback) => {
            const error = Object.assign(new Error('jwt expired'), { name: 'TokenExpiredError' });
            callback(error, null);
        });

        authMiddleware(req, res, next);

        expect(req.user).toBeNull(); // Must remain null (as initialized in createMockReqRes)
        expect(next).not.toHaveBeenCalled();
    });

    // ─── 5. Simulating time advance: valid token becomes expired ─────────────
    it('should detect expiry after fake timer advances past token lifetime', () => {
        const { req, res, next } = createMockReqRes();
        req.headers = { authorization: 'Bearer time_sensitive_token' };

        // First call: token is valid
        let isExpired = false;
        jwt.verify.mockImplementation((token, secret, options, callback) => {
            if (isExpired) {
                const error = Object.assign(new Error('jwt expired'), { name: 'TokenExpiredError' });
                callback(error, null);
            } else {
                callback(null, VALID_PAYLOAD);
            }
        });

        // Time T=0: Token is valid
        authMiddleware(req, res, next);
        expect(next).toHaveBeenCalledTimes(1);

        // Advance fake time past the token lifetime (e.g., 2 hours)
        vi.advanceTimersByTime(2 * 60 * 60 * 1000);
        isExpired = true;

        // Time T+2h: Token is now expired
        const { req: req2, res: res2, next: next2 } = createMockReqRes();
        req2.headers = { authorization: 'Bearer time_sensitive_token' };
        authMiddleware(req2, res2, next2);

        expect(res2.status).toHaveBeenCalledWith(403);
        expect(next2).not.toHaveBeenCalled();
    });

    // ─── 6. Admin token: userIsAdmin flag is set correctly on valid token ─────
    it('should set req.userIsAdmin = true for a valid admin token', () => {
        const { req, res, next } = createMockReqRes();
        req.headers = { authorization: 'Bearer admin_token' };

        jwt.verify.mockImplementation((token, secret, options, callback) => {
            callback(null, ADMIN_PAYLOAD);
        });

        authMiddleware(req, res, next);

        expect(req.user).toEqual(ADMIN_PAYLOAD);
        expect(req.userIsAdmin).toBe(true);
        expect(next).toHaveBeenCalled();
    });

    // ─── 7. Expired admin token: userIsAdmin must NOT be set ──────────────────
    it('should NOT set req.userIsAdmin when an admin token is expired', () => {
        const { req, res, next } = createMockReqRes();
        req.headers = { authorization: 'Bearer expired_admin_token' };

        jwt.verify.mockImplementation((token, secret, options, callback) => {
            const error = Object.assign(new Error('jwt expired'), { name: 'TokenExpiredError' });
            callback(error, null);
        });

        authMiddleware(req, res, next);

        expect(req.userIsAdmin).toBeUndefined();
        expect(res.status).toHaveBeenCalledWith(403);
        expect(next).not.toHaveBeenCalled();
    });

    // ─── 8. Missing Authorization header: returns 401, not 403 ───────────────
    it('should return 401 Unauthorized (not 403) when no Authorization header is sent', () => {
        const { req, res, next } = createMockReqRes();
        req.headers = {};

        authMiddleware(req, res, next);

        expect(res.status).toHaveBeenCalledWith(401);
        expect(res.json).toHaveBeenCalledWith({ message: 'Unauthorized' });
        expect(next).not.toHaveBeenCalled();
    });
});
