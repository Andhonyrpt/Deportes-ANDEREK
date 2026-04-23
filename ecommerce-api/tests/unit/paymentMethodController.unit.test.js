import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  getPaymentMethods,
  getPaymentMethodById,
  getPaymentMethodsByUser,
  createPaymentMethod,
  updatePaymentMethod,
  setDefaultPaymentMethod,
  deactivatePaymentMethod,
  deletePaymentMethod,
  getDefaultPaymentMethod
} from '../../src/controllers/paymentMethodController.js';
import PaymentMethod from '../../src/models/paymentMethod.js';
import { createMockReqRes } from '../helpers/createMockReqRes.js';

vi.mock('../../src/models/paymentMethod.js');

describe('paymentMethodController Unit Tests', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe('getPaymentMethodById', () => {
        it('should return 404 if not found', async () => {
            const { req, res, next } = createMockReqRes({ params: { id: 'none' } });
            PaymentMethod.findById.mockReturnValue({
                populate: vi.fn().mockResolvedValue(null)
            });
            await getPaymentMethodById(req, res, next);
            expect(res.status).toHaveBeenCalledWith(404);
        });
    });

    describe('createPaymentMethod', () => {
        it('should create a credit card payment method', async () => {
            const { req, res, next } = createMockReqRes({
                body: { type: 'credit_card', cardNumber: '1234123412341234', cardHolderName: 'Test', expiryDate: '12/25' },
                user: { userId: 'u1' }
            });
            const mockPay = { _id: 'p1', populate: vi.fn() };
            PaymentMethod.create.mockResolvedValue(mockPay);
            PaymentMethod.updateMany.mockResolvedValue(true);

            await createPaymentMethod(req, res, next);
            expect(res.status).toHaveBeenCalledWith(201);
        });

        it('should create a paypal payment method', async () => {
            const { req, res, next } = createMockReqRes({
                body: { type: 'paypal', paypalEmail: 'test@test.com' },
                user: { userId: 'u1' }
            });
            const mockPay = { _id: 'p1', populate: vi.fn() };
            PaymentMethod.create.mockResolvedValue(mockPay);

            await createPaymentMethod(req, res, next);
            expect(res.status).toHaveBeenCalledWith(201);
        });

        it('should create a bank transfer payment method', async () => {
            const { req, res, next } = createMockReqRes({
                body: { type: 'bank_transfer', bankName: 'Bank', accountNumber: '123' },
                user: { userId: 'u1' }
            });
            const mockPay = { _id: 'p1', populate: vi.fn() };
            PaymentMethod.create.mockResolvedValue(mockPay);

            await createPaymentMethod(req, res, next);
            expect(res.status).toHaveBeenCalledWith(201);
        });
    });

    describe('updatePaymentMethod', () => {
        it('should update and handle default', async () => {
            const { req, res, next } = createMockReqRes({
                params: { id: 'p1' },
                body: { isDefault: true },
                user: { userId: 'u1' }
            });
            const mockPay = { _id: 'p1', user: 'u1', type: 'paypal' };
            PaymentMethod.findById.mockResolvedValue(mockPay);
            PaymentMethod.updateMany.mockResolvedValue(true);
            PaymentMethod.findByIdAndUpdate.mockReturnValue({ populate: vi.fn().mockResolvedValue({ ...mockPay, isDefault: true }) });

            await updatePaymentMethod(req, res, next);
            expect(res.status).toHaveBeenCalledWith(200);
            expect(PaymentMethod.updateMany).toHaveBeenCalled();
        });
    });

    describe('setDefaultPaymentMethod', () => {
        it('should set as default', async () => {
            const { req, res, next } = createMockReqRes({ params: { id: 'p1' }, user: { userId: 'u1' } });
            const mockPay = { _id: 'p1', user: 'u1', isActive: true };
            PaymentMethod.findById.mockResolvedValue(mockPay);
            PaymentMethod.updateMany.mockResolvedValue(true);
            PaymentMethod.findByIdAndUpdate.mockReturnValue({ populate: vi.fn().mockResolvedValue({ ...mockPay, isDefault: true }) });

            await setDefaultPaymentMethod(req, res, next);
            expect(res.status).toHaveBeenCalledWith(200);
        });
    });

    describe('deletePaymentMethod', () => {
        it('should delete', async () => {
            const { req, res, next } = createMockReqRes({ params: { id: 'p1' }, user: { userId: 'u1' } });
            PaymentMethod.findById.mockResolvedValue({ _id: 'p1', user: 'u1' });
            PaymentMethod.findByIdAndDelete.mockResolvedValue(true);

            await deletePaymentMethod(req, res, next);
            expect(res.status).toHaveBeenCalledWith(204);
        });
    });
});
