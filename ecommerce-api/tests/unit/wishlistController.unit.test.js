import { describe, it, expect, vi, beforeEach } from 'vitest';
import { addToWishList, removeFromWishList, moveToCart } from '../../src/controllers/wishListController.js';
import WishList from '../../src/models/wishList.js';
import Product from '../../src/models/product.js';
import Cart from '../../src/models/cart.js';
import { createMockReqRes } from '../helpers/createMockReqRes.js';

// Mock dependencias
vi.mock('../../src/models/wishList.js');
vi.mock('../../src/models/product.js');
vi.mock('../../src/models/cart.js');

describe('wishlistController Unit Tests', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe('addToWishList', () => {
        it('should return 404 if product does not exist', async () => {
            const { req, res, next } = createMockReqRes({
                body: { productId: 'invalid_prod' },
                user: { userId: 'user123' }
            });

            Product.findById.mockReturnValue({ lean: () => null });

            await addToWishList(req, res, next);

            expect(res.status).toHaveBeenCalledWith(404);
            expect(res.json).toHaveBeenCalledWith({ message: 'Product not found' });
        });

        it('should return 200 and message if product already in wishlist', async () => {
            const { req, res, next } = createMockReqRes({
                body: { productId: 'prod123' },
                user: { userId: 'user123' }
            });

            Product.findById.mockReturnValue({ lean: () => ({ _id: 'prod123' }) });

            const mockWishList = {
                products: [{ product: { toString: () => 'prod123' } }],
                populate: vi.fn().mockResolvedValue(true)
            };
            WishList.findOne.mockResolvedValue(mockWishList);

            await addToWishList(req, res, next);

            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
                message: 'Product already in wishlist'
            }));
            expect(WishList.findOneAndUpdate).not.toHaveBeenCalled();
        });

        it('should push product to existing wishlist if not a duplicate', async () => {
            const { req, res, next } = createMockReqRes({
                body: { productId: 'prod456' },
                user: { userId: 'user123' }
            });

            Product.findById.mockReturnValue({ lean: () => ({ _id: 'prod456' }) });

            const mockWishList = {
                products: [{ product: { toString: () => 'prod123' } }] // Different product
            };
            WishList.findOne.mockResolvedValue(mockWishList);

            const updatedWishList = {
                products: [{ product: 'prod123' }, { product: 'prod456' }],
                populate: vi.fn().mockResolvedValue(true)
            };
            WishList.findOneAndUpdate.mockReturnValue({
                populate: vi.fn().mockResolvedValue(updatedWishList)
            });

            await addToWishList(req, res, next);

            expect(WishList.findOneAndUpdate).toHaveBeenCalledWith(
                { user: 'user123' },
                { $push: { products: { product: 'prod456' } } },
                { new: true }
            );
            expect(res.status).toHaveBeenCalledWith(200);
        });
    });

    describe('moveToCart', () => {
        it('should pull from wishlist and add to cart', async () => {
            const { req, res, next } = createMockReqRes({
                body: { productId: 'prod123', size: 'M' },
                user: { userId: 'user123' }
            });

            const mockPopulated = {
                _id: 'wish123',
                products: []
            };
            WishList.findOneAndUpdate.mockReturnValue({
                populate: vi.fn().mockResolvedValue(mockPopulated)
            });
            Cart.findOneAndUpdate.mockResolvedValue(true);

            await moveToCart(req, res, next);

            expect(WishList.findOneAndUpdate).toHaveBeenCalledWith(
                { user: 'user123' },
                { $pull: { products: { product: 'prod123' } } },
                { new: true }
            );
            expect(Cart.findOneAndUpdate).toHaveBeenCalledWith(
                { user: 'user123' },
                { $addToSet: { products: { product: 'prod123', size: 'M', quantity: 1 } } },
                { upsert: true }
            );
            expect(res.status).toHaveBeenCalledWith(200);
        });

        it('should return 404 if wishlist does not exist', async () => {
            const { req, res, next } = createMockReqRes({
                body: { productId: 'prod123', size: 'M' },
                user: { userId: 'user123' }
            });

            WishList.findOneAndUpdate.mockReturnValue({
                populate: vi.fn().mockResolvedValue(null)
            });

            await moveToCart(req, res, next);

            expect(res.status).toHaveBeenCalledWith(404);
            expect(Cart.findOneAndUpdate).not.toHaveBeenCalled();
        });
    });
});
