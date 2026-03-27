import express from 'express';
import { body, param } from 'express-validator';
import {
    createReview,
    getProductReviews,
    getUserReviews,
    updateReview,
    deleteReview
} from '../controllers/reviewController.js';
import authMiddleware from '../middlewares/authMiddleware.js';
import validate from '../middlewares/validations.js';
import {
    mongoIdValidation,
    bodyMongoIdValidation,
    ratingValidation,
    commentValidation
} from '../middlewares/validators.js';

const router = express.Router();

/**
 * @openapi
 * /review:
 *   post:
 *     summary: Crear una nueva review
 *     tags: [Reviews]
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [product, rating]
 *             properties:
 *               product: { type: string }
 *               rating: { type: integer, min: 1, max: 5 }
 *               comment: { type: string }
 *     responses:
 *       201: { description: Review creada }
 */
router.post('/review', authMiddleware, [
    bodyMongoIdValidation('product', 'Product ID'),
    ratingValidation('rating'),
    commentValidation('comment')
], validate, createReview);

/**
 * @openapi
 * /review-product/{productId}:
 *   get:
 *     summary: Obtener reviews de un producto
 *     tags: [Reviews]
 *     parameters:
 *       - in: path
 *         name: productId
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200: { description: Lista de reviews }
 */
router.get('/review-product/:productId', [
    mongoIdValidation('productId', 'Product ID')
], validate, getProductReviews);

/**
 * @openapi
 * /my-reviews:
 *   get:
 *     summary: Obtener reviews del usuario autenticado
 *     tags: [Reviews]
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200: { description: Lista de reviews }
 */
router.get('/my-reviews', authMiddleware, getUserReviews);

/**
 * @openapi
 * /my-reviews/{reviewId}:
 *   put:
 *     summary: Actualizar una review
 *     tags: [Reviews]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: reviewId
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200: { description: Review actualizada }
 */
router.put('/my-reviews/:reviewId', authMiddleware, [
    mongoIdValidation('reviewId', 'Review ID'),
    ratingValidation(true),
    commentValidation()
], validate, updateReview);

/**
 * @openapi
 * /my-reviews/{reviewId}:
 *   delete:
 *     summary: Eliminar una review
 *     tags: [Reviews]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: reviewId
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200: { description: Eliminada }
 */
router.delete('/my-reviews/:reviewId', authMiddleware, [
    mongoIdValidation('reviewId', 'Review ID')
], validate, deleteReview);

export default router;