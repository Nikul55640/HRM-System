import notificationService from '../../services/notificationService.js';
import Employee from '../../models/sequelize/Employee.js';

/**
 * Get notifications for the authenticated employee
 * @route GET /api/employee/notifications
 */
const getNotifications = async (req, res) => {
  try {
    const userId = req.user._id;
    const {
      limit, skip, isRead, type, priority,
    } = req.query;

    const options = {
      limit: parseInt(limit) || 20,
      skip: parseInt(skip) || 0,
    };

    if (isRead !== undefined) {
      options.isRead = isRead === 'true';
    }

    if (type) {
      options.type = type;
    }

    if (priority) {
      options.priority = priority;
    }

    const result = await notificationService.getNotifications(userId, options);

    res.json({
      success: true,
      data: result.notifications,
      pagination: {
        total: result.total,
        limit: options.limit,
        skip: options.skip,
        hasMore: result.hasMore,
      },
      unreadCount: result.unreadCount,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching notifications',
      error: error.message,
    });
  }
};

/**
 * Get unread notification count
 * @route GET /api/employee/notifications/unread-count
 */
 const getUnreadCount = async (req, res) => {
  try {
    const userId = req.user._id;
    const count = await notificationService.getUnreadCount(userId);

    res.json({
      success: true,
      data: { count },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching unread count',
      error: error.message,
    });
  }
};

/**
 * Mark a notification as read
 * @route PUT /api/employee/notifications/:id/read
 */
 const markAsRead = async (req, res) => {
  try {
    const userId = req.user._id;
    const { id } = req.params;

    const notification = await notificationService.markAsRead(id, userId);

    res.json({
      success: true,
      data: notification,
      message: 'Notification marked as read',
    });
  } catch (error) {
    const statusCode = error.message === 'Notification not found' ? 404 : 500;
    res.status(statusCode).json({
      success: false,
      message: error.message || 'Error marking notification as read',
    });
  }
};

/**
 * Mark multiple notifications as read
 * @route PUT /api/employee/notifications/read-many
 */
 const markManyAsRead = async (req, res) => {
  try {
    const userId = req.user._id;
    const { notificationIds } = req.body;

    if (!Array.isArray(notificationIds) || notificationIds.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'notificationIds must be a non-empty array',
      });
    }

    const result = await notificationService.markManyAsRead(notificationIds, userId);

    res.json({
      success: true,
      data: { modifiedCount: result.modifiedCount },
      message: 'Notifications marked as read',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error marking notifications as read',
      error: error.message,
    });
  }
};

/**
 * Mark all notifications as read
 * @route PUT /api/employee/notifications/read-all
 */
const markAllAsRead = async (req, res) => {
  try {
    const userId = req.user._id;
    const result = await notificationService.markAllAsRead(userId);

    res.json({
      success: true,
      data: { modifiedCount: result.modifiedCount },
      message: 'All notifications marked as read',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error marking all notifications as read',
      error: error.message,
    });
  }
};

/**
 * Delete a notification
 * @route DELETE /api/employee/notifications/:id
 */
const deleteNotification = async (req, res) => {
  try {
    const userId = req.user._id;
    const { id } = req.params;

    await notificationService.deleteNotification(id, userId);

    res.json({
      success: true,
      message: 'Notification deleted',
    });
  } catch (error) {
    const statusCode = error.message === 'Notification not found' ? 404 : 500;
    res.status(statusCode).json({
      success: false,
      message: error.message || 'Error deleting notification',
    });
  }
};


export default {
  getNotifications,
  getUnreadCount,
  markAsRead,
  markManyAsRead,
  markAllAsRead,
  deleteNotification,
};
