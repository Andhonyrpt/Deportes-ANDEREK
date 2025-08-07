import express from 'express';
import { body, param, query } from 'express-validator';
import validate from '../middlewares/validations.js';
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

router.get('/categories', authMiddleware, getCategories);

router.get('/categories/search', [
    query('q')
        .optional()
        .isString().withMessage('Search term must be a string'),

    query('parentCategory')
        .optional()
        .isMongoId().withMessage('Address ID must be a valid MongoDB ObjectId'),

    query('sort')
        .optional()
        .isIn(['name', 'description' /*, 'createdAt'*/]) // ajusta según tu modelo real
        .withMessage('Invalid sort fields'),

    query('order')
        .optional()
        .isIn(['asc', 'desc']).withMessage('Order must be "asc" o "desc".'),

    query('page')
        .optional()
        .isInt({ min: 1 })
        .withMessage('Page must be a positive integer'),
    query('limit')
        .optional()
        .isInt({ min: 1 })
        .withMessage('Limit must be a positive integer')
], validate, searchCategories);

router.get('/categories/:id', [
    param('id')
        .isMongoId().withMessage('Address ID must be a valid MongoDB ObjectId')
], validate, authMiddleware, isAdmin, getCategoryById);

router.post('/categories', validateCategory, validate, authMiddleware, isAdmin, createCategory);

router.put('/categories/:id', [
    param('id')
        .isMongoId().withMessage('Address ID must be a valid MongoDB ObjectId')
], validateCategory, validate, authMiddleware, isAdmin, updateCategory);

router.delete('/categories/:id', [
    param('id')
        .isMongoId().withMessage('Address ID must be a valid MongoDB ObjectId')
], validate, authMiddleware, isAdmin, deleteCategory);

export default router;