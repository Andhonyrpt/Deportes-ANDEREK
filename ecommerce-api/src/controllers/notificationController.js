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
    res.json(notification);
  } catch (err) {
    next(err);
  }
}

async function getNotificationByUser(req, res, next) {
  try {
    const userId = req.params.userId;
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
    if (!user || !message) {
      return res.status(400).json({ error: 'User and message are required' });
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

    const updatedNotification = await Notification.findByIdAndUpdate(id,
      { message, isRead },
      { new: true }
    ).populate('user');

    if (updatedNotification) {
      return res.status(200).json(updatedNotification);
    } else {
      return res.status(404).json({ message: 'Notification not found' });
    }
  } catch (err) {
    next(err);
  }
}

async function deleteNotification(req, res, next) {
  try {
    const { id } = req.params;
    const deletedNotification = await Notification.findByIdAndDelete(id);

    if (deletedNotification) {
      return res.status(204).send();
    } else {
      return res.status(404).json({ message: 'Notification not found' });
    }
  } catch (err) {
    next(err);
  }
}

async function markAsRead(req, res, next) {
  try {
    const { id } = req.params;
    const notification = await Notification.findByIdAndUpdate(
      id,
      { isRead: true },
      { new: true }
    ).populate('user');

    if (notification) {
      return res.status(200).json(notification);
    } else {
      return res.status(404).json({ message: 'Notification not found' });
    }
  } catch (err) {
    next(err);
  }
}

async function markAllAsReadByUser(req, res, next) {
  try {
    const { userId } = req.params;
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