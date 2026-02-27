import request from 'supertest';
import { describe, it, expect, beforeEach } from 'vitest';
import { app } from '../../server.js';
import Product from '../../src/models/product.js';
import Category from '../../src/models/category.js';
import SubCategory from '../../src/models/subCategory.js';
import User from '../../src/models/user.js';
import Review from '../../src/models/review.js';
import { getAuthToken } from '../helpers/auth.js';

describe('Review Integration Tests', () => {
    let customerToken;
    let customerToken2; // a second user for authorization tests
    let customerUser;
    let testProduct;

    beforeEach(async () => {
        await Review.deleteMany({});
        await Product.deleteMany({});
        await SubCategory.deleteMany({});
        await Category.deleteMany({});
        await User.deleteMany({});

        customerToken = await getAuthToken('customer');
        customerToken2 = await getAuthToken('customer', '2');
        customerUser = await User.findOne({ email: 'customer@test.com' });

        const category = await Category.create({ name: 'Review Cat', description: 'Desc' });
        const subCat = await SubCategory.create({ name: 'Review Sub', description: 'Desc', parentCategory: category._id });

        testProduct = await Product.create({
            name: 'Reviewable Product',
            description: 'Product for review tests',
            modelo: 'Local',
            variants: [{ size: 'M', stock: 5 }],
            price: 100,
            category: subCat._id
        });
    });

    describe('POST /api/review', () => {
        it('should create a review successfully', async () => {
            const response = await request(app)
                .post('/api/review')
                .set('Authorization', `Bearer ${customerToken}`)
                .send({
                    product: testProduct._id.toString(),
                    rating: 5,
                    comment: 'Excellent product, highly recommended'
                });

            expect(response.status).toBe(201);
            expect(response.body).toHaveProperty('message', 'Review created successfully');
            expect(response.body.review).toHaveProperty('rating', 5);
            expect(response.body.review.user).toHaveProperty('displayName');
        });

        it('should return 404 when reviewing a non-existent product', async () => {
            const response = await request(app)
                .post('/api/review')
                .set('Authorization', `Bearer ${customerToken}`)
                .send({
                    product: '654321654321654321654321',
                    rating: 4,
                    comment: 'Ghost product review'
                });

            expect(response.status).toBe(404);
            expect(response.body).toHaveProperty('message', 'Product not found');
        });

        it('should return 400 when user already reviewed the product', async () => {
            const reviewPayload = {
                product: testProduct._id.toString(),
                rating: 3,
                comment: 'First review'
            };

            // First review
            await request(app)
                .post('/api/review')
                .set('Authorization', `Bearer ${customerToken}`)
                .send(reviewPayload);

            // Second review – should fail
            const response = await request(app)
                .post('/api/review')
                .set('Authorization', `Bearer ${customerToken}`)
                .send({ ...reviewPayload, comment: 'Trying again' });

            expect(response.status).toBe(400);
            expect(response.body).toHaveProperty('message', 'You have already reviewed this product');
        });

        it('should return 401 when not authenticated', async () => {
            const response = await request(app)
                .post('/api/review')
                .send({ product: testProduct._id.toString(), rating: 4, comment: 'No auth' });

            expect(response.status).toBe(401);
        });
    });

    describe('GET /api/review-product/:productId', () => {
        it('should return all reviews for a product', async () => {
            // Create a review first
            await request(app)
                .post('/api/review')
                .set('Authorization', `Bearer ${customerToken}`)
                .send({ product: testProduct._id.toString(), rating: 4, comment: 'Good product here' });

            const response = await request(app)
                .get(`/api/review-product/${testProduct._id}`);

            expect(response.status).toBe(200);
            expect(response.body).toHaveProperty('count', 1);
            expect(response.body.reviews).toHaveLength(1);
        });

        it('should return empty array for a product with no reviews', async () => {
            const response = await request(app)
                .get(`/api/review-product/${testProduct._id}`);

            expect(response.status).toBe(200);
            expect(response.body).toHaveProperty('count', 0);
            expect(response.body.reviews).toHaveLength(0);
        });
    });

    describe('PUT /api/my-reviews/:reviewId', () => {
        let createdReview;

        beforeEach(async () => {
            const res = await request(app)
                .post('/api/review')
                .set('Authorization', `Bearer ${customerToken}`)
                .send({ product: testProduct._id.toString(), rating: 3, comment: 'Initial comment here' });
            createdReview = res.body.review;
        });

        it('should update own review', async () => {
            const response = await request(app)
                .put(`/api/my-reviews/${createdReview._id}`)
                .set('Authorization', `Bearer ${customerToken}`)
                .send({ rating: 5, comment: 'Changed my mind, great!' });

            expect(response.status).toBe(200);
            expect(response.body.review).toHaveProperty('rating', 5);
            expect(response.body.review).toHaveProperty('comment', 'Changed my mind, great!');
        });

        it('should return 403 when updating another user\'s review', async () => {
            const response = await request(app)
                .put(`/api/my-reviews/${createdReview._id}`)
                .set('Authorization', `Bearer ${customerToken2}`)
                .send({ rating: 1, comment: 'I am hacking this' });

            expect(response.status).toBe(403);
            expect(response.body).toHaveProperty('message', 'You can only update your own reviews');
        });
    });

    describe('DELETE /api/my-reviews/:reviewId', () => {
        let createdReview;

        beforeEach(async () => {
            const res = await request(app)
                .post('/api/review')
                .set('Authorization', `Bearer ${customerToken}`)
                .send({ product: testProduct._id.toString(), rating: 2, comment: 'Delete this review' });
            createdReview = res.body.review;
        });

        it('should return 403 when deleting another user\'s review', async () => {
            const response = await request(app)
                .delete(`/api/my-reviews/${createdReview._id}`)
                .set('Authorization', `Bearer ${customerToken2}`);

            expect(response.status).toBe(403);
            expect(response.body).toHaveProperty('message', 'You can only delete your own reviews');
        });

        it('should delete own review', async () => {
            const response = await request(app)
                .delete(`/api/my-reviews/${createdReview._id}`)
                .set('Authorization', `Bearer ${customerToken}`);

            expect(response.status).toBe(200);
            expect(response.body).toHaveProperty('message', 'Review deleted successfully');
        });
    });
});
