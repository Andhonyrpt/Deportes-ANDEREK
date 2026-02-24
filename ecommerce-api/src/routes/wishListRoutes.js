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

// Obtener la wishlist del usuario
router.get('/wishlist', authMiddleware, getUserWishList);

// Agregar producto a la wishlist
router.post('/wishlist/add', authMiddleware, [
    bodyMongoIdValidation('productId', 'Product ID')
], validate, addToWishList);

// Verificar si un producto está en la wishlist
router.get('/wishlist/check/:productId', authMiddleware, [
    mongoIdValidation('productId', 'Product ID')
], validate, checkProductInWishList);

// Remover producto de la wishlist
router.delete('/wishlist/remove/:productId', authMiddleware, [
    mongoIdValidation('productId', 'Product ID')
], validate, removeFromWishList);

// Mover producto al carrito
router.post('/wishlist/move-to-cart', authMiddleware, [
    bodyMongoIdValidation('productId', 'Product ID'),
    sizeValidation('size')
], validate, moveToCart);

// Limpiar toda la wishlist
router.delete('/wishlist/clear', authMiddleware, clearWishList);

export default router;