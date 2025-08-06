import express from 'express';
import { body, param } from 'express-validator';
import validate from '../middlewares/validations.js';
import {
  getCarts,
  getCartById,
  getCartByUser,
  createCart,
  updateCart,
  deleteCart,
  addProductToCart,
} from '../controllers/cartController.js';
import authMiddleware from '../middlewares/authMiddleware.js';
import isAdmin from '../middlewares/isAdminMiddleware.js';

const router = express.Router();

const validateCart = [
  // Validar que user exista y sea un ObjectId válido
  body('user')
    .notEmpty().withMessage('El campo user es obligatorio')
    .isMongoId().withMessage('Address ID must be a valid MongoDB ObjectId'),

  // Validar que products sea un array
  body('products')
    .isArray({ min: 1 }).withMessage('Debe haber al menos un producto en el carrito'),

  // Validar cada producto individualmente
  body('products.*.product')
    .notEmpty().withMessage('El campo product es obligatorio')
    .isMongoId().withMessage('Address ID must be a valid MongoDB ObjectId'),

  body('products.*.quantity')
    .notEmpty().withMessage('El campo quantity es obligatorio')
    .isInt({ min: 1 }).withMessage('La cantidad debe ser un número entero mayor o igual a 1')
];

// Obtener todos los carritos (admin)
router.get('/cart', authMiddleware, isAdmin, getCarts);

// Obtener carrito por ID (admin)
router.get('/cart/:id', [
  param('id')
    .isMongoId().withMessage('Address ID must be a valid MongoDB ObjectId.')
], validate, authMiddleware, isAdmin, getCartById);

// Obtener carrito por usuario
router.get('/cart/user/:userId', [
  param('userId')
    .isMongoId().withMessage('Address ID must be a valid MongoDB ObjectId')
], validate, authMiddleware, getCartByUser);

// Crear nuevo carrito
router.post('/cart', validateCart, validate, authMiddleware, createCart);

// Agregar producto al carrito (función especial)
router.post('/cart/add-product', [
  body('userId')
    .notEmpty().withMessage('El campo "userId" es obligatorio.')
    .isMongoId().withMessage('Address ID must be a valid MongoDB ObjectId'),

  body('productId')
    .notEmpty().withMessage('El campo "productId" es obligatorio.')
    .isMongoId().withMessage('Address ID must be a valid MongoDB ObjectId'),

  body('quantity')
    .optional()
    .isInt({ min: 1 }).withMessage('La cantidad debe ser un número entero mayor o igual a 1.')
], validate, authMiddleware, addProductToCart);

// Actualizar carrito completo
router.put('/cart/:id', [
  param('id')
    .isMongoId().withMessage('Address ID must be a valid MongoDB ObjectId')
], validateCart, validate, authMiddleware, updateCart);

// Eliminar carrito
router.delete('/cart/:id', [
  param('id')
    .isMongoId().withMessage('Address ID must be a valid MongoDB ObjectId')
], validate, authMiddleware, deleteCart);

export default router;
