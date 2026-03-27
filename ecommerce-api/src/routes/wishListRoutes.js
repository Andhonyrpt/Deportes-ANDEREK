import express from 'express';
import { body, param } from 'express-validator';
import {
    getUserWishList,
    addToWishList,
    removeFromWishList,
    clearWishList,
    checkProductInWishList,
    moveToCart
} from '../controllers/wishListController.js';
import authMiddleware from '../middlewares/authMiddleware.js';
import validate from '../middlewares/validations.js';
import {
    mongoIdValidation,
    bodyMongoIdValidation,
    sizeValidation
} from '../middlewares/validators.js';

const router = express.Router();

/**
 * @openapi
 * /wishlist:
 *   get:
 *     summary: Obtener wishlist del usuario
 *     tags: [Wishlist]
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200: { description: Lista de deseos }
 */
router.get('/wishlist', authMiddleware, getUserWishList);

/**
 * @openapi
 * /wishlist/add:
 *   post:
 *     summary: Agregar producto a wishlist
 *     tags: [Wishlist]
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               productId: { type: string }
 *     responses:
 *       200: { description: Producto agregado }
 */
router.post('/wishlist/add', authMiddleware, [
    bodyMongoIdValidation('productId', 'Product ID')
], validate, addToWishList);

/**
 * @openapi
 * /wishlist/check/{productId}:
 *   get:
 *     summary: Verificar si un producto está en wishlist
 *     tags: [Wishlist]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: productId
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200: { description: true o false }
 */
router.get('/wishlist/check/:productId', authMiddleware, [
    mongoIdValidation('productId', 'Product ID')
], validate, checkProductInWishList);

/**
 * @openapi
 * /wishlist/remove/{productId}:
 *   delete:
 *     summary: Remover producto de wishlist
 *     tags: [Wishlist]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: productId
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200: { description: Producto removido }
 */
router.delete('/wishlist/remove/:productId', authMiddleware, [
    mongoIdValidation('productId', 'Product ID')
], validate, removeFromWishList);

/**
 * @openapi
 * /wishlist/move-to-cart:
 *   post:
 *     summary: Mover producto a carrito
 *     tags: [Wishlist]
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               productId: { type: string }
 *               size: { type: string }
 *     responses:
 *       200: { description: Movido al carrito }
 */
router.post('/wishlist/move-to-cart', authMiddleware, [
    bodyMongoIdValidation('productId', 'Product ID'),
    sizeValidation('size')
], validate, moveToCart);

/**
 * @openapi
 * /wishlist/clear:
 *   delete:
 *     summary: Limpiar wishlist
 *     tags: [Wishlist]
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200: { description: Wishlist vaciada }
 */
router.delete('/wishlist/clear', authMiddleware, clearWishList);

export default router;