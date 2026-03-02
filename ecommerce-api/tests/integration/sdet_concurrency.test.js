import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import mongoose from 'mongoose';
import { app } from '../../server.js';
import { getAuthToken } from '../helpers/auth.js';
import User from '../../src/models/user.js';
import Product from '../../src/models/product.js';
import Cart from '../../src/models/cart.js';
import Review from '../../src/models/review.js';
import ShippingAddress from '../../src/models/shippingAddress.js';

describe('SDET Advanced Concurrency Tests', () => {
    let customerToken;
    let customerId;
    let productId;

    beforeAll(async () => {
        console.log('Supertest App Object:', app);
        // Setup a customer
        const customer = await User.create({
            displayName: 'Concurrency User',
            email: `concur_${Date.now()}@test.com`,
            hashPassword: 'password123',
            phone: '1234567890',
            role: 'customer'
        });
        customerId = customer._id.toString();
        customerToken = await getAuthToken('customer', customerId);

        // Setup a product
        const product = await Product.create({
            name: 'Concurrency Shield',
            description: 'Protects against race conditions',
            modelo: 'Local',
            price: 100,
            category: new mongoose.Types.ObjectId(),
            variants: [{ size: 'M', stock: 100 }]
        });
        productId = product._id.toString();
    });

    afterAll(async () => {
        await User.deleteMany({ email: /concur_/ });
        await Product.deleteMany({ name: 'Concurrency Shield' });
        await Cart.deleteMany({ user: customerId });
        await Review.deleteMany({ user: customerId });
        await ShippingAddress.deleteMany({ user: customerId });
    });

    describe('1. Review Concurrency (Race Conditions)', () => {
        it('should NOT allow creating multiple reviews for the same product via race condition', async () => {
            // Warm up
            await request(app).get('/health');

            // FIRE 10 concurrent requests
            const results = await Promise.all(
                Array.from({ length: 10 }).map(() =>
                    request(app)
                        .post('/api/review')
                        .set('Authorization', `Bearer ${customerToken}`)
                        .send({
                            product: productId,
                            rating: 5,
                            comment: 'Concurrent review attempt'
                        })
                )
            );

            // Check how many tests "passed" (should only be 1)
            const successes = results.filter(r => r.status === 201);
            const failures = results.filter(r => r.status !== 201);

            if (successes.length === 0 && failures.length > 0) {
                console.log('First failure body:', JSON.stringify(failures[0].body));
            }

            console.log(`Review Concurrency Results: Successes=${successes.length}, Failures=${failures.length}`);

            // If the code is buggy (which we suspect), successes might be > 1
            // But as an SDET, we want to prove it and then suggest a fix.
            // For now, let's verify how many Reviews actually exist in DB
            const reviewCount = await Review.countDocuments({ user: customerId, product: productId });

            // Expected outcome in a ROBUST system is 1.
            // If it's more, we found a bug!
            expect(reviewCount).toBe(1);
        }, 15000);
    });

    describe('2. Cart Concurrency (New User)', () => {
        it('should NOT create multiple carts for a new user when adding products concurrently', async () => {
            // Warm up
            await request(app).get('/health');
            const newUser = await User.create({
                displayName: 'Cart Race User',
                email: `cart_race_${Date.now()}@test.com`,
                hashPassword: 'password123',
                phone: '1122334455',
                role: 'customer'
            });
            const newUserToken = await getAuthToken('customer', newUser._id.toString());

            // FIRE 8 concurrent requests to add product
            await Promise.all(
                Array.from({ length: 8 }).map(() =>
                    request(app)
                        .post('/api/cart/add')
                        .set('Authorization', `Bearer ${newUserToken}`)
                        .send({
                            productId,
                            quantity: 1,
                            size: 'M'
                        })
                )
            );

            const cartCount = await Cart.countDocuments({ user: newUser._id });
            console.log(`Cart Concurrency Results: Total Carts=${cartCount}`);

            // Robust system should have exactly 1 cart and 8 quantity (or 1 depending on logic)
            expect(cartCount).toBe(1);

            // Cleanup
            await User.findByIdAndDelete(newUser._id);
            await Cart.deleteMany({ user: newUser._id });
        }, 15000);
    });

    describe('3. Shipping Address Concurrency (Default Flag)', () => {
        it('should maintain exactly ONE default address under concurrent creation', async () => {
            // Warm up
            await request(app).get('/health');
            // FIRE 6 concurrent requests to create a default address
            await Promise.all(
                Array.from({ length: 6 }).map((_, i) =>
                    request(app)
                        .post('/api/new-address')
                        .set('Authorization', `Bearer ${customerToken}`)
                        .send({
                            name: `Address ${i}`,
                            address: 'Concurrency Ave',
                            city: 'RaceCity',
                            state: 'ST',
                            postalCode: '12345',
                            phone: '1234567890',
                            isDefault: true
                        })
                )
            );

            const defaultAddresses = await ShippingAddress.find({ user: customerId, isDefault: true });
            console.log(`Address Concurrency Results: Default Addresses=${defaultAddresses.length}`);

            // Should have exactly 1 default address
            expect(defaultAddresses.length).toBe(1);
        }, 15000);
    });

    describe('4. Cart Product Increments Concurrency', () => {
        it('should correctly increment quantity without losing updates during concurrent additions', async () => {
            // Warm up
            await request(app).get('/health');
            // Ensure cart exists
            await request(app)
                .post('/api/cart/add')
                .set('Authorization', `Bearer ${customerToken}`)
                .send({ productId, quantity: 1, size: 'M' });

            // FIRE 10 concurrent requests to add 1 more
            await Promise.all(
                Array.from({ length: 10 }).map(() =>
                    request(app)
                        .post('/api/cart/add')
                        .set('Authorization', `Bearer ${customerToken}`)
                        .send({ productId, quantity: 1, size: 'M' })
                )
            );

            const cart = await Cart.findOne({ user: customerId });
            const item = cart.products.find(p => p.product.toString() === productId && p.size === 'M');

            console.log(`Cart Increment Results: Final Quantity=${item.quantity}`);
            // Initial 1 + 10 concurrent = 11
            expect(item.quantity).toBe(11);
        }, 15000);
    });
});
