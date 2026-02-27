import request from 'supertest';
import { describe, it, expect, beforeEach } from 'vitest';
import { app } from '../../server.js';
import Product from '../../src/models/product.js';
import Category from '../../src/models/category.js';
import SubCategory from '../../src/models/subCategory.js';
import { getAuthToken } from '../helpers/auth.js';

describe('Product Integration Tests', () => {
    let adminToken;
    let customerToken;
    let testSubCategory;

    beforeEach(async () => {
        await Product.deleteMany({});
        await SubCategory.deleteMany({});
        await Category.deleteMany({});

        adminToken = await getAuthToken('admin');
        customerToken = await getAuthToken('customer');

        // Create a test category and sub-category
        const category = await Category.create({
            name: 'Test Category',
            description: 'Test Description'
        });

        testSubCategory = await SubCategory.create({
            name: 'Test SubCategory',
            description: 'Test Description',
            parentCategory: category._id
        });
    });

    describe('GET /api/products', () => {
        it('should return paginated products', async () => {
            await Product.create({
                name: 'Product 1',
                description: 'Description 1',
                modelo: 'Local',
                variants: [{ size: 'M', stock: 10 }],
                price: 100,
                category: testSubCategory._id
            });

            const response = await request(app).get('/api/products');

            expect(response.status).toBe(200);
            expect(response.body).toHaveProperty('products');
            expect(response.body.products).toHaveLength(1);
            expect(response.body).toHaveProperty('pagination');
        });
    });

    describe('POST /api/products', () => {
        it('should create a product as admin', async () => {
            const productData = {
                name: 'New Product',
                description: 'Product Description (at least 10 chars)',
                modelo: 'Local',
                variants: [{ size: 'L', stock: 5 }],
                genre: 'Hombre',
                price: 150,
                category: testSubCategory._id.toString(),
                imagesUrl: ['https://example.com/image.png']
            };

            const response = await request(app)
                .post('/api/products')
                .set('Authorization', `Bearer ${adminToken}`)
                .send(productData);

            expect(response.status).toBe(201);
            expect(response.body).toHaveProperty('name', productData.name);
        });

        it('should return 403 when creating as customer', async () => {
            const response = await request(app)
                .post('/api/products')
                .set('Authorization', `Bearer ${customerToken}`)
                .send({});

            expect(response.status).toBe(403);
            expect(response.body).toHaveProperty('message', 'Admin access required');
        });
    });

    describe('GET /api/products/:id', () => {
        it('should return 404 for non-existent product', async () => {
            const fakeId = '654321654321654321654321';
            const response = await request(app).get(`/api/products/${fakeId}`);

            expect(response.status).toBe(404);
            expect(response.body).toHaveProperty('message', 'Product not found');
        });
    });

    describe('GET /api/products/:id', () => {
        it('should return an existing product by id', async () => {
            const product = await Product.create({
                name: 'Existing Product',
                description: 'A product that exists in the DB',
                modelo: 'Local',
                variants: [{ size: 'L', stock: 5 }],
                price: 99,
                category: testSubCategory._id
            });

            const response = await request(app).get(`/api/products/${product._id}`);

            expect(response.status).toBe(200);
            expect(response.body).toHaveProperty('name', 'Existing Product');
        });
    });

    describe('GET /api/products/search', () => {
        it('should find products by name query', async () => {
            await Product.create({
                name: 'Unique Sneaker',
                description: 'Very unique sneaker description',
                modelo: 'Local',
                variants: [{ size: 'XL', stock: 1 }],
                price: 200,
                category: testSubCategory._id
            });

            const response = await request(app)
                .get('/api/products/search')
                .query({ q: 'Unique' });

            expect(response.status).toBe(200);
            expect(response.body.products).toHaveLength(1);
            expect(response.body.products[0]).toHaveProperty('name', 'Unique Sneaker');
        });

        it('should filter products by price range', async () => {
            await Product.create({ name: 'Cheap', description: 'Desc min 10 chars', modelo: 'Local', variants: [{ size: 'S', stock: 3 }], price: 50, category: testSubCategory._id });
            await Product.create({ name: 'Expensive', description: 'Desc min 10 chars', modelo: 'Local', variants: [{ size: 'S', stock: 3 }], price: 500, category: testSubCategory._id });

            const response = await request(app)
                .get('/api/products/search')
                .query({ minPrice: 100, maxPrice: 600 });

            expect(response.status).toBe(200);
            expect(response.body.products.every(p => p.price >= 100 && p.price <= 600)).toBe(true);
        });

        it('should filter only in-stock products', async () => {
            await Product.create({ name: 'In Stock', description: 'Desc min 10 chars', modelo: 'Local', variants: [{ size: 'M', stock: 5 }], price: 100, category: testSubCategory._id });
            await Product.create({ name: 'Out Stock', description: 'Desc min 10 chars', modelo: 'Local', variants: [{ size: 'M', stock: 0 }], price: 100, category: testSubCategory._id });

            const response = await request(app)
                .get('/api/products/search')
                .query({ inStock: 'true' });

            expect(response.status).toBe(200);
            expect(response.body.products.every(p => p.variants.some(v => v.stock > 0))).toBe(true);
        });
    });

    describe('PUT /api/products/:id', () => {
        let testProduct;

        beforeEach(async () => {
            testProduct = await Product.create({
                name: 'Update Me',
                description: 'A product to be updated',
                modelo: 'Local',
                variants: [{ size: 'M', stock: 10 }],
                price: 100,
                category: testSubCategory._id
            });
        });

        it('should update a product as admin', async () => {
            const response = await request(app)
                .put(`/api/products/${testProduct._id}`)
                .set('Authorization', `Bearer ${adminToken}`)
                .send({
                    name: 'Updated Name',
                    price: 250,
                    modelo: 'Visitante',
                    genre: 'Hombre',
                    // Variants are required by the validator (stockValidation is notEmpty)
                    variants: [{ size: 'M', stock: 10 }]
                });

            expect(response.status).toBe(200);
            expect(response.body).toHaveProperty('name', 'Updated Name');
            expect(response.body).toHaveProperty('price', 250);
        });

        it('should return 400 or 422 when updating without any updatable field', async () => {
            const response = await request(app)
                .put(`/api/products/${testProduct._id}`)
                .set('Authorization', `Bearer ${adminToken}`)
                .send({});

            // Validators may return 422 (express-validator), controller returns 400;
            // Both are valid rejections for an empty body.
            expect([400, 422]).toContain(response.status);
        });

        it('should return 404 for non-existent product (valid ID format)', async () => {
            const fakeId = '654321654321654321654321';
            const response = await request(app)
                .put(`/api/products/${fakeId}`)
                .set('Authorization', `Bearer ${adminToken}`)
                .send({
                    name: 'Ghost Product',
                    modelo: 'Local',
                    genre: 'Hombre',
                    variants: [{ size: 'M', stock: 1 }] // include variants to satisfy validator
                });

            expect(response.status).toBe(404);
        });

        it('should return 403 when updating as customer', async () => {
            const response = await request(app)
                .put(`/api/products/${testProduct._id}`)
                .set('Authorization', `Bearer ${customerToken}`)
                .send({ name: 'Hacked' });

            expect(response.status).toBe(403);
        });
    });

    describe('DELETE /api/products/:id', () => {
        it('should delete a product as admin', async () => {
            const product = await Product.create({
                name: 'Delete Me',
                description: 'Product to be deleted',
                modelo: 'Local',
                variants: [{ size: 'S', stock: 1 }],
                price: 10,
                category: testSubCategory._id
            });

            const response = await request(app)
                .delete(`/api/products/${product._id}`)
                .set('Authorization', `Bearer ${adminToken}`);

            expect(response.status).toBe(204);

            // Verify it no longer exists
            const found = await Product.findById(product._id);
            expect(found).toBeNull();
        });

        it('should return 404 for deleting non-existent product', async () => {
            const fakeId = '654321654321654321654321';
            const response = await request(app)
                .delete(`/api/products/${fakeId}`)
                .set('Authorization', `Bearer ${adminToken}`);

            expect(response.status).toBe(404);
        });

        it('should return 403 when deleting as customer', async () => {
            const product = await Product.create({
                name: 'Guarded',
                description: 'Customer cannot delete this',
                modelo: 'Local',
                variants: [{ size: 'L', stock: 2 }],
                price: 50,
                category: testSubCategory._id
            });

            const response = await request(app)
                .delete(`/api/products/${product._id}`)
                .set('Authorization', `Bearer ${customerToken}`);

            expect(response.status).toBe(403);
        });
    });

    describe('POST /api/products (edge cases)', () => {
        it('should return 400 or 422 when category (SubCategory) does not exist', async () => {
            const response = await request(app)
                .post('/api/products')
                .set('Authorization', `Bearer ${adminToken}`)
                .send({
                    name: 'Ghost Category Product',
                    description: 'Desc at least 10 chars',
                    modelo: 'Local',
                    variants: [{ size: 'M', stock: 5 }],
                    genre: 'Hombre',
                    price: 100,
                    category: '654321654321654321654321' // non-existent subcategory
                });

            // Route validator may reject invalid category ID, controller returns 400 with 'Invalid category'
            expect([400, 422]).toContain(response.status);
        });

        it('should return 401 when creating a product without authentication', async () => {
            const response = await request(app)
                .post('/api/products')
                .send({ name: 'Unauthorized' });

            expect(response.status).toBe(401);
        });
    });
});
