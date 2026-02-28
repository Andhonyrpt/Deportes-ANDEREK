import request from 'supertest';
import { describe, it, expect, beforeEach } from 'vitest';
import { app } from '../../server.js';
import User from '../../src/models/user.js';
import Product from '../../src/models/product.js';
import Order from '../../src/models/order.js';
import Category from '../../src/models/category.js';
import SubCategory from '../../src/models/subCategory.js';
import ShippingAddress from '../../src/models/shippingAddress.js';
import PaymentMethod from '../../src/models/paymentMethod.js';
import { getAuthToken } from '../helpers/auth.js';

describe('Order Concurrency & Race Conditions', () => {
    let users = [];
    let tokens = [];
    let testProduct;
    let shippingAddress, paymentMethod;

    beforeEach(async () => {
        await Order.deleteMany({});
        await Product.deleteMany({});
        await User.deleteMany({});
        await Category.deleteMany({});
        await SubCategory.deleteMany({});
        await ShippingAddress.deleteMany({});
        await PaymentMethod.deleteMany({});

        users = [];
        tokens = [];

        // Create 2 users
        for (let i = 0; i < 2; i++) {
            const token = await getAuthToken('customer', `${i}`);
            const user = await User.findOne({ email: `customer${i}@test.com` });
            tokens.push(token);
            users.push(user);
        }

        const cat = await Category.create({ name: 'Stock Cat', description: 'Desc' });
        const sub = await SubCategory.create({ name: 'Stock Sub', description: 'Desc', parentCategory: cat._id });

        // Product with only 1 item in stock
        testProduct = await Product.create({
            name: 'Last Item',
            description: 'Race condition target',
            modelo: 'Local',
            price: 100,
            variants: [{ size: 'M', stock: 1 }],
            category: sub._id
        });

        shippingAddress = await ShippingAddress.create({
            user: users[0]._id, name: 'Home', address: '123 St', city: 'City', state: 'ST', postalCode: '12345', phone: '1234567890'
        });
        paymentMethod = await PaymentMethod.create({
            user: users[0]._id, type: 'credit_card', cardHolderName: 'User', cardNumber: '1234567890123456', expiryDate: '12/25'
        });
    });

    it('should NOT allow over-selling when multiple users buy the last item simultaneously', async () => {
        const orderDataUser0 = {
            user: users[0]._id.toString(),
            products: [{
                productId: testProduct._id.toString(),
                quantity: 1,
                size: 'M',
                price: 100
            }],
            shippingAddress: shippingAddress._id.toString(),
            paymentMethod: paymentMethod._id.toString()
        };

        const orderDataUser1 = {
            user: users[1]._id.toString(),
            products: [{
                productId: testProduct._id.toString(),
                quantity: 1,
                size: 'M',
                price: 100
            }],
            shippingAddress: shippingAddress._id.toString(),
            paymentMethod: paymentMethod._id.toString()
        };

        // Execute two requests almost at the same time
        const results = await Promise.all([
            request(app).post('/api/orders').set('Authorization', `Bearer ${tokens[0]}`).send(orderDataUser0),
            request(app).post('/api/orders').set('Authorization', `Bearer ${tokens[1]}`).send(orderDataUser1)
        ]);

        const statuses = results.map(r => r.status);
        const successes = statuses.filter(s => s === 201).length;
        const failures = statuses.filter(s => s >= 400).length;

        const finalProduct = await Product.findById(testProduct._id);
        const stockSizeM = finalProduct.variants.find(v => v.size === 'M').stock;

        console.log(`Statuses: ${statuses}`);
        console.log(`Successes: ${successes}, Failures: ${failures}`);
        console.log(`Final stock: ${stockSizeM}`);

        // One should succeed, one should fail (if handled correctly)
        // If both succeed, it proves a race condition bug exists
        expect(successes, "Overselling detected! Both orders succeeded but only 1 item was in stock.").toBe(1);
        expect(stockSizeM).toBeGreaterThanOrEqual(0);
    });
});
