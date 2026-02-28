import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createCategory, deleteCategory } from '../../src/controllers/categoryController.js';
import { createSubCategory, deleteSubCategory } from '../../src/controllers/subCategoryController.js';
import Category from '../../src/models/category.js';
import SubCategory from '../../src/models/subCategory.js';
import Product from '../../src/models/product.js';
import { createMockReqRes } from '../helpers/createMockReqRes.js';

// Mock dependencias
vi.mock('../../src/models/category.js');
vi.mock('../../src/models/subCategory.js');
vi.mock('../../src/models/product.js');

describe('Categories & SubCategories Unit Tests', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe('Category Controller', () => {
        it('should return 400 if deleting a category with subcategories', async () => {
            const { req, res, next } = createMockReqRes({
                params: { id: 'cat123' }
            });

            SubCategory.exists.mockResolvedValue(true);

            await deleteCategory(req, res, next);

            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({ message: 'Cannot delete category with subcategories' });
            expect(Category.findByIdAndDelete).not.toHaveBeenCalled();
        });

        it('should call next(err) if createCategory fails in Mongoose', async () => {
            const { req, res, next } = createMockReqRes({
                body: { name: 'New Cat' }
            });

            const error = new Error('Mongoose Validation Error');
            Category.prototype.save = vi.fn().mockRejectedValue(error);

            await createCategory(req, res, next);

            expect(next).toHaveBeenCalledWith(error);
        });
    });

    describe('SubCategory Controller', () => {
        it('should return 400 if parent category does not exist during creation', async () => {
            const { req, res, next } = createMockReqRes({
                body: { name: 'Sub', description: 'Desc', parentCategory: 'invalid_cat' }
            });

            Category.exists.mockResolvedValue(false);

            await createSubCategory(req, res, next);

            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({ message: 'Parent category does not exist' });
        });

        it('should return 400 if deleting a subcategory with products', async () => {
            const { req, res, next } = createMockReqRes({
                params: { id: 'sub123' }
            });

            Product.exists.mockResolvedValue(true);

            await deleteSubCategory(req, res, next);

            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({ message: 'Cannot delete subcategory with products' });
            expect(SubCategory.findByIdAndDelete).not.toHaveBeenCalled();
        });
    });
});
