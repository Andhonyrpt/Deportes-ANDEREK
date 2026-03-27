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

/**
 * @openapi
 * /categories/search:
 *   get:
 *     summary: Buscar categorías
 *     tags: [Categories]
 *     parameters:
 *       - in: query
 *         name: q
 *         schema: { type: string }
 *       - in: query
 *         name: parentCategory
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Resultados de búsqueda
 */
router.get('/categories/search', [
    searchQueryValidation(),
    queryMongoIdValidation('parentCategory', 'parent category ID'),
    sortFieldValidation(['name', 'description']),
    orderValidation(),
    ...paginationValidation()
], validate, searchCategories);

/**
 * @openapi
 * /categories:
 *   get:
 *     summary: Obtener todas las categorías
 *     tags: [Categories]
 *     responses:
 *       200:
 *         description: Lista de categorías
 */
/**
 * @openapi
 * /categories:
 *   get:
 *     summary: Obtener todas las categorías
 *     tags: [Categories]
 *     responses:
 *       200:
 *         description: Lista de categorías
 */
router.get('/categories', getCategories);

/**
 * @openapi
 * /categories/{id}:
 *   get:
 *     summary: Obtener categoría por ID
 *     tags: [Categories]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Detalle de la categoría
 */
router.get('/categories/:id', [
    mongoIdValidation('id', 'Category ID')
], validate, getCategoryById);

/**
 * @openapi
 * /categories:
 *   post:
 *     summary: Crear categoría (Admin)
 *     tags: [Categories]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name, description]
 *             properties:
 *               name: { type: string }
 *               description: { type: string }
 *               imageUrl: { type: string }
 *               parentCategory: { type: string }
 *     responses:
 *       201:
 *         description: Creada
 */
router.post('/categories', authMiddleware, isAdmin, [
    generalNameValidation('name', true, 100),
    descriptionValidation('description'),
    urlValidation('imageUrl'),
    bodyMongoIdValidation('parentCategory', 'Parent category ID', true)
], validate, createCategory);

/**
 * @openapi
 * /categories/{id}:
 *   put:
 *     summary: Actualizar categoría (Admin)
 *     tags: [Categories]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Actualizada
 */
router.put('/categories/:id', authMiddleware, isAdmin, [
    mongoIdValidation('id', 'Category ID'),
    generalNameValidation('name', false, 100),
    descriptionValidation('description'),
    urlValidation('imageUrl'),
    bodyMongoIdValidation('parentCategory', 'Parent category ID', true)
], validate, updateCategory);

/**
 * @openapi
 * /categories/{id}:
 *   delete:
 *     summary: Eliminar categoría (Admin)
 *     tags: [Categories]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       204:
 *         description: Eliminada
 */
router.delete('/categories/:id', authMiddleware, isAdmin, [
    mongoIdValidation('id', 'Category ID')
], validate, deleteCategory);

export default router;