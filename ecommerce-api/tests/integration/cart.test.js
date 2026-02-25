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
    });

    describe('GET /api/cart/user/:userId', () => {
        it('should return 404 if user has no cart', async () => {
            const response = await request(app)
                .get(`/api/cart/user/${customerUser._id}`)
                .set('Authorization', `Bearer ${customerToken}`);

            expect(response.status).toBe(404);
            expect(response.body).toHaveProperty('message', 'No cart found for this user');
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
