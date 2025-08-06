import express from 'express';
import { body, param } from 'express-validator';
import validate from '../middlewares/validations.js';
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

const router = express.Router();

// Obtener todas las órdenes (admin)
router.get('/orders', authMiddleware, isAdmin, getOrders);

// Obtener órdenes por usuario
router.get('/orders/user/:userId', [
  param('userId')
    .isMongoId().withMessage('Address ID must be a valid MongoDB ObjectId')
], validate, authMiddleware, getOrdersByUser);

// Obtener orden por ID
router.get('/orders/:id', [
  param('id')
    .isMongoId().withMessage('Address ID must be a valid MongoDB ObjectId')
], validate, authMiddleware, getOrderById);

// Crear nueva orden
router.post('/orders', [
  body('user')
    .notEmpty().withMessage('"user" es obligatorio')
    .isMongoId().withMessage('Address ID must be a valid MongoDB ObjectId'),

  body('products')
    .isArray({ min: 1 }).withMessage('"products" debe ser un arreglo con al menos un producto'),

  body('products.*.productId')
    .notEmpty().withMessage('"productId" es obligatorio')
    .isMongoId().withMessage('Address ID must be a valid MongoDB ObjectId'),

  body('products.*.quantity')
    .isInt({ min: 1 }).withMessage('"quantity" debe ser un número entero mayor o igual a 1'),

  body('products.*.price')
    .isFloat({ min: 0 }).withMessage('"price" debe ser un número positivo'),

  body('shippingAddress')
    .notEmpty().withMessage('"shippingAddress" es obligatorio')
    .isMongoId().withMessage('Address ID must be a valid MongoDB ObjectId'),

  body('paymentMethod')
    .notEmpty().withMessage('"paymentMethod" es obligatorio')
    .isMongoId().withMessage('Address ID must be a valid MongoDB ObjectId'),

  body('shippingCost')
    .isFloat({ min: 0 }).withMessage('"shippingCost" must be a positive number'),
], validate, authMiddleware, createOrder);

// Cancelar orden (función especial)
router.patch('/orders/:id/cancel', [
  param('id')
    .isMongoId().withMessage('Address ID must be a valid MongoDB ObjectId')
], validate, authMiddleware, isAdmin, cancelOrder);

// Actualizar solo el estado de la orden (admin)
router.patch('/orders/:id/status', [
  param('id')
    .isMongoId().withMessage('Address ID must be a valid MongoDB ObjectId'),

  body('status')
    .optional()
    .isIn(['pending', 'processing', 'shipped', 'delivered', 'cancelled'])
    .withMessage('Status is not valid')
], validate, authMiddleware, isAdmin, updateOrderStatus);

// Actualizar solo el estado de pago (admin)
router.patch('/orders/:id/payment-status', [
  param('id')
    .isMongoId().withMessage('Address ID must be a valid MongoDB ObjectId'),

  body('paymentStatus')
    .optional()
    .isIn(['pending', 'paid', 'failed', 'refunded'])
    .withMessage('Payment method is not valid')
], validate, authMiddleware, isAdmin, updatePaymentStatus);

// Actualizar orden completa (admin)
router.put('/orders/:id', [
  param('id')
    .isMongoId().withMessage('Address ID must be a valid MongoDB ObjectId'),

  body('shippingCost')
    .isFloat({ min: 0 }).withMessage('"shippingCost" must be a positive number'),

  body('status')
    .optional()
    .isIn(['pending', 'processing', 'shipped', 'delivered', 'cancelled'])
    .withMessage('Status is not valid'),

  body('paymentStatus')
    .optional()
    .isIn(['pending', 'paid', 'failed', 'refunded'])
    .withMessage('Payment method is not valid'),
], validate, authMiddleware, isAdmin, updateOrder);

// Eliminar orden (solo si está cancelada) (admin)
router.delete('/orders/:id', [
  param('id')
    .isMongoId().withMessage('Address ID must be a valid MongoDB ObjectId'),

], validate, authMiddleware, isAdmin, deleteOrder);

export default router;
