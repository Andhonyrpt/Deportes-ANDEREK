import { describe, it, expect } from 'vitest';
import { validationResult } from 'express-validator';
import * as validators from '../../../src/middlewares/validators.js';

// Helper to run middleware and get results
const runMiddleware = async (req, middleware) => {
    if (Array.isArray(middleware)) {
        for (const m of middleware) {
            await m(req, {}, () => { });
        }
    } else {
        await middleware(req, {}, () => { });
    }
    return validationResult(req);
};

describe('Validators Unit Tests', () => {
    describe('emailValidation', () => {
        it('should fail if email is missing', async () => {
            const req = { body: {} };
            const result = await runMiddleware(req, validators.emailValidation());
            expect(result.isEmpty()).toBe(false);
            // emailValidation uses .isEmail().withMessage("Valid email is required") BEFORE .notEmpty()
            // In express-validator, both might run or the first one might trigger depending on how it's chain is evaluated.
            // Looking at validators.js, isEmail is first.
            expect(result.array()[0].msg).toBe('Valid email is required');
        });

        it('should fail if email is invalid', async () => {
            const req = { body: { email: 'invalid-email' } };
            const result = await runMiddleware(req, validators.emailValidation());
            expect(result.isEmpty()).toBe(false);
            expect(result.array()[0].msg).toBe('Valid email is required');
        });

        it('should pass if email is valid', async () => {
            const req = { body: { email: 'test@example.com' } };
            const result = await runMiddleware(req, validators.emailValidation());
            expect(result.isEmpty()).toBe(true);
        });
    });

    describe('passwordValidation', () => {
        it('should fail if password is too short', async () => {
            const req = { body: { password: '123' } };
            const result = await runMiddleware(req, validators.passwordValidation());
            expect(result.isEmpty()).toBe(false);
            expect(result.array().some(e => e.msg.includes('6 characters'))).toBe(true);
        });

        it('should fail if password has no numbers', async () => {
            const req = { body: { password: 'password' } };
            const result = await runMiddleware(req, validators.passwordValidation());
            expect(result.isEmpty()).toBe(false);
            expect(result.array().some(e => e.msg.includes('one number'))).toBe(true);
        });

        it('should pass if password is valid', async () => {
            const req = { body: { password: 'Password123' } };
            const result = await runMiddleware(req, validators.passwordValidation());
            expect(result.isEmpty()).toBe(true);
        });
    });

    describe('mongoIdValidation', () => {
        it('should fail if id is not a valid MongoID', async () => {
            const req = { params: { id: '123' } };
            const result = await runMiddleware(req, validators.mongoIdValidation('id'));
            expect(result.isEmpty()).toBe(false);
            expect(result.array()[0].msg).toContain('must be a valid MongoDB ObjectId');
        });

        it('should pass if id is a valid MongoID', async () => {
            const req = { params: { id: '507f1f72bcf86cd799439011' } };
            const result = await runMiddleware(req, validators.mongoIdValidation('id'));
            expect(result.isEmpty()).toBe(true);
        });
    });

    describe('sizeValidation', () => {
        it('should fail if size is invalid', async () => {
            const req = { body: { size: 'XXL' } };
            const result = await runMiddleware(req, validators.sizeValidation());
            expect(result.isEmpty()).toBe(false);
            expect(result.array()[0].msg).toBe('Invalid size. Expected: S, M, L, or XL');
        });

        it('should pass if size is valid (case insensitive check due to toUpperCase)', async () => {
            const req = { body: { size: 'm' } };
            const result = await runMiddleware(req, validators.sizeValidation());
            expect(result.isEmpty()).toBe(true);
        });
    });

    describe('orderStatusValidation', () => {
        it('should fail if status is invalid', async () => {
            const req = { body: { status: 'unknown' } };
            const result = await runMiddleware(req, validators.orderStatusValidation());
            expect(result.isEmpty()).toBe(false);
            expect(result.array()[0].msg).toBe('Invalid status value');
        });

        it('should pass if status is valid', async () => {
            const req = { body: { status: 'shipped' } };
            const result = await runMiddleware(req, validators.orderStatusValidation());
            expect(result.isEmpty()).toBe(true);
        });
    });
});
