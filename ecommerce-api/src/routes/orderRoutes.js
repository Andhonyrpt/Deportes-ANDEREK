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
  previewOrder,
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

/**
 * @openapi
 * /orders:
 *   get:
 *     summary: Obtener todas las órdenes (Amin)
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de órdenes devuelta con éxito
 */
router.get('/orders', authMiddleware, isAdmin, getOrders);

/**
 * @openapi
 * /orders/user/{userId}:
 *   get:
 *     summary: Obtener órdenes por usuario
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Órdenes del usuario
 */
router.get('/orders/user/:userId', authMiddleware, [
  mongoIdValidation('userId', 'User ID')
], validate, getOrdersByUser);

/**
 * @openapi
 * /orders/{id}:
 *   get:
 *     summary: Obtener orden por ID
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Detalle de orden
 */
router.get('/orders/:id', authMiddleware, [
  mongoIdValidation('id', 'Order ID')
], validate, getOrderById);

/**
 * @openapi
 * /orders:
 *   post:
 *     summary: Crear nueva orden
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               user: 
 *                 type: string
 *               products:
 *                 type: array
 *                 items:
 *                   type: object
 *               shippingAddress:
 *                 type: string
 *               paymentMethod:
 *                 type: string
 *               shippingCost:
 *                 type: number
 *     responses:
 *       201:
 *         description: Orden creada
 */
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

/**
 * @openapi
 * /orders/{id}/cancel:
 *   patch:
 *     summary: Cancelar orden (Admin)
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Orden cancelada
 */
router.patch('/orders/:id/cancel', authMiddleware, isAdmin, [
  mongoIdValidation('id', 'Order ID')
], validate, cancelOrder);

/**
 * @openapi
 * /orders/{id}/status:
 *   patch:
 *     summary: Actualizar estado de orden (Admin)
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               status:
 *                 type: string
 *     responses:
 *       200:
 *         description: Estado actualizado
 */
router.patch('/orders/:id/status', authMiddleware, isAdmin, [
  mongoIdValidation('id', 'Order ID'),
  orderStatusValidation()
], validate, updateOrderStatus);

/**
 * @openapi
 * /orders/{id}/payment-status:
 *   patch:
 *     summary: Actualizar estado de pago (Admin)
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               paymentStatus:
 *                 type: string
 *     responses:
 *       200:
 *         description: Estado de pago actualizado
 */
router.patch('/orders/:id/payment-status', authMiddleware, isAdmin, [
  mongoIdValidation('id', 'Order ID'),
  paymentStatusValidation()
], validate, updatePaymentStatus);

/**
 * @openapi
 * /orders/{id}:
 *   put:
 *     summary: Actualizar orden completa (Admin)
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Orden actualizada
 */
router.put('/orders/:id', authMiddleware, isAdmin, [
  mongoIdValidation('id', 'Order ID'),
  orderStatusValidation(true),
  paymentStatusValidation(true),
  shippingCostValidation()
], validate, updateOrder);

/**
 * @openapi
 * /orders/{id}:
 *   delete:
 *     summary: Eliminar orden cancelada (Admin)
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Orden eliminada
 */
router.delete('/orders/:id', authMiddleware, isAdmin, [
  mongoIdValidation('id', 'Order ID')
], validate, deleteOrder);

/**
 * @openapi
 * /orders/preview:
 *   post:
 *     summary: Previsualizar orden (Cálculo de servidor)
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               products:
 *                 type: array
 *     responses:
 *       200:
 *         description: Resumen de totales devuelto
 */
router.post('/orders/preview', authMiddleware, [
  body('products').notEmpty()
    .withMessage('Products are required')
    .isArray({ min: 1 })
    .withMessage("Products must be a non-empty array"),
  bodyMongoIdValidation('products.*.productId', 'Product ID'),
  sizeValidation('products.*.size'),
  quantityValidation('products.*.quantity'),
], validate, previewOrder);

export default router;