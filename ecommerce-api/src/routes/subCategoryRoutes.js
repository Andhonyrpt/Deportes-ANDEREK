import express from 'express';
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
import { 
    bodyMongoIdValidation, 
    generalNameValidation, 
    mongoIdValidation, 
    productDescriptionValidation 
} from '../middlewares/validators.js';

const router = express.Router();

/**
 * @openapi
 * /subcategories:
 *   get:
 *     summary: Obtener todas las subcategorías
 *     tags: [SubCategories]
 *     responses:
 *       200:
 *         description: Lista de subcategorías
 */
router.get('/subcategories', getSubCategories);

/**
 * @openapi
 * /subcategories/{id}:
 *   get:
 *     summary: Obtener subcategoría por ID
 *     tags: [SubCategories]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Detalle de la subcategoría
 */
router.get('/subcategories/:id', authMiddleware, isAdmin, [
    mongoIdValidation('id', 'SubCategory ID')
], validate, getSubCategoryById);

/**
 * @openapi
 * /subcategories:
 *   post:
 *     summary: Crear subcategoría (Admin)
 *     tags: [SubCategories]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name, description, parentCategory]
 *             properties:
 *               name: { type: string }
 *               description: { type: string }
 *               imageURL: { type: string }
 *               parentCategory: { type: string }
 *     responses:
 *       201:
 *         description: Creada
 */
router.post('/subcategories', authMiddleware, isAdmin, [
    generalNameValidation('name'),
    productDescriptionValidation('description'),
    bodyMongoIdValidation('parentCategory', 'Parent Category ID')
], validate, createSubCategory);

/**
 * @openapi
 * /subcategories/{id}:
 *   put:
 *     summary: Actualizar subcategoría (Admin)
 *     tags: [SubCategories]
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
router.put('/subcategories/:id', authMiddleware, isAdmin, [
    mongoIdValidation('id', 'SubCategory ID'),
    generalNameValidation('name', true),
    productDescriptionValidation('description', true),
    bodyMongoIdValidation('parentCategory', 'Parent Category ID', true)
], validate, updateSubCategory);

/**
 * @openapi
 * /subcategories/{id}:
 *   delete:
 *     summary: Eliminar subcategoría (Admin)
 *     tags: [SubCategories]
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
router.delete('/subcategories/:id', authMiddleware, isAdmin, [
    mongoIdValidation('id', 'SubCategory ID')
], validate, deleteSubCategory);

export default router;