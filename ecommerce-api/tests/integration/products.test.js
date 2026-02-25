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
    });
});
