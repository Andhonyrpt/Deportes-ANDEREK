import { describe, it, expect, vi, beforeEach } from 'vitest';
import * as cartController from '../../src/controllers/cartController.js';
import Cart from '../../src/models/cart.js';
import { createMockReqRes } from '../helpers/createMockReqRes.js';

vi.mock('../../src/models/cart.js', () => ({
    default: {
        findOne: vi.fn(),
        create: vi.fn(),
    },
}));

describe('Cart Controller Resilience Unit Tests', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('should call next(err) when Cart.findOne fails (DB failure simulation)', async () => {
        const error = new Error('Database connection lost');
        Cart.findOne.mockRejectedValue(error);

        const { req, res, next } = createMockReqRes({
            body: { userId: '507f1f72bcf86cd799439011', productId: '507f1f72bcf86cd799439012' }
        });

        await cartController.addProductToCart(req, res, next);

        expect(next).toHaveBeenCalledWith(error);
        expect(res.status).not.toHaveBeenCalled();
    });

    it('should call next(err) when Cart.create fails', async () => {
        const error = new Error('Schema validation failed during creation');
        Cart.findOne.mockResolvedValue(null);
        Cart.create.mockRejectedValue(error);

        const { req, res, next } = createMockReqRes({
            body: { userId: '507f1f72bcf86cd799439011', productId: '507f1f72bcf86cd799439012' }
        });

        // The addProductToCart uses new Cart().save() if not using create directly, 
        // let's check the implementation again.
    });
});
