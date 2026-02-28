import request from 'supertest';
import { describe, it, expect, beforeEach } from 'vitest';
import { app } from '../../server.js';
import User from '../../src/models/user.js';
import Product from '../../src/models/product.js';
import Cart from '../../src/models/cart.js';
import Category from '../../src/models/category.js';
import SubCategory from '../../src/models/subCategory.js';
import { getAuthToken } from '../helpers/auth.js';

describe('Cart IDOR Security Tests', () => {
    let userAToken, userA;
    let userBToken, userB;
    let testProduct;

    beforeEach(async () => {
        await Cart.deleteMany({});
        await User.deleteMany({});
        await Product.deleteMany({});
        await Category.deleteMany({});
        await SubCategory.deleteMany({});

        // Create User A
        userAToken = await getAuthToken('customer', 'A');
        userA = await User.findOne({ email: 'customerA@test.com' });

        // Create User B
        userBToken = await getAuthToken('customer', 'B');
        userB = await User.findOne({ email: 'customerB@test.com' });

        // Create a product
        const cat = await Category.create({ name: 'Sec Cat', description: 'Desc' });
        const sub = await SubCategory.create({ name: 'Sec Sub', description: 'Desc', parentCategory: cat._id });
        testProduct = await Product.create({
            name: 'Sec Product',
            description: 'Security Test Product Description',
            modelo: 'Local',
            price: 100,
            variants: [{ size: 'M', stock: 10 }],
            category: sub._id
        });
    });

    it('should NOT allow User A to view User B\'s cart (GET /api/cart/user/:userId)', async () => {
        const response = await request(app)
            .get(`/api/cart/user/${userB._id}`)
            .set('Authorization', `Bearer ${userAToken}`);

        expect(response.status).toBe(403);
        expect(response.body.message).toMatch(/not allowed/i);
    });

    it('should ignore userId in body and update User A\'s own cart (POST /api/cart/add)', async () => {
        // User A adds product but sends User B's ID in body
        const response = await request(app)
            .post('/api/cart/add')
            .set('Authorization', `Bearer ${userAToken}`)
            .send({
                userId: userB._id.toString(), // Attempting IDOR
                productId: testProduct._id.toString(),
                quantity: 1,
                size: 'M'
            });

        expect(response.status).toBe(200);
        // The ID in the response should be User A's cart
        expect(response.body.cart.user._id.toString()).toBe(userA._id.toString());

        // Verify User B still has no cart
        const userBCart = await Cart.findOne({ user: userB._id });
        expect(userBCart).toBeNull();
    });

    it('should NOT allow User A to update items in User B\'s cart (PUT /api/cart/update-item)', async () => {
        // First, manually create a cart for User B
        await Cart.create({
            user: userB._id,
            products: [{ product: testProduct._id, quantity: 1, size: 'M' }]
        });

        // User A tries to update User B's cart item
        const response = await request(app)
            .put('/api/cart/update-item')
            .set('Authorization', `Bearer ${userAToken}`)
            .send({
                userId: userB._id.toString(), // IDOR attempt
                productId: testProduct._id.toString(),
                size: 'M',
                quantity: 10
            });

        // Since the controller now uses req.user.userId, it will look for User A's cart
        // and return 404 (Cart not found) since User A has no cart yet.
        expect(response.status).toBe(404);

        // Verify User B's cart is untouched
        const userBCart = await Cart.findOne({ user: userB._id });
        expect(userBCart.products[0].quantity).toBe(1);
    });

    it('should NOT allow User A to clear User B\'s cart (POST /api/cart/clear)', async () => {
        await Cart.create({
            user: userB._id,
            products: [{ product: testProduct._id, quantity: 1, size: 'M' }]
        });

        const response = await request(app)
            .post('/api/cart/clear')
            .set('Authorization', `Bearer ${userAToken}`)
            .send({ userId: userB._id.toString() });

        expect(response.status).toBe(404); // User A has no cart

        const userBCart = await Cart.findOne({ user: userB._id });
        expect(userBCart.products).toHaveLength(1);
    });

    it('should allow admin to view any user\'s cart', async () => {
        const adminToken = await getAuthToken('admin');

        // Create a cart for User B
        await Cart.create({
            user: userB._id,
            products: [{ product: testProduct._id, quantity: 1, size: 'M' }]
        });

        const response = await request(app)
            .get(`/api/cart/user/${userB._id}`)
            .set('Authorization', `Bearer ${adminToken}`);

        expect(response.status).toBe(200);
        expect(response.body.user._id.toString()).toBe(userB._id.toString());
    });
});
