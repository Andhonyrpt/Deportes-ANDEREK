import express from 'express';
import { body, param, query } from 'express-validator';
import {
    getUserProfile,
    getUsers,
    getUserById,
    updateUserProfile,
    changePassword,
    updateUser,
    deactivateUser,
    toggleUserStatus,
    deleteUser,
    searchUsers,
    createUser
} from '../controllers/userController.js';
import authMiddleware from '../middlewares/authMiddleware.js'; // Middleware de autenticación
import isAdmin from '../middlewares/isAdminMiddleware.js'; // Middleware de admin
import validate from '../middlewares/validations.js';
import {
    displayNameValidation,
    emailValidation,
    passwordValidation,
    phoneValidation,
    urlValidation,
    paginationValidation,
    mongoIdValidation,
    roleValidation,
    booleanValidation,
    userDisplayNameValidation,
    fullPasswordValidation,
    newPasswordValidation,
    confirmPasswordValidation,
    queryRoleValidation,
    queryIsActiveValidation,
    searchQueryValidation,
    sortFieldValidation,
    orderValidation
} from '../middlewares/validators.js';

const router = express.Router();

// Validaciones comunes para actualizar perfil
const profileValidations = [
    userDisplayNameValidation(false),
    emailValidation(true),
    phoneValidation(),
    urlValidation('avatar')
];

// Obtener perfil del usuario autenticado
router.get('/users/profile', authMiddleware, getUserProfile);

router.get('/users', authMiddleware, isAdmin, [
    ...paginationValidation(),
    queryRoleValidation(),
    queryIsActiveValidation()
], validate, getUsers);

// Buscar usuarios (requiere autenticación)
router.get('/search', authMiddleware, [
    searchQueryValidation(),
    ...paginationValidation(),
    queryRoleValidation(),
    queryIsActiveValidation(),
    sortFieldValidation(['email', 'displayName' /*, 'createdAt'*/]),
    orderValidation()
], validate, searchUsers);

router.get('/users/:userId', authMiddleware, isAdmin, [
    mongoIdValidation('userId', 'User ID')
], validate, getUserById);

// Crear nuevo usuario (solo admin)
router.post(
    "/users",
    authMiddleware,
    isAdmin,
    [
        userDisplayNameValidation(true),
        emailValidation(),
        fullPasswordValidation(),
        phoneValidation(),
        urlValidation("avatar"),
        roleValidation(),
        booleanValidation("isActive"),
    ],
    validate,
    createUser
);

router.put('/users/profile', authMiddleware, profileValidations, validate, updateUserProfile);

router.put('/change-password/:userId', authMiddleware, [
    body("currentPassword").notEmpty().withMessage("Current password is required"),
    newPasswordValidation(),
    confirmPasswordValidation()
], validate, changePassword);

router.put('/users/:userId', authMiddleware, isAdmin, [
    mongoIdValidation('userId', 'User ID'),
    ...profileValidations,
    roleValidation(),
    booleanValidation('isActive')
], validate, updateUser);

// Desactivar cuenta propia
router.patch('/deactivate', authMiddleware, deactivateUser);

// Activar/Desactivar usuario (solo admin)
router.patch('/toggle-status/:userId', authMiddleware, isAdmin, [
    mongoIdValidation('userId', 'User ID')
], validate, toggleUserStatus);

router.delete('/users/:userId', authMiddleware, isAdmin, [
    mongoIdValidation('userId', 'User ID')
], validate, deleteUser);

export default router;