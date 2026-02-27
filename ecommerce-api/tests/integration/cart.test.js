import request from 'supertest';
import { describe, it, expect, beforeEach } from 'vitest';
import { app } from '../../server.js';
import User from '../../src/models/user.js';
import Product from '../../src/models/product.js';
import SubCategory from '../../src/models/subCategory.js';
import Category from '../../src/models/category.js';
import Cart from '../../src/models/cart.js';
import { getAuthToken } from '../helpers/auth.js';

describe('Cart Integration Tests', () => {
    let customerToken;
    let customerUser;
    let testProduct;

    beforeEach(async () => {
        await Cart.deleteMany({});
        await Product.deleteMany({});
        await SubCategory.deleteMany({});
        await Category.deleteMany({});
        await User.deleteMany({});


        customerToken = await getAuthToken('customer');
        customerUser = await User.findOne({ email: 'customer@test.com' });

        const category = await Category.create({ name: 'Cart Category', description: 'Desc' });
        const subCategory = await SubCategory.create({ name: 'Cart Sub', description: 'Desc', parentCategory: category._id });

        testProduct = await Product.create({
            name: 'Cart Product',
            description: 'Description of product',
            modelo: 'Local',
            variants: [{ size: 'M', stock: 10 }],
            price: 50,
            category: subCategory._id
        });
    });

    describe('POST /api/cart/add', () => {
        it('should add a product to the cart', async () => {
            const addData = {
                userId: customerUser._id.toString(),
                productId: testProduct._id.toString(),
                quantity: 2,
                size: 'M'
            };

            const response = await request(app)
                .post('/api/cart/add')
                .set('Authorization', `Bearer ${customerToken}`)
                .send(addData);

            expect(response.status).toBe(200);
            expect(response.body).toHaveProperty('message', 'Product added to cart successfully');
            expect(response.body.cart.products).toHaveLength(1);
            expect(response.body.cart.products[0].quantity).toBe(2);
        });

        it('should accumulate quantity when adding the same product + size twice', async () => {
            const addData = {
                userId: customerUser._id.toString(),
                productId: testProduct._id.toString(),
                quantity: 2,
                size: 'M'
            };

            // First add
            await request(app)
                .post('/api/cart/add')
                .set('Authorization', `Bearer ${customerToken}`)
                .send(addData);

            // Second add with same size → should accumulate
            const response = await request(app)
                .post('/api/cart/add')
                .set('Authorization', `Bearer ${customerToken}`)
                .send({ ...addData, quantity: 3 });

            expect(response.status).toBe(200);
            expect(response.body.cart.products).toHaveLength(1); // Still 1 item
            expect(response.body.cart.products[0].quantity).toBe(5); // 2 + 3
        });

        it('should create a separate item when adding same product with different size', async () => {
            const baseData = {
                userId: customerUser._id.toString(),
                productId: testProduct._id.toString(),
                quantity: 1,
            };

            // Add in size M
            await request(app)
                .post('/api/cart/add')
                .set('Authorization', `Bearer ${customerToken}`)
                .send({ ...baseData, size: 'M' });

            // Add in size L → different item
            const response = await request(app)
                .post('/api/cart/add')
                .set('Authorization', `Bearer ${customerToken}`)
                .send({ ...baseData, size: 'L' });

            expect(response.status).toBe(200);
            expect(response.body.cart.products).toHaveLength(2); // Two separate items
        });

        it('should return 401 when adding without authentication', async () => {
            const response = await request(app)
                .post('/api/cart/add')
                .send({
                    userId: customerUser._id.toString(),
                    productId: testProduct._id.toString(),
                    quantity: 1,
                    size: 'M'
                });

            expect(response.status).toBe(401);
        });
    });

    describe('GET /api/cart/user/:userId', () => {
        it('should return 404 if user has no cart', async () => {
            const response = await request(app)
                .get(`/api/cart/user/${customerUser._id}`)
                .set('Authorization', `Bearer ${customerToken}`);

            expect(response.status).toBe(404);
            expect(response.body).toHaveProperty('message', 'No cart found for this user');
        });

        it('should return cart when user has one', async () => {
            // Create a cart first
            await request(app)
                .post('/api/cart/add')
                .set('Authorization', `Bearer ${customerToken}`)
                .send({ userId: customerUser._id.toString(), productId: testProduct._id.toString(), quantity: 1, size: 'M' });

            const response = await request(app)
                .get(`/api/cart/user/${customerUser._id}`)
                .set('Authorization', `Bearer ${customerToken}`);

            expect(response.status).toBe(200);
            expect(response.body).toHaveProperty('products');
            expect(response.body.products).toHaveLength(1);
        });
    });

    describe('PUT /api/cart/update-item', () => {
        beforeEach(async () => {
            // Pre-populate cart
            await request(app)
                .post('/api/cart/add')
                .set('Authorization', `Bearer ${customerToken}`)
                .send({ userId: customerUser._id.toString(), productId: testProduct._id.toString(), quantity: 1, size: 'M' });
        });

        it('should update the quantity of a cart item', async () => {
            const response = await request(app)
                .put('/api/cart/update-item')
                .set('Authorization', `Bearer ${customerToken}`)
                .send({
                    userId: customerUser._id.toString(),
                    productId: testProduct._id.toString(),
                    size: 'M',
                    quantity: 5
                });

            expect(response.status).toBe(200);
            const updatedItem = response.body.cart.products.find(p => p.size === 'M');
            expect(updatedItem.quantity).toBe(5);
        });

        it('should change the size of a cart item using oldSize', async () => {
            const response = await request(app)
                .put('/api/cart/update-item')
                .set('Authorization', `Bearer ${customerToken}`)
                .send({
                    userId: customerUser._id.toString(),
                    productId: testProduct._id.toString(),
                    oldSize: 'M',    // find by this
                    size: 'L',       // update to this
                    quantity: 1
                });

            expect(response.status).toBe(200);
            expect(response.body.cart.products.some(p => p.size === 'L')).toBe(true);
            expect(response.body.cart.products.some(p => p.size === 'M')).toBe(false);
        });

        it('should return 404 if product is not in cart', async () => {
            const response = await request(app)
                .put('/api/cart/update-item')
                .set('Authorization', `Bearer ${customerToken}`)
                .send({
                    userId: customerUser._id.toString(),
                    productId: '654321654321654321654321', // not in cart
                    size: 'M',
                    quantity: 2
                });

            expect(response.status).toBe(404);
            expect(response.body).toHaveProperty('message', 'Product not found in cart');
        });
    });

    describe('DELETE /api/cart/remove-item/:productId', () => {
        beforeEach(async () => {
            await request(app)
                .post('/api/cart/add')
                .set('Authorization', `Bearer ${customerToken}`)
                .send({ userId: customerUser._id.toString(), productId: testProduct._id.toString(), quantity: 2, size: 'M' });
        });

        it('should remove a specific product+size from the cart', async () => {
            const response = await request(app)
                .delete(`/api/cart/remove-item/${testProduct._id}`)
                .set('Authorization', `Bearer ${customerToken}`)
                .send({
                    userId: customerUser._id.toString(),
                    size: 'M'
                });

            expect(response.status).toBe(200);
            expect(response.body.cart.products).toHaveLength(0);
        });
    });

    describe('POST /api/cart/clear', () => {
        it('should clear all items from the cart', async () => {
            // First add something
            await request(app)
                .post('/api/cart/add')
                .set('Authorization', `Bearer ${customerToken}`)
                .send({
                    userId: customerUser._id.toString(),
                    productId: testProduct._id.toString(),
                    quantity: 1,
                    size: 'M'
                });

            const response = await request(app)
                .post('/api/cart/clear')
                .set('Authorization', `Bearer ${customerToken}`)
                .send({ userId: customerUser._id.toString() });

            expect(response.status).toBe(200);
            expect(response.body.cart.products).toHaveLength(0);
        });
    });
});
