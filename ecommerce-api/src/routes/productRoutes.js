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

const router = express.Router();

/**
 * @openapi
 * /products:
 *   get:
 *     summary: Obtener todos los productos con paginación
 *     tags: [Products]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *     responses:
 *       200:
 *         description: Lista de productos devuelta exitosamente
 */
router.get('/products', [
    ...paginationValidation()
], getProducts);

/**
 * @openapi
 * /products/search:
 *   get:
 *     summary: Buscar productos con filtros
 *     tags: [Products]
 *     parameters:
 *       - in: query
 *         name: query
 *         schema:
 *           type: string
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *       - in: query
 *         name: minPrice
 *         schema:
 *           type: number
 *       - in: query
 *         name: maxPrice
 *         schema:
 *           type: number
 *       - in: query
 *         name: inStock
 *         schema:
 *           type: boolean
 *     responses:
 *       200:
 *         description: Resultados de búsqueda
 */
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

/**
 * @openapi
 * /products/category/{idCategory}:
 *   get:
 *     summary: Obtener productos por categoría
 *     tags: [Products]
 *     parameters:
 *       - in: path
 *         name: idCategory
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Productos de la categoría
 */
router.get('/products/category/:idCategory', [
    mongoIdValidation('idCategory', 'Category ID')
], validate, getProductByCategory);

/**
 * @openapi
 * /products/{id}:
 *   get:
 *     summary: Obtener producto por ID
 *     tags: [Products]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Detalle del producto
 */
router.get('/products/:id', [
    mongoIdValidation('id', 'Product ID')
], validate, getProductById);

/**
 * @openapi
 * /products:
 *   post:
 *     summary: Crear un nuevo producto (Admin)
 *     tags: [Products]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name, description, price, variants, category]
 *             properties:
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *               modelo:
 *                 type: string
 *               genre:
 *                 type: string
 *               price:
 *                 type: number
 *               variants:
 *                 type: array
 *                 items:
 *                   type: object
 *               imagesUrl:
 *                 type: array
 *                 items:
 *                   type: string
 *               category:
 *                 type: string
 *     responses:
 *       201:
 *         description: Producto creado
 */
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

/**
 * @openapi
 * /products/{id}:
 *   put:
 *     summary: Actualizar un producto (Admin)
 *     tags: [Products]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
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
 *         description: Producto actualizado
 */
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

/**
 * @openapi
 * /products/{id}:
 *   delete:
 *     summary: Eliminar un producto (Admin)
 *     tags: [Products]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Producto eliminado
 */
router.delete('/products/:id', authMiddleware, isAdmin, [
    mongoIdValidation('id', 'Product ID')
], validate, deleteProduct);

export default router;