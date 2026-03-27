import express from 'express';
import { body, param } from 'express-validator';
import {
  getPaymentMethods,
  getPaymentMethodById,
  getPaymentMethodsByUser,
  createPaymentMethod,
  updatePaymentMethod,
  setDefaultPaymentMethod,
  deactivatePaymentMethod,
  deletePaymentMethod,
  getDefaultPaymentMethod,
} from '../controllers/paymentMethodController.js';
import authMiddleware from '../middlewares/authMiddleware.js';
import isAdmin from '../middlewares/isAdminMiddleware.js';
import validate from '../middlewares/validations.js';
import {
  accountNumberValidation,
  bankNameValidation,
  booleanValidation,
  cardHolderNameValidation,
  cardNumberValidation,
  expiryDateValidation,
  mongoIdValidation,
  paymentTypeValidation,
  paypalEmailValidation,
} from '../middlewares/validators.js';

const router = express.Router();

/**
 * @openapi
 * /payment-methods:
 *   get:
 *     summary: Obtener todos los métodos de pago (Admin)
 *     tags: [PaymentMethods]
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200: { description: Lista de métodos de pago }
 */
router.get('/payment-methods', authMiddleware, isAdmin, getPaymentMethods);

/**
 * @openapi
 * /payment-methods/default/{userId}:
 *   get:
 *     summary: Obtener método de pago predeterminado
 *     tags: [PaymentMethods]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200: { description: Método predeterminado }
 */
router.get('/payment-methods/default/:userId', [
  mongoIdValidation('userId', 'User ID')
], validate, authMiddleware, getDefaultPaymentMethod);

/**
 * @openapi
 * /payment-methods/user/{userId}:
 *   get:
 *     summary: Obtener métodos de pago de un usuario
 *     tags: [PaymentMethods]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200: { description: Métodos de pago del usuario }
 */
router.get('/payment-methods/user/:userId', [
  mongoIdValidation('userId', 'User ID')
], validate, authMiddleware, getPaymentMethodsByUser);

/**
 * @openapi
 * /payment-methods/{id}:
 *   get:
 *     summary: Obtener método de pago por ID
 *     tags: [PaymentMethods]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200: { description: Detalle método de pago }
 */
router.get('/payment-methods/:id', authMiddleware, [
  mongoIdValidation('id', 'Payment Method ID')
], validate, getPaymentMethodById);

/**
 * @openapi
 * /payment-methods:
 *   post:
 *     summary: Crear nuevo método de pago
 *     tags: [PaymentMethods]
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               type: { type: string }
 *               cardNumber: { type: string }
 *               cardHolderName: { type: string }
 *               expiryDate: { type: string }
 *               paypalEmail: { type: string }
 *               bankName: { type: string }
 *               accountNumber: { type: string }
 *               isDefault: { type: boolean }
 *     responses:
 *       201: { description: Método de pago creado }
 */
router.post('/payment-methods', authMiddleware, [
  paymentTypeValidation(),
  cardNumberValidation(),
  cardHolderNameValidation(),
  expiryDateValidation(),
  paypalEmailValidation(),
  bankNameValidation(),
  accountNumberValidation(),
  booleanValidation('isDefault'),
], validate, createPaymentMethod);

/**
 * @openapi
 * /payment-methods/{id}/set-default:
 *   patch:
 *     summary: Establecer método como predeterminado
 *     tags: [PaymentMethods]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200: { description: Método actualizado }
 */
router.patch('/payment-methods/:id/set-default', authMiddleware, [
  mongoIdValidation('id', 'Payment Method ID')
], validate, setDefaultPaymentMethod);

/**
 * @openapi
 * /payment-methods/{id}/deactivate:
 *   patch:
 *     summary: Desactivar método de pago
 *     tags: [PaymentMethods]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200: { description: Método desactivado }
 */
router.patch('/payment-methods/:id/deactivate', authMiddleware, [
  mongoIdValidation('id', 'Payment Method ID')
], validate, deactivatePaymentMethod);

/**
 * @openapi
 * /payment-methods/{id}:
 *   put:
 *     summary: Actualizar método de pago
 *     tags: [PaymentMethods]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200: { description: Método actualizado }
 */
router.put('/payment-methods/:id', authMiddleware, [
  mongoIdValidation('id', 'Payment Method ID'),
  cardHolderNameValidation(),
  expiryDateValidation(),
  paypalEmailValidation(),
  bankNameValidation(),
  accountNumberValidation(),
  booleanValidation('isDefault'),
  booleanValidation('isActive')
], validate, updatePaymentMethod);

/**
 * @openapi
 * /payment-methods/{id}:
 *   delete:
 *     summary: Eliminar método de pago
 *     tags: [PaymentMethods]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200: { description: Eliminado }
 */
router.delete('/payment-methods/:id', authMiddleware, [
  mongoIdValidation('id', 'Payment Method ID')
], validate, deletePaymentMethod);

export default router;