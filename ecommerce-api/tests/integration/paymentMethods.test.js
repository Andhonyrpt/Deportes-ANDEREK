import request from 'supertest';
import { describe, it, expect, beforeEach } from 'vitest';
import { app } from '../../server.js';
import User from '../../src/models/user.js';
import PaymentMethod from '../../src/models/paymentMethod.js';
import { getAuthToken } from '../helpers/auth.js';

describe('Payment Method Integration Tests', () => {
    let adminToken;
    let customerToken;
    let customerToken2;
    let customerUser;

    const validCreditCardPayload = {
        type: 'credit_card',
        cardNumber: '1111222233334444',
        cardHolderName: 'Test User',
        expiryDate: '12/28',
        isDefault: false
    };

    beforeEach(async () => {
        await PaymentMethod.deleteMany({});
        await User.deleteMany({});

        adminToken = await getAuthToken('admin');
        customerToken = await getAuthToken('customer');
        customerToken2 = await getAuthToken('customer', '2');
        customerUser = await User.findOne({ email: 'customer@test.com' });
    });

    describe('POST /api/payment-methods', () => {
        it('should create a credit card payment method', async () => {
            const response = await request(app)
                .post('/api/payment-methods')
                .set('Authorization', `Bearer ${customerToken}`)
                .send(validCreditCardPayload);

            console.log("PAYMENT METHOD CREATE RESPONSE:", response.body);
            expect(response.status).toBe(201);
            expect(response.body).toHaveProperty('type', 'credit_card');
        });

        it('should return 422 for invalid payment type', async () => {
            const response = await request(app)
                .post('/api/payment-methods')
                .set('Authorization', `Bearer ${customerToken}`)
                .send({ ...validCreditCardPayload, type: 'bitcoin' }); // invalid type

            expect(response.status).toBe(422);
            expect(response.body).toHaveProperty('errors');
        });

        it('should return 422 for invalid expiry date format', async () => {
            const response = await request(app)
                .post('/api/payment-methods')
                .set('Authorization', `Bearer ${customerToken}`)
                .send({ ...validCreditCardPayload, expiryDate: '2028-12' }); // wrong format (should be MM/YY)

            expect(response.status).toBe(422);
            expect(response.body).toHaveProperty('errors');
        });

        it('should ensure only one default when setting isDefault: true', async () => {
            // Create first payment method as default
            await request(app)
                .post('/api/payment-methods')
                .set('Authorization', `Bearer ${customerToken}`)
                .send({ ...validCreditCardPayload, isDefault: true });

            // Create second as default— should unmark the first
            const response = await request(app)
                .post('/api/payment-methods')
                .set('Authorization', `Bearer ${customerToken}`)
                .send({ ...validCreditCardPayload, cardNumber: '5555666677778888', isDefault: true });

            expect(response.status).toBe(201);

            const allMethods = await PaymentMethod.find({ user: customerUser._id });
            const defaults = allMethods.filter(m => m.isDefault === true);
            expect(defaults).toHaveLength(1);
            expect(defaults[0].cardNumber).toBe('5555666677778888');
        });
    });

    describe('PUT /api/payment-methods/:id (ownership)', () => {
        it("should return 403 when updating another user's payment method", async () => {
            // Customer1 creates a payment method
            const createRes = await request(app)
                .post('/api/payment-methods')
                .set('Authorization', `Bearer ${customerToken}`)
                .send(validCreditCardPayload);

            const methodId = createRes.body._id;

            // Customer2 tries to update it
            const response = await request(app)
                .put(`/api/payment-methods/${methodId}`)
                .set('Authorization', `Bearer ${customerToken2}`)
                .send({ cardHolderName: 'Hacker' });

            expect(response.status).toBe(403);
        });
    });

    describe('DELETE /api/payment-methods/:id (ownership)', () => {
        it("should return 403 when deleting another user's payment method", async () => {
            const createRes = await request(app)
                .post('/api/payment-methods')
                .set('Authorization', `Bearer ${customerToken}`)
                .send(validCreditCardPayload);

            const methodId = createRes.body._id;

            const response = await request(app)
                .delete(`/api/payment-methods/${methodId}`)
                .set('Authorization', `Bearer ${customerToken2}`);

            expect(response.status).toBe(403);
        });

        it('should delete own payment method', async () => {
            const createRes = await request(app)
                .post('/api/payment-methods')
                .set('Authorization', `Bearer ${customerToken}`)
                .send(validCreditCardPayload);

            const methodId = createRes.body._id;

            const response = await request(app)
                .delete(`/api/payment-methods/${methodId}`)
                .set('Authorization', `Bearer ${customerToken}`);

            expect(response.status).toBe(204);
        });
    });
});
