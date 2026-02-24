import express from 'express';
import { body, param, query } from 'express-validator';
import {
    getProducts,
    getProductById,
    getProductByCategory,
    createProduct,
    updateProduct,
    searchProducts,
    deleteProduct
} from '../controllers/productController.js';
import authMiddleware from '../middlewares/authMiddleware.js';
import isAdmin from '../middlewares/isAdminMiddleware.js';
import validate from '../middlewares/validations.js';
import {
    bodyMongoIdValidation,
    generalNameValidation,
    genreValidation,
    imagesUrlValidation,
    mongoIdValidation,
    orderValidation,
    paginationValidation,
    priceOptionalValidation,
    priceValidation,
    productDescriptionValidation,
    productNameValidation,
    queryBooleanValidation,
    queryMongoIdValidation,
    queryPriceValidation,
    searchQueryValidation,
    sizeValidation,
    sortFieldValidation,
    stockOptionalValidation,
    stockValidation
} from '../middlewares/validators.js';
import { mongo } from 'mongoose';

const router = express.Router();

// Obtener todos los productos con paginación
router.get('/products', [
    ...paginationValidation()
], getProducts);

// Buscar productos con filtros
router.get('/products/search', [
    searchQueryValidation(),
    queryMongoIdValidation('category', 'Category ID'),
    queryPriceValidation('minPrice'),
    queryPriceValidation('maxPrice'),
    queryBooleanValidation('inStock'),
    sortFieldValidation(['name', 'price', 'stock' /*, 'createdAt'*/]),
    orderValidation(),
    ...paginationValidation()
], validate, searchProducts);

router.get('/products/category/:idCategory', [
    mongoIdValidation('idCategory', 'Category ID')
], validate, getProductByCategory);

router.get('/products/:id', [
    mongoIdValidation('id', 'Product ID')
], validate, getProductById);

router.post('/products', authMiddleware, isAdmin, [
    productNameValidation(true),
    productDescriptionValidation(true),
    generalNameValidation('modelo'),
    genreValidation('genre'),
    priceValidation('price'),
    body('variants').isArray({ min: 1 }).withMessage('At least one variant is required'),
    sizeValidation('variants.*.size'),
    stockValidation('variants.*.stock'),
    ...imagesUrlValidation(true),
    bodyMongoIdValidation('category', 'Category ID')
], validate, createProduct);

router.put('/products/:id', authMiddleware, isAdmin, [
    mongoIdValidation('id', 'Product ID'),
    productNameValidation(false),
    productDescriptionValidation(false),
    generalNameValidation('modelo', true),
    genreValidation('genre', true),
    priceOptionalValidation('price'),
    sizeValidation('variants.*.size', true),
    stockValidation('variants.*.stock'),
    ...imagesUrlValidation(false),
    bodyMongoIdValidation('category', 'Category ID', true)
], validate, updateProduct);

router.delete('/products/:id', authMiddleware, isAdmin, [
    mongoIdValidation('id', 'Product ID')
], validate, deleteProduct);

export default router;