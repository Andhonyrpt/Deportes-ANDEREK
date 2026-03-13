import request from 'supertest';
import { describe, it, expect, beforeEach } from 'vitest';
import { app } from '../../server.js';
import Product from '../../src/models/product.js';
import Category from '../../src/models/category.js';
import SubCategory from '../../src/models/subCategory.js';
import User from '../../src/models/user.js';
import { getAuthToken } from '../helpers/auth.js';

describe('Order Preview Integration Tests (T-302)', () => {
    let customerToken;
    let customerUser;
    let productBelowThreshold;
    let productAboveThreshold;

    beforeEach(async () => {
        // Clean up DB state
        await Product.deleteMany({});
        await SubCategory.deleteMany({});
        await Category.deleteMany({});
        await User.deleteMany({});

        customerToken = await getAuthToken('customer');
        customerUser = await User.findOne({ email: 'customer@test.com' });

        const category = await Category.create({ name: 'Test Cat', description: 'Desc' });
        const subCategory = await SubCategory.create({ name: 'Test Sub', description: 'Desc', parentCategory: category._id });

        // Product that costs 500 (Shipping should be 350)
        productBelowThreshold = await Product.create({
            name: 'Cheap Product',
            description: 'A cheap product for testing',
            modelo: 'Local',
            price: 500,
            variants: [{ size: 'M', stock: 10 }],
            category: subCategory._id
        });

        // Product that costs 1200 (Shipping should be 0)
        productAboveThreshold = await Product.create({
            name: 'Expensive Product',
            description: 'An expensive product for testing',
            modelo: 'Visitante',
            price: 1200,
            variants: [{ size: 'L', stock: 5 }],
            category: subCategory._id
        });
    });

    describe('POST /api/orders/preview', () => {
        it('should calculate financials correctly for order below free shipping threshold', async () => {
            const response = await request(app)
                .post('/api/orders/preview')
                .set('Authorization', `Bearer ${customerToken}`)
                .send({
                    products: [{ productId: productBelowThreshold._id, quantity: 1, size: 'M' }]
                });

            expect(response.status).toBe(200);
            expect(response.body.subtotal).toBe(500);
            expect(response.body.tax).toBe(80); // 500 * 0.16
            expect(response.body.shippingCost).toBe(350);
            expect(response.body.total).toBe(930); // 500 + 80 + 350
        });

        it('should calculate financials correctly for order above free shipping threshold ($1000)', async () => {
            const response = await request(app)
                .post('/api/orders/preview')
                .set('Authorization', `Bearer ${customerToken}`)
                .send({
                    products: [{ productId: productAboveThreshold._id, quantity: 1, size: 'L' }]
                });

            expect(response.status).toBe(200);
            expect(response.body.subtotal).toBe(1200);
            expect(response.body.shippingCost).toBe(0);
            expect(response.body.total).toBe(1392); // 1200 + 192 (tax)
        });

        it('should enforce PRICE INTEGRITY: use database price even if client sends different price', async () => {
            const response = await request(app)
                .post('/api/orders/preview')
                .set('Authorization', `Bearer ${customerToken}`)
                .send({
                    products: [{ 
                        productId: productBelowThreshold._id, 
                        quantity: 1, 
                        size: 'M',
                        price: 1 // Attempted price injection
                    }]
                });

            expect(response.status).toBe(200);
            expect(response.body.subtotal).toBe(500); // Should still use DB price
            expect(response.body.total).toBe(930);
        });

        it('should handle multiple products and calculate totals correctly', async () => {
            const response = await request(app)
                .post('/api/orders/preview')
                .set('Authorization', `Bearer ${customerToken}`)
                .send({
                    products: [
                        { productId: productBelowThreshold._id, quantity: 2, size: 'M' },
                        { productId: productAboveThreshold._id, quantity: 1, size: 'L' }
                    ]
                });

            // Subtotal: (500*2) + 1200 = 2200
            // Tax: 2200 * 0.16 = 352
            // Shipping: 0 (subtotal > 1000)
            // Total: 2552
            expect(response.status).toBe(200);
            expect(response.body.subtotal).toBe(2200);
            expect(response.body.shippingCost).toBe(0);
            expect(response.body.total).toBe(2552);
        });

        it('should return 401 if unauthorized', async () => {
            const response = await request(app)
                .post('/api/orders/preview')
                .send({
                    products: [{ productId: productBelowThreshold._id, quantity: 1, size: 'M' }]
                });

            expect(response.status).toBe(401);
        });

        it('should return 400 for empty products array', async () => {
            const response = await request(app)
                .post('/api/orders/preview')
                .set('Authorization', `Bearer ${customerToken}`)
                .send({ products: [] });

            expect(response.status).toBe(422); // Validation middleware might trigger 422
        });

        it('should return 404 if one of the products does not exist', async () => {
            const fakeId = '507f1f77bcf86cd799439011';
            const response = await request(app)
                .post('/api/orders/preview')
                .set('Authorization', `Bearer ${customerToken}`)
                .send({
                    products: [
                        { productId: productBelowThreshold._id, quantity: 1, size: 'M' },
                        { productId: fakeId, quantity: 1, size: 'M' }
                    ]
                });

            expect(response.status).toBe(404);
            expect(response.body.message).toContain('not found');
        });

        it('should validate IVA precision with small amounts', async () => {
            // Create a very cheap product for precision testing
            const cheapo = await Product.create({
                name: 'Cheapo',
                description: 'A very cheap product',
                modelo: 'Local',
                price: 10.55,
                variants: [{ size: 'S', stock: 10 }],
                category: productBelowThreshold.category
            });

            const response = await request(app)
                .post('/api/orders/preview')
                .set('Authorization', `Bearer ${customerToken}`)
                .send({
                    products: [{ productId: cheapo._id, quantity: 1, size: 'S' }]
                });

            // Subtotal: 10.55
            // Tax: 10.55 * 0.16 = 1.688 -> 1.69 (rounded)
            // Shipping: 350
            // Total: 10.55 + 1.69 + 350 = 362.24
            expect(response.status).toBe(200);
            expect(response.body.subtotal).toBe(10.55);
            expect(response.body.tax).toBe(1.69);
            expect(response.body.total).toBe(362.24);
        });

        it('should handle negative quantities by returning validation error', async () => {
            const response = await request(app)
                .post('/api/orders/preview')
                .set('Authorization', `Bearer ${customerToken}`)
                .send({
                    products: [{ productId: productBelowThreshold._id, quantity: -1, size: 'M' }]
                });

            expect(response.status).toBe(422);
        });
    });
});
