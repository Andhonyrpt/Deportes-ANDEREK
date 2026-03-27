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

/**
 * @openapi
 * /cart:
 *   get:
 *     summary: Obtener todos los carritos (Admin)
 *     tags: [Cart]
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200: { description: Lista de carritos }
 */
router.get('/cart', authMiddleware, isAdmin, getCarts);

/**
 * @openapi
 * /cart/user/{userId}:
 *   get:
 *     summary: Obtener carrito por usuario
 *     tags: [Cart]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200: { description: Carrito del usuario }
 */
router.get('/cart/user/:userId', authMiddleware, [
  mongoIdValidation("userId", "User ID")
], validate, getCartByUser);

/**
 * @openapi
 * /cart/add:
 *   post:
 *     summary: Agregar producto al carrito
 *     tags: [Cart]
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               productId: { type: string }
 *               quantity: { type: integer }
 *               size: { type: string }
 *     responses:
 *       200: { description: Producto agregado }
 */
router.post('/cart/add', authMiddleware, [
  bodyMongoIdValidation("productId", "Product ID"),
  quantityValidation("quantity", true),
  sizeValidation("size", true)
], validate, addProductToCart);

/**
 * @openapi
 * /cart/{id}:
 *   get:
 *     summary: Obtener carrito por ID (Admin)
 *     tags: [Cart]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200: { description: Detalle del carrito }
 */
router.get('/cart/:id', authMiddleware, isAdmin, [
  mongoIdValidation("id", "Cart ID")
], validate, getCartById);

/**
 * @openapi
 * /cart/create:
 *   post:
 *     summary: Crear nuevo carrito
 *     tags: [Cart]
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               products: { type: array, items: { type: object } }
 *     responses:
 *       201: { description: Carrito creado }
 */
router.post('/cart/create', authMiddleware, [
  body("products")
    .notEmpty().withMessage("Products are required")
    .isArray({ min: 1 }).withMessage("Products must be a non-empty array"),
  bodyMongoIdValidation("products.*.product", "Product ID"),
  quantityValidation("products.*.quantity"),
  sizeValidation("products.*.size")
], validate, createCart);

/**
 * @openapi
 * /cart/update/{id}:
 *   put:
 *     summary: Actualizar carrito completo
 *     tags: [Cart]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200: { description: Carrito actualizado }
 */
router.put('/cart/update/:id', authMiddleware, [
  mongoIdValidation("id", "Cart ID"),
  body("products").optional().isArray().withMessage("Products must be an array"),
  bodyMongoIdValidation("products.*.product", "Product ID", true),
  quantityValidation("products.*.quantity", true),
  sizeValidation("products.*.size", true)
], validate, updateCart);

/**
 * @openapi
 * /cart/clear/{id}:
 *   delete:
 *     summary: Eliminar carrito
 *     tags: [Cart]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200: { description: Carrito eliminado }
 */
router.delete('/cart/clear/:id', [
  mongoIdValidation("id", "Cart ID")
], validate, authMiddleware, deleteCart);

/**
 * @openapi
 * /cart/update-item:
 *   put:
 *     summary: Actualizar producto en carrito
 *     tags: [Cart]
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200: { description: Item actualizado }
 */
router.put("/cart/update-item", authMiddleware, [
  bodyMongoIdValidation("productId", "Product ID"),
  quantityValidation("quantity", true),
  sizeValidation("size", true),
  sizeValidation("oldSize", true),
], validate, updateCartItem);

/**
 * @openapi
 * /cart/remove-item/{productId}:
 *   delete:
 *     summary: Eliminar producto del carrito
 *     tags: [Cart]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: productId
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200: { description: Item eliminado }
 */
router.delete("/cart/remove-item/:productId", authMiddleware, [
  mongoIdValidation("productId", "Product ID"),
  sizeValidation("size")
], validate, removeCartItem);

/**
 * @openapi
 * /cart/clear:
 *   post:
 *     summary: Vaciar carrito
 *     tags: [Cart]
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200: { description: Carrito vaciado }
 */
router.post("/cart/clear", authMiddleware, [], validate, clearCartItems);

/**
 * @openapi
 * /cart/merge:
 *   post:
 *     summary: Combinar carritos
 *     tags: [Cart]
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200: { description: Carritos combinados }
 */
router.post("/cart/merge", authMiddleware, [
  body("products").isArray().withMessage("Products must be an array"),
  bodyMongoIdValidation("products.*.productId", "Product ID"),
  quantityValidation("products.*.quantity", true),
  sizeValidation("products.*.size", true)
], validate, mergeCart);

export default router;