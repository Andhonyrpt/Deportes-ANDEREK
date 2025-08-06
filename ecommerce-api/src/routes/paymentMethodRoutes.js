import express from 'express';
import { body, param } from 'express-validator';
import validate from '../middlewares/validations.js';
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

const router = express.Router();

// Obtener todos los métodos de pago activos (admin)
router.get('/payment-methods', authMiddleware, isAdmin, getPaymentMethods);

// Obtener método de pago predeterminado de un usuario
router.get('/payment-methods/default/:userId', [
  param('userId')
    .isMongoId().withMessage('Address ID must be a valid MongoDB ObjectId'),

], validate, authMiddleware, getDefaultPaymentMethod);

// Obtener métodos de pago de un usuario
router.get('/payment-methods/user/:userId', [
  param('userId')
    .isMongoId().withMessage('Address ID must be a valid MongoDB ObjectId'),

], validate, authMiddleware, getPaymentMethodsByUser);

// Obtener método de pago por ID
router.get('/payment-methods/:id', [
  param('id')
    .isMongoId().withMessage('Address ID must be a valid MongoDB ObjectId'),

], validate, authMiddleware, getPaymentMethodById);

// Crear nuevo método de pago
router.post('/payment-methods', [
  body('user')
    .notEmpty().withMessage('El campo user es obligatorio.')
    .isMongoId().withMessage('El ID de usuario no es válido.'),

  body('type')
    .notEmpty().withMessage('El campo type es obligatorio.')
    .isIn(['credit_card', 'debit_card', 'paypal', 'bank_transfer', 'cash_on_delivery'])
    .withMessage('El tipo de método de pago no es válido.'),

  // Validaciones condicionales según el tipo de método
  body('cardNumber')
    .if(body('type').isIn(['credit_card', 'debit_card']))
    .notEmpty().withMessage('El número de tarjeta es obligatorio para tarjetas.')
    .isCreditCard().withMessage('El número de tarjeta no es válido.'),

  body('cardHolderName')
    .if(body('type').isIn(['credit_card', 'debit_card']))
    .notEmpty().withMessage('El nombre del titular es obligatorio para tarjetas.')
    .isLength({ min: 3 }).withMessage('El nombre del titular debe tener al menos 3 caracteres.'),

  body('expiryDate')
    .if(body('type').isIn(['credit_card', 'debit_card']))
    .notEmpty().withMessage('La fecha de expiración es obligatoria.')
    .matches(/^(0[1-9]|1[0-2])\/\d{2}$/).withMessage('La fecha debe tener el formato MM/YY.'),

  body('paypalEmail')
    .if(body('type').equals('paypal'))
    .notEmpty().withMessage('El correo de PayPal es obligatorio.')
    .isEmail().withMessage('El correo de PayPal no es válido.'),

  body('bankName')
    .if(body('type').equals('bank_transfer'))
    .notEmpty().withMessage('El nombre del banco es obligatorio.'),

  body('accountNumber')
    .if(body('type').equals('bank_transfer'))
    .notEmpty().withMessage('El número de cuenta es obligatorio.')
    .isLength({ min: 6 }).withMessage('El número de cuenta debe tener al menos 6 caracteres.'),

  body('isDefault')
    .optional()
    .isBoolean().withMessage('isDefault debe ser booleano.')
], validate, authMiddleware, createPaymentMethod);

// Establecer método de pago como predeterminado
router.patch('/payment-methods/:id/set-default', [
  param('id')
    .isMongoId().withMessage('Address ID must be a valid MongoDB ObjectId'),

], validate, authMiddleware, setDefaultPaymentMethod);

// Desactivar método de pago
router.patch('/payment-methods/:id/deactivate', [
  param('id')
    .isMongoId().withMessage('Address ID must be a valid MongoDB ObjectId'),

], validate, authMiddleware, deactivatePaymentMethod);

// Actualizar método de pago
router.put('/payment-methods/:id', [
  param('id')
    .isMongoId().withMessage('Address ID must be a valid MongoDB ObjectId'),

  body('cardHolderName')
    .if(body('type').isIn(['credit_card', 'debit_card']))
    .notEmpty().withMessage('El nombre del titular es obligatorio para tarjetas.')
    .isLength({ min: 3 }).withMessage('El nombre del titular debe tener al menos 3 caracteres.'),

  body('expiryDate')
    .if(body('type').isIn(['credit_card', 'debit_card']))
    .notEmpty().withMessage('La fecha de expiración es obligatoria.')
    .matches(/^(0[1-9]|1[0-2])\/\d{2}$/).withMessage('La fecha debe tener el formato MM/YY.'),

  body('paypalEmail')
    .if(body('type').equals('paypal'))
    .notEmpty().withMessage('El correo de PayPal es obligatorio.')
    .isEmail().withMessage('El correo de PayPal no es válido.'),

  body('bankName')
    .if(body('type').equals('bank_transfer'))
    .notEmpty().withMessage('El nombre del banco es obligatorio.'),

  body('accountNumber')
    .if(body('type').equals('bank_transfer'))
    .notEmpty().withMessage('El número de cuenta es obligatorio.')
    .isLength({ min: 6 }).withMessage('El número de cuenta debe tener al menos 6 caracteres.'),

  body('isDefault')
    .optional()
    .isBoolean().withMessage('isDefault debe ser booleano.'),

  body('isActive')
    .optional()
    .isBoolean().withMessage('isActive debe ser booleano.')
], validate, authMiddleware, updatePaymentMethod);

// Eliminar método de pago permanentemente
router.delete('/payment-methods/:id', [
  param('id')
    .isMongoId().withMessage('Address ID must be a valid MongoDB ObjectId'),

], validate, authMiddleware, deletePaymentMethod);

export default router;
