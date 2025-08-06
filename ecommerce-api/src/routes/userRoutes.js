import express from 'express';
import { body, param, query } from 'express-validator';
import validate from '../middlewares/validations.js';
import {
    getUserProfile,
    getUsers,
    getUserById,
    updateUserProfile,
    changePassword,
    updateUser,
    deactivateUser,
    toggleUserStatus,
    deleteUser
} from '../controllers/userController.js';
import authMiddleware from '../middlewares/authMiddleware.js'; // Middleware de autenticación
import isAdmin from '../middlewares/isAdminMiddleware.js'; // Middleware de admin

const router = express.Router();

// Validaciones comunes para actualizar perfil
const profileValidations = [
    body('displayName')
        .optional()
        .isLength({ min: 2, max: 50 }).withMessage('Display name must be between 2 and 50 characters')
        .matches(/^[a-zA-Z0-9áéíóúÁÉÍÓÚñÑ\s]+$/).withMessage('Display name must contain only letters, numbers and spaces')
        .trim(),

    body('email')
        .optional()
        .isEmail().withMessage('Valid email is required')
        .normalizeEmail(),

    body('phone')
        .optional()
        .isLength({ min: 10, max: 10 }).withMessage('Phone must be exactly 10 digits')
        .isNumeric().withMessage('Phone must contain only numbers'),

    body('avatar')
        .optional()
        .isURL().withMessage('Avatar must be a valid URL')
];

router.get('/profile/:userId', authMiddleware, getUserProfile);

router.get('/users', [
    query('page')
        .optional()
        .isInt({ min: 1 }).withMessage('Page must be a positive integer'),

    query('limit')
        .optional()
        .isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),

    query('role')
        .optional()
        .isIn(['admin', 'customer', 'guest']).withMessage('Role must be admin, customer, or guest'),

    query('isActive')
        .optional()
        .isBoolean().withMessage('isActive must be a boolean value')

], validate, authMiddleware, isAdmin, getUsers);

router.get('/users/:userId', [
    param('userId')
        .isMongoId().withMessage('User ID must be a valid MongoDB ObjectId')
], validate, authMiddleware, isAdmin, getUserById);

router.put('/profile', profileValidations, validate, authMiddleware, updateUserProfile);

router.put('/change-password/:userId', [
    body('currentPassword')
        .notEmpty().withMessage('Current password is required'),

    body('newPassword')
        .isLength({ min: 6 }).withMessage('New password must be at least 6 characters long')
        .matches(/\d/).withMessage('New password must contain at least one number')
        .matches(/[a-zA-Z]/).withMessage('New password must contain at least one letter'),

    body('confirmPassword')
        .custom((value, { req }) => {
            if (value !== req.body.newPassword) {
                throw new Error('Password confirmation does not match new password');
            }
            return true;
        })
], validate, authMiddleware, changePassword);

router.put('/users/:userId', [
    param('userId')
        .isMongoId().withMessage('User ID must be a valid MongoDB ObjectId'),

    body('role')
        .optional()
        .isIn(['admin', 'customer', 'guest']).withMessage('Role must be admin, customer, or guest'),

    body('isActive')
        .optional()
        .isBoolean().withMessage('isActive must be a boolean value')
], profileValidations, validate, authMiddleware, isAdmin, updateUser);

// Desactivar cuenta propia
router.patch('/deactivate/:userId', authMiddleware, deactivateUser);

// Activar/Desactivar usuario (solo admin)
router.patch('/toggle-status/:userId', [
    param('userId')
        .isMongoId().withMessage('User ID must be a valid MongoDB ObjectId')
], validate, authMiddleware, isAdmin, toggleUserStatus);

router.delete('/users/:userId', [
    param('userId')
        .isMongoId().withMessage('User ID must be a valid MongoDB ObjectId')
], validate, authMiddleware, isAdmin, deleteUser);

export default router;