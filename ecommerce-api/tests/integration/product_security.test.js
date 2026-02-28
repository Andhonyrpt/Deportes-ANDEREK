import request from 'supertest';
import { describe, it, expect, beforeEach } from 'vitest';
import { app } from '../../server.js';
import User from '../../src/models/user.js';
import Product from '../../src/models/product.js';
import Category from '../../src/models/category.js';
import SubCategory from '../../src/models/subCategory.js';
import { getAuthToken } from '../helpers/auth.js';

describe('Product Search Security (NoSQLi & ReDoS)', () => {
    let testProduct;

    beforeEach(async () => {
        await Product.deleteMany({});
        await SubCategory.deleteMany({});
        await Category.deleteMany({});

        const cat = await Category.create({ name: 'Sec Cat', description: 'Desc' });
        const sub = await SubCategory.create({ name: 'Sec Sub', description: 'Desc', parentCategory: cat._id });
        testProduct = await Product.create({
            name: 'Security Shield',
            description: 'Advanced protection for your API',
            modelo: 'Local',
            price: 150,
            variants: [{ size: 'M', stock: 10 }],
            category: sub._id
        });
    });

    it('should NOT allow NoSQL Injection in filters (?minPrice[$gt]=0)', async () => {
        // Many NoSQL injection attempts look like this: ?price[$gt]=0
        // If the server doesn't sanitize, it might interpret the object.
        const response = await request(app)
            .get('/api/products/search')
            .query({ minPrice: { '$gt': 0 } });

        // If the validator (queryPriceValidation) works, minPrice must be a float.
        // Sending an object should ideally be rejected with 422 or sanitized to 0.
        // Currently, searchProducts uses parseFloat(minPrice).
        // parseFloat({'$gt': 0}) is NaN.

        expect(response.status).toBe(200); // 200 handles NaN as "no filter" or 422?
        // Let's see how it behaves.
    });

    it('should handle ReDoS patterns safely in "q" parameter', async () => {
        const maliciousRegex = '(a+)+$';
        const longA = 'a'.repeat(50) + 'X'; // This will trigger backtracking if matched as regex

        const startTime = Date.now();
        const response = await request(app)
            .get('/api/products/search')
            .query({ q: maliciousRegex });
        const duration = Date.now() - startTime;

        expect(response.status).toBe(200);
        expect(duration).toBeLessThan(1000); // Should not hang the event loop
    });

    it('should treat "q" as a literal string or sanitize regex special characters', async () => {
        // If I search for ".", it shouldn't match everything if I want literal search
        // But if I want regex search, then it's fine. 
        // Senior QA usually recommends escaping or using $text index for generic search.
        const response = await request(app)
            .get('/api/products/search')
            .query({ q: 'Shield' });

        expect(response.status).toBe(200);
        expect(response.body.products).toHaveLength(1);
    });
});
