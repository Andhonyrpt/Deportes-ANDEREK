import express from 'express';
import { body, param } from 'express-validator';
import validate from '../middlewares/validations.js';
import {
    getUserWishList,
    addToWishList,
    removeFromWishList,
    clearWishList,
    checkProductInWishList,
    moveToCart
} from '../controllers/wishListController.js';
import authMiddleware from '../middlewares/authMiddleware.js';

const router = express.Router();

// Obtener la wishlist del usuario
router.get('/wishlist', authMiddleware, getUserWishList);

// Agregar producto a la wishlist
router.post('/add', [
    body('productId')
        .notEmpty().withMessage('Product ID is required')
        .isMongoId().withMessage('Product ID must be a valid MongoDB ObjectId')
], validate, authMiddleware, addToWishList);

// Verificar si un producto está en la wishlist
router.get('/check/:productId', [
    param('productId')
        .isMongoId().withMessage('Product ID must be a valid MongoDB ObjectId')
], validate, authMiddleware, checkProductInWishList);

// Remover producto de la wishlist
router.delete('/remove/:productId', [
    param('productId')
        .isMongoId().withMessage('Product ID must be a valid MongoDB ObjectId')
], validate, authMiddleware, removeFromWishList);

// Mover producto al carrito
router.post('/move-to-cart', [
    body('productId')
        .notEmpty().withMessage('Product ID is required')
        .isMongoId().withMessage('Product ID must be a valid MongoDB ObjectId')
], validate, authMiddleware, moveToCart);

// Limpiar toda la wishlist
router.delete('/clear', authMiddleware, clearWishList);

export default router;