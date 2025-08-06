import express from 'express';
import { body, param } from 'express-validator';
import validate from '../middlewares/validations.js';
import {
    getProducts,
    getProductById,
    getProductByCategory,
    createProduct,
    updateProduct,
    deleteProduct,
} from '../controllers/productController.js';
import authMiddleware from '../middlewares/authMiddleware.js';
import isAdmin from '../middlewares/isAdminMiddleware.js';

const router = express.Router();

const validateProduct = [
    body('name')
        .notEmpty().withMessage('El nombre es obligatorio.')
        .isString().withMessage('El nombre debe ser una cadena de texto.')
        .trim(),

    body('description')
        .notEmpty().withMessage('La descripción es obligatoria.')
        .isString().withMessage('La descripción debe ser una cadena de texto.')
        .trim(),

    body('modelo')
        .notEmpty().withMessage('El modelo es obligatorio.')
        .isIn(['Local', 'Visitante']).withMessage('El modelo debe ser "Local" o "Visitante".'),

    body('sizes')
        .optional()
        .isArray().withMessage('Sizes debe ser un arreglo.')
        .custom((arr) => arr.every(size => ['S', 'M', 'L'].includes(size)))
        .withMessage('Tallas válidas: S, M, L.'),

    body('genre')
        .optional()
        .isIn(['Hombre', 'Mujer', 'Niño']).withMessage('Género no válido.'),

    body('price')
        .notEmpty().withMessage('El precio es obligatorio.')
        .isFloat({ min: 1 }).withMessage('El precio debe ser mayor o igual a 1.'),

    body('stock')
        .notEmpty().withMessage('El stock es obligatorio.')
        .isInt({ min: 0 }).withMessage('El stock debe ser un número entero mayor o igual a 0.'),

    body('imagesURL')
        .optional()
        .isArray().withMessage('imagesURL debe ser un arreglo.')
        .custom((arr) => arr.every(url => typeof url === 'string'))
        .withMessage('Todas las URLs deben ser cadenas de texto.'),

    body('category')
        .notEmpty().withMessage('La categoría es obligatoria.')
        .isMongoId().withMessage('Address ID must be a valid MongoDB ObjectId'),
];

router.get('/products', getProducts);
router.get('/products/:id', [
    param('id')
        .isMongoId().withMessage('Address ID must be a valid MongoDB ObjectId'),

], validate, getProductById);
router.get('/products/category/:idCategory', [
    param('idCategory')
        .isMongoId().withMessage('Address ID must be a valid MongoDB ObjectId'),

], validate, getProductByCategory);
router.post('/products', validateProduct, validate, authMiddleware, isAdmin, createProduct);
router.put('/products/:id', [
    param('idCategory')
        .isMongoId().withMessage('Address ID must be a valid MongoDB ObjectId'),

], validateProduct, validate, authMiddleware, isAdmin, updateProduct);
router.delete('/products/:id', [
    param('idCategory')
        .isMongoId().withMessage('Address ID must be a valid MongoDB ObjectId'),

], validate, authMiddleware, isAdmin, deleteProduct);

export default router;