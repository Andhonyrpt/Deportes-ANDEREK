import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  getNotifications,
  getNotificationById,
  getNotificationByUser,
  createNotification,
  updateNotification,
  deleteNotification,
  markAsRead,
  markAllAsReadByUser,
  getUnreadNotificationsByUser
} from '../../src/controllers/notificationController.js';
import Notification from '../../src/models/notification.js';
import { createMockReqRes } from '../helpers/createMockReqRes.js';

vi.mock('../../src/models/notification.js');

describe('notificationController Unit Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getNotifications', () => {
    it('should return all notifications sorted by message', async () => {
      const { req, res, next } = createMockReqRes();
      const mockNotifications = [{ message: 'A' }, { message: 'B' }];
      
      const findMock = {
        populate: vi.fn().mockReturnThis(),
        sort: vi.fn().mockResolvedValue(mockNotifications)
      };
      Notification.find.mockReturnValue(findMock);

      await getNotifications(req, res, next);

      expect(res.json).toHaveBeenCalledWith(mockNotifications);
      expect(findMock.sort).toHaveBeenCalledWith({ message: 1 });
    });

    it('should handle errors', async () => {
      const { req, res, next } = createMockReqRes();
      Notification.find.mockReturnValue({
        populate: vi.fn().mockReturnThis(),
        sort: vi.fn().mockRejectedValue(new Error('DB Error'))
      });

      await getNotifications(req, res, next);

      expect(next).toHaveBeenCalledWith(expect.any(Error));
    });
  });

  describe('getNotificationById', () => {
    it('should return a notification if found and user is owner', async () => {
      const { req, res, next } = createMockReqRes({
        params: { id: 'notif123' },
        user: { userId: 'user123', role: 'customer' }
      });
      const mockNotif = {
        _id: 'notif123',
        user: { _id: { toString: () => 'user123' } },
        message: 'Hello'
      };
      Notification.findById.mockReturnValue({
        populate: vi.fn().mockResolvedValue(mockNotif)
      });

      await getNotificationById(req, res, next);

      expect(res.json).toHaveBeenCalledWith(mockNotif);
    });

    it('should return 404 if notification not found', async () => {
      const { req, res, next } = createMockReqRes({ params: { id: 'notif123' } });
      Notification.findById.mockReturnValue({
        populate: vi.fn().mockResolvedValue(null)
      });

      await getNotificationById(req, res, next);

      expect(res.status).toHaveBeenCalledWith(404);
    });

    it('should return 403 if user is not owner', async () => {
      const { req, res, next } = createMockReqRes({
        params: { id: 'notif123' },
        user: { userId: 'otherUser', role: 'customer' }
      });
      const mockNotif = {
        _id: 'notif123',
        user: { _id: { toString: () => 'user123' } }
      };
      Notification.findById.mockReturnValue({
        populate: vi.fn().mockResolvedValue(mockNotif)
      });

      await getNotificationById(req, res, next);

      expect(res.status).toHaveBeenCalledWith(403);
    });
  });

  describe('createNotification', () => {
    it('should create a notification for self', async () => {
        const { req, res, next } = createMockReqRes({
            user: { userId: 'user123', role: 'customer' },
            body: { user: 'user123', message: 'Test Notif' }
        });
        const mockNotif = { user: 'user123', message: 'Test Notif', populate: vi.fn().mockResolvedValue(true) };
        Notification.create.mockResolvedValue(mockNotif);

        await createNotification(req, res, next);

        expect(res.status).toHaveBeenCalledWith(201);
    });

    it('should allow admin to create notification for others', async () => {
        const { req, res, next } = createMockReqRes({
            user: { userId: 'admin123', role: 'admin' },
            body: { user: 'user123', message: 'Admin Notif' }
        });
        const mockNotif = { user: 'user123', message: 'Admin Notif', populate: vi.fn().mockResolvedValue(true) };
        Notification.create.mockResolvedValue(mockNotif);

        await createNotification(req, res, next);

        expect(res.status).toHaveBeenCalledWith(201);
    });

    it('should return 403 if customer tries to create for someone else', async () => {
        const { req, res, next } = createMockReqRes({
            user: { userId: 'user1', role: 'customer' },
            body: { user: 'user2', message: 'Evil Notif' }
        });

        await createNotification(req, res, next);

        expect(res.status).toHaveBeenCalledWith(403);
    });
  });

  describe('markAllAsReadByUser', () => {
    it('should mark all notifications as read', async () => {
        const { req, res, next } = createMockReqRes({
            params: { userId: 'user123' },
            user: { userId: 'user123' }
        });
        Notification.updateMany.mockResolvedValue({ modifiedCount: 5 });

        await markAllAsReadByUser(req, res, next);

        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ modifiedCount: 5 }));
    });

    it('should handle errors in markAllAsReadByUser', async () => {
        const { req, res, next } = createMockReqRes({
            params: { userId: 'user123' },
            user: { userId: 'user123' }
        });
        Notification.updateMany.mockRejectedValue(new Error('Update Error'));

        await markAllAsReadByUser(req, res, next);

        expect(next).toHaveBeenCalledWith(expect.any(Error));
    });
  });

  describe('getUnreadNotificationsByUser', () => {
    it('should return unread notifications', async () => {
      const { req, res, next } = createMockReqRes({
          params: { userId: 'user123' },
          user: { userId: 'user123' }
      });
      const findMock = {
          populate: vi.fn().mockReturnThis(),
          sort: vi.fn().mockResolvedValue([{ message: 'Unread' }])
      };
      Notification.find.mockReturnValue(findMock);

      await getUnreadNotificationsByUser(req, res, next);

      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ count: 1 }));
    });
  });

  describe('updateNotification', () => {
      it('should return 404 if not found', async () => {
          const { req, res, next } = createMockReqRes({ params: { id: 'none' } });
          Notification.findById.mockResolvedValue(null);
          await updateNotification(req, res, next);
          expect(res.status).toHaveBeenCalledWith(404);
      });

      it('should return 400 if no fields provided', async () => {
          const { req, res, next } = createMockReqRes({ 
            params: { id: 'notif1' },
            body: {},
            user: { userId: 'u1' }
          });
          Notification.findById.mockResolvedValue({ user: 'u1' });
          await updateNotification(req, res, next);
          expect(res.status).toHaveBeenCalledWith(400);
      });
  });

  describe('deleteNotification', () => {
      it('should delete if owner', async () => {
          const { req, res, next } = createMockReqRes({ 
            params: { id: 'notif1' },
            user: { userId: 'u1' }
          });
          Notification.findById.mockResolvedValue({ user: 'u1' });
          await deleteNotification(req, res, next);
          expect(res.status).toHaveBeenCalledWith(204);
      });
  });

  describe('markAsRead', () => {
      it('should mark as read', async () => {
          const { req, res, next } = createMockReqRes({ 
            params: { id: 'notif1' },
            user: { userId: 'u1' }
          });
          const mockNotif = { user: 'u1', isRead: false, save: vi.fn(), populate: vi.fn() };
          Notification.findById.mockResolvedValue(mockNotif);
          await markAsRead(req, res, next);
          expect(mockNotif.isRead).toBe(true);
          expect(res.status).toHaveBeenCalledWith(200);
      });
  });
});

