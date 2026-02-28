import request from 'supertest';
import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { app } from '../../server.js';
import Category from '../../src/models/category.js';
import User from '../../src/models/user.js';
import jwt from 'jsonwebtoken';

describe('Category Integrity & Cycles', () => {
    let adminToken;
    let catA, catB;

    beforeAll(async () => {
        await User.deleteMany({});
        await Category.deleteMany({});

        const admin = await User.create({
            displayName: 'Admin',
            email: 'admin@example.com',
            hashPassword: 'password',
            role: 'admin',
            phone: '1112223334'
        });
        adminToken = jwt.sign({ userId: admin._id, role: admin.role }, process.env.JWT_SECRET);

        catA = await Category.create({ name: 'Category A', description: 'Desc A' });
        catB = await Category.create({ name: 'Category B', description: 'Desc B', parentCategory: catA._id });
    });

    afterAll(async () => {
        await User.deleteMany({});
        await Category.deleteMany({});
    });

    it('should NOT allow a category to be its own parent', async () => {
        const response = await request(app)
            .put(`/api/categories/${catA._id}`)
            .set('Authorization', `Bearer ${adminToken}`)
            .send({ parentCategory: catA._id });

        expect(response.status).toBe(400);
        expect(response.body.message).toContain('own parent');
    });

    it('should NOT allow creating a circular reference (A -> B -> A)', async () => {
        // Trying to set A's parent as B, but B's parent is already A
        const response = await request(app)
            .put(`/api/categories/${catA._id}`)
            .set('Authorization', `Bearer ${adminToken}`)
            .send({ parentCategory: catB._id });

        expect(response.status).toBe(400);
        expect(response.body.message).toContain('Circular reference');
    });

    it('should ALLOW a valid parent update', async () => {
        const catC = await Category.create({ name: 'Category C', description: 'Desc C' });
        const response = await request(app)
            .put(`/api/categories/${catB._id}`)
            .set('Authorization', `Bearer ${adminToken}`)
            .send({ parentCategory: catC._id });

        expect(response.status).toBe(200);
        const updatedCatB = await Category.findById(catB._id);
        expect(updatedCatB.parentCategory.toString()).toBe(catC._id.toString());
    });
});
