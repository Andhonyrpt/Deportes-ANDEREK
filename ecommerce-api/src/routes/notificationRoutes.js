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

/**
 * @openapi
 * /notifications:
 *   get:
 *     summary: Obtener todas las notificaciones (Admin)
 *     tags: [Notifications]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista completa
 */
router.get('/notifications', authMiddleware, isAdmin, getNotifications);

/**
 * @openapi
 * /notifications/unread/{userId}:
 *   get:
 *     summary: Obtener notificaciones no leídas
 *     tags: [Notifications]
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
 *         description: Conteo/listado de no leídas
 */
router.get('/notifications/unread/:userId', authMiddleware, [
  mongoIdValidation('userId', 'User ID')
], validate, getUnreadNotificationsByUser);

/**
 * @openapi
 * /notifications/user/{userId}:
 *   get:
 *     summary: Obtener notificaciones por usuario
 *     tags: [Notifications]
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
 *         description: Historial de notificaciones
 */
router.get('/notifications/user/:userId', authMiddleware, [
  mongoIdValidation('userId', 'User ID')
], validate, getNotificationByUser);

/**
 * @openapi
 * /notifications/{id}:
 *   get:
 *     summary: Obtener notificación por ID
 *     tags: [Notifications]
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
 *         description: Detalle notification
 */
router.get('/notifications/:id', authMiddleware, [
  mongoIdValidation('id', 'Notification ID')
], validate, getNotificationById);

/**
 * @openapi
 * /notifications:
 *   post:
 *     summary: Crear nueva notificación (Admin)
 *     tags: [Notifications]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [user, message]
 *             properties:
 *               user:
 *                 type: string
 *               message:
 *                 type: string
 *     responses:
 *       201:
 *         description: Notificación enviada
 */
router.post('/notifications', authMiddleware, [
  bodyMongoIdValidation('user', 'User ID'),
  messageValidation()
], validate, createNotification);

/**
 * @openapi
 * /notifications/{id}/mark-read:
 *   patch:
 *     summary: Marcar como leída
 *     tags: [Notifications]
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
 *         description: Notification marcada
 */
router.patch('/notifications/:id/mark-read', authMiddleware, [
  mongoIdValidation('id', 'Notification ID')
], validate, markAsRead);

/**
 * @openapi
 * /notifications/user/{userId}/mark-all-read:
 *   patch:
 *     summary: Marcar todas como leídas
 *     tags: [Notifications]
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
 *         description: Historial marcado
 */
router.patch('/notifications/user/:userId/mark-all-read', authMiddleware, [
  mongoIdValidation('userId', 'User ID')
], validate, markAllAsReadByUser);

/**
 * @openapi
 * /notifications/{id}:
 *   put:
 *     summary: Actualizar notificación (Admin)
 *     tags: [Notifications]
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
 *     responses:
 *       200:
 *         description: Registro modificado
 */
router.put('/notifications/:id', authMiddleware, isAdmin, [
  mongoIdValidation('id', 'Notification ID'),
  messageValidation(500).optional(),
  booleanValidation('isRead')
], validate, updateNotification);

/**
 * @openapi
 * /notifications/{id}:
 *   delete:
 *     summary: Eliminar notificación
 *     tags: [Notifications]
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
 *         description: Eliminación exitosa
 */
router.delete('/notifications/:id', authMiddleware, [
  mongoIdValidation('id', 'Notification ID')
], validate, deleteNotification);

export default router;