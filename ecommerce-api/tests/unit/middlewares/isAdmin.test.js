import { describe, it, expect, vi } from 'vitest';
import isAdmin from '../../../src/middlewares/isAdminMiddleware.js';
import { createMockReqRes } from '../../helpers/createMockReqRes.js';

describe('isAdmin Middleware Unit Tests', () => {
    it('should return 401 if user is not authenticated (req.user missing)', async () => {
        const { req, res, next } = createMockReqRes({ user: null });

        isAdmin(req, res, next);

        expect(res.status).toHaveBeenCalledWith(401);
        expect(res.json).toHaveBeenCalledWith({ message: 'Authetication required' });
        expect(next).not.toHaveBeenCalled();
    });

    it('should return 403 if user role is not admin', async () => {
        const { req, res, next } = createMockReqRes({ user: { role: 'customer' } });

        isAdmin(req, res, next);

        expect(res.status).toHaveBeenCalledWith(403);
        expect(res.json).toHaveBeenCalledWith({ message: 'Admin access required' });
        expect(next).not.toHaveBeenCalled();
    });

    it('should call next if user is admin', async () => {
        const { req, res, next } = createMockReqRes({ user: { role: 'admin' } });

        isAdmin(req, res, next);

        expect(next).toHaveBeenCalled();
        expect(res.status).not.toHaveBeenCalled();
    });
});
