import { describe, it, expect, vi, beforeEach } from 'vitest';
import { getProducts, getProductById, createProduct, searchProducts } from '../../src/controllers/productController.js';
import Product from '../../src/models/product.js';
import SubCategory from '../../src/models/subCategory.js';
import { createMockReqRes } from '../helpers/createMockReqRes.js';

// Mock dependencies
vi.mock('../../src/models/product.js');
vi.mock('../../src/models/subCategory.js');

describe('productController Unit Tests', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe('getProducts', () => {
        it('should return a paginated list of products', async () => {
            const { req, res, next } = createMockReqRes({ query: { page: '1', limit: '10' } });

            const mockProducts = [{ name: 'Product 1' }, { name: 'Product 2' }];
            Product.find.mockReturnValue({
                populate: vi.fn().mockReturnThis(),
                skip: vi.fn().mockReturnThis(),
                limit: vi.fn().mockReturnThis(),
                sort: vi.fn().mockResolvedValue(mockProducts)
            });
            Product.countDocuments.mockResolvedValue(2);

            await getProducts(req, res, next);

            expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
                products: mockProducts,
                pagination: expect.objectContaining({
                    currentPage: 1,
                    totalResults: 2
                })
            }));
        });
    });

    describe('getProductById', () => {
        it('should return a product if found', async () => {
            const { req, res, next } = createMockReqRes({ params: { id: 'mockId' } });
            const mockProduct = { _id: 'mockId', name: 'Test Product' };

            Product.findById.mockReturnValue({
                populate: vi.fn().mockResolvedValue(mockProduct)
            });

            await getProductById(req, res, next);

            expect(res.json).toHaveBeenCalledWith(mockProduct);
        });

        it('should return 404 if product not found', async () => {
            const { req, res, next } = createMockReqRes({ params: { id: 'nonExistentId' } });

            Product.findById.mockReturnValue({
                populate: vi.fn().mockResolvedValue(null)
            });

            await getProductById(req, res, next);

            expect(res.status).toHaveBeenCalledWith(404);
            expect(res.json).toHaveBeenCalledWith({ message: 'Product not found' });
        });
    });

    describe('createProduct', () => {
        it('should create a new product and return 201', async () => {
            const productData = {
                name: 'New Product',
                category: 'categoryId'
            };
            const { req, res, next } = createMockReqRes({ body: productData });

            SubCategory.findById.mockResolvedValue({ _id: 'categoryId' });
            Product.create.mockResolvedValue({ _id: 'newId', ...productData });
            Product.findById.mockReturnValue({
                populate: vi.fn().mockResolvedValue({ _id: 'newId', ...productData })
            });

            await createProduct(req, res, next);

            expect(res.status).toHaveBeenCalledWith(201);
            expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ name: 'New Product' }));
        });

        it('should return 400 if category is invalid', async () => {
            const { req, res, next } = createMockReqRes({ body: { category: 'invalidId' } });

            SubCategory.findById.mockResolvedValue(null);

            await createProduct(req, res, next);

            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({ error: 'Invalid category' });
        });
    });

    describe('searchProducts', () => {
        it('should filter products by query and price range', async () => {
            const { req, res, next } = createMockReqRes({
                query: { q: 'shoe', minPrice: '10', maxPrice: '50' }
            });

            const mockProducts = [{ name: 'Blue Shoe', price: 20 }];
            Product.find.mockReturnValue({
                populate: vi.fn().mockReturnThis(),
                sort: vi.fn().mockReturnThis(),
                skip: vi.fn().mockReturnThis(),
                limit: vi.fn().mockResolvedValue(mockProducts)
            });
            Product.countDocuments.mockResolvedValue(1);

            await searchProducts(req, res, next);

            expect(Product.find).toHaveBeenCalledWith(expect.objectContaining({
                $or: expect.any(Array),
                price: { $gte: 10, $lte: 50 }
            }));
            expect(res.status).toHaveBeenCalledWith(200);
        });
    });
});
