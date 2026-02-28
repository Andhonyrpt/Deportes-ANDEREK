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

    it('should call next(err) when Cart.findOne fails (DB failure simulation)', async () => {
        const error = new Error('Database connection lost');
        const findOneSpy = vi.spyOn(Cart, 'findOne').mockRejectedValue(error);

        const { req, res, next } = createMockReqRes({
            user: { userId: '507f1f72bcf86cd799439011', role: 'customer' },
            body: { userId: '507f1f72bcf86cd799439011', productId: '507f1f72bcf86cd799439012' }
        });

        await cartController.addProductToCart(req, res, next);

        expect(next).toHaveBeenCalledWith(error);
        expect(res.status).not.toHaveBeenCalled();
    });

    it('should call next(err) when the Cart instance save fails', async () => {
        const error = new Error('Schema validation failed during creation');
        vi.spyOn(Cart, 'findOne').mockResolvedValue(null);

        // Spy on the prototype of Cart to catch the .save() call inside the controller
        const saveSpy = vi.spyOn(Cart.prototype, 'save').mockRejectedValue(error);

        const { req, res, next } = createMockReqRes({
            user: { userId: '507f1f72bcf86cd799439011', role: 'customer' },
            body: { userId: '507f1f72bcf86cd799439011', productId: '507f1f72bcf86cd799439012' }
        });

        await cartController.addProductToCart(req, res, next);

        expect(next).toHaveBeenCalledWith(error);
        expect(saveSpy).toHaveBeenCalled();
    });
});
