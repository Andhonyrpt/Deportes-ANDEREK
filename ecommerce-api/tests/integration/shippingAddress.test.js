import request from 'supertest';
import { describe, it, expect, beforeEach } from 'vitest';
import { app } from '../../server.js';
import User from '../../src/models/user.js';
import ShippingAddress from '../../src/models/shippingAddress.js';
import { getAuthToken } from '../helpers/auth.js';

describe('Shipping Address Integration Tests', () => {
    let customerToken;
    let customerToken2; // second user for isolation tests
    let customerUser;

    const validAddressPayload = {
        name: 'Home Address',
        address: 'Calle Falsa 123',
        city: 'Guadalajara',
        state: 'Jalisco',
        postalCode: '44100',
        country: 'México',
        phone: '3312345678',
        isDefault: false,
        addressType: 'home'
    };

    beforeEach(async () => {
        await ShippingAddress.deleteMany({});
        await User.deleteMany({});

        customerToken = await getAuthToken('customer');
        customerToken2 = await getAuthToken('customer', '2');
        customerUser = await User.findOne({ email: 'customer@test.com' });
    });

    describe('POST /api/new-address', () => {
        it('should create a shipping address successfully', async () => {
            const response = await request(app)
                .post('/api/new-address')
                .set('Authorization', `Bearer ${customerToken}`)
                .send(validAddressPayload);

            expect(response.status).toBe(201);
            expect(response.body).toHaveProperty('message', 'Shipping address created successfully');
            expect(response.body.address).toHaveProperty('city', 'Guadalajara');
            expect(response.body.address).toHaveProperty('isDefault', false);
        });

        it('should ensure only one default address exists when setting isDefault: true', async () => {
            // Create first address as default
            await request(app)
                .post('/api/new-address')
                .set('Authorization', `Bearer ${customerToken}`)
                .send({ ...validAddressPayload, isDefault: true });

            // Create second address also as default
            const response = await request(app)
                .post('/api/new-address')
                .set('Authorization', `Bearer ${customerToken}`)
                .send({ ...validAddressPayload, address: 'Avenida Siempre Viva 742', isDefault: true });

            expect(response.status).toBe(201);

            // Get all addresses and verify only 1 is default
            const allAddresses = await ShippingAddress.find({ user: customerUser._id });
            const defaultAddresses = allAddresses.filter(a => a.isDefault === true);
            expect(defaultAddresses).toHaveLength(1);
            expect(defaultAddresses[0].address).toBe('Avenida Siempre Viva 742');
        });

        it('should return 401 without authentication', async () => {
            const response = await request(app)
                .post('/api/new-address')
                .send(validAddressPayload);

            expect(response.status).toBe(401);
        });
    });

    describe('GET /api/user-addresses', () => {
        it('should list user addresses sorted by default first', async () => {
            await request(app)
                .post('/api/new-address')
                .set('Authorization', `Bearer ${customerToken}`)
                .send({ ...validAddressPayload, isDefault: false });

            await request(app)
                .post('/api/new-address')
                .set('Authorization', `Bearer ${customerToken}`)
                .send({ ...validAddressPayload, address: '2nd Street', isDefault: true });

            const response = await request(app)
                .get('/api/user-addresses')
                .set('Authorization', `Bearer ${customerToken}`);

            expect(response.status).toBe(200);
            expect(response.body.count).toBe(2);
            // First address should be the default one
            expect(response.body.addresses[0].isDefault).toBe(true);
        });
    });

    describe('GET /api/user-address/:addressId (data isolation)', () => {
        it("should return 404 when accessing another user's address", async () => {
            // Customer1 creates an address
            const createRes = await request(app)
                .post('/api/new-address')
                .set('Authorization', `Bearer ${customerToken}`)
                .send(validAddressPayload);

            const addressId = createRes.body.address._id;

            // Customer2 tries to access it
            const response = await request(app)
                .get(`/api/user-address/${addressId}`)
                .set('Authorization', `Bearer ${customerToken2}`);

            expect(response.status).toBe(404);
            expect(response.body).toHaveProperty('message', 'Address not found');
        });
    });

    describe('PATCH /api/default/:addressId', () => {
        it('should change default address and unmark previous default', async () => {
            // Create two addresses
            const addr1Res = await request(app)
                .post('/api/new-address')
                .set('Authorization', `Bearer ${customerToken}`)
                .send({ ...validAddressPayload, isDefault: true });

            const addr2Res = await request(app)
                .post('/api/new-address')
                .set('Authorization', `Bearer ${customerToken}`)
                .send({ ...validAddressPayload, address: 'Second Ave', isDefault: false });

            const addr1Id = addr1Res.body.address._id;
            const addr2Id = addr2Res.body.address._id;

            // Set address 2 as default
            const response = await request(app)
                .patch(`/api/default/${addr2Id}`)
                .set('Authorization', `Bearer ${customerToken}`);

            expect(response.status).toBe(200);
            expect(response.body.address.isDefault).toBe(true);

            // Verify address 1 is no longer default
            const addr1InDb = await ShippingAddress.findById(addr1Id);
            expect(addr1InDb.isDefault).toBe(false);
        });
    });

    describe('DELETE /api/delete-address/:addressId (data isolation)', () => {
        it("should return 404 when deleting another user's address", async () => {
            const createRes = await request(app)
                .post('/api/new-address')
                .set('Authorization', `Bearer ${customerToken}`)
                .send(validAddressPayload);

            const addressId = createRes.body.address._id;

            // Customer2 tries to delete it
            const response = await request(app)
                .delete(`/api/delete-address/${addressId}`)
                .set('Authorization', `Bearer ${customerToken2}`);

            expect(response.status).toBe(404);
        });

        it('should delete own address successfully', async () => {
            const createRes = await request(app)
                .post('/api/new-address')
                .set('Authorization', `Bearer ${customerToken}`)
                .send(validAddressPayload);

            const addressId = createRes.body.address._id;

            const response = await request(app)
                .delete(`/api/delete-address/${addressId}`)
                .set('Authorization', `Bearer ${customerToken}`);

            expect(response.status).toBe(200);
            expect(response.body).toHaveProperty('message', 'Address deleted successfully');
        });
    });
});
