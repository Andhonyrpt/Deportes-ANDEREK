import { describe, it, expect, vi, beforeEach } from 'vitest';
import * as cartController from '../../src/controllers/cartController.js';
import Cart from '../../src/models/cart.js';
import { createMockReqRes } from '../helpers/createMockReqRes.js';

describe('Cart Controller Resilience Unit Tests', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        // Restore spys if any
        vi.restoreAllMocks();
    });

    it('should call next(err) when Cart.findOneAndUpdate fails (DB failure simulation)', async () => {
        const error = new Error('Database connection lost');
        vi.spyOn(Cart, 'findOneAndUpdate').mockRejectedValue(error);

        const { req, res, next } = createMockReqRes({
            user: { userId: '507f1f72bcf86cd799439011', role: 'customer' },
            body: { userId: '507f1f72bcf86cd799439011', productId: '507f1f72bcf86cd799439012' }
        });

        await cartController.addProductToCart(req, res, next);

        expect(next).toHaveBeenCalledWith(error);
        expect(res.status).not.toHaveBeenCalled();
    });

    it('should call next(err) when Cart.populate fails', async () => {
        const error = new Error('Populate Failure');
        const mockCart = {
            populate: vi.fn().mockRejectedValue(error)
        };
        vi.spyOn(Cart, 'findOneAndUpdate').mockResolvedValue(mockCart);

        const { req, res, next } = createMockReqRes({
            user: { userId: '507f1f72bcf86cd799439011', role: 'customer' },
            body: { userId: '507f1f72bcf86cd799439011', productId: '507f1f72bcf86cd799439012' }
        });

        await cartController.addProductToCart(req, res, next);

        expect(next).toHaveBeenCalledWith(error);
    });
});
