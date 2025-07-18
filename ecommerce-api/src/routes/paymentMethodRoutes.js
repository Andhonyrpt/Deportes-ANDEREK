import express from 'express';
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

const router = express.Router();

// Obtener todos los métodos de pago activos (admin)
router.get('/payment-methods', getPaymentMethods);

// Obtener método de pago predeterminado de un usuario
router.get('/payment-methods/default/:userId', getDefaultPaymentMethod);

// Obtener métodos de pago de un usuario
router.get('/payment-methods/user/:userId', getPaymentMethodsByUser);

// Obtener método de pago por ID
router.get('/payment-methods/:id', getPaymentMethodById);

// Crear nuevo método de pago
router.post('/payment-methods', createPaymentMethod);

// Establecer método de pago como predeterminado
router.patch('/payment-methods/:id/set-default', setDefaultPaymentMethod);

// Desactivar método de pago
router.patch('/payment-methods/:id/deactivate', deactivatePaymentMethod);

// Actualizar método de pago
router.put('/payment-methods/:id', updatePaymentMethod);

// Eliminar método de pago permanentemente
router.delete('/payment-methods/:id', deletePaymentMethod);

export default router;
