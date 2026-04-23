import { describe, it, expect, vi, beforeEach } from 'vitest';
import { 
    createOrder, 
    cancelOrder, 
    getOrders, 
    getOrderById, 
    updateOrderStatus, 
    deleteOrder,
    getOrdersByUser,
    updatePaymentStatus
} from '../../src/controllers/orderController.js';
import Order from '../../src/models/order.js';
import Product from '../../src/models/product.js';
import { createMockReqRes } from '../helpers/createMockReqRes.js';

vi.mock('../../src/models/order.js');
vi.mock('../../src/models/product.js');
vi.mock('../../src/models/notification.js');

describe('orderController Unit Tests', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe('getOrdersByUser', () => {
        it('should return user orders', async () => {
            const { req, res, next } = createMockReqRes({ params: { userId: 'u1' }, user: { userId: 'u1' } });
            Order.find.mockReturnValue({
                populate: vi.fn().mockReturnThis(),
                sort: vi.fn().mockReturnThis(),
                skip: vi.fn().mockReturnThis(),
                limit: vi.fn().mockResolvedValue([{ _id: 'o1' }])
            });
            Order.countDocuments.mockResolvedValue(1);
            await getOrdersByUser(req, res, next);
            expect(res.json).toHaveBeenCalled();
        });
    });

    describe('updatePaymentStatus', () => {
        it('should update payment status', async () => {
            const { req, res, next } = createMockReqRes({ params: { id: 'o1' }, body: { paymentStatus: 'paid' } });
            Order.findByIdAndUpdate.mockReturnValue({
                populate: vi.fn().mockReturnThis(),
                then: vi.fn().mockImplementation(cb => cb({ _id: 'o1', paymentStatus: 'paid' }))
            });
            await updatePaymentStatus(req, res, next);
            expect(res.status).toHaveBeenCalledWith(200);
        });
    });

    describe('deleteOrder', () => {
        it('should delete order if it is cancelled', async () => {
            const { req, res, next } = createMockReqRes({ params: { id: 'o1' } });
            Order.findById.mockResolvedValue({ _id: 'o1', status: 'cancelled' });
            Order.findByIdAndDelete.mockResolvedValue({ _id: 'o1' });

            await deleteOrder(req, res, next);
            expect(res.status).toHaveBeenCalledWith(204);
        });
    });
});
