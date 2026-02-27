import request from 'supertest';
import { describe, it, expect, beforeEach } from 'vitest';
import { app } from '../../server.js';
import User from '../../src/models/user.js';
import Category from '../../src/models/category.js';
import SubCategory from '../../src/models/subCategory.js';
import { getAuthToken } from '../helpers/auth.js';

describe('Category & SubCategory Integration Tests', () => {
    let adminToken;
    let customerToken;
    let parentCategory;

    beforeEach(async () => {
        await SubCategory.deleteMany({});
        await Category.deleteMany({});
        await User.deleteMany({});

        adminToken = await getAuthToken('admin');
        customerToken = await getAuthToken('customer');

        parentCategory = await Category.create({
            name: 'Parent Category',
            description: 'A parent category'
        });
    });

    describe('GET /api/categories', () => {
        it('should list all categories', async () => {
            const response = await request(app).get('/api/categories');

            expect(response.status).toBe(200);
            expect(Array.isArray(response.body)).toBe(true);
            expect(response.body.length).toBeGreaterThanOrEqual(1);
        });
    });

    describe('GET /api/categories/:id', () => {
        it('should return an existing category', async () => {
            const response = await request(app).get(`/api/categories/${parentCategory._id}`);

            expect(response.status).toBe(200);
            expect(response.body).toHaveProperty('name', 'Parent Category');
        });

        it('should return 404 for non-existent category', async () => {
            const response = await request(app).get('/api/categories/654321654321654321654321');

            expect(response.status).toBe(404);
            expect(response.body).toHaveProperty('message', 'Category not found');
        });
    });

    describe('POST /api/categories', () => {
        it('admin should create a root category', async () => {
            const response = await request(app)
                .post('/api/categories')
                .set('Authorization', `Bearer ${adminToken}`)
                .send({ name: 'New Root Category', description: 'A new root category' });

            expect(response.status).toBe(201);
            expect(response.body).toHaveProperty('name', 'New Root Category');
        });

        it('should return 403 without admin role', async () => {
            const response = await request(app)
                .post('/api/categories')
                .set('Authorization', `Bearer ${customerToken}`)
                .send({ name: 'Hacked Category', description: 'Should not work' });

            expect(response.status).toBe(403);
        });
    });

    describe('DELETE /api/categories/:id', () => {
        it('should return 400 when deleting a category with subcategories', async () => {
            // Create a subcategory under parentCategory
            await SubCategory.create({
                name: 'Child Sub',
                description: 'Child subcat',
                parentCategory: parentCategory._id
            });

            // Now try to delete the parent
            const response = await request(app)
                .delete(`/api/categories/${parentCategory._id}`)
                .set('Authorization', `Bearer ${adminToken}`);

            expect(response.status).toBe(400);
            expect(response.body).toHaveProperty('message', 'Cannot delete category with subcategories');
        });

        it('should delete a leaf category (no children)', async () => {
            const leafCat = await Category.create({ name: 'Leaf', description: 'No children' });

            const response = await request(app)
                .delete(`/api/categories/${leafCat._id}`)
                .set('Authorization', `Bearer ${adminToken}`);

            expect(response.status).toBe(204);
        });
    });

    describe('GET /api/categories/search', () => {
        it('should search categories by query', async () => {
            const response = await request(app)
                .get('/api/categories/search')
                .query({ q: 'Parent' });

            expect(response.status).toBe(200);
            expect(response.body.categories).toBeDefined();
            expect(response.body.categories.length).toBeGreaterThanOrEqual(1);
        });
    });

    // ─── SubCategory ─────────────────────────────────────────────────────────

    describe('SubCategory Operations', () => {
        it('admin should create a subcategory', async () => {
            const response = await request(app)
                .post('/api/subcategories')
                .set('Authorization', `Bearer ${adminToken}`)
                .send({
                    name: 'New SubCategory',
                    description: 'A new subcategory',
                    parentCategory: parentCategory._id.toString()
                });

            expect(response.status).toBe(201);
            expect(response.body).toHaveProperty('name', 'New SubCategory');
        });

        it('customer should be denied creating a subcategory', async () => {
            const response = await request(app)
                .post('/api/subcategories')
                .set('Authorization', `Bearer ${customerToken}`)
                .send({ name: 'Hack Sub', description: 'Nope', parentCategory: parentCategory._id.toString() });

            expect(response.status).toBe(403);
        });

        it('should list all subcategories', async () => {
            await SubCategory.create({ name: 'Sub1', description: 'Desc', parentCategory: parentCategory._id });

            const response = await request(app).get('/api/subcategories');

            expect(response.status).toBe(200);
            expect(Array.isArray(response.body)).toBe(true);
        });
    });
});
