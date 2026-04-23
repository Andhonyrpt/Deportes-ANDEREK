import { describe, it, expect, vi, beforeEach } from 'vitest';
import { 
    addProductToCart, 
    updateCartItem, 
    getCarts, 
    getCartById, 
    getCartByUser, 
    createCart, 
    deleteCart, 
    removeCartItem, 
    clearCartItems, 
    mergeCart 
} from '../../src/controllers/cartController.js';
import Cart from '../../src/models/cart.js';
import { createMockReqRes } from '../helpers/createMockReqRes.js';

// Mock dependencias
vi.mock('../../src/models/cart.js');

describe('cartController Unit Tests', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe('addProductToCart', () => {
        it('should create a new cart if the user does not have one', async () => {
            const { req, res, next } = createMockReqRes({
                user: { userId: 'user123', role: 'customer' },
                body: { productId: 'prod123', quantity: 2, size: 'M' }
            });

            Cart.findOneAndUpdate.mockResolvedValueOnce(null);
            const mockCart = {
                user: 'user123',
                products: [{ product: 'prod123', quantity: 2, size: 'M' }],
                populate: vi.fn().mockReturnThis()
            };
            Cart.findOneAndUpdate.mockResolvedValueOnce(mockCart);

            await addProductToCart(req, res, next);

            expect(Cart.findOneAndUpdate).toHaveBeenCalledTimes(2);
            expect(res.status).toHaveBeenCalledWith(200);
        });
    });

    describe('updateCartItem', () => {
        it('should return 404 if the user does not have a cart', async () => {
            const { req, res, next } = createMockReqRes({
                user: { userId: 'user123', role: 'customer' },
                body: { userId: 'user123', productId: 'prod123', size: 'M' }
            });

            Cart.findOne.mockResolvedValue(null);

            await updateCartItem(req, res, next);

            expect(res.status).toHaveBeenCalledWith(404);
        });

        it('should update size and quantity using oldSize to find the item', async () => {
            const { req, res, next } = createMockReqRes({
                user: { userId: 'user123', role: 'customer' },
                body: { userId: 'user123', productId: 'prod123', quantity: 5, size: 'L', oldSize: 'M' }
            });

            const mockProductId = { toString: () => 'prod123' };
            const mockCart = {
                user: 'user123',
                products: [{ product: mockProductId, quantity: 2, size: 'M' }],
                save: vi.fn(),
                populate: vi.fn()
            };
            Cart.findOne.mockResolvedValue(mockCart);

            await updateCartItem(req, res, next);

            expect(mockCart.products[0].quantity).toBe(5);
            expect(mockCart.save).toHaveBeenCalled();
        });
    });

    describe('getCarts', () => {
        it('should return all carts', async () => {
            const { req, res, next } = createMockReqRes();
            const mockCarts = [{ user: 'user1' }];
            Cart.find.mockReturnValue({
                populate: vi.fn().mockReturnThis(),
                then: vi.fn().mockImplementation(cb => cb(mockCarts))
            });

            await getCarts(req, res, next);
            expect(res.json).toHaveBeenCalledWith(mockCarts);
        });
    });

    describe('getCartById', () => {
        it('should return a cart if it exists', async () => {
            const { req, res, next } = createMockReqRes({ params: { id: 'cart1' } });
            const mockCart = { _id: 'cart1' };
            Cart.findById.mockReturnValue({
                populate: vi.fn().mockReturnThis(),
                then: vi.fn().mockImplementation(cb => cb(mockCart))
            });
            await getCartById(req, res, next);
            expect(res.json).toHaveBeenCalledWith(mockCart);
        });
    });

    describe('getCartByUser', () => {
        it('should return cart for authorized user', async () => {
            const { req, res, next } = createMockReqRes({ 
                params: { userId: 'user123' },
                user: { userId: 'user123', role: 'customer' }
            });
            const mockCart = { user: 'user123' };
            Cart.findOne.mockReturnValue({
                populate: vi.fn().mockReturnThis(),
                then: vi.fn().mockImplementation(cb => cb(mockCart))
            });
            await getCartByUser(req, res, next);
            expect(res.json).toHaveBeenCalledWith(mockCart);
        });
    });

    describe('createCart', () => {
        it('should create and return a new cart', async () => {
            const { req, res, next } = createMockReqRes({
                body: { user: 'user1', products: [] }
            });
            const mockCart = { create: vi.fn(), populate: vi.fn().mockResolvedValue(true) };
            Cart.create.mockResolvedValue(mockCart);
            await createCart(req, res, next);
            expect(res.status).toHaveBeenCalledWith(201);
        });
    });

    describe('deleteCart', () => {
        it('should delete a cart if it exists', async () => {
            const { req, res, next } = createMockReqRes({ params: { id: 'cart1' } });
            Cart.findByIdAndDelete.mockResolvedValue({ _id: 'cart1' });
            await deleteCart(req, res, next);
            expect(res.status).toHaveBeenCalledWith(204);
        });
    });

    describe('removeCartItem', () => {
        it('should remove an item from the cart', async () => {
            const { req, res, next } = createMockReqRes({
                params: { productId: 'p1' },
                body: { size: 'M' },
                user: { userId: 'u1' }
            });
            const mockCart = {
                user: 'u1',
                products: [{ product: { toString: () => 'p1' }, size: 'M' }],
                save: vi.fn(),
                populate: vi.fn()
            };
            Cart.findOne.mockResolvedValue(mockCart);
            await removeCartItem(req, res, next);
            expect(mockCart.products).toHaveLength(0);
        });
    });

    describe('mergeCart', () => {
        it('should merge products into the cart', async () => {
            const { req, res, next } = createMockReqRes({
                body: { products: [{ productId: 'p1', size: 'M', quantity: 2 }] },
                user: { userId: 'u1' }
            });
            const mockCart = {
                user: 'u1',
                products: [{ product: { toString: () => 'p1' }, size: 'M', quantity: 1 }],
                save: vi.fn(),
                populate: vi.fn()
            };
            Cart.findOne.mockResolvedValue(mockCart);
            await mergeCart(req, res, next);
            expect(mockCart.products[0].quantity).toBe(3);
        });
    });
});
