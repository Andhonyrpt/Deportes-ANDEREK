import Notification from '../models/notification.js';

async function getNotifications(req, res, next) {
  try {
    const notifications = await Notification.find().populate('user').sort({ message: 1 });
    res.json(notifications);
  } catch (err) {
    next(err);
  }
}

async function getNotificationById(req, res, next) {
  try {
    const id = req.params.id;
    const notification = await Notification.findById(id).populate('user');

    if (!notification) {
      return res.status(404).json({ message: 'Notification not found' });
    }

    // IDOR Check: Only owner or admin can view
    if (notification.user._id.toString() !== req.user.userId && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Forbidden: You do not own this notification' });
    }

    res.json(notification);
  } catch (err) {
    next(err);
  }
}

async function getNotificationByUser(req, res, next) {
  try {
    const userId = req.params.userId;

    // IDOR Check: User can only see their own notifications, unless admin
    if (userId !== req.user.userId && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Forbidden: Access denied' });
    }

    const notifications = await Notification.find({ user: userId }).populate('user').sort({ message: 1 });

    if (notifications.length === 0) {
      return res.status(404).json({ message: 'No notifications found for this user' });
    }
    res.json(notifications);
  } catch (err) {
    next(err);
  }
}

async function createNotification(req, res, next) {
  try {
    const { user, message } = req.body;

    // Security: Only admins can create notifications for others
    if (user !== req.user.userId && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Forbidden' });
    }

    const newNotification = await Notification.create({
      user,
      message,
      isRead: false
    });

    await newNotification.populate('user');
    res.status(201).json(newNotification);
  } catch (err) {
    next(err);
  }
}

async function updateNotification(req, res, next) {
  try {
    const { id } = req.params;
    const { message, isRead } = req.body;

    const notification = await Notification.findById(id);
    if (!notification) {
      return res.status(404).json({ message: 'Notification not found' });
    }

    // IDOR Check: Only owner can update (admins can update anything)
    if (notification.user.toString() !== req.user.userId && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Forbidden' });
    }

    // Validar que al menos un campo sea proporcionado
    if (message === undefined && isRead === undefined) {
      return res.status(400).json({
        message: "At least one field (message or isRead) must be provided for update",
      });
    }

    const updateData = {};
    if (message !== undefined) updateData.message = message;
    if (isRead !== undefined) updateData.isRead = isRead;

    const updatedNotification = await Notification.findByIdAndUpdate(
      id,
      updateData,
      { new: true }
    ).populate('user');

    res.status(200).json(updatedNotification);
  } catch (err) {
    next(err);
  }
}

async function deleteNotification(req, res, next) {
  try {
    const { id } = req.params;

    const notification = await Notification.findById(id);
    if (!notification) {
      return res.status(404).json({ message: 'Notification not found' });
    }

    // IDOR Check
    if (notification.user.toString() !== req.user.userId && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Forbidden' });
    }

    await Notification.findByIdAndDelete(id);
    res.status(204).send();
  } catch (err) {
    next(err);
  }
}

async function markAsRead(req, res, next) {
  try {
    const { id } = req.params;

    const notification = await Notification.findById(id);
    if (!notification) {
      return res.status(404).json({ message: 'Notification not found' });
    }

    // IDOR Check
    if (notification.user.toString() !== req.user.userId && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Forbidden' });
    }

    notification.isRead = true;
    await notification.save();
    await notification.populate('user');

    res.status(200).json(notification);
  } catch (err) {
    next(err);
  }
}

async function markAllAsReadByUser(req, res, next) {
  try {
    const { userId } = req.params;

    // IDOR Check
    if (userId !== req.user.userId && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Forbidden' });
    }

    const result = await Notification.updateMany(
      { user: userId, isRead: false },
      { isRead: true }
    );

    res.status(200).json({
      message: `${result.modifiedCount} notifications marked as read`,
      modifiedCount: result.modifiedCount
    });
  } catch (err) {
    next(err);
  }
}

async function getUnreadNotificationsByUser(req, res, next) {
  try {
    const userId = req.params.userId;

    // IDOR Check
    if (userId !== req.user.userId && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Forbidden' });
    }

    const notifications = await Notification.find({
      user: userId,
      isRead: false
    }).populate('user').sort({ message: 1 });

    res.json({
      count: notifications.length,
      notifications
    });
  } catch (err) {
    next(err);
  }
}

export {
  getNotifications,
  getNotificationById,
  getNotificationByUser,
  createNotification,
  updateNotification,
  deleteNotification,
  markAsRead,
  markAllAsReadByUser,
  getUnreadNotificationsByUser
};