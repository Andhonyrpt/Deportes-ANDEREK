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

// Obtener todos los métodos de pago activos (admin)
router.get('/payment-methods', authMiddleware, isAdmin, getPaymentMethods);

// Obtener método de pago predeterminado de un usuario
router.get('/payment-methods/default/:userId', [
  mongoIdValidation('userId', 'User ID')
], validate, authMiddleware, getDefaultPaymentMethod);

// Obtener métodos de pago de un usuario
router.get('/payment-methods/user/:userId', [
  mongoIdValidation('userId', 'User ID')
], validate, authMiddleware, getPaymentMethodsByUser);

// Obtener método de pago por ID
router.get('/payment-methods/:id', authMiddleware, [
  mongoIdValidation('id', 'Payment Method ID')
], validate, getPaymentMethodById);

// Crear nuevo método de pago
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

// Establecer método de pago como predeterminado
router.patch('/payment-methods/:id/set-default', authMiddleware, [
  mongoIdValidation('id', 'Payment Method ID')
], validate, setDefaultPaymentMethod);

// Desactivar método de pago
router.patch('/payment-methods/:id/deactivate', authMiddleware, [
  mongoIdValidation('id', 'Payment Method ID')
], validate, deactivatePaymentMethod);

// Actualizar método de pago
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

// Eliminar método de pago permanentemente
router.delete('/payment-methods/:id', authMiddleware, [
  mongoIdValidation('id', 'Payment Method ID')
], validate, deletePaymentMethod);

export default router;