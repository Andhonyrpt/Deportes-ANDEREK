import { describe, it, expect, vi, beforeEach } from 'vitest';
import mongoose from 'mongoose';
import * as orderController from '../../src/controllers/orderController.js';
import Order from '../../src/models/order.js';
import Product from '../../src/models/product.js';
import { createMockReqRes } from '../helpers/createMockReqRes.js';

vi.mock('../../src/models/order.js', () => ({
    default: {
        create: vi.fn(),
    },
}));

vi.mock('../../src/models/product.js', () => ({
    default: {
        findById: vi.fn(),
        findOneAndUpdate: vi.fn(),
    },
}));

describe('Order Controller Atomic Flow Verification', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('should handle partial failures during order creation (Resilience Test)', async () => {
        // Setup: Mock Product.findById so stock checks pass
        Product.findById.mockResolvedValue({
            _id: '507f1f72bcf86cd799439012',
            name: 'Test Product',
            price: 100,
            variants: [{ size: 'M', stock: 10 }]
        });

        // Setup: Mock findOneAndUpdate for stock reduction
        Product.findOneAndUpdate.mockResolvedValue({ ok: true });

        // Setup: Mock Order.create to fail
        const error = new Error('Order creation failed unexpectedly');
        Order.create.mockRejectedValue(error);

        const { req, res, next } = createMockReqRes({
            body: {
                user: '507f1f72bcf86cd799439011',
                products: [{ productId: '507f1f72bcf86cd799439012', quantity: 1, size: 'M' }],
                totalAmount: 110,
                shippingAddress: 'Address',
                shippingCost: 10
            }
        });

        await orderController.createOrder(req, res, next);

        expect(next).toHaveBeenCalledWith(error);
        expect(res.status).not.toHaveBeenCalled();
    });
});
