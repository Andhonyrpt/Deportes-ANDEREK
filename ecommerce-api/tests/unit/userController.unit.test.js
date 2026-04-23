import { describe, it, expect, vi, beforeEach } from 'vitest';

// ─── Mocks (deben declararse ANTES de cualquier import del controlador) ─────────
const mockUserSave = vi.fn().mockResolvedValue(undefined);


const createMockChain = (val = null) => {
  const chain = {
    select: vi.fn().mockReturnThis(),
    populate: vi.fn().mockReturnThis(),
    limit: vi.fn().mockReturnThis(),
    skip: vi.fn().mockReturnThis(),
    sort: vi.fn().mockReturnThis(),
    then: function (resolve, reject) {
      const p = this._error ? Promise.reject(this._error) : Promise.resolve(this._val);
      return p.then(resolve, reject);
    },
    _val: val,
    _error: null,
    mockResolvedValue: function (v) { this._val = v; return this; },
    mockRejectedValue: function (e) { this._error = e; return this; },
  };
  return chain;
};

vi.mock('../../src/models/user.js', () => {
  const MockUser = vi.fn().mockImplementation(function (data) {
    Object.assign(this, data);
    this.save = mockUserSave;
  });

  MockUser.findById = vi.fn(() => createMockChain());
  MockUser.find = vi.fn(() => createMockChain());
  MockUser.findOne = vi.fn();
  MockUser.countDocuments = vi.fn();
  return { default: MockUser };
});

vi.mock('bcrypt', () => ({
  default: {
    compare: vi.fn(),
    hash: vi.fn(),
  },
}));

// Mock mongoose.model() para deleteUser (busca órdenes activas)
const mockOrderFindOne = vi.fn();
vi.mock('mongoose', async (importOriginal) => {
  const actual = await importOriginal();
  return {
    ...actual,
    default: {
      ...actual.default,
      model: vi.fn(() => ({ findOne: mockOrderFindOne })),
    },
  };
});

// ─── Imports reales (después del mock) ────────────────────────────────────────
import {
  getUserProfile,
  getUsers,
  getUserById,
  updateUserProfile,
  changePassword,
  updateUser,
  deactivateUser,
  toggleUserStatus,
  deleteUser,
  searchUsers,
  createUser,
} from '../../src/controllers/userController.js';
import User from '../../src/models/user.js';
import bcrypt from 'bcrypt';
import { createMockReqRes } from '../helpers/createMockReqRes.js';

// ─── Datos de prueba comunes ───────────────────────────────────────────────────
const FAKE_USER = {
  _id: 'uid123',
  displayName: 'Juan Pérez',
  email: 'juan@test.com',
  phone: '5551234567',
  role: 'guest',
  isActive: true,
  hashPassword: 'hashed_pw',
};

// ─────────────────────────────────────────────────────────────────────────────
describe('userController Unit Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUserSave.mockResolvedValue(undefined);
  });

  // ── getUserProfile ─────────────────────────────────────────────────────────
  describe('getUserProfile', () => {
    it('200 — devuelve el perfil del usuario autenticado', async () => {
      const { req, res, next } = createMockReqRes({ user: { userId: 'uid123' } });
      User.findById.mockReturnValueOnce(User.findById().mockResolvedValue(FAKE_USER));

      await getUserProfile(req, res, next);

      expect(User.findById).toHaveBeenCalledWith('uid123');
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({ message: 'User profile retrieved successfully', user: FAKE_USER })
      );
    });

    it('404 — usuario no encontrado', async () => {
      const { req, res, next } = createMockReqRes({ user: { userId: 'uid123' } });
      User.findById.mockReturnValueOnce(User.findById().mockResolvedValue(null));

      await getUserProfile(req, res, next);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ message: 'User not found' });
    });

    it('next(err) — error de base de datos', async () => {
      const err = new Error('DB error');
      const { req, res, next } = createMockReqRes({ user: { userId: 'uid123' } });
      User.findById.mockReturnValueOnce(User.findById().mockRejectedValue(err));

      await getUserProfile(req, res, next);

      expect(next).toHaveBeenCalledWith(err);
    });
  });

  // ── getUsers ───────────────────────────────────────────────────────────────
  describe('getUsers', () => {
    it('200 — devuelve lista paginada de usuarios', async () => {
      const fakeUsers = [FAKE_USER];
      const { req, res, next } = createMockReqRes({ query: { page: '1', limit: '10' } });

      const chain = {
        select: vi.fn().mockReturnThis(),
        limit: vi.fn().mockReturnThis(),
        skip: vi.fn().mockReturnThis(),
        sort: vi.fn().mockResolvedValue(fakeUsers),
      };
      User.find.mockReturnValue(chain);
      User.countDocuments.mockResolvedValue(1);

      await getUsers(req, res, next);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'Users retrieved successfully',
          users: fakeUsers,
          pagination: expect.objectContaining({ total: 1, currentPage: 1 }),
        })
      );
    });

    it('200 — filtra por role e isActive=true', async () => {
      const { req, res, next } = createMockReqRes({
        query: { role: 'admin', isActive: 'true' },
      });
      const chain = {
        select: vi.fn().mockReturnThis(),
        limit: vi.fn().mockReturnThis(),
        skip: vi.fn().mockReturnThis(),
        sort: vi.fn().mockResolvedValue([]),
      };
      User.find.mockReturnValue(chain);
      User.countDocuments.mockResolvedValue(0);

      await getUsers(req, res, next);

      expect(User.find).toHaveBeenCalledWith({ role: 'admin', isActive: true });
    });

    it('next(err) — error de base de datos', async () => {
      const err = new Error('timeout');
      const { req, res, next } = createMockReqRes({ query: {} });
      User.find.mockReturnValue({
        select: vi.fn().mockReturnThis(),
        limit: vi.fn().mockReturnThis(),
        skip: vi.fn().mockReturnThis(),
        sort: vi.fn().mockRejectedValue(err),
      });

      await getUsers(req, res, next);

      expect(next).toHaveBeenCalledWith(err);
    });
  });

  // ── getUserById ────────────────────────────────────────────────────────────
  describe('getUserById', () => {
    it('200 — devuelve usuario por ID', async () => {
      const { req, res, next } = createMockReqRes({ params: { userId: 'uid123' } });
      User.findById.mockReturnValueOnce(User.findById().mockResolvedValue(FAKE_USER));

      await getUserById(req, res, next);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({ message: 'User retrieved successfully', user: FAKE_USER })
      );
    });

    it('404 — usuario no encontrado', async () => {
      const { req, res, next } = createMockReqRes({ params: { userId: 'uid_noop' } });
      User.findById.mockReturnValueOnce(User.findById().mockResolvedValue(null));

      await getUserById(req, res, next);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ message: 'User not found' });
    });

    it('next(err) — error de base de datos', async () => {
      const err = new Error('DB down');
      const { req, res, next } = createMockReqRes({ params: { userId: 'uid123' } });
      User.findById.mockReturnValueOnce(User.findById().mockRejectedValue(err));

      await getUserById(req, res, next);

      expect(next).toHaveBeenCalledWith(err);
    });
  });

  // ── updateUserProfile ──────────────────────────────────────────────────────
  describe('updateUserProfile', () => {
    it('400 — sin ningún campo presente', async () => {
      const { req, res, next } = createMockReqRes({
        user: { userId: 'uid123' },
        body: {},
      });

      await updateUserProfile(req, res, next);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({ message: expect.stringContaining('At least one field') })
      );
    });

    it('404 — usuario no encontrado', async () => {
      const { req, res, next } = createMockReqRes({
        user: { userId: 'uid123' },
        body: { displayName: 'Nuevo' },
      });
      User.findById.mockResolvedValueOnce(null);

      await updateUserProfile(req, res, next);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ message: 'User not found' });
    });

    it('400 — email ya en uso por otro usuario', async () => {
      const fakeUser = { ...FAKE_USER, save: mockUserSave };
      const { req, res, next } = createMockReqRes({
        user: { userId: 'uid123' },
        body: { email: 'otro@test.com' },
      });
      User.findById.mockResolvedValueOnce(fakeUser);
      User.findOne.mockResolvedValueOnce({ email: 'otro@test.com' });

      await updateUserProfile(req, res, next);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ message: 'Email already in use' });
    });

    it('200 — actualiza el perfil exitosamente', async () => {
      const fakeUser = { ...FAKE_USER, save: mockUserSave };
      const updatedUser = { ...FAKE_USER, displayName: 'Nuevo Nombre' };
      const { req, res, next } = createMockReqRes({
        user: { userId: 'uid123' },
        body: { displayName: 'Nuevo Nombre' },
      });
      const userObj = { ...fakeUser, save: mockUserSave };
      User.findById
        .mockReturnValueOnce(createMockChain(userObj)) // For line 101
        .mockReturnValueOnce(createMockChain(updatedUser)); // For line 123
      User.findOne.mockResolvedValueOnce(null);

      await updateUserProfile(req, res, next);

      expect(mockUserSave).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({ message: 'Profile updated successfully' })
      );
    });
  });

  // ── changePassword ─────────────────────────────────────────────────────────
  describe('changePassword', () => {
    it('404 — usuario no encontrado', async () => {
      const { req, res, next } = createMockReqRes({
        user: { userId: 'uid123' },
        body: { currentPassword: 'old', newPassword: 'new' },
      });
      User.findById.mockResolvedValueOnce(null);

      await changePassword(req, res, next);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ message: 'User not found' });
    });

    it('400 — contraseña actual incorrecta', async () => {
      const fakeUser = { ...FAKE_USER };
      const { req, res, next } = createMockReqRes({
        user: { userId: 'uid123' },
        body: { currentPassword: 'wrong', newPassword: 'newpass' },
      });
      User.findById.mockResolvedValueOnce(fakeUser);
      bcrypt.compare.mockResolvedValueOnce(false);

      await changePassword(req, res, next);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ message: 'Current password is incorrect' });
    });

    it('200 — cambia la contraseña exitosamente', async () => {
      const fakeUser = { ...FAKE_USER, save: mockUserSave };
      const { req, res, next } = createMockReqRes({
        user: { userId: 'uid123' },
        body: { currentPassword: 'correct', newPassword: 'nuevaPass123' },
      });
      User.findById.mockResolvedValueOnce(fakeUser);
      bcrypt.compare.mockResolvedValueOnce(true);
      bcrypt.hash.mockResolvedValueOnce('hashed_nuevaPass123');

      await changePassword(req, res, next);

      expect(bcrypt.hash).toHaveBeenCalledWith('nuevaPass123', 10);
      expect(mockUserSave).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ message: 'Password changed successfully' });
    });

    it('next(err) — error de base de datos', async () => {
      const err = new Error('DB error');
      const { req, res, next } = createMockReqRes({
        user: { userId: 'uid123' },
        body: { currentPassword: 'p', newPassword: 'n' },
      });
      User.findById.mockRejectedValueOnce(err);

      await changePassword(req, res, next);

      expect(next).toHaveBeenCalledWith(err);
    });
  });

  // ── updateUser (admin) ─────────────────────────────────────────────────────
  describe('updateUser', () => {
    it('400 — sin campos que actualizar', async () => {
      const { req, res, next } = createMockReqRes({
        params: { userId: 'uid123' },
        body: {},
      });

      await updateUser(req, res, next);

      expect(res.status).toHaveBeenCalledWith(400);
    });

    it('404 — usuario no encontrado', async () => {
      const { req, res, next } = createMockReqRes({
        params: { userId: 'uid_noop' },
        body: { role: 'admin' },
      });
      User.findById.mockResolvedValueOnce(null);

      await updateUser(req, res, next);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ message: 'User not found' });
    });

    it('400 — email ya en uso', async () => {
      // El cuerpo envía 'existente@test.com' que es diferente a 'juan@test.com'
      // → el controlador ejecuta User.findOne y encuentra un duplicado → 400
      const fakeUser = { ...FAKE_USER, email: 'juan@test.com', save: mockUserSave };
      const { req, res, next } = createMockReqRes({
        params: { userId: 'uid123' },
        body: { email: 'existente@test.com' },
      });
      const userObj = { ...fakeUser, email: 'juan@test.com', save: mockUserSave };
      // Primera llamada findById → retorna el usuario actual
      User.findById.mockReturnValueOnce(createMockChain(userObj));
      // findOne → encuentra que el email ya existe en otro documento
      User.findOne = vi.fn().mockResolvedValue({ _id: 'otro_uid', email: 'existente@test.com' });

      await updateUser(req, res, next);
      
      if (res.status.mock.calls.length > 0 && res.status.mock.calls[0][0] === 200) {
        console.log("TEST DEBUG: Expected 400 but got 200. Body sent:", req.body);
        console.log("TEST DEBUG: User found by findById:", userObj);
      }

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ message: 'Email already in use' });
    });

    it('200 — actualiza el role exitosamente', async () => {
      const fakeUser = { ...FAKE_USER, save: mockUserSave };
      const updatedUser = { ...FAKE_USER, role: 'admin' };
      const { req, res, next } = createMockReqRes({
        params: { userId: 'uid123' },
        body: { role: 'admin' },
      });
      const userObj = { ...fakeUser, save: mockUserSave };
      User.findById
        .mockReturnValueOnce(createMockChain(userObj))
        .mockReturnValueOnce(createMockChain(updatedUser));

      await updateUser(req, res, next);

      expect(mockUserSave).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({ message: 'User updated successfully', user: updatedUser })
      );
    });
  });

  // ── deactivateUser ─────────────────────────────────────────────────────────
  describe('deactivateUser', () => {
    it('404 — usuario no encontrado', async () => {
      const { req, res, next } = createMockReqRes({ user: { userId: 'uid_noop' } });
      User.findById.mockResolvedValueOnce(null);

      await deactivateUser(req, res, next);

      expect(res.status).toHaveBeenCalledWith(404);
    });

    it('200 — desactiva la cuenta del usuario', async () => {
      const fakeUser = { ...FAKE_USER, isActive: true, save: mockUserSave };
      const { req, res, next } = createMockReqRes({ user: { userId: 'uid123' } });
      const userObj = { ...fakeUser, save: mockUserSave };
      User.findById.mockReturnValueOnce(createMockChain(userObj));


      await deactivateUser(req, res, next);

      expect(userObj.isActive).toBe(false);
      expect(mockUserSave).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ message: 'Account deactivated successfully' });
    });

    it('next(err) — error de base de datos', async () => {
      const err = new Error('DB error');
      const { req, res, next } = createMockReqRes({ user: { userId: 'uid123' } });
      User.findById.mockRejectedValueOnce(err);

      await deactivateUser(req, res, next);

      expect(next).toHaveBeenCalledWith(err);
    });
  });

  // ── toggleUserStatus ───────────────────────────────────────────────────────
  describe('toggleUserStatus', () => {
    it('404 — usuario no encontrado', async () => {
      const { req, res, next } = createMockReqRes({ params: { userId: 'uid_noop' } });
      User.findById.mockResolvedValueOnce(null);

      await toggleUserStatus(req, res, next);

      expect(res.status).toHaveBeenCalledWith(404);
    });

    it('200 — desactiva usuario activo (toggle true→false)', async () => {
      const fakeUser = { ...FAKE_USER, isActive: true, save: mockUserSave };
      const updatedUser = { ...FAKE_USER, isActive: false };
      const { req, res, next } = createMockReqRes({ params: { userId: 'uid123' } });
      User.findById
        .mockResolvedValueOnce(fakeUser)
        .mockReturnValueOnce({ select: vi.fn().mockResolvedValue(updatedUser) });

      await toggleUserStatus(req, res, next);

      expect(fakeUser.isActive).toBe(false);
      expect(mockUserSave).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(200);
    });

    it('200 — activa usuario inactivo (toggle false→true)', async () => {
      const fakeUser = { ...FAKE_USER, isActive: false, save: mockUserSave };
      const updatedUser = { ...FAKE_USER, isActive: true };
      const { req, res, next } = createMockReqRes({ params: { userId: 'uid123' } });
      User.findById
        .mockResolvedValueOnce(fakeUser)
        .mockReturnValueOnce({ select: vi.fn().mockResolvedValue(updatedUser) });

      await toggleUserStatus(req, res, next);

      expect(fakeUser.isActive).toBe(true);
      expect(res.status).toHaveBeenCalledWith(200);
    });

    it('next(err) — error de base de datos', async () => {
      const err = new Error('DB error');
      const { req, res, next } = createMockReqRes({ params: { userId: 'uid123' } });
      User.findById.mockRejectedValueOnce(err);

      await toggleUserStatus(req, res, next);

      expect(next).toHaveBeenCalledWith(err);
    });
  });

  // ── deleteUser ─────────────────────────────────────────────────────────────
  describe('deleteUser', () => {
    it('404 — usuario no encontrado', async () => {
      const { req, res, next } = createMockReqRes({ params: { userId: 'uid_noop' } });
      User.findById.mockResolvedValueOnce(null);

      await deleteUser(req, res, next);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ message: 'User not found' });
    });

    it('400 — usuario tiene órdenes activas', async () => {
      const fakeUser = { ...FAKE_USER, save: mockUserSave };
      const { req, res, next } = createMockReqRes({ params: { userId: 'uid123' } });
      User.findById.mockResolvedValue(fakeUser);
      mockOrderFindOne.mockResolvedValue({ _id: 'ord123', status: 'pending' });

      await deleteUser(req, res, next);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({ message: expect.stringContaining('active orders') })
      );
    });

    it('200 — soft-delete cuando no hay órdenes activas', async () => {
      const fakeUser = { ...FAKE_USER, isActive: true, save: mockUserSave };
      const { req, res, next } = createMockReqRes({ params: { userId: 'uid123' } });
      User.findById.mockResolvedValue(fakeUser);
      mockOrderFindOne.mockResolvedValue(null);

      await deleteUser(req, res, next);

      expect(fakeUser.isActive).toBe(false);
      expect(mockUserSave).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ message: 'User deleted successfully' });
    });

    it('next(err) — error de base de datos en findById', async () => {
      const err = new Error('Database connection lost');
      const { req, res, next } = createMockReqRes({ params: { userId: 'uid123' } });
      User.findById.mockRejectedValue(err);

      await deleteUser(req, res, next);

      expect(next).toHaveBeenCalledWith(err);
    });
  });

  // ── searchUsers ────────────────────────────────────────────────────────────
  describe('searchUsers', () => {
    const buildFindChain = (result) => ({
      sort: vi.fn().mockReturnThis(),
      skip: vi.fn().mockReturnThis(),
      limit: vi.fn().mockReturnThis(),
      select: vi.fn().mockResolvedValue(result),
    });

    it('200 — búsqueda por término q', async () => {
      const fakeUsers = [FAKE_USER];
      const { req, res, next } = createMockReqRes({ query: { q: 'juan', page: '1', limit: '10' } });
      User.find.mockReturnValue(buildFindChain(fakeUsers));
      User.countDocuments.mockResolvedValue(1);

      await searchUsers(req, res, next);

      expect(User.find).toHaveBeenCalledWith(
        expect.objectContaining({ $or: expect.any(Array) })
      );
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          users: fakeUsers,
          pagination: expect.objectContaining({ currentPage: 1, totalPages: 1 }),
        })
      );
    });

    it('200 — filtra por role y isActive=false', async () => {
      const { req, res, next } = createMockReqRes({
        query: { role: 'admin', isActive: 'false' },
      });
      User.find.mockReturnValue(buildFindChain([]));
      User.countDocuments.mockResolvedValue(0);

      await searchUsers(req, res, next);

      expect(User.find).toHaveBeenCalledWith(
        expect.objectContaining({ role: 'admin', isActive: false })
      );
    });

    it('200 — sin filtros devuelve todos', async () => {
      const { req, res, next } = createMockReqRes({ query: {} });
      User.find.mockReturnValue(buildFindChain([]));
      User.countDocuments.mockResolvedValue(0);

      await searchUsers(req, res, next);

      expect(res.status).toHaveBeenCalledWith(200);
    });

    it('next(err) — error de base de datos', async () => {
      const err = new Error('timeout');
      const { req, res, next } = createMockReqRes({ query: { q: 'test' } });
      User.find.mockReturnValue({
        sort: vi.fn().mockReturnThis(),
        skip: vi.fn().mockReturnThis(),
        limit: vi.fn().mockReturnThis(),
        select: vi.fn().mockRejectedValue(err),
      });

      await searchUsers(req, res, next);

      expect(next).toHaveBeenCalledWith(err);
    });
  });

  // ── createUser ─────────────────────────────────────────────────────────────
  describe('createUser', () => {
    it('201 — crea un nuevo usuario exitosamente', async () => {
      const newUser = { _id: 'newuid', displayName: 'Test', email: 'test@test.com' };
      const { req, res, next } = createMockReqRes({
        body: {
          displayName: 'Test',
          email: 'test@test.com',
          password: 'Pass123!',
          role: 'guest',
          isActive: true,
        },
      });
      bcrypt.hash.mockResolvedValue('hashed_pass');
      // mockUserSave ya está configurado en beforeEach como resuelve undefined
      User.findById.mockReturnValue({ select: vi.fn().mockResolvedValue(newUser) });

      await createUser(req, res, next);

      expect(bcrypt.hash).toHaveBeenCalledWith('Pass123!', 10);
      expect(mockUserSave).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({ message: 'User created successfully', user: newUser })
      );
    });

    it('next(err) — error al hacer hash', async () => {
      const err = new Error('hash error');
      const { req, res, next } = createMockReqRes({
        body: { displayName: 'T', email: 't@t.com', password: 'p', role: 'guest', isActive: true },
      });
      bcrypt.hash.mockRejectedValue(err);

      await createUser(req, res, next);

      expect(next).toHaveBeenCalledWith(err);
    });

    it('next(err) — error al hacer save', async () => {
      const err = new Error('Duplicate key error');
      bcrypt.hash.mockResolvedValue('hashed_pass');
      mockUserSave.mockRejectedValue(err);
      const { req, res, next } = createMockReqRes({
        body: { displayName: 'T', email: 't@t.com', password: 'p', role: 'guest', isActive: true },
      });

      await createUser(req, res, next);

      expect(next).toHaveBeenCalledWith(err);
    });
  });
});
