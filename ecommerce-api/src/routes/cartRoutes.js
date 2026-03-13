import express from 'express';
import { body, param } from 'express-validator';
import {
  getCarts,
  getCartById,
  getCartByUser,
  createCart,
  updateCart,
  deleteCart,
  addProductToCart,
  updateCartItem,
  removeCartItem,
  clearCartItems,
  mergeCart
} from '../controllers/cartController.js';
import validate from '../middlewares/validations.js';
import authMiddleware from '../middlewares/authMiddleware.js';
import isAdmin from '../middlewares/isAdminMiddleware.js';
import {
  mongoIdValidation,
  bodyMongoIdValidation,
  quantityValidation,
  sizeValidation
} from '../middlewares/validators.js';

const router = express.Router();

// Obtener todos los carritos (admin)
router.get('/cart', authMiddleware, isAdmin, getCarts);

// Obtener carrito por usuario
router.get('/cart/user/:userId', authMiddleware, [
  mongoIdValidation("userId", "User ID")
], validate, getCartByUser);

// Agregar producto al carrito 
router.post('/cart/add', authMiddleware, [
  bodyMongoIdValidation("productId", "Product ID"),
  quantityValidation("quantity", true),
  sizeValidation("size", true)
], validate, addProductToCart);

// Obtener carrito por ID (admin)
router.get('/cart/:id', authMiddleware, isAdmin, [
  mongoIdValidation("id", "Cart ID")
], validate, getCartById);

// Crear nuevo carrito
router.post('/cart/create', authMiddleware, [
  body("products")
    .notEmpty()
    .withMessage("Products are required")
    .isArray({ min: 1 })
    .withMessage("Products must be a non-empty array"),
  bodyMongoIdValidation("products.*.product", "Product ID"),
  quantityValidation("products.*.quantity"),
  sizeValidation("products.*.size")
], validate, createCart);

// Actualizar carrito completo
router.put('/cart/update/:id', authMiddleware, [
  mongoIdValidation("id", "Cart ID"),
  body("products")
    .optional()
    .isArray()
    .withMessage("Products must be an array"),
  bodyMongoIdValidation("products.*.product", "Product ID", true),
  quantityValidation("products.*.quantity", true),
  sizeValidation("products.*.size", true)
], validate, updateCart);

// Eliminar carrito
router.delete('/cart/clear/:id', [
  mongoIdValidation("id", "Cart ID")
], validate, authMiddleware, deleteCart);

// Rutas nuevas
router.put("/cart/update-item", authMiddleware,
  [
    bodyMongoIdValidation("productId", "Product ID"),
    quantityValidation("quantity", true),
    sizeValidation("size", true),
    sizeValidation("oldSize", true),
  ], validate, updateCartItem);

router.delete("/cart/remove-item/:productId", authMiddleware, [
  mongoIdValidation("productId", "Product ID"),
  sizeValidation("size")
], validate, removeCartItem);

router.post("/cart/clear", authMiddleware, [], validate, clearCartItems);

router.post("/cart/merge", authMiddleware, [
  body("products").isArray().withMessage("Products must be an array"),
  bodyMongoIdValidation("products.*.productId", "Product ID"),
  quantityValidation("products.*.quantity", true),
  sizeValidation("products.*.size", true)
], validate, mergeCart);

export default router;
