import express from 'express';
import {
    getProducts,
    getProductById,
    getProductByCategory,
    createProduct,
    updateProduct,
    deleteProduct,
} from '../controllers/productController.js';

const router = express.Router();

router.get('/product', getProducts);
router.get('/product/:id', getProductById);
router.get('/product/category/:id', getProductByCategory);
router.post('/product', createProduct);
router.put('/product/:id', updateProduct);
router.get('/product/:id', deleteProduct);

export default router;