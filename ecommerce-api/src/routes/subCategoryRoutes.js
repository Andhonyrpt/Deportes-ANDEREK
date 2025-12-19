import express from 'express';
import { body, param, query } from 'express-validator';
import validate from '../middlewares/validations.js';
import {
    getSubCategories,
    getSubCategoryById,
    createSubCategory,
    updateSubCategory,
    deleteSubCategory
} from '../controllers/subCategoryController.js';
import authMiddleware from '../middlewares/authMiddleware.js';
import isAdmin from '../middlewares/isAdminMiddleware.js';

const router = express.Router();

const validateCategory = [
    body('name')
        .notEmpty().withMessage('El nombre es obligatorio')
        .isString().withMessage('El nombre debe ser una cadena de texto')
        .trim(),

    body('description')
        .notEmpty().withMessage('La descripción es obligatoria')
        .isString().withMessage('La descripción debe ser una cadena de texto')
        .trim(),

    body('imageUrl')
        .optional()
        .isURL().withMessage('La URL de la imagen no es válida'),

    body('parentCategory')
        .optional()
        .isMongoId().withMessage('Address ID must be a valid MongoDB ObjectId')
];

router.get('/subcategories', authMiddleware, getSubCategories);

router.get('/subcategories/:id', [
    param('id')
        .isMongoId().withMessage('Address ID must be a valid MongoDB ObjectId')
], validate, authMiddleware, isAdmin, getSubCategoryById);

router.post('/subcategories', validateCategory, validate, authMiddleware, isAdmin, createSubCategory);

router.put('/subcategories/:id', [
    param('id')
        .isMongoId().withMessage('Address ID must be a valid MongoDB ObjectId')
], validateCategory, validate, authMiddleware, isAdmin, updateSubCategory);

router.delete('/subcategories/:id', [
    param('id')
        .isMongoId().withMessage('Address ID must be a valid MongoDB ObjectId')
], validate, authMiddleware, isAdmin, deleteSubCategory);

export default router;