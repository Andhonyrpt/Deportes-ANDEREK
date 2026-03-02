import { describe, it, expect, vi, beforeEach } from 'vitest';
import { addProductToCart, updateCartItem } from '../../src/controllers/cartController.js';
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

            // Mock: Primera llamada (intentar update existente) devuelve null
            Cart.findOneAndUpdate.mockResolvedValueOnce(null);
            // Mock: Segunda llamada (upsert) devuelve el nuevo carrito
            const mockCart = {
                user: 'user123',
                products: [{ product: 'prod123', quantity: 2, size: 'M' }],
                populate: vi.fn().mockReturnThis()
            };
            Cart.findOneAndUpdate.mockResolvedValueOnce(mockCart);

            await addProductToCart(req, res, next);

            expect(Cart.findOneAndUpdate).toHaveBeenCalledTimes(2);
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
                message: "Product added to cart successfully"
            }));
        });

        it('should increment quantity if the exact product and size already exists', async () => {
            const { req, res, next } = createMockReqRes({
                user: { userId: 'user123', role: 'customer' },
                body: { productId: 'prod123', quantity: 3, size: 'M' }
            });

            const mockCart = {
                user: 'user123',
                products: [{ product: 'prod123', quantity: 5, size: 'M' }],
                populate: vi.fn().mockReturnThis()
            };
            // Primera llamada tiene éxito ($inc)
            Cart.findOneAndUpdate.mockResolvedValueOnce(mockCart);

            await addProductToCart(req, res, next);

            expect(Cart.findOneAndUpdate).toHaveBeenCalledTimes(1);
            expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
                cart: expect.objectContaining({ user: 'user123' })
            }));
        });
    });

    describe('updateCartItem', () => {
        it('should return 404 if the user does not have a cart', async () => {
            const { req, res, next } = createMockReqRes({
                user: { userId: 'user123', role: 'customer' },
                body: { userId: 'user123', productId: 'prod123', size: 'M' },
                params: { userId: 'user123' } // Controllers now often use params over body for userId
            });

            Cart.findOne.mockResolvedValue(null);

            await updateCartItem(req, res, next);

            expect(res.status).toHaveBeenCalledWith(404);
            expect(res.json).toHaveBeenCalledWith({ message: "Cart not found" });
        });

        it('should return 404 if the product/size is not in the cart', async () => {
            const { req, res, next } = createMockReqRes({
                user: { userId: 'user123', role: 'customer' },
                body: { userId: 'user123', productId: 'prod123', size: 'L' }
            });

            const mockProductId = { toString: () => 'prod999' };
            const mockCart = {
                user: 'user123',
                products: [{ product: mockProductId, quantity: 2, size: 'M' }]
            };
            Cart.findOne.mockResolvedValue(mockCart);

            await updateCartItem(req, res, next);

            expect(res.status).toHaveBeenCalledWith(404);
            expect(res.json).toHaveBeenCalledWith({ message: "Product not found in cart" });
        });

        it('should update size and quantity using oldSize to find the item', async () => {
            const { req, res, next } = createMockReqRes({
                user: { userId: 'user123', role: 'customer' },
                body: { userId: 'user123', productId: 'prod123', quantity: 5, size: 'L', oldSize: 'M' }
            });

            const mockProductId = { toString: () => 'prod123' };
            const mockCart = {
                user: 'user123',
                products: [{ product: mockProductId, quantity: 2, size: 'M' }], // Elemento original
                save: vi.fn(),
                populate: vi.fn()
            };
            Cart.findOne.mockResolvedValue(mockCart);

            await updateCartItem(req, res, next);

            expect(mockCart.products[0].quantity).toBe(5);
            expect(mockCart.products[0].size).toBe('L');
            expect(mockCart.save).toHaveBeenCalled();
            expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ message: "Cart item updated" }));
        });
    });
});
