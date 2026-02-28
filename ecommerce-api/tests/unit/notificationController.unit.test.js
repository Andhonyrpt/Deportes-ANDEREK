import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
    markAsRead,
    markAllAsReadByUser,
    getUnreadNotificationsByUser,
    getNotifications
} from '../../src/controllers/notificationController.js';
import Notification from '../../src/models/notification.js';
import { createMockReqRes } from '../helpers/createMockReqRes.js';

// Mock dependencias
vi.mock('../../src/models/notification.js');

describe('notificationController Unit Tests', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe('markAsRead', () => {
        it('should mark a notification as read and return 200', async () => {
            const { req, res, next } = createMockReqRes({
                user: { userId: 'user123', role: 'customer' },
                params: { id: 'notif123' }
            });

            const mockNotif = {
                _id: 'notif123',
                isRead: false,
                user: 'user123', // Still needs to match req.user.userId for the IDOR check
                save: vi.fn().mockResolvedValue(true),
                populate: vi.fn().mockReturnThis()
            };
            Notification.findById.mockResolvedValue(mockNotif);

            await markAsRead(req, res, next);

            expect(Notification.findById).toHaveBeenCalledWith('notif123');
            expect(mockNotif.isRead).toBe(true);
            expect(mockNotif.save).toHaveBeenCalled();
            expect(mockNotif.populate).toHaveBeenCalledWith('user');
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith(mockNotif);
        });

        it('should return 404 if notification not found', async () => {
            const { req, res, next } = createMockReqRes({
                user: { userId: 'user123', role: 'customer' },
                params: { id: 'invalid_id' }
            });

            Notification.findById.mockResolvedValue(null);

            await markAsRead(req, res, next);

            expect(res.status).toHaveBeenCalledWith(404);
        });
    });

    describe('markAllAsReadByUser', () => {
        it('should mark all notifications as read for a user', async () => {
            const { req, res, next } = createMockReqRes({
                user: { userId: 'user123', role: 'customer' },
                params: { userId: 'user123' }
            });

            Notification.updateMany.mockResolvedValue({ modifiedCount: 5 });

            await markAllAsReadByUser(req, res, next);

            expect(Notification.updateMany).toHaveBeenCalledWith(
                { user: 'user123', isRead: false },
                { isRead: true }
            );
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
                modifiedCount: 5
            }));
        });
    });

    describe('Error Handling', () => {
        it('should call next(err) if getNotifications fails', async () => {
            const { req, res, next } = createMockReqRes();

            const error = new Error('Database connection failed');
            Notification.find.mockReturnValue({
                populate: vi.fn().mockReturnValue({
                    sort: vi.fn().mockRejectedValue(error)
                })
            });

            await getNotifications(req, res, next);

            expect(next).toHaveBeenCalledWith(error);
        });
    });
});
