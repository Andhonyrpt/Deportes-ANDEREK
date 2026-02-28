import { describe, it, expect, vi, beforeEach } from 'vitest';
import { changePassword, deleteUser } from '../../src/controllers/userController.js';
import User from '../../src/models/user.js';
import bcrypt from 'bcrypt';
import { createMockReqRes } from '../helpers/createMockReqRes.js';

// Mock dependencias
vi.mock('../../src/models/user.js');
vi.mock('bcrypt');

describe('userController Unit Tests', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe('changePassword', () => {
        it('should return 404 if user not found (mocked)', async () => {
            const { req, res, next } = createMockReqRes({
                user: { userId: '12345' },
                body: { currentPassword: 'old', newPassword: 'new' }
            });

            // Mock: User.findById retorna null
            User.findById.mockResolvedValue(null);

            await changePassword(req, res, next);

            expect(User.findById).toHaveBeenCalledWith('12345');
            expect(res.status).toHaveBeenCalledWith(404);
            expect(res.json).toHaveBeenCalledWith({ message: 'User not found' });
        });
    });

    describe('deleteUser', () => {
        it('should propagate 500 database error to next() on findById (mocked)', async () => {
            const { req, res, next } = createMockReqRes({
                params: { userId: '12345' }
            });

            // Mock: Fallo en BD al buscar usuario
            const mockError = new Error("Database connection lost");
            User.findById.mockRejectedValue(mockError);

            await deleteUser(req, res, next);

            expect(User.findById).toHaveBeenCalledWith('12345');
            expect(next).toHaveBeenCalledWith(mockError);
            expect(res.status).not.toHaveBeenCalled();
            expect(res.json).not.toHaveBeenCalled();
        });
    });
});
