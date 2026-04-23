import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  searchProducts
} from '../../src/controllers/productController.js';
import Product from '../../src/models/product.js';
import SubCategory from '../../src/models/subCategory.js';
import { createMockReqRes } from '../helpers/createMockReqRes.js';

vi.mock('../../src/models/product.js');
vi.mock('../../src/models/subCategory.js');

describe('productController Unit Tests', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe('getProducts', () => {
        it('should return all products with pagination', async () => {
            const { req, res, next } = createMockReqRes();
            const mockProducts = [{ name: 'P1' }];
            Product.find.mockReturnValue({
                populate: vi.fn().mockReturnValue({
                    sort: vi.fn().mockResolvedValue(mockProducts)
                })
            });

            await getProducts(req, res, next);
            expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
                products: mockProducts,
                pagination: expect.any(Object)
            }));
        });
    });

    describe('createProduct', () => {
        it('should create a product if category exists', async () => {
            const { req, res, next } = createMockReqRes({
                body: { name: 'New P', category: 'cat123' }
            });
            SubCategory.findById.mockResolvedValue({ _id: 'cat123' });
            Product.create.mockResolvedValue({ _id: 'p123' });
            Product.findById.mockReturnValue({
                populate: vi.fn().mockResolvedValue({ name: 'New P' })
            });

            await createProduct(req, res, next);
            expect(res.status).toHaveBeenCalledWith(201);
        });

        it('should return 400 if category does not exist', async () => {
            const { req, res, next } = createMockReqRes({
                body: { name: 'New P', category: 'invalid' }
            });
            SubCategory.findById.mockResolvedValue(null);

            await createProduct(req, res, next);
            expect(res.status).toHaveBeenCalledWith(400);
        });
    });
});
