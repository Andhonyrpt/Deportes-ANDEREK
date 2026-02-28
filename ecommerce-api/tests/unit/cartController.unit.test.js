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
                body: { userId: 'user123', productId: 'prod123', quantity: 2, size: 'M' }
            });

            // Mock: No existe carrito
            Cart.findOne.mockResolvedValue(null);

            // Mock Cart constructor instance methods using prototype
            const saveMock = vi.fn().mockResolvedValue(true);
            const populateMock = vi.fn().mockResolvedValue(true);

            Cart.prototype.save = saveMock;
            Cart.prototype.populate = populateMock;

            await addProductToCart(req, res, next);

            expect(Cart.findOne).toHaveBeenCalledWith({ user: 'user123' });
            expect(saveMock).toHaveBeenCalled();
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
                message: "Product added to cart successfully"
            }));
        });

        it('should add a new product to an existing cart (same product diff size)', async () => {
            const { req, res, next } = createMockReqRes({
                body: { userId: 'user123', productId: 'prod123', quantity: 1, size: 'L' }
            });

            const mockCart = {
                user: 'user123',
                products: [{ product: 'prod123', quantity: 2, size: 'M' }],
                save: vi.fn(),
                populate: vi.fn()
            };
            Cart.findOne.mockResolvedValue(mockCart);

            await addProductToCart(req, res, next);

            expect(mockCart.products).toHaveLength(2); // Se agregó una nueva talla
            expect(mockCart.products[1].size).toBe('L');
            expect(mockCart.save).toHaveBeenCalled();
        });

        it('should increment quantity if the exact product and size already exists', async () => {
            const { req, res, next } = createMockReqRes({
                body: { userId: 'user123', productId: 'prod123', quantity: 3, size: 'M' }
            });

            // Simulamos toString() del ObjectId
            const mockProductId = { toString: () => 'prod123' };

            const mockCart = {
                user: 'user123',
                products: [{ product: mockProductId, quantity: 2, size: 'M' }],
                save: vi.fn(),
                populate: vi.fn()
            };
            Cart.findOne.mockResolvedValue(mockCart);

            await addProductToCart(req, res, next);

            expect(mockCart.products).toHaveLength(1);
            expect(mockCart.products[0].quantity).toBe(5); // 2 + 3
            expect(mockCart.save).toHaveBeenCalled();
        });
    });

    describe('updateCartItem', () => {
        it('should return 404 if the user does not have a cart', async () => {
            const { req, res, next } = createMockReqRes({
                body: { userId: 'user123', productId: 'prod123', size: 'M' }
            });

            Cart.findOne.mockResolvedValue(null);

            await updateCartItem(req, res, next);

            expect(res.status).toHaveBeenCalledWith(404);
            expect(res.json).toHaveBeenCalledWith({ message: "Cart not found" });
        });

        it('should return 404 if the product/size is not in the cart', async () => {
            const { req, res, next } = createMockReqRes({
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
