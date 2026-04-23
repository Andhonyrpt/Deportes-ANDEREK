import { describe, it, expect, vi, beforeEach } from 'vitest';

// ─── Mocks (antes de cualquier import del controlador) ─────────────────────────
const mockSubCategorySave = vi.fn().mockResolvedValue(undefined);

vi.mock('../../src/models/subCategory.js', () => {
  const MockSubCategory = vi.fn().mockImplementation(function (data) {
    Object.assign(this, data);
    this.save = mockSubCategorySave;
  });
  MockSubCategory.find = vi.fn();
  MockSubCategory.findById = vi.fn();
  MockSubCategory.findByIdAndUpdate = vi.fn();
  MockSubCategory.findByIdAndDelete = vi.fn();
  MockSubCategory.countDocuments = vi.fn();
  return { default: MockSubCategory };
});

vi.mock('../../src/models/category.js', () => ({
  default: {
    exists: vi.fn(),
  },
}));

vi.mock('../../src/models/product.js', () => ({
  default: {
    exists: vi.fn(),
  },
}));

// ─── Imports reales ────────────────────────────────────────────────────────────
import {
  getSubCategories,
  getSubCategoryById,
  createSubCategory,
  updateSubCategory,
  deleteSubCategory,
} from '../../src/controllers/subCategoryController.js';
import SubCategory from '../../src/models/subCategory.js';
import Category from '../../src/models/category.js';
import Product from '../../src/models/product.js';
import { createMockReqRes } from '../helpers/createMockReqRes.js';

// ─── Datos de prueba comunes ───────────────────────────────────────────────────
const FAKE_PARENT = { _id: 'cat001', name: 'Ropa' };
const FAKE_SUBCAT = {
  _id: 'sub001',
  name: 'Camisetas',
  description: 'Camisetas deportivas',
  imageURL: 'https://example.com/img.jpg',
  parentCategory: FAKE_PARENT,
};

// ─────────────────────────────────────────────────────────────────────────────
describe('subCategoryController Unit Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockSubCategorySave.mockResolvedValue(undefined);
  });

  // ── getSubCategories ───────────────────────────────────────────────────────
  describe('getSubCategories', () => {
    it('200 — devuelve todas las subcategorías sin paginación', async () => {
      const { req, res, next } = createMockReqRes({ query: {} });
      SubCategory.find.mockReturnValue({ populate: vi.fn().mockResolvedValue([FAKE_SUBCAT]) });

      await getSubCategories(req, res, next);

      expect(SubCategory.find).toHaveBeenCalledWith({});
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ subCategories: [FAKE_SUBCAT] });
    });

    it('200 — filtra por parentCategory', async () => {
      const { req, res, next } = createMockReqRes({ query: { parentCategory: 'cat001' } });
      SubCategory.find.mockReturnValue({ populate: vi.fn().mockResolvedValue([FAKE_SUBCAT]) });

      await getSubCategories(req, res, next);

      expect(SubCategory.find).toHaveBeenCalledWith({ parentCategory: 'cat001' });
    });

    it('200 — devuelve lista paginada con page y limit', async () => {
      const { req, res, next } = createMockReqRes({ query: { page: '1', limit: '5' } });
      const chain = {
        populate: vi.fn().mockReturnThis(),
        skip: vi.fn().mockReturnThis(),
        limit: vi.fn().mockResolvedValue([FAKE_SUBCAT]),
      };
      SubCategory.find.mockReturnValue(chain);
      SubCategory.countDocuments.mockResolvedValue(1);

      await getSubCategories(req, res, next);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          subCategories: [FAKE_SUBCAT],
          pagination: expect.objectContaining({ currentPage: 1, totalResults: 1 }),
        })
      );
    });

    it('200 — paginación hasNext y hasPrev correctos', async () => {
      // página 2 de 3 → hasNext: true, hasPrev: true
      const { req, res, next } = createMockReqRes({ query: { page: '2', limit: '1' } });
      const chain = {
        populate: vi.fn().mockReturnThis(),
        skip: vi.fn().mockReturnThis(),
        limit: vi.fn().mockResolvedValue([FAKE_SUBCAT]),
      };
      SubCategory.find.mockReturnValue(chain);
      SubCategory.countDocuments.mockResolvedValue(3);

      await getSubCategories(req, res, next);

      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          pagination: expect.objectContaining({ hasNext: true, hasPrev: true }),
        })
      );
    });

    it('next(err) — error de base de datos', async () => {
      const err = new Error('DB down');
      const { req, res, next } = createMockReqRes({ query: {} });
      SubCategory.find.mockReturnValue({ populate: vi.fn().mockRejectedValue(err) });

      await getSubCategories(req, res, next);

      expect(next).toHaveBeenCalledWith(err);
    });
  });

  // ── getSubCategoryById ─────────────────────────────────────────────────────
  describe('getSubCategoryById', () => {
    it('200 — devuelve la subcategoría por ID', async () => {
      const { req, res, next } = createMockReqRes({ params: { id: 'sub001' } });
      SubCategory.findById.mockReturnValue({ populate: vi.fn().mockResolvedValue(FAKE_SUBCAT) });

      await getSubCategoryById(req, res, next);

      expect(SubCategory.findById).toHaveBeenCalledWith('sub001');
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(FAKE_SUBCAT);
    });

    it('404 — subcategoría no encontrada', async () => {
      const { req, res, next } = createMockReqRes({ params: { id: 'sub_noop' } });
      SubCategory.findById.mockReturnValue({ populate: vi.fn().mockResolvedValue(null) });

      await getSubCategoryById(req, res, next);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ message: 'SubCategory not found' });
    });

    it('next(err) — error de base de datos', async () => {
      const err = new Error('DB error');
      const { req, res, next } = createMockReqRes({ params: { id: 'sub001' } });
      SubCategory.findById.mockReturnValue({ populate: vi.fn().mockRejectedValue(err) });

      await getSubCategoryById(req, res, next);

      expect(next).toHaveBeenCalledWith(err);
    });
  });

  // ── createSubCategory ──────────────────────────────────────────────────────
  describe('createSubCategory', () => {
    it('400 — falta name (campos requeridos incompletos)', async () => {
      const { req, res, next } = createMockReqRes({
        body: { description: 'Desc', parentCategory: 'cat001' }, // sin name
      });

      await createSubCategory(req, res, next);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ message: 'All fields are required' });
    });

    it('400 — falta description', async () => {
      const { req, res, next } = createMockReqRes({
        body: { name: 'Camisetas', parentCategory: 'cat001' },
      });

      await createSubCategory(req, res, next);

      expect(res.status).toHaveBeenCalledWith(400);
    });

    it('400 — categoría padre no existe', async () => {
      const { req, res, next } = createMockReqRes({
        body: { name: 'Camisetas', description: 'Desc', parentCategory: 'cat_noop' },
      });
      Category.exists.mockResolvedValue(null);

      await createSubCategory(req, res, next);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ message: 'Parent category does not exist' });
    });

    it('201 — crea la subcategoría exitosamente', async () => {
      const { req, res, next } = createMockReqRes({
        body: {
          name: 'Camisetas',
          description: 'Camisetas deportivas',
          imageURL: 'https://example.com/img.jpg',
          parentCategory: 'cat001',
        },
      });
      Category.exists.mockResolvedValue({ _id: 'cat001' });

      await createSubCategory(req, res, next);

      expect(mockSubCategorySave).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({ name: 'Camisetas', description: 'Camisetas deportivas' })
      );
    });

    it('next(err) — error de base de datos al guardar', async () => {
      const err = new Error('Duplicate key');
      mockSubCategorySave.mockRejectedValue(err);
      const { req, res, next } = createMockReqRes({
        body: { name: 'X', description: 'Y', parentCategory: 'cat001' },
      });
      Category.exists.mockResolvedValue({ _id: 'cat001' });

      await createSubCategory(req, res, next);

      expect(next).toHaveBeenCalledWith(err);
    });
  });

  // ── updateSubCategory ──────────────────────────────────────────────────────
  describe('updateSubCategory', () => {
    it('400 — falta name', async () => {
      const { req, res, next } = createMockReqRes({
        params: { id: 'sub001' },
        body: { description: 'Desc', parentCategory: 'cat001' },
      });

      await updateSubCategory(req, res, next);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ message: 'All fields are required' });
    });

    it('400 — categoría padre no existe', async () => {
      const { req, res, next } = createMockReqRes({
        params: { id: 'sub001' },
        body: { name: 'X', description: 'Y', parentCategory: 'cat_noop' },
      });
      Category.exists.mockResolvedValue(null);

      await updateSubCategory(req, res, next);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ message: 'Parent category does not exist' });
    });

    it('404 — subcategoría no encontrada', async () => {
      const { req, res, next } = createMockReqRes({
        params: { id: 'sub_noop' },
        body: { name: 'X', description: 'Y', parentCategory: 'cat001' },
      });
      Category.exists.mockResolvedValue({ _id: 'cat001' });
      SubCategory.findByIdAndUpdate.mockReturnValue({ populate: vi.fn().mockResolvedValue(null) });

      await updateSubCategory(req, res, next);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ message: 'SubCategory not found' });
    });

    it('200 — actualiza la subcategoría exitosamente', async () => {
      const updated = { ...FAKE_SUBCAT, name: 'Camisetas Actualizadas' };
      const { req, res, next } = createMockReqRes({
        params: { id: 'sub001' },
        body: { name: 'Camisetas Actualizadas', description: 'Camisetas deportivas', parentCategory: 'cat001' },
      });
      Category.exists.mockResolvedValue({ _id: 'cat001' });
      SubCategory.findByIdAndUpdate.mockReturnValue({ populate: vi.fn().mockResolvedValue(updated) });

      await updateSubCategory(req, res, next);

      expect(SubCategory.findByIdAndUpdate).toHaveBeenCalledWith(
        'sub001',
        expect.objectContaining({ name: 'Camisetas Actualizadas' }),
        { new: true }
      );
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(updated);
    });

    it('next(err) — error de base de datos', async () => {
      const err = new Error('DB error');
      const { req, res, next } = createMockReqRes({
        params: { id: 'sub001' },
        body: { name: 'X', description: 'Y', parentCategory: 'cat001' },
      });
      Category.exists.mockResolvedValue({ _id: 'cat001' });
      SubCategory.findByIdAndUpdate.mockReturnValue({ populate: vi.fn().mockRejectedValue(err) });

      await updateSubCategory(req, res, next);

      expect(next).toHaveBeenCalledWith(err);
    });
  });

  // ── deleteSubCategory ──────────────────────────────────────────────────────
  describe('deleteSubCategory', () => {
    it('400 — no se puede eliminar subcategoría con productos asociados', async () => {
      const { req, res, next } = createMockReqRes({ params: { id: 'sub001' } });
      Product.exists.mockResolvedValue({ _id: 'prod001' }); // tiene productos

      await deleteSubCategory(req, res, next);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ message: 'Cannot delete subcategory with products' });
    });

    it('404 — subcategoría no encontrada', async () => {
      const { req, res, next } = createMockReqRes({ params: { id: 'sub_noop' } });
      Product.exists.mockResolvedValue(null);
      SubCategory.findByIdAndDelete.mockResolvedValue(null);

      await deleteSubCategory(req, res, next);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ message: 'SubCategory not found' });
    });

    it('204 — elimina la subcategoría exitosamente', async () => {
      const { req, res, next } = createMockReqRes({ params: { id: 'sub001' } });
      res.send = vi.fn();
      Product.exists.mockResolvedValue(null);
      SubCategory.findByIdAndDelete.mockResolvedValue(FAKE_SUBCAT);

      await deleteSubCategory(req, res, next);

      expect(SubCategory.findByIdAndDelete).toHaveBeenCalledWith('sub001');
      expect(res.status).toHaveBeenCalledWith(204);
    });

    it('next(err) — error de base de datos al verificar productos', async () => {
      const err = new Error('DB error');
      const { req, res, next } = createMockReqRes({ params: { id: 'sub001' } });
      Product.exists.mockRejectedValue(err);

      await deleteSubCategory(req, res, next);

      expect(next).toHaveBeenCalledWith(err);
    });

    it('next(err) — error de base de datos al eliminar', async () => {
      const err = new Error('DB error');
      const { req, res, next } = createMockReqRes({ params: { id: 'sub001' } });
      Product.exists.mockResolvedValue(null);
      SubCategory.findByIdAndDelete.mockRejectedValue(err);

      await deleteSubCategory(req, res, next);

      expect(next).toHaveBeenCalledWith(err);
    });
  });
});
