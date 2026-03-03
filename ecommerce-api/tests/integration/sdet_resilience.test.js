import { describe, it, expect, beforeAll, afterAll, vi } from 'vitest';
import request from 'supertest';
import { app } from '../../server.js';
import { getAuthToken } from '../helpers/auth.js';
import Product from '../../src/models/product.js';
import Order from '../../src/models/order.js';
import User from '../../src/models/user.js';
import mongoose from 'mongoose';

describe('SDET Advanced Resilience & Fault Tolerance Tests', () => {
    let customerToken;
    let customerId;
    let productId;

    beforeAll(async () => {
        // Setup
        const customer = await User.create({
            displayName: 'Resilience User',
            email: `resil_${Date.now()}@test.com`,
            hashPassword: 'password123',
            phone: '1234567890',
            role: 'customer'
        });
        customerId = customer._id.toString();
        customerToken = await getAuthToken('customer', customerId);

        const product = await Product.create({
            name: 'Resilience Shield',
            description: 'Testing rollbacks',
            modelo: 'Local',
            price: 100,
            category: new mongoose.Types.ObjectId(),
            variants: [{ size: 'M', stock: 10 }]
        });
        productId = product._id.toString();
    });

    afterAll(async () => {
        await User.deleteMany({ email: /resil_/ });
        await Product.deleteMany({ name: 'Resilience Shield' });
        await Order.deleteMany({ user: customerId });
    });

    describe('1. Transactional Rollback (Stock Integrity)', () => {
        it('should ROLLBACK product stock if Order creation fails after stock deduction', async () => {
            // Warm up
            await request(app).get('/health');

            // 1. Check initial stock
            const initialProduct = await Product.findById(productId);
            const initialStock = initialProduct.variants.find(v => v.size === 'M').stock;
            expect(initialStock).toBe(10);

            // 2. Mock Order.create to FAIL
            const orderCreateSpy = vi.spyOn(Order, 'create').mockRejectedValue(new Error('Simulated DB Crash during Order Save'));

            // 3. Attempt to create order
            const response = await request(app)
                .post('/api/orders')
                .set('Authorization', `Bearer ${customerToken}`)
                .send({
                    user: customerId,
                    products: [{ productId, quantity: 2, size: 'M', price: 100 }],
                    shippingAddress: new mongoose.Types.ObjectId(),
                    paymentMethod: new mongoose.Types.ObjectId(),
                    shippingCost: 10
                });

            console.log(`Order Resilience Response Status: ${response.status}`);
            if (response.status !== 500) {
                console.log('Error Body:', JSON.stringify(response.body));
            }
            expect(response.status).toBe(500);

            // 4. Verify stock (Should be back to 10 if rollback works)
            const finalProduct = await Product.findById(productId);
            const finalStock = finalProduct.variants.find(v => v.size === 'M').stock;

            console.log(`Stock Rollback Results: Initial=${initialStock}, Final=${finalStock}`);

            // If the code is buggy (no rollback), finalStock will be 8
            expect(finalStock).toBe(10);

            orderCreateSpy.mockRestore();
        }, 15000);
    });

    describe('2. Rate Limiting Resilience', () => {
        it('should return 429 Too Many Requests when exceeding the limit', async () => {
            // We use x-test-limit-strict header to trigger max: 2 for authLimiter in tests
            // First 2 requests pass
            await request(app).post('/api/auth/login').set('x-test-limit-strict', 'true').send({ email: 'nonexistent@test.com', password: '123' });
            await request(app).post('/api/auth/login').set('x-test-limit-strict', 'true').send({ email: 'nonexistent@test.com', password: '123' });

            // 3rd request should fail with 429
            const res = await request(app).post('/api/auth/login').set('x-test-limit-strict', 'true').send({ email: 'nonexistent@test.com', password: '123' });

            expect(res.status).toBe(429);
            expect(res.body.message).toMatch(/Too many authentication attempts/);
        });
    });

    describe('3. Partial Data Integrity (Circular Refs revisited)', () => {
        it('should handle deep nesting and circularity gracefully in complex business logic', async () => {
            // This is more of a logic test, but fits resilience to bad data.
            // [Scenario: Nested Category Tree depth > 10]
        });
    });
});
