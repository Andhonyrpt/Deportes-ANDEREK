import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createOrder, cancelOrder } from '../../src/controllers/orderController.js';
import Order from '../../src/models/order.js';
import Product from '../../src/models/product.js';
import { createMockReqRes } from '../helpers/createMockReqRes.js';

// Mock dependencias
vi.mock('../../src/models/order.js');
vi.mock('../../src/models/product.js');

describe('orderController Unit Tests - Edge Cases', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe('createOrder (Strict Price Calculation)', () => {
        it('should strictly calculate totalPrice based on server DB prices, ignoring malicious client input', async () => {
            const { req, res, next } = createMockReqRes({
                body: {
                    user: 'user123',
                    products: [{ productId: 'prod1', quantity: 2, size: 'M' }],
                    shippingAddress: 'address123',
                    paymentMethod: 'payment123',
                    shippingCost: 10,
                    totalPrice: 1 // Malicious client trying to pay $1 total
                }
            });

            // Mock Product.findOne to return stock check success
            Product.findOne.mockResolvedValue({
                _id: 'prod1',
                price: 50, // Real server price
                variants: [{ size: 'M', stock: 10 }]
            });

            // Mock Product.findById to return the product for stock checks
            Product.findById.mockResolvedValue({
                _id: 'prod1',
                name: 'Test Product',
                price: 50, // Real server price
                variants: [{ size: 'M', stock: 10 }]
            });

            // Mock Product.findOneAndUpdate (stock deduction)
            Product.findOneAndUpdate.mockResolvedValue(true);

            // Mock Order.create
            const populateMock = vi.fn().mockResolvedValue(true);
            Order.create.mockResolvedValue({ populate: populateMock });

            await createOrder(req, res, next);

            // Server should calculate: (50 * 2) + 10 = 110. It must ignore the client's `1`.
            expect(Order.create).toHaveBeenCalledWith(expect.objectContaining({
                totalPrice: 110,
                shippingCost: 10
            }));
            expect(res.status).toHaveBeenCalledWith(201);
        });
    });

    describe('cancelOrder (Partial Failure Bug)', () => {
        it('should rollback already restored stock if a subsequent restoration fails', async () => {
            const { req, res, next } = createMockReqRes({
                params: { id: 'order123' }
            });

            // Simulamos una orden con 2 productos
            const mockOrder = {
                _id: 'order123',
                status: 'pending',
                products: [
                    { productId: { _id: 'prod1' }, size: 'M', quantity: 2 },
                    { productId: { _id: 'prod2' }, size: 'L', quantity: 1 }
                ]
            };

            const populateMock = vi.fn().mockResolvedValue(mockOrder);
            Order.findById.mockReturnValue({ populate: populateMock });

            // Simulamos que el primer producto (prod1) se restaura bien, 
            // pero el segundo (prod2) falla (ej: producto fue borrado, no lo encuentra).
            Product.findOneAndUpdate
                .mockResolvedValueOnce({ _id: 'prod1' }) // Éxito para prod1 (Llamada 1)
                .mockResolvedValueOnce(null)             // Fallo para prod2 (Llamada 2)
                .mockResolvedValueOnce({ _id: 'prod1' });// Éxito en Rollback prod1 (Llamada 3)

            await cancelOrder(req, res, next);

            // Verificamos que findOneAndUpdate se llamó para intentar restaurar ambos y hacer el rollback de prod1
            expect(Product.findOneAndUpdate).toHaveBeenCalledTimes(3);

            // Verificamos que el rollback intentó revertir la cantidad restaurada
            expect(Product.findOneAndUpdate).toHaveBeenNthCalledWith(3,
                { _id: 'prod1', "variants.size": 'M' },
                { $inc: { "variants.$.stock": -2 } } // -quantity
            );

            // Verificamos que el controlador devolvió 500 por el fallo parcial
            expect(res.status).toHaveBeenCalledWith(500);
        });
    });
});
