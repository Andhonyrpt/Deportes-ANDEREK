import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createShippingAddress, setDefaultAddress } from '../../src/controllers/shippingAddressController.js';
import { setDefaultPaymentMethod, updatePaymentMethod } from '../../src/controllers/paymentMethodController.js';
import ShippingAddress from '../../src/models/shippingAddress.js';
import PaymentMethod from '../../src/models/paymentMethod.js';
import { createMockReqRes } from '../helpers/createMockReqRes.js';

// Mock dependencias
vi.mock('../../src/models/shippingAddress.js');
vi.mock('../../src/models/paymentMethod.js');

describe('Shipping & Payment Unit Tests', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe('ShippingAddress Controller', () => {
        it('should call updateMany to deselect previous defaults when creating a new default address', async () => {
            const { req, res, next } = createMockReqRes({
                body: { name: 'Home', isDefault: true },
                user: { userId: 'user123' }
            });

            ShippingAddress.updateMany.mockResolvedValue({ modifiedCount: 1 });
            const saveMock = vi.fn().mockResolvedValue(true);
            ShippingAddress.prototype.save = saveMock;

            await createShippingAddress(req, res, next);

            expect(ShippingAddress.updateMany).toHaveBeenCalledWith(
                { user: 'user123' },
                { isDefault: false }
            );
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

            expect(ShippingAddress.updateMany).toHaveBeenCalledWith(
                { user: 'user123' },
                { isDefault: false }
            );
            expect(mockAddr.isDefault).toBe(true);
            expect(mockAddr.save).toHaveBeenCalled();
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
                user: 'owner_id', // Different owner
                type: 'credit_card'
            };
            PaymentMethod.findById.mockResolvedValue(mockPayment);

            await updatePaymentMethod(req, res, next);

            expect(next).toHaveBeenCalledWith(expect.objectContaining({
                statusCode: 403,
                message: "You are not allowed to modify this payment method"
            }));
        });

        it('should return 400 when setting an inactive payment method as default', async () => {
            const { req, res, next } = createMockReqRes({
                params: { id: 'pay123' },
                user: { userId: 'owner_id' }
            });

            const mockPayment = {
                _id: 'pay123',
                user: 'owner_id',
                isActive: false
            };
            PaymentMethod.findById.mockResolvedValue(mockPayment);

            await setDefaultPaymentMethod(req, res, next);

            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({ message: 'Cannot set inactive payment method as default' });
        });
    });
});
