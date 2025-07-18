import express from 'express';
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

const router = express.Router();

// Obtener todas las órdenes (admin)
router.get('/orders', getOrders);

// Obtener órdenes por usuario
router.get('/orders/user/:userId', getOrdersByUser);

// Obtener orden por ID
router.get('/orders/:id', getOrderById);

// Crear nueva orden
router.post('/orders', createOrder);

// Cancelar orden (función especial)
router.patch('/orders/:id/cancel', cancelOrder);

// Actualizar solo el estado de la orden
router.patch('/orders/:id/status', updateOrderStatus);

// Actualizar solo el estado de pago
router.patch('/orders/:id/payment-status', updatePaymentStatus);

// Actualizar orden completa
router.put('/orders/:id', updateOrder);

// Eliminar orden (solo si está cancelada)
router.delete('/orders/:id', deleteOrder);

export default router;
