import { Notification, User, Employee } from '../models/index.js';
import sseManager from '../utils/sseManager.js';
import logger from '../utils/logger.js';
import { Op } from 'sequelize';

/**
 * Notification Service
 * Handles notification creation, sending, and management
 */
class NotificationService {
  /**
   * Create a new notification
   */
  async createNotification({
    userId,
    title,
    message,
    type = 'info',
    category,
    metadata = null,
  }) {
    try {
      const notification = await Notification.create({
        userId,
        title,
        message,
        type,
        category,
        metadata,
      });

      logger.info(`Notification created for user ${userId}: ${title}`);
      return notification;
    } catch (error) {
      logger.error('Failed to create notification:', error);
      throw error;
    }
  }

  /**
   * Send notification to specific user (create + SSE)
   */
  async sendToUser(userId, notificationData) {
    try {
      // Create notification in database
      const notification = await this.createNotification({
        userId,
        ...notificationData,
      });

      // Send via SSE
      const sseData = {
        id: notification.id,
        title: notification.title,
        message: notification.message,
        type: notification.type,
        category: notification.category,
        metadata: notification.metadata,
        createdAt: notification.createdAt,
        isRead: false,
      };

      const sent = sseManager.sendToUser(userId, sseData);
      
      if (sent) {
        logger.info(`Notification sent to user ${userId} via SSE`);
      } else {
        logger.warn(`User ${userId} not connected to SSE, notification saved to DB only`);
      }

      return notification;
    } catch (error) {
      logger.error('Failed to send notification to user:', error);
      throw error;
    }
  }

  /**
   * Send notification to users with specific role
   */
  async sendToRole(role, notificationData) {
    try {
      // Get all users with the specified role
      const users = await User.findAll({
        where: { role },
        attributes: ['id'],
      });

      const notifications = [];
      
      // Create notifications for all users with this role
      for (const user of users) {
        const notification = await this.createNotification({
          userId: user.id,
          ...notificationData,
        });
        notifications.push(notification);
      }

      // Send via SSE to connected users
      const sseData = {
        title: notificationData.title,
        message: notificationData.message,
        type: notificationData.type || 'info',
        category: notificationData.category,
        metadata: notificationData.metadata,
        createdAt: new Date().toISOString(),
        isRead: false,
      };

      const sentCount = sseManager.sendToRole(role, sseData);
      
      logger.info(`Notification sent to ${notifications.length} users with role ${role}, ${sentCount} via SSE`);
      return notifications;
    } catch (error) {
      logger.error('Failed to send notification to role:', error);
      throw error;
    }
  }

  /**
   * Send notification to multiple roles
   */
  async sendToRoles(roles, notificationData) {
    const allNotifications = [];
    
    for (const role of roles) {
      const notifications = await this.sendToRole(role, notificationData);
      allNotifications.push(...notifications);
    }

    return allNotifications;
  }

  /**
   * Get notifications for a user
   */
  async getUserNotifications(userId, options = {}) {
    const {
      page = 1,
      limit = 20,
      isRead,
      category,
      type,
    } = options;

    const where = { userId };
    
    if (isRead !== undefined) {
      where.isRead = isRead;
    }
    
    if (category) {
      where.category = category;
    }
    
    if (type) {
      where.type = type;
    }

    const offset = (page - 1) * limit;

    const { count, rows } = await Notification.findAndCountAll({
      where,
      order: [['createdAt', 'DESC']],
      limit,
      offset,
    });

    return {
      notifications: rows,
      pagination: {
        total: count,
        page,
        limit,
        totalPages: Math.ceil(count / limit),
      },
    };
  }

  /**
   * Get unread count for a user
   */
  async getUnreadCount(userId) {
    const count = await Notification.count({
      where: {
        userId,
        isRead: false,
      },
    });

    return count;
  }

  /**
   * Mark notification as read
   */
  async markAsRead(notificationId, userId) {
    const [updatedCount] = await Notification.update(
      { isRead: true },
      {
        where: {
          id: notificationId,
          userId, // Ensure user can only mark their own notifications
        },
      }
    );

    return updatedCount > 0;
  }

  /**
   * Mark multiple notifications as read
   */
  async markManyAsRead(notificationIds, userId) {
    const [updatedCount] = await Notification.update(
      { isRead: true },
      {
        where: {
          id: { [Op.in]: notificationIds },
          userId,
        },
      }
    );

    return updatedCount;
  }

  /**
   * Mark all notifications as read for a user
   */
  async markAllAsRead(userId) {
    const [updatedCount] = await Notification.update(
      { isRead: true },
      {
        where: {
          userId,
          isRead: false,
        },
      }
    );

    return updatedCount;
  }

  /**
   * Delete notification
   */
  async deleteNotification(notificationId, userId) {
    const deletedCount = await Notification.destroy({
      where: {
        id: notificationId,
        userId,
      },
    });

    return deletedCount > 0;
  }

  /**
   * Clean up old notifications (used by cron job)
   */
  async cleanupOldNotifications(daysOld = 30) {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysOld);

    const deletedCount = await Notification.destroy({
      where: {
        createdAt: {
          [Op.lt]: cutoffDate,
        },
        isRead: true, // Only delete read notifications
      },
    });

    logger.info(`Cleaned up ${deletedCount} old notifications`);
    return { deletedCount };
  }

  // ===================================================
  // HELPER METHODS FOR COMMON NOTIFICATION SCENARIOS
  // ===================================================

  /**
   * Leave application notification
   */
  async notifyLeaveApplication(leaveRequest) {
    // Notify HR and Admin about new leave application
    await this.sendToRoles(['admin', 'hr'], {
      title: 'New Leave Application',
      message: `${leaveRequest.employee.firstName} ${leaveRequest.employee.lastName} has applied for ${leaveRequest.leaveType} leave`,
      type: 'info',
      category: 'leave',
      metadata: {
        leaveRequestId: leaveRequest.id,
        employeeId: leaveRequest.employeeId,
        leaveType: leaveRequest.leaveType,
      },
    });
  }

  /**
   * Leave approval notification
   */
  async notifyLeaveApproval(leaveRequest, approved = true) {
    const status = approved ? 'approved' : 'rejected';
    const type = approved ? 'success' : 'error';

    // Notify employee about leave status
    await this.sendToUser(leaveRequest.employee.userId, {
      title: `Leave ${status.charAt(0).toUpperCase() + status.slice(1)}`,
      message: `Your ${leaveRequest.leaveType} leave request has been ${status}`,
      type,
      category: 'leave',
      metadata: {
        leaveRequestId: leaveRequest.id,
        status,
      },
    });
  }

  /**
   * Late clock-in notification
   */
  async notifyLateClockIn(attendanceRecord) {
    // Notify employee
    await this.sendToUser(attendanceRecord.employee.userId, {
      title: 'Late Clock-in Recorded',
      message: 'You have been marked as late for today. Please contact HR if this is incorrect.',
      type: 'warning',
      category: 'attendance',
      metadata: {
        attendanceId: attendanceRecord.id,
        clockInTime: attendanceRecord.clockIn,
      },
    });

    // Notify HR and Admin
    await this.sendToRoles(['admin', 'hr'], {
      title: 'Late Clock-in Alert',
      message: `${attendanceRecord.employee.firstName} ${attendanceRecord.employee.lastName} clocked in late`,
      type: 'warning',
      category: 'attendance',
      metadata: {
        attendanceId: attendanceRecord.id,
        employeeId: attendanceRecord.employeeId,
        clockInTime: attendanceRecord.clockIn,
      },
    });
  }

  /**
   * ✅ NEW: Absent employee notification
   */
  async notifyAbsentEmployee(attendanceRecord) {
    // Notify HR and Admin about absent employee
    await this.sendToRoles(['admin', 'hr'], {
      title: 'Employee Marked Absent',
      message: `${attendanceRecord.employee.firstName} ${attendanceRecord.employee.lastName} has been automatically marked absent for not clocking in`,
      type: 'error',
      category: 'attendance',
      metadata: {
        attendanceId: attendanceRecord.id,
        employeeId: attendanceRecord.employeeId,
        date: attendanceRecord.date,
        shiftStartTime: attendanceRecord.shift?.shiftStartTime,
        reason: 'No clock-in recorded'
      },
    });

    // Optional: Notify employee (if they have access to notifications)
    try {
      if (attendanceRecord.employee.userId) {
        await this.sendToUser(attendanceRecord.employee.userId, {
          title: 'Attendance Alert',
          message: 'You have been marked absent for today. If this is incorrect, please contact HR immediately.',
          type: 'error',
          category: 'attendance',
          metadata: {
            attendanceId: attendanceRecord.id,
            date: attendanceRecord.date,
            reason: 'No clock-in recorded'
          },
        });
      }
    } catch (error) {
      logger.warn('Could not send absent notification to employee:', error.message);
      // Don't fail if employee notification fails
    }
  }

  /**
   * ✅ NEW: Half-day detection notification
   */
  async notifyHalfDayDetected(attendanceRecord) {
    const halfDayTypeText = attendanceRecord.halfDayType === 'first_half' ? 'First Half' : 'Second Half';
    
    // Notify employee
    if (attendanceRecord.employee.userId) {
      await this.sendToUser(attendanceRecord.employee.userId, {
        title: 'Half Day Recorded',
        message: `Your attendance has been marked as ${halfDayTypeText} based on your working hours (${attendanceRecord.workHours} hours)`,
        type: 'info',
        category: 'attendance',
        metadata: {
          attendanceId: attendanceRecord.id,
          halfDayType: attendanceRecord.halfDayType,
          workHours: attendanceRecord.workHours,
        },
      });
    }

    // Notify HR and Admin
    await this.sendToRoles(['admin', 'hr'], {
      title: 'Half Day Detected',
      message: `${attendanceRecord.employee.firstName} ${attendanceRecord.employee.lastName} worked ${halfDayTypeText} (${attendanceRecord.workHours} hours)`,
      type: 'info',
      category: 'attendance',
      metadata: {
        attendanceId: attendanceRecord.id,
        employeeId: attendanceRecord.employeeId,
        halfDayType: attendanceRecord.halfDayType,
        workHours: attendanceRecord.workHours,
      },
    });
  }

  /**
   * Shift assignment notification
   */
  async notifyShiftAssignment(employeeShift) {
    await this.sendToUser(employeeShift.employee.userId, {
      title: 'New Shift Assigned',
      message: `You have been assigned to ${employeeShift.shift.name} shift`,
      type: 'info',
      category: 'shift',
      metadata: {
        shiftId: employeeShift.shiftId,
        shiftName: employeeShift.shift.name,
        startDate: employeeShift.startDate,
      },
    });
  }
}

export default new NotificationService();