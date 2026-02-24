import express from 'express';
import { body, param } from 'express-validator';
import {
  getNotifications,
  getNotificationById,
  getNotificationByUser,
  createNotification,
  updateNotification,
  deleteNotification,
  markAsRead,
  markAllAsReadByUser,
  getUnreadNotificationsByUser,
} from '../controllers/notificationController.js';
import authMiddleware from '../middlewares/authMiddleware.js';
import isAdmin from '../middlewares/isAdminMiddleware.js';
import validate from '../middlewares/validations.js';
import {
  bodyMongoIdValidation,
  messageValidation,
  booleanValidation,
  mongoIdValidation
} from '../middlewares/validators.js'

const router = express.Router();

// Obtener todas las notificaciones (admin)
router.get('/notifications', authMiddleware, isAdmin, getNotifications);

// Obtener notificaciones no leídas por usuario
router.get('/notifications/unread/:userId', authMiddleware, [
  mongoIdValidation('userId', 'User ID')
], validate, getUnreadNotificationsByUser);

// Obtener notificaciones por usuario
router.get('/notifications/user/:userId', authMiddleware, [
  mongoIdValidation('userId', 'User ID')
], validate, getNotificationByUser);

// Obtener notificación por ID
router.get('/notifications/:id', authMiddleware, [
  mongoIdValidation('id', 'Notification ID')
], validate, getNotificationById);

// Crear nueva notificación (admin)
router.post('/notifications', authMiddleware, [
  bodyMongoIdValidation('user', 'User ID'),
  messageValidation()
], validate, createNotification);

// Marcar una notificación como leída
router.patch('/notifications/:id/mark-read', authMiddleware, [
  mongoIdValidation('id', 'Notification ID')
], validate, markAsRead);

// Marcar todas las notificaciones de un usuario como leídas
router.patch('/notifications/user/:userId/mark-all-read', authMiddleware, [
  mongoIdValidation('userId', 'User ID')
], validate, markAllAsReadByUser);

// Actualizar notificación (admin)
router.put('/notifications/:id', authMiddleware, isAdmin, [
  mongoIdValidation('id', 'Notification ID'),
  messageValidation(500).optional(),
  booleanValidation('isRead')
], validate, updateNotification);

// Eliminar notificación
router.delete('/notifications/:id', authMiddleware, [
  mongoIdValidation('id', 'Notification ID')
], validate, deleteNotification);

export default router;
