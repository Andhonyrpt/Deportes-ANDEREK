import express from 'express';
import { body, param } from 'express-validator';
import {
  getOrders,
  getOrderById,
  getOrdersByUser,
  createOrder,
  updateOrder,
  cancelOrder,
  updateOrderStatus,
  updatePaymentStatus,
  deleteOrder,
} from '../controllers/orderController.js';
import authMiddleware from '../middlewares/authMiddleware.js';
import isAdmin from '../middlewares/isAdminMiddleware.js';
import validate from '../middlewares/validations.js';
import {
  bodyMongoIdValidation,
  mongoIdValidation,
  orderStatusValidation,
  paymentStatusValidation,
  priceValidation,
  quantityValidation,
  shippingCostValidation,
  sizeValidation
} from '../middlewares/validators.js';

const router = express.Router();

// Obtener todas las órdenes (admin)
router.get('/orders', authMiddleware, isAdmin, getOrders);

// Obtener órdenes por usuario
router.get('/orders/user/:userId', authMiddleware, [
  mongoIdValidation('userId', 'User ID')
], validate, getOrdersByUser);

// Obtener orden por ID
router.get('/orders/:id', authMiddleware, [
  mongoIdValidation('id', 'Order ID')
], validate, getOrderById);

// Crear nueva orden
router.post('/orders', authMiddleware, [
  bodyMongoIdValidation('user', 'User ID'),
  body('products').notEmpty()
    .withMessage('Products are required')
    .isArray({ min: 1 })
    .withMessage("Products must be a non-empty array"),
  bodyMongoIdValidation('products.*.productId', 'Product ID'),
  sizeValidation('products.*.size'),
  quantityValidation('products.*.quantity'),
  priceValidation('products.*.price'),
  bodyMongoIdValidation('shippingAddress', 'Shipping Address ID'),
  bodyMongoIdValidation('paymentMethod', 'Payment Method ID'),
  shippingCostValidation()
], validate, createOrder);

// Cancelar orden (función especial)
router.patch('/orders/:id/cancel', authMiddleware, isAdmin, [
  mongoIdValidation('id', 'Order ID')
], validate, cancelOrder);

// Actualizar solo el estado de la orden (admin)
router.patch('/orders/:id/status', authMiddleware, isAdmin, [
  mongoIdValidation('id', 'Order ID'),
  orderStatusValidation()
], validate, updateOrderStatus);

// Actualizar solo el estado de pago (admin)
router.patch('/orders/:id/payment-status', authMiddleware, isAdmin, [
  mongoIdValidation('id', 'Order ID'),
  paymentStatusValidation()
], validate, updatePaymentStatus);

// Actualizar orden completa (admin)
router.put('/orders/:id', authMiddleware, isAdmin, [
  mongoIdValidation('id', 'Order ID'),
  orderStatusValidation(true),
  paymentStatusValidation(true),
  shippingCostValidation()
], validate, updateOrder);

// Eliminar orden (solo si está cancelada) (admin)
router.delete('/orders/:id', authMiddleware, isAdmin, [
  mongoIdValidation('id', 'Order ID')
], validate, deleteOrder);

export default router;
