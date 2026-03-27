import express from "express";
import {
    register,
    login,
    checkEmail,
    refreshToken,
    logout
} from '../controllers/authController.js';
import validate from "../middlewares/validations.js";
import { authLimiter } from "../middlewares/rateLimiter.js";
import {
    displayNameValidation,
    emailValidation,
    passwordValidation,
    phoneValidation,
    queryEmailValidation,
    passwordLoginValidation,
} from "../middlewares/validators.js";

const router = express.Router();

// Aplicar rate limiting a todas las rutas 
router.use(authLimiter);

/**
 * @openapi
 * /auth/register:
 *   post:
 *     summary: Registrar un nuevo usuario
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [displayName, email, password, phone]
 *             properties:
 *               displayName: { type: string }
 *               email: { type: string, format: email }
 *               password: { type: string, minLength: 6 }
 *               phone: { type: string }
 *     responses:
 *       201: { description: Usuario registrado exitosamente }
 */
router.post(
    "/register",
    [
        displayNameValidation(),
        emailValidation(),
        passwordValidation(),
        phoneValidation(),
    ],
    validate,
    register
);

/**
 * @openapi
 * /auth/login:
 *   post:
 *     summary: Iniciar sesión
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, password]
 *             properties:
 *               email: { type: string }
 *               password: { type: string }
 *     responses:
 *       200: { description: Login exitoso }
 */
router.post("/login", [emailValidation(), passwordLoginValidation()], validate, login);

/**
 * @openapi
 * /auth/refresh:
 *   post:
 *     summary: Renovar Access Token usando Refresh Token
 *     tags: [Auth]
 *     responses:
 *       200: { description: Token refrescado exitosamente }
 */
router.post("/refresh", refreshToken);

/**
 * @openapi
 * /auth/logout:
 *   post:
 *     summary: Cerrar sesión
 *     tags: [Auth]
 *     responses:
 *       200: { description: Sesión cerrada }
 */
router.post("/logout", logout);

/**
 * @openapi
 * /auth/check-email:
 *   get:
 *     summary: Verificar disponibilidad de correo
 *     tags: [Auth]
 *     parameters:
 *       - in: query
 *         name: email
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200: { description: Retorna true si existe }
 */
router.get("/check-email", [queryEmailValidation()], validate, checkEmail);

export default router;