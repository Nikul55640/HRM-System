import Notification from '../models/Notification.js';
import Employee from '../models/Employee.js';
import logger from '../utils/logger.js';

class NotificationService {
  async createNotification(notificationData) {
    try {
      const {
        employeeId,
        userId,
        type,
        title,
        message,
        relatedEntity,
        priority = 'medium',
        actionUrl,
      } = notificationData;

      const notification = new Notification({
        employeeId,
        userId,
        type,
        title,
        message,
        relatedEntity,
        priority,
        actionUrl,
      });

      await notification.save();
      logger.info(`Notification created for user ${userId}: ${type}`);

      return notification;
    } catch (error) {
      logger.error('Error creating notification:', error);
      throw error;
    }
  }

  async createBulkNotifications(employeeIds, notificationData) {
    try {
      const employees = await Employee.find({ _id: { $in: employeeIds } }).select('userId');

      const notifications = employees.map((employee) => ({
        employeeId: employee._id,
        userId: employee.userId,
        ...notificationData,
      }));

      const created = await Notification.insertMany(notifications);
      logger.info(`Bulk notifications created for ${created.length} employees`);

      return created;
    } catch (error) {
      logger.error('Error creating bulk notifications:', error);
      throw error;
    }
  }

  async getNotifications(userId, options = {}) {
    try {
      const { limit = 20, skip = 0, isRead, type, priority } = options;

      const query = { userId };

      if (isRead !== undefined) query.isRead = isRead;
      if (type) query.type = type;
      if (priority) query.priority = priority;

      const [notifications, total, unreadCount] = await Promise.all([
        Notification.find(query).sort({ createdAt: -1 }).limit(limit).skip(skip).lean(),
        Notification.countDocuments(query),
        Notification.getUnreadCount(userId),
      ]);

      return {
        notifications,
        total,
        unreadCount,
        hasMore: skip + notifications.length < total,
      };
    } catch (error) {
      logger.error('Error fetching notifications:', error);
      throw error;
    }
  }

  async markAsRead(notificationId, userId) {
    try {
      const notification = await Notification.findOne({ _id: notificationId, userId });

      if (!notification) throw new Error('Notification not found');

      if (!notification.isRead) await notification.markAsRead();

      return notification;
    } catch (error) {
      logger.error('Error marking notification as read:', error);
      throw error;
    }
  }

  async markManyAsRead(notificationIds, userId) {
    try {
      const result = await Notification.markManyAsRead(notificationIds, userId);
      logger.info(`Marked ${result.modifiedCount} notifications as read for user ${userId}`);
      return result;
    } catch (error) {
      logger.error('Error marking notifications as read:', error);
      throw error;
    }
  }

  async markAllAsRead(userId) {
    try {
      const result = await Notification.markAllAsRead(userId);
      logger.info(`Marked all notifications as read for user ${userId}`);
      return result;
    } catch (error) {
      logger.error('Error marking all notifications as read:', error);
      throw error;
    }
  }

  async deleteNotification(notificationId, userId) {
    try {
      const result = await Notification.deleteOne({ _id: notificationId, userId });

      if (result.deletedCount === 0) throw new Error('Notification not found');

      logger.info(`Notification ${notificationId} deleted for user ${userId}`);
      return result;
    } catch (error) {
      logger.error('Error deleting notification:', error);
      throw error;
    }
  }

  async getUnreadCount(userId) {
    try {
      return await Notification.getUnreadCount(userId);
    } catch (error) {
      logger.error('Error getting unread count:', error);
      throw error;
    }
  }

  async notifyProfileUpdate(employeeId, userId, field, status) {
    return this.createNotification({
      employeeId,
      userId,
      type: 'profile_update',
      title: 'Profile Update',
      message: `Your ${field} update has been ${status}`,
      priority: 'medium',
      actionUrl: '/employee/profile',
    });
  }

  async notifyBankDetailsUpdate(employeeId, userId, status) {
    return this.createNotification({
      employeeId,
      userId,
      type: 'bank_details_update',
      title: 'Bank Details Update',
      message: `Your bank details update has been ${status}`,
      priority: 'high',
      actionUrl: '/employee/profile',
    });
  }

  async notifyDocumentUpload(employeeId, userId, documentType, status) {
    return this.createNotification({
      employeeId,
      userId,
      type: 'document_upload',
      title: 'Document Upload',
      message: `Your ${documentType} document has been ${status}`,
      priority: 'medium',
      actionUrl: '/employee/profile',
    });
  }

  async notifyRequestStatusChange(employeeId, userId, requestType, requestId, status) {
    const statusMessages = {
      approved: 'approved',
      rejected: 'rejected',
      pending: 'submitted and is pending approval',
    };

    return this.createNotification({
      employeeId,
      userId,
      type:
        status === 'approved'
          ? 'request_approved'
          : status === 'rejected'
          ? 'request_rejected'
          : `${requestType}_request`,
      title: `${requestType.charAt(0).toUpperCase() + requestType.slice(1)} Request ${
        status.charAt(0).toUpperCase() + status.slice(1)
      }`,
      message: `Your ${requestType} request has been ${statusMessages[status]}`,
      relatedEntity: { entityType: 'Request', entityId: requestId },
      priority: status === 'rejected' ? 'high' : 'medium',
      actionUrl: `/employee/requests/${requestId}`,
    });
  }

  async notifyPayslipAvailable(employeeId, userId, month, year, payslipId) {
    return this.createNotification({
      employeeId,
      userId,
      type: 'payslip_available',
      title: 'New Payslip Available',
      message: `Your payslip for ${month}/${year} is now available`,
      relatedEntity: { entityType: 'Payslip', entityId: payslipId },
      priority: 'medium',
      actionUrl: `/employee/payslips/${payslipId}`,
    });
  }

  async notifySystemAnnouncement(employeeIds, title, message, priority = 'medium') {
    return this.createBulkNotifications(employeeIds, {
      type: 'system_announcement',
      title,
      message,
      priority,
    });
  }

  async cleanupOldNotifications(daysOld = 30) {
    try {
      const result = await Notification.deleteOldReadNotifications(daysOld);
      logger.info(`Cleaned up ${result.deletedCount} old notifications`);
      return result;
    } catch (error) {
      logger.error('Error cleaning up old notifications:', error);
      throw error;
    }
  }

  // ============================================
  // Attendance Notification Methods
  // ============================================

  /**
   * Notify HR administrators when an employee clocks in
   */
  async notifyHRClockIn(employeeData, sessionData) {
    try {
      // Find HR administrators
      const hrEmployees = await Employee.find({ role: 'hr' }).select('userId _id');

      if (hrEmployees.length === 0) {
        logger.info('No HR administrators found to notify');
        return [];
      }

      const notificationData = {
        type: 'attendance_clock_in',
        title: 'Employee Clocked In',
        message: `${employeeData.fullName} clocked in at ${sessionData.workLocation}`,
        relatedEntity: {
          entityType: 'AttendanceSession',
          entityId: sessionData.sessionId,
        },
        priority: 'low',
        actionUrl: '/admin/attendance/live',
      };

      return await this.createBulkNotifications(
        hrEmployees.map((e) => e._id),
        notificationData
      );
    } catch (error) {
      logger.error('Error notifying HR of clock-in:', error);
      // Don't throw - notification failure shouldn't block clock-in
      return [];
    }
  }

  /**
   * Notify HR administrators when an employee clocks out
   */
  async notifyHRClockOut(employeeData, sessionData) {
    try {
      // Find HR administrators
      const hrEmployees = await Employee.find({ role: 'hr' }).select('userId _id');

      if (hrEmployees.length === 0) {
        logger.info('No HR administrators found to notify');
        return [];
      }

      const workedHours = (sessionData.workedMinutes / 60).toFixed(2);

      const notificationData = {
        type: 'attendance_clock_out',
        title: 'Employee Clocked Out',
        message: `${employeeData.fullName} clocked out after ${workedHours} hours`,
        relatedEntity: {
          entityType: 'AttendanceSession',
          entityId: sessionData.sessionId,
        },
        priority: 'low',
        actionUrl: '/admin/attendance/live',
      };

      return await this.createBulkNotifications(
        hrEmployees.map((e) => e._id),
        notificationData
      );
    } catch (error) {
      logger.error('Error notifying HR of clock-out:', error);
      // Don't throw - notification failure shouldn't block clock-out
      return [];
    }
  }

  /**
   * Batch notifications for multiple simultaneous events
   */
  async batchAttendanceNotifications(events) {
    try {
      if (!events || events.length === 0) return [];

      // Group events by type
      const clockIns = events.filter((e) => e.type === 'clock_in');
      const clockOuts = events.filter((e) => e.type === 'clock_out');

      // Find HR administrators
      const hrEmployees = await Employee.find({ role: 'hr' }).select('userId _id');

      if (hrEmployees.length === 0) {
        logger.info('No HR administrators found to notify');
        return [];
      }

      const notifications = [];

      // Create batched notification for clock-ins
      if (clockIns.length > 0) {
        const message =
          clockIns.length === 1
            ? `${clockIns[0].employeeName} clocked in`
            : `${clockIns.length} employees clocked in`;

        const notificationData = {
          type: 'attendance_batch',
          title: 'Attendance Update',
          message,
          priority: 'low',
          actionUrl: '/admin/attendance/live',
        };

        const created = await this.createBulkNotifications(
          hrEmployees.map((e) => e._id),
          notificationData
        );
        notifications.push(...created);
      }

      // Create batched notification for clock-outs
      if (clockOuts.length > 0) {
        const message =
          clockOuts.length === 1
            ? `${clockOuts[0].employeeName} clocked out`
            : `${clockOuts.length} employees clocked out`;

        const notificationData = {
          type: 'attendance_batch',
          title: 'Attendance Update',
          message,
          priority: 'low',
          actionUrl: '/admin/attendance/live',
        };

        const created = await this.createBulkNotifications(
          hrEmployees.map((e) => e._id),
          notificationData
        );
        notifications.push(...created);
      }

      logger.info(`Batched ${notifications.length} attendance notifications`);
      return notifications;
    } catch (error) {
      logger.error('Error batching attendance notifications:', error);
      return [];
    }
  }

  /**
   * Check if HR user has attendance notifications enabled
   */
  async hasAttendanceNotificationsEnabled(userId) {
    try {
      // TODO: Implement user preferences check
      // For now, return true (all HR users receive notifications)
      return true;
    } catch (error) {
      logger.error('Error checking notification preferences:', error);
      return true; // Default to enabled
    }
  }
}

export default new NotificationService();
