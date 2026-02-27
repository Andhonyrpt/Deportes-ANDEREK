import request from 'supertest';
import { describe, it, expect, beforeEach } from 'vitest';
import { app } from '../../server.js';
import Product from '../../src/models/product.js';
import Category from '../../src/models/category.js';
import SubCategory from '../../src/models/subCategory.js';
import User from '../../src/models/user.js';
import WishList from '../../src/models/wishList.js';
import Cart from '../../src/models/cart.js';
import { getAuthToken } from '../helpers/auth.js';

describe('Wishlist Integration Tests', () => {
    let customerToken;
    let customerUser;
    let testProduct;

    beforeEach(async () => {
        await WishList.deleteMany({});
        await Cart.deleteMany({});
        await Product.deleteMany({});
        await SubCategory.deleteMany({});
        await Category.deleteMany({});
        await User.deleteMany({});

        customerToken = await getAuthToken('customer');
        customerUser = await User.findOne({ email: 'customer@test.com' });

        const category = await Category.create({ name: 'WL Cat', description: 'Desc' });
        const subCat = await SubCategory.create({ name: 'WL Sub', description: 'Desc', parentCategory: category._id });

        testProduct = await Product.create({
            name: 'Wishlist Product',
            description: 'Product for wishlist tests',
            modelo: 'Local',
            variants: [{ size: 'M', stock: 5 }],
            price: 200,
            category: subCat._id
        });
    });

    describe('GET /api/wishlist', () => {
        it('should return empty wishlist for user with no items', async () => {
            const response = await request(app)
                .get('/api/wishlist')
                .set('Authorization', `Bearer ${customerToken}`);

            expect(response.status).toBe(200);
            expect(response.body).toHaveProperty('count', 0);
            expect(response.body.wishList.products).toHaveLength(0);
        });

        it('should return wishlist with products', async () => {
            // Add a product first
            await request(app)
                .post('/api/wishlist/add')
                .set('Authorization', `Bearer ${customerToken}`)
                .send({ productId: testProduct._id.toString() });

            const response = await request(app)
                .get('/api/wishlist')
                .set('Authorization', `Bearer ${customerToken}`);

            expect(response.status).toBe(200);
            expect(response.body.count).toBe(1);
        });

        it('should return 401 without authentication', async () => {
            const response = await request(app).get('/api/wishlist');
            expect(response.status).toBe(401);
        });
    });

    describe('POST /api/wishlist/add', () => {
        it('should add a product to the wishlist', async () => {
            const response = await request(app)
                .post('/api/wishlist/add')
                .set('Authorization', `Bearer ${customerToken}`)
                .send({ productId: testProduct._id.toString() });

            expect(response.status).toBe(200);
            expect(response.body).toHaveProperty('message', 'Product added to wishlist successfully');
            expect(response.body.count).toBe(1);
        });

        it('should return 404 for non-existent product', async () => {
            const response = await request(app)
                .post('/api/wishlist/add')
                .set('Authorization', `Bearer ${customerToken}`)
                .send({ productId: '654321654321654321654321' });

            expect(response.status).toBe(404);
            expect(response.body).toHaveProperty('message', 'Product not found');
        });

        it('should be idempotent: adding same product twice does not create duplicates', async () => {
            // Add first time
            await request(app)
                .post('/api/wishlist/add')
                .set('Authorization', `Bearer ${customerToken}`)
                .send({ productId: testProduct._id.toString() });

            // Add second time
            const response = await request(app)
                .post('/api/wishlist/add')
                .set('Authorization', `Bearer ${customerToken}`)
                .send({ productId: testProduct._id.toString() });

            // Using $addToSet, should not have duplicates
            expect(response.status).toBe(200);
            expect(response.body.count).toBe(1); // Still just 1 item
        });
    });

    describe('DELETE /api/wishlist/remove/:productId', () => {
        it('should remove a product from the wishlist', async () => {
            // Add first
            await request(app)
                .post('/api/wishlist/add')
                .set('Authorization', `Bearer ${customerToken}`)
                .send({ productId: testProduct._id.toString() });

            const response = await request(app)
                .delete(`/api/wishlist/remove/${testProduct._id}`)
                .set('Authorization', `Bearer ${customerToken}`);

            expect(response.status).toBe(200);
            expect(response.body.count).toBe(0);
        });
    });

    describe('GET /api/wishlist/check/:productId', () => {
        it('should return inWishList: true when product is in wishlist', async () => {
            await request(app)
                .post('/api/wishlist/add')
                .set('Authorization', `Bearer ${customerToken}`)
                .send({ productId: testProduct._id.toString() });

            const response = await request(app)
                .get(`/api/wishlist/check/${testProduct._id}`)
                .set('Authorization', `Bearer ${customerToken}`);

            expect(response.status).toBe(200);
            expect(response.body).toHaveProperty('inWishList', true);
        });

        it('should return inWishList: false when product is not in wishlist', async () => {
            const response = await request(app)
                .get(`/api/wishlist/check/${testProduct._id}`)
                .set('Authorization', `Bearer ${customerToken}`);

            expect(response.status).toBe(200);
            expect(response.body).toHaveProperty('inWishList', false);
        });
    });

    describe('DELETE /api/wishlist/clear', () => {
        it('should clear all products from the wishlist', async () => {
            // Add a product first
            await request(app)
                .post('/api/wishlist/add')
                .set('Authorization', `Bearer ${customerToken}`)
                .send({ productId: testProduct._id.toString() });

            const response = await request(app)
                .delete('/api/wishlist/clear')
                .set('Authorization', `Bearer ${customerToken}`);

            expect(response.status).toBe(200);
            expect(response.body).toHaveProperty('count', 0);
        });
    });
});
