import express from "express";
import { body } from "express-validator";
import { register, login, checkEmail } from '../controllers/authController.js';
import validate from "../middlewares/validations.js";
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

router.get("/check-email", [queryEmailValidation()], validate, checkEmail);

export default router;