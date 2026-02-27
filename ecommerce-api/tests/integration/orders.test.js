import request from 'supertest';
import { describe, it, expect, beforeEach } from 'vitest';
import { app } from '../../server.js';
import Product from '../../src/models/product.js';
import Category from '../../src/models/category.js';
import SubCategory from '../../src/models/subCategory.js';
import Order from '../../src/models/order.js';
import User from '../../src/models/user.js';
import { getAuthToken } from '../helpers/auth.js';

// ─── Helpers ───────────────────────────────────────────────────────────────

/**
 * Creates a minimal user with a shipping address and payment method
 * by calling the corresponding API or directly, depending on what's available.
 * Since shipping and payment methods require their own tests later,
 * we create them directly in MongoDB for now.
 */
import ShippingAddress from '../../src/models/shippingAddress.js';
import PaymentMethod from '../../src/models/paymentMethod.js';

describe('Order Integration Tests', () => {
    let adminToken;
    let customerToken;
    let adminUser;
    let customerUser;
    let testProduct;
    let testShippingAddress;
    let testPaymentMethod;

    beforeEach(async () => {
        // Clean up DB state
        await Order.deleteMany({});
        await Product.deleteMany({});
        await SubCategory.deleteMany({});
        await Category.deleteMany({});
        await ShippingAddress.deleteMany({});
        await PaymentMethod.deleteMany({});
        await User.deleteMany({});

        adminToken = await getAuthToken('admin');
        customerToken = await getAuthToken('customer');

        adminUser = await User.findOne({ email: 'admin@test.com' });
        customerUser = await User.findOne({ email: 'customer@test.com' });

        // Set up product data
        const category = await Category.create({ name: 'Order Cat', description: 'Desc' });
        const subCategory = await SubCategory.create({ name: 'Order Sub', description: 'Desc', parentCategory: category._id });

        testProduct = await Product.create({
            name: 'Order Product',
            description: 'Product used for order tests',
            modelo: 'Local',
            variants: [
                { size: 'M', stock: 10 },
                { size: 'L', stock: 0 }  // L is intentionally out-of-stock
            ],
            price: 150,
            category: subCategory._id
        });

        // Create a shipping address directly
        testShippingAddress = await ShippingAddress.create({
            user: customerUser._id,
            name: 'Test Address',
            address: 'Calle Falsa 123',
            city: 'Guadalajara',
            state: 'Jalisco',
            postalCode: '44100',
            country: 'México',
            phone: '3312345678',
            isDefault: true,
            addressType: 'home'
        });

        // Create a payment method directly
        testPaymentMethod = await PaymentMethod.create({
            user: customerUser._id,
            type: 'credit_card',
            lastFourDigits: '4242',
            cardholderName: 'Test Customer',
            expiryDate: '12/28',
            isDefault: true,
            isActive: true
        });
    });

    // Helper to build a valid order payload
    const buildOrderPayload = (overrides = {}) => ({
        user: customerUser._id.toString(),
        products: [
            {
                productId: testProduct._id.toString(),
                quantity: 2,
                size: 'M',
                price: testProduct.price
            }
        ],
        shippingAddress: testShippingAddress._id.toString(),
        paymentMethod: testPaymentMethod._id.toString(),
        shippingCost: 50,
        ...overrides
    });

    // ─── Create Order ───────────────────────────────────────────────────────

    describe('POST /api/orders', () => {
        it('Happy Path: should create an order and deduct stock', async () => {
            const response = await request(app)
                .post('/api/orders')
                .set('Authorization', `Bearer ${customerToken}`)
                .send(buildOrderPayload());

            expect(response.status).toBe(201);
            expect(response.body).toHaveProperty('status', 'pending');
            expect(response.body).toHaveProperty('paymentStatus', 'pending');

            // Verify stock was deducted in database (2 units of size M)
            const updatedProduct = await Product.findById(testProduct._id);
            const mVariant = updatedProduct.variants.find(v => v.size === 'M');
            expect(mVariant.stock).toBe(8); // 10 - 2
        });

        it('should calculate totalPrice server-side (ignore client price)', async () => {
            const clientPayload = buildOrderPayload();
            // Try to manipulate the price from the client
            clientPayload.products[0].price = 1; // Attempt to send fake low price

            const response = await request(app)
                .post('/api/orders')
                .set('Authorization', `Bearer ${customerToken}`)
                .send(clientPayload);

            expect(response.status).toBe(201);
            // Server should use testProduct.price (150) not the client-provided 1
            // totalPrice = (150 * 2) + 50 shipping = 350
            expect(response.body.totalPrice).toBe(350);
        });

        it('should return 400 when stock is insufficient', async () => {
            const response = await request(app)
                .post('/api/orders')
                .set('Authorization', `Bearer ${customerToken}`)
                .send(buildOrderPayload({
                    products: [{
                        productId: testProduct._id.toString(),
                        quantity: 999, // Way more than 10
                        size: 'M',
                        price: testProduct.price
                    }]
                }));

            expect(response.status).toBe(400);
            expect(response.body).toHaveProperty('message', 'Cannot create order due to stock issues');
            expect(response.body.errors).toBeInstanceOf(Array);
            expect(response.body.errors[0]).toHaveProperty('available', 10);
            expect(response.body.errors[0]).toHaveProperty('requested', 999);
        });

        it('should return 400 when size is out-of-stock', async () => {
            const response = await request(app)
                .post('/api/orders')
                .set('Authorization', `Bearer ${customerToken}`)
                .send(buildOrderPayload({
                    products: [{
                        productId: testProduct._id.toString(),
                        quantity: 1,
                        size: 'L', // L has stock = 0
                        price: testProduct.price
                    }]
                }));

            expect(response.status).toBe(400);
            expect(response.body.errors[0]).toHaveProperty('size', 'L');
        });

        it('should return 401 without authentication', async () => {
            const response = await request(app)
                .post('/api/orders')
                .send(buildOrderPayload());

            expect(response.status).toBe(401);
        });
    });

    // ─── Get Orders ─────────────────────────────────────────────────────────

    describe('GET /api/orders', () => {
        it('admin should list all orders', async () => {
            // Create one order first
            await request(app)
                .post('/api/orders')
                .set('Authorization', `Bearer ${customerToken}`)
                .send(buildOrderPayload());

            const response = await request(app)
                .get('/api/orders')
                .set('Authorization', `Bearer ${adminToken}`);

            expect(response.status).toBe(200);
            expect(Array.isArray(response.body)).toBe(true);
            expect(response.body.length).toBeGreaterThanOrEqual(1);
        });

        it('customer should be denied access to all orders (RBAC)', async () => {
            const response = await request(app)
                .get('/api/orders')
                .set('Authorization', `Bearer ${customerToken}`);

            expect(response.status).toBe(403);
            expect(response.body).toHaveProperty('message', 'Admin access required');
        });
    });

    // ─── Update Order Status ─────────────────────────────────────────────────

    describe('PATCH /api/orders/:id/status', () => {
        let createdOrder;

        beforeEach(async () => {
            const res = await request(app)
                .post('/api/orders')
                .set('Authorization', `Bearer ${customerToken}`)
                .send(buildOrderPayload());
            createdOrder = res.body;
        });

        it('admin should update order status', async () => {
            const response = await request(app)
                .patch(`/api/orders/${createdOrder._id}/status`)
                .set('Authorization', `Bearer ${adminToken}`)
                .send({ status: 'shipped' });

            expect(response.status).toBe(200);
            expect(response.body).toHaveProperty('status', 'shipped');
        });

        it('customer should be denied status update (RBAC)', async () => {
            const response = await request(app)
                .patch(`/api/orders/${createdOrder._id}/status`)
                .set('Authorization', `Bearer ${customerToken}`)
                .send({ status: 'shipped' });

            expect(response.status).toBe(403);
        });
    });

    // ─── Cancel Order ─────────────────────────────────────────────────────────

    describe('PATCH /api/orders/:id/cancel', () => {
        let createdOrder;
        const QUANTITY_ORDERED = 2;

        beforeEach(async () => {
            const res = await request(app)
                .post('/api/orders')
                .set('Authorization', `Bearer ${customerToken}`)
                .send(buildOrderPayload());
            createdOrder = res.body;
        });

        it('should cancel a pending order and restore stock', async () => {
            const response = await request(app)
                .patch(`/api/orders/${createdOrder._id}/cancel`)
                .set('Authorization', `Bearer ${adminToken}`);

            expect(response.status).toBe(200);
            expect(response.body.updatedOrder).toHaveProperty('status', 'cancelled');

            // Verify stock was restored
            const updatedProduct = await Product.findById(testProduct._id);
            const mVariant = updatedProduct.variants.find(v => v.size === 'M');
            expect(mVariant.stock).toBe(10); // restored from 8 back to 10
        });

        it('should set paymentStatus to "refunded" when cancelling a paid order', async () => {
            // Manually mark the order as paid
            await Order.findByIdAndUpdate(createdOrder._id, { paymentStatus: 'paid' });

            const response = await request(app)
                .patch(`/api/orders/${createdOrder._id}/cancel`)
                .set('Authorization', `Bearer ${adminToken}`);

            expect(response.status).toBe(200);
            expect(response.body.updatedOrder.paymentStatus).toBe('refunded');
        });

        it('should return 400 when cancelling a delivered order', async () => {
            // Manually set order to delivered
            await Order.findByIdAndUpdate(createdOrder._id, { status: 'delivered' });

            const response = await request(app)
                .patch(`/api/orders/${createdOrder._id}/cancel`)
                .set('Authorization', `Bearer ${adminToken}`);

            expect(response.status).toBe(400);
            expect(response.body.message).toContain('Cannot cancel order with status: delivered');
        });

        it('should return 400 when cancelling an already-cancelled order', async () => {
            await Order.findByIdAndUpdate(createdOrder._id, { status: 'cancelled' });

            const response = await request(app)
                .patch(`/api/orders/${createdOrder._id}/cancel`)
                .set('Authorization', `Bearer ${adminToken}`);

            expect(response.status).toBe(400);
        });
    });

    // ─── Delete Order ─────────────────────────────────────────────────────────

    describe('DELETE /api/orders/:id', () => {
        it('should delete a cancelled order', async () => {
            // Create and cancel the order
            const createRes = await request(app)
                .post('/api/orders')
                .set('Authorization', `Bearer ${customerToken}`)
                .send(buildOrderPayload());

            await request(app)
                .patch(`/api/orders/${createRes.body._id}/cancel`)
                .set('Authorization', `Bearer ${adminToken}`);

            const deleteRes = await request(app)
                .delete(`/api/orders/${createRes.body._id}`)
                .set('Authorization', `Bearer ${adminToken}`);

            expect(deleteRes.status).toBe(204);
        });

        it('should return 400 when deleting an active (non-cancelled) order', async () => {
            const createRes = await request(app)
                .post('/api/orders')
                .set('Authorization', `Bearer ${customerToken}`)
                .send(buildOrderPayload());

            const deleteRes = await request(app)
                .delete(`/api/orders/${createRes.body._id}`)
                .set('Authorization', `Bearer ${adminToken}`);

            expect(deleteRes.status).toBe(400);
            expect(deleteRes.body).toHaveProperty('message', 'Only cancelled orders can be deleted');
        });
    });
});
