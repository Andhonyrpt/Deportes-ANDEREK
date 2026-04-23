import { describe, it, expect, vi, beforeEach } from 'vitest';
import { 
    createShippingAddress, 
    setDefaultAddress, 
    getUserAddresses, 
    getAddressById, 
    getDefaultAddress, 
    updateShippingAddress, 
    deleteShippingAddress 
} from '../../src/controllers/shippingAddressController.js';
import { setDefaultPaymentMethod, updatePaymentMethod } from '../../src/controllers/paymentMethodController.js';
import ShippingAddress from '../../src/models/shippingAddress.js';
import PaymentMethod from '../../src/models/paymentMethod.js';
import { createMockReqRes } from '../helpers/createMockReqRes.js';

// Mock dependencias
vi.mock('../../src/models/shippingAddress.js', () => {
    const mockModel = vi.fn().mockImplementation(function (data) {
        Object.assign(this, data);
        this.save = vi.fn().mockResolvedValue(this);
        this._id = 'mock_id_123';
    });
    mockModel.updateMany = vi.fn().mockResolvedValue({ modifiedCount: 1 });
    mockModel.findOne = vi.fn();
    mockModel.find = vi.fn();
    mockModel.findByIdAndDelete = vi.fn();
    return { default: mockModel };
});
vi.mock('../../src/models/paymentMethod.js');

describe('Shipping & Payment Unit Tests', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe('ShippingAddress Controller', () => {
        it('should create a new default address', async () => {
            const { req, res, next } = createMockReqRes({
                body: { name: 'Home', isDefault: true, address: 'St 1', city: 'City', state: 'TS', postalCode: '12345', phone: '123' },
                user: { userId: 'user123' }
            });

            ShippingAddress.updateMany.mockResolvedValue({ modifiedCount: 1 });
            
            await createShippingAddress(req, res, next);

            expect(res.status).toHaveBeenCalledWith(201);
        });

        it('should call updateMany when setting a default address', async () => {
            const { req, res, next } = createMockReqRes({
                params: { addressId: 'addr123' },
                user: { userId: 'user123' }
            });

            const mockAddr = { _id: 'addr123', isDefault: false, save: vi.fn() };
            ShippingAddress.findOne.mockResolvedValue(mockAddr);
            ShippingAddress.updateMany.mockResolvedValue(true);

            await setDefaultAddress(req, res, next);

            expect(res.status).toHaveBeenCalledWith(200);
            expect(mockAddr.isDefault).toBe(true);
        });

        it('should return user addresses', async () => {
            const { req, res, next } = createMockReqRes({ user: { userId: 'user1' } });
            const mockAddrs = [{ name: 'Home' }];
            ShippingAddress.find.mockReturnValue({
                sort: vi.fn().mockResolvedValue(mockAddrs)
            });

            await getUserAddresses(req, res, next);

            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ count: 1 }));
        });

        it('should return address by id', async () => {
            const { req, res, next } = createMockReqRes({ 
                params: { addressId: 'addr1' },
                user: { userId: 'user1' }
            });
            const mockAddr = { _id: 'addr1', user: 'user1' };
            ShippingAddress.findOne.mockResolvedValue(mockAddr);

            await getAddressById(req, res, next);

            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ address: mockAddr }));
        });

        it('should return 404 if address not found by id', async () => {
            const { req, res, next } = createMockReqRes({ 
                params: { addressId: 'none' },
                user: { userId: 'user1' }
            });
            ShippingAddress.findOne.mockResolvedValue(null);

            await getAddressById(req, res, next);

            expect(res.status).toHaveBeenCalledWith(404);
        });

        it('should return default address', async () => {
            const { req, res, next } = createMockReqRes({ user: { userId: 'user1' } });
            const mockAddr = { isDefault: true };
            ShippingAddress.findOne.mockResolvedValue(mockAddr);

            await getDefaultAddress(req, res, next);

            expect(res.status).toHaveBeenCalledWith(200);
        });

        it('should update shipping address', async () => {
            const { req, res, next } = createMockReqRes({
                params: { addressId: 'addr1' },
                user: { userId: 'user1' },
                body: { name: 'Work' }
            });
            const mockAddr = { _id: 'addr1', user: 'user1', name: 'Home', save: vi.fn() };
            ShippingAddress.findOne.mockResolvedValue(mockAddr);

            await updateShippingAddress(req, res, next);

            expect(mockAddr.name).toBe('Work');
            expect(mockAddr.save).toHaveBeenCalled();
            expect(res.status).toHaveBeenCalledWith(200);
        });

        it('should delete shipping address', async () => {
            const { req, res, next } = createMockReqRes({
                params: { addressId: 'addr1' },
                user: { userId: 'user1' }
            });
            ShippingAddress.findOne.mockResolvedValue({ _id: 'addr1' });
            ShippingAddress.findByIdAndDelete.mockResolvedValue(true);

            await deleteShippingAddress(req, res, next);

            expect(res.status).toHaveBeenCalledWith(200);
        });
    });

    describe('PaymentMethod Controller', () => {
        it('should return 403 if user attempts to update a payment method they do not own', async () => {
            const { req, res, next } = createMockReqRes({
                params: { id: 'pay123' },
                body: { isDefault: true },
                user: { userId: 'hacker_id', role: 'customer' }
            });

            const mockPayment = {
                _id: 'pay123',
                user: 'owner_id',
                type: 'credit_card'
            };
            PaymentMethod.findById.mockResolvedValue(mockPayment);

            await updatePaymentMethod(req, res, next);

            expect(next).toHaveBeenCalledWith(expect.objectContaining({
                statusCode: 403
            }));
        });
    });
});
