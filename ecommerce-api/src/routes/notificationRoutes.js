import express from 'express';
import { body, param } from 'express-validator';
import validate from '../middlewares/validations.js';
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

const router = express.Router();

// Obtener todas las notificaciones (admin)
router.get('/notifications', authMiddleware, isAdmin, getNotifications);

// Obtener notificaciones no leídas por usuario
router.get('/notifications/unread/:userId', [
  param('id')
    .isMongoId().withMessage('Address ID must be a valid MongoDB ObjectId')
], validate, authMiddleware, getUnreadNotificationsByUser);

// Obtener notificaciones por usuario
router.get('/notifications/user/:userId', [
  param('userId')
    .isMongoId().withMessage('Address ID must be a valid MongoDB ObjectId')
], validate, authMiddleware, getNotificationByUser);

// Obtener notificación por ID
router.get('/notifications/:id', [
  param('id')
    .isMongoId().withMessage('Address ID must be a valid MongoDB ObjectId')
], validate, authMiddleware, getNotificationById);

// Crear nueva notificación (admin)
router.post('/notifications', [
  body('user')
    .notEmpty().withMessage('El campo "user" es obligatorio')
    .isMongoId().withMessage('Address ID must be a valid MongoDB ObjectId'),

  body('message')
    .notEmpty().withMessage('El mensaje es obligatorio')
    .isString().withMessage('El mensaje debe ser una cadena de texto')
    .trim()

], validate, authMiddleware, isAdmin, createNotification);

// Marcar una notificación como leída
router.patch('/notifications/:id/mark-read', [
  param('id')
    .isMongoId().withMessage('Address ID must be a valid MongoDB ObjectId')
], validate, authMiddleware, markAsRead);

// Marcar todas las notificaciones de un usuario como leídas
router.patch('/notifications/user/:userId/mark-all-read', [
  param('userId')
    .isMongoId().withMessage('Address ID must be a valid MongoDB ObjectId')
], validate, authMiddleware, markAllAsReadByUser);

// Actualizar notificación (admin)
router.put('/notifications/:id', [
  param('id')
    .isMongoId().withMessage('Address ID must be a valid MongoDB ObjectId'),

  body('message')
    .notEmpty().withMessage('El mensaje es obligatorio')
    .isString().withMessage('El mensaje debe ser una cadena de texto')
    .trim(),

  body('isRead')
    .optional()
    .isBoolean().withMessage('"isRead" must be a boolean value (true/false)'),
], validate, authMiddleware, isAdmin, updateNotification);

// Eliminar notificación
router.delete('/notifications/:id', [
  param('id')
    .isMongoId().withMessage('Address ID must be a valid MongoDB ObjectId'),
], validate, deleteNotification);

export default router;
