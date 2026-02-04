import express from "express";
import {
    register,
    login,
    checkEmail,
    refreshToken
} from '../controllers/authController.js';
import validate from "../middlewares/validations.js";
import { authLimiter } from "../middlewares/rateLimiter.js";
import {
    displayNameValidation,
    emailValidation,
    passwordValidation,
    phoneValidation,
    urlValidation,
    roleValidation,
    queryEmailValidation,
    passwordLoginValidation,
} from "../middlewares/validators.js";

const router = express.Router();

// Aplicar rate limiting a todas las rutas 
router.use(authLimiter);

router.post(
    "/register",
    [
        displayNameValidation(),
        emailValidation(),
        passwordValidation(),
        phoneValidation(),
        // roleValidation(),
        // urlValidation("avatar"),
    ],
    validate,
    register
);

router.post("/login", [emailValidation(), passwordLoginValidation()], validate, login);

router.post("/refresh", refreshToken);

router.get("/check-email", [queryEmailValidation()], validate, checkEmail);

export default router;