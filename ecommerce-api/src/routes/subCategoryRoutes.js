import express from 'express';
import { body, param, query } from 'express-validator';
import {
    getSubCategories,
    getSubCategoryById,
    createSubCategory,
    updateSubCategory,
    deleteSubCategory
} from '../controllers/subCategoryController.js';
import authMiddleware from '../middlewares/authMiddleware.js';
import isAdmin from '../middlewares/isAdminMiddleware.js';
import validate from '../middlewares/validations.js';
import { bodyMongoIdValidation, generalNameValidation, mongoIdValidation, productDescriptionValidation } from '../middlewares/validators.js';

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

router.get('/subcategories', getSubCategories);

router.get('/subcategories/:id', authMiddleware, isAdmin, [
    mongoIdValidation('id', 'SubCategory ID')
], validate, getSubCategoryById);

router.post('/subcategories', authMiddleware, isAdmin, [
    generalNameValidation('name'),
    productDescriptionValidation('description'),
    bodyMongoIdValidation('parentCategory', 'Parent Category ID')
], validate, createSubCategory);

router.put('/subcategories/:id', authMiddleware, isAdmin, [
    mongoIdValidation('id', 'SubCategory ID'),
    generalNameValidation('name', true),
    productDescriptionValidation('description', true),
    bodyMongoIdValidation('parentCategory', 'Parent Category ID', true)
], validate, updateSubCategory);

router.delete('/subcategories/:id', authMiddleware, isAdmin, [
    mongoIdValidation('id', 'SubCategory ID')
], validate, deleteSubCategory);

export default router;