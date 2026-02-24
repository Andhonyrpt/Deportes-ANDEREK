import express from 'express';
import { body, param, query } from 'express-validator';
import {
    getCategories,
    getCategoryById,
    createCategory,
    updateCategory,
    deleteCategory,
    searchCategories
} from '../controllers/categoryController.js';
import authMiddleware from '../middlewares/authMiddleware.js';
import isAdmin from '../middlewares/isAdminMiddleware.js';
import validate from '../middlewares/validations.js';
import {
    mongoIdValidation,
    paginationValidation,
    descriptionValidation,
    urlValidation,
    searchQueryValidation,
    sortFieldValidation,
    orderValidation,
    generalNameValidation,
    queryMongoIdValidation,
    bodyMongoIdValidation
} from '../middlewares/validators.js';

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

router.get('/categories/search', [
    searchQueryValidation(),
    queryMongoIdValidation('parentCategory', 'parent category ID'),
    sortFieldValidation(['name', 'description']),
    orderValidation(),
    ...paginationValidation()
], validate, searchCategories);

router.get('/categories', getCategories);

router.get('/categories/:id', [
    mongoIdValidation('id', 'Category ID')
], validate, getCategoryById);

router.post('/categories', authMiddleware, isAdmin, [
    generalNameValidation('name', true, 100),
    descriptionValidation('description'),
    urlValidation('imageUrl'),
    bodyMongoIdValidation('parentCategory', 'Parent category ID', true)
], validate, createCategory);

router.put('/categories/:id', authMiddleware, isAdmin, [
    mongoIdValidation('id', 'Category ID'),
    generalNameValidation('name', false, 100),
    descriptionValidation('description'),
    urlValidation('imageUrl'),
    bodyMongoIdValidation('parentCategory', 'Parent category ID', true)
], validate, updateCategory);

router.delete('/categories/:id', authMiddleware, isAdmin, [
    mongoIdValidation('id', 'Category ID')
], validate, deleteCategory);

export default router;