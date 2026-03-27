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

/**
 * @openapi
 * /users/profile:
 *   get:
 *     summary: Obtener perfil del usuario autenticado
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Perfil del usuario
 */
router.get('/users/profile', authMiddleware, getUserProfile);

/**
 * @openapi
 * /users:
 *   get:
 *     summary: Obtener todos los usuarios (Admin)
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Lista de usuarios
 */
router.get('/users', authMiddleware, isAdmin, [
    ...paginationValidation(),
    queryRoleValidation(),
    queryIsActiveValidation()
], validate, getUsers);

/**
 * @openapi
 * /search:
 *   get:
 *     summary: Buscar usuarios (Admin)
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: query
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Resultados de búsqueda
 */
router.get('/search', authMiddleware, [
    searchQueryValidation(),
    ...paginationValidation(),
    queryRoleValidation(),
    queryIsActiveValidation(),
    sortFieldValidation(['email', 'displayName' /*, 'createdAt'*/]),
    orderValidation()
], validate, searchUsers);

/**
 * @openapi
 * /users/{userId}:
 *   get:
 *     summary: Obtener usuario por ID (Admin)
 *     tags: [Users]
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
 *         description: Detalle del usuario
 */
router.get('/users/:userId', authMiddleware, isAdmin, [
    mongoIdValidation('userId', 'User ID')
], validate, getUserById);

/**
 * @openapi
 * /users:
 *   post:
 *     summary: Crear nuevo usuario (Admin)
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [displayName, email, password, phone, role]
 *             properties:
 *               displayName:
 *                 type: string
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *               phone:
 *                 type: string
 *               role:
 *                 type: string
 *               isActive:
 *                 type: boolean
 *     responses:
 *       201:
 *         description: Usuario creado
 */
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

/**
 * @openapi
 * /users/profile:
 *   put:
 *     summary: Actualizar perfil propio
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       200:
 *         description: Perfil actualizado
 */
router.put('/users/profile', authMiddleware, profileValidations, validate, updateUserProfile);

/**
 * @openapi
 * /change-password/{userId}:
 *   put:
 *     summary: Cambiar contraseña
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [currentPassword, newPassword, confirmPassword]
 *     responses:
 *       200:
 *         description: Contraseña cambiada
 */
router.put('/change-password/:userId', authMiddleware, [
    body("currentPassword").notEmpty().withMessage("Current password is required"),
    newPasswordValidation(),
    confirmPasswordValidation()
], validate, changePassword);

/**
 * @openapi
 * /users/{userId}:
 *   put:
 *     summary: Actualizar cualquier usuario (Admin)
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
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
 *         description: Usuario actualizado
 */
router.put('/users/:userId', authMiddleware, isAdmin, [
    mongoIdValidation('userId', 'User ID'),
    ...profileValidations,
    roleValidation(),
    booleanValidation('isActive')
], validate, updateUser);

/**
 * @openapi
 * /deactivate:
 *   patch:
 *     summary: Desactivar cuenta propia
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Cuenta desactivada
 */
router.patch('/deactivate', authMiddleware, deactivateUser);

/**
 * @openapi
 * /toggle-status/{userId}:
 *   patch:
 *     summary: Activar/Desactivar usuario (Admin)
 *     tags: [Users]
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
 *         description: Estado cambiado
 */
router.patch('/toggle-status/:userId', authMiddleware, isAdmin, [
    mongoIdValidation('userId', 'User ID')
], validate, toggleUserStatus);

/**
 * @openapi
 * /users/{userId}:
 *   delete:
 *     summary: Eliminar usuario (Admin)
 *     tags: [Users]
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
 *         description: Usuario eliminado
 */
router.delete('/users/:userId', authMiddleware, isAdmin, [
    mongoIdValidation('userId', 'User ID')
], validate, deleteUser);

export default router;