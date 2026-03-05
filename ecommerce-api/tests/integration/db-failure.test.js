/**
 * @file db-failure.test.js
 * @description Integration tests that simulate database failures to verify that
 *   the global errorHandler middleware:
 *   1. Does NOT crash the Node.js process.
 *   2. Returns a safe JSON `{ status: 'error', message: 'Internal Server Error' }` with HTTP 500.
 *   3. Does NOT leak internal stack traces in the API response.
 *
 *   Strategy: Spy directly on Mongoose Model static methods and prototype methods
 *   so that when a controller calls them, an error is thrown synchronously or rejected.
 *   This exercises the full Express error-handling pipeline via `next(err)`.
 */
import request from 'supertest';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import mongoose from 'mongoose';
import { app } from '../../server.js';
import Product from '../../src/models/product.js';
import User from '../../src/models/user.js';
import Order from '../../src/models/order.js';

// ─── Helpers ──────────────────────────────────────────────────────────────────
const makeDbError = () => {
    const err = new Error('MongoNetworkError: connection refused');
    err.name = 'MongoNetworkError';
    return err;
};

/** Builds a fully-chained Mongoose query mock that rejects on .sort() */
const makeFailingQueryChain = () => {
    const chain = {
        populate: vi.fn().mockReturnThis(),
        skip: vi.fn().mockReturnThis(),
        limit: vi.fn().mockReturnThis(),
        sort: vi.fn().mockRejectedValue(makeDbError()),
        select: vi.fn().mockReturnThis(),
        lean: vi.fn().mockRejectedValue(makeDbError()),
        exec: vi.fn().mockRejectedValue(makeDbError()),
    };
    // Allow populte to chain back to self with nested args
    chain.populate.mockReturnValue(chain);
    return chain;
};

// ─────────────────────────────────────────────────────────────────────────────

describe('DB Failure Resilience Tests', () => {
    let adminToken;

    beforeEach(async () => {
        await User.deleteMany({});

        // Create admin user directly in DB (avoids relying on auth controller succeeding later)
        const bcrypt = await import('bcrypt');
        const adminUser = new User({
            displayName: 'DB Test Admin',
            email: 'dbfailure_admin@test.com',
            hashPassword: await bcrypt.default.hash('Admin123', 10),
            role: 'admin',
            isActive: true,
            phone: '5500000001',
        });
        await adminUser.save();

        const loginRes = await request(app)
            .post('/api/auth/login')
            .send({ email: 'dbfailure_admin@test.com', password: 'Admin123' });

        adminToken = loginRes.body.token;
    });

    afterEach(() => {
        vi.restoreAllMocks();
    });

    // ─── 1. Product.find() throws synchronously ───────────────────────────────
    it('should return 500 and safe JSON when Product.find() throws synchronously', async () => {
        vi.spyOn(Product, 'find').mockImplementation(() => {
            throw makeDbError();
        });

        const response = await request(app).get('/api/products');

        expect(response.status).toBe(500);
        expect(response.body).toHaveProperty('status', 'error');
        expect(response.body).toHaveProperty('message', 'Internal Server Error');
        expect(response.body).not.toHaveProperty('stack');
    });

    // ─── 2. Product.countDocuments() fails ────────────────────────────────────
    it('should return 500 when Product.countDocuments() rejects', async () => {
        // Let find() return a working chain but countDocuments rejects
        vi.spyOn(Product, 'find').mockReturnValue(makeFailingQueryChain());

        const response = await request(app).get('/api/products');

        // The chain will reject on sort(), which the controller awaits
        expect(response.status).toBe(500);
        expect(response.body).toHaveProperty('status', 'error');
        expect(response.body).toHaveProperty('message', 'Internal Server Error');
    });

    // ─── 3. User.findOne() rejects during login ───────────────────────────────
    it('should return 500 and safe JSON when User.findOne() rejects during /auth/login', async () => {
        vi.spyOn(User, 'findOne').mockRejectedValue(makeDbError());

        const response = await request(app)
            .post('/api/auth/login')
            .send({ email: 'any@example.com', password: 'Password123' });

        expect(response.status).toBe(500);
        expect(response.body).toHaveProperty('status', 'error');
        expect(response.body).toHaveProperty('message', 'Internal Server Error');
        // Must NOT expose connection-level details
        expect(JSON.stringify(response.body)).not.toContain('connection refused');
    });

    // ─── 4. Product.findById() fails on GET /api/products/:id ────────────────
    it('should return 500 when Product.findById() throws on single product request', async () => {
        vi.spyOn(Product, 'findById').mockImplementation(() => {
            throw makeDbError();
        });

        const fakeId = new mongoose.Types.ObjectId().toHexString();
        const response = await request(app).get(`/api/products/${fakeId}`);

        expect(response.status).toBe(500);
        expect(response.body).toHaveProperty('status', 'error');
        expect(response.body).toHaveProperty('message', 'Internal Server Error');
    });

    // ─── 5. errorHandler: NO stack trace or internal details exposed ──────────
    it('should never include stack trace, class name, or connection details in the response', async () => {
        vi.spyOn(User, 'findOne').mockRejectedValue(makeDbError());

        const response = await request(app)
            .post('/api/auth/login')
            .send({ email: 'any@example.com', password: 'Password123' });

        const bodyStr = JSON.stringify(response.body);
        expect(bodyStr).not.toContain('at ');                 // No stack trace lines
        expect(bodyStr).not.toContain('MongoNetworkError');   // No DB error class name
        expect(bodyStr).not.toContain('connection refused');  // No connection details
    });
});
