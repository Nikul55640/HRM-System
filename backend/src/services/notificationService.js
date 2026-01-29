import { Notification, User, Employee } from '../models/index.js';
import sseManager from '../utils/sseManager.js';
import { sendEmail } from './email/email.service.js';
import { render } from '@react-email/render';
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
   * Send notification to specific user (create + SSE + Email)
   */
  async sendToUser(userId, notificationData, options = {}) {
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

      // 🔥 NEW: Send email if enabled and appropriate
      if (options.sendEmail && this.shouldSendEmail(notificationData)) {
        await this.sendEmailNotification(userId, notificationData, options.emailData);
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
  // EMAIL NOTIFICATION METHODS
  // ===================================================

  /**
   * Determine if notification should trigger email
   */
  shouldSendEmail(notificationData) {
    const emailCategories = ['attendance', 'leave', 'account', 'payroll', 'system'];
    const emailTypes = ['error', 'warning', 'success'];
    
    // Send email for important categories or high-priority types
    return emailCategories.includes(notificationData.category) || 
           emailTypes.includes(notificationData.type);
  }

  /**
   * Send email notification
   */
  async sendEmailNotification(userId, notificationData, emailData = {}) {
    try {
      const { category, type, metadata } = notificationData;

      // Route to appropriate email template based on category
      switch (category) {
        case 'attendance':
          await this.sendAttendanceEmail(userId, notificationData, emailData);
          break;
        case 'leave':
          await this.sendLeaveEmail(userId, notificationData, emailData);
          break;
        default:
          await this.sendGenericEmail(userId, notificationData);
      }
    } catch (error) {
      logger.error('Failed to send email notification:', error);
      // Don't throw - email failure shouldn't break notification flow
    }
  }

  /**
   * Send attendance-related email
   */
  async sendAttendanceEmail(userId, notificationData, emailData) {
    const { metadata } = notificationData;
    
    // Get user and employee details
    const user = await User.findByPk(userId, {
      include: [{ model: Employee, as: 'employee' }],
    });

    if (!user || !user.email || !user.employee) {
      logger.warn(`Cannot send email: User ${userId} has no email or employee record`);
      return;
    }

    const employee = user.employee;

    // Import email templates dynamically
    const { AttendanceAbsent } = await import('../emails/templates/AttendanceAbsent.js');
    const { CorrectionRequired } = await import('../emails/templates/CorrectionRequired.js');

    if (metadata?.action === 'attendance_auto_absent') {
      const html = render(AttendanceAbsent({
        employeeName: `${employee.firstName} ${employee.lastName}`,
        date: new Date(emailData.date || metadata.date).toLocaleDateString(),
        reason: emailData.reason || metadata.reason || 'No clock-in recorded',
        actionUrl: `${process.env.FRONTEND_URL}/attendance/corrections`
      }));

      await sendEmail({
        to: user.email,
        subject: `Attendance Marked as Absent - ${emailData.date || metadata.date}`,
        html,
        text: `Your attendance for ${emailData.date || metadata.date} was marked as absent. Reason: ${emailData.reason || metadata.reason || 'No clock-in recorded'}`
      });
    } else if (metadata?.action === 'attendance_correction_required') {
      const html = render(CorrectionRequired({
        employeeName: `${employee.firstName} ${employee.lastName}`,
        date: new Date(emailData.date || metadata.date).toLocaleDateString(),
        issue: emailData.issue || metadata.reason || 'Missing clock-out',
        actionUrl: `${process.env.FRONTEND_URL}/attendance/corrections`
      }));

      await sendEmail({
        to: user.email,
        subject: `Attendance Correction Required - ${emailData.date || metadata.date}`,
        html,
        text: `Your attendance for ${emailData.date || metadata.date} requires correction. Issue: ${emailData.issue || metadata.reason || 'Missing clock-out'}`
      });
    }
  }

  /**
   * Send leave-related email
   */
  async sendLeaveEmail(userId, notificationData, emailData) {
    const { metadata } = notificationData;
    
    // Get user and employee details
    const user = await User.findByPk(userId, {
      include: [{ model: Employee, as: 'employee' }],
    });

    if (!user || !user.email || !user.employee) {
      logger.warn(`Cannot send email: User ${userId} has no email or employee record`);
      return;
    }

    const employee = user.employee;
    
    if (metadata?.status && ['approved', 'rejected'].includes(metadata.status)) {
      if (metadata.status === 'approved') {
        // Import email template dynamically
        const { LeaveApproved } = await import('../emails/templates/LeaveApproved.js');
        
        const startDate = new Date(emailData.startDate).toLocaleDateString();
        const endDate = new Date(emailData.endDate).toLocaleDateString();
        const days = emailData.duration || 1;

        const html = render(LeaveApproved({
          employeeName: `${employee.firstName} ${employee.lastName}`,
          leaveType: emailData.leaveType || 'Leave',
          startDate,
          endDate,
          days,
          approverName: emailData.approverName || 'Manager',
          actionUrl: `${process.env.FRONTEND_URL}/leave/my-leaves`
        }));

        await sendEmail({
          to: user.email,
          subject: `Leave Request Approved - ${startDate} to ${endDate}`,
          html,
          text: `Your ${emailData.leaveType || 'Leave'} request from ${startDate} to ${endDate} has been approved.`
        });
      }
      // Note: We don't have a leave rejected template yet
    }
  }

  /**
   * Send generic email for other notifications
   */
  async sendGenericEmail(userId, notificationData) {
    // For now, we don't send generic emails
    // This can be extended later if needed
    logger.info(`Generic email not sent for category: ${notificationData.category}`);
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
   * Leave approval notification (with email)
   */
  async notifyLeaveApproval(leaveRequest, approved = true) {
    const status = approved ? 'approved' : 'rejected';
    const type = approved ? 'success' : 'error';

    // 🔥 NEW: Notify employee about leave status with email
    await this.sendToUser(leaveRequest.employee.userId, {
      title: `Leave ${status.charAt(0).toUpperCase() + status.slice(1)}`,
      message: `Your ${leaveRequest.leaveType} leave request has been ${status}`,
      type,
      category: 'leave',
      metadata: {
        leaveRequestId: leaveRequest.id,
        status,
      },
    }, {
      sendEmail: true, // 🔥 Enable email for leave approvals/rejections
      emailData: {
        leaveType: leaveRequest.leaveType,
        startDate: leaveRequest.startDate,
        endDate: leaveRequest.endDate,
        duration: leaveRequest.duration,
        reason: leaveRequest.reason,
        adminComments: leaveRequest.adminComments
      }
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
   * ✅ NEW: Absent employee notification (with email)
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

    // 🔥 NEW: Send email to employee
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
            reason: 'No clock-in recorded',
            action: 'attendance_auto_absent'
          },
        }, {
          sendEmail: true // 🔥 Enable email for this notification
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
   * 🔥 NEW: Auto-finalized attendance notification (with email)
   */
  async notifyAutoFinalized(attendanceRecord, shiftEndTime) {
    try {
      if (attendanceRecord.employee.userId) {
        await this.sendToUser(attendanceRecord.employee.userId, {
          title: 'Attendance Auto-Finalized',
          message: `Your attendance for ${attendanceRecord.date} was auto-finalized at shift end. Clock-out recorded at ${shiftEndTime}. Status: ${attendanceRecord.status}`,
          type: 'info',
          category: 'attendance',
          metadata: {
            attendanceId: attendanceRecord.id,
            date: attendanceRecord.date,
            reason: 'Auto clock-out at shift end (+30 min rule)',
            action: 'attendance_auto_finalized'
          },
        }, {
          sendEmail: true, // 🔥 Enable email for auto-finalized attendance
          emailData: {
            clockOutTime: shiftEndTime,
            status: attendanceRecord.status,
            workHours: attendanceRecord.workHours
          }
        });
      }
    } catch (error) {
      logger.error('Failed to send auto-finalized notification:', error);
    }
  }

  /**
   * 🔥 NEW: Attendance correction required notification (with email)
   */
  async notifyAttendanceCorrectionRequired(attendanceRecord, reason) {
    try {
      if (attendanceRecord.employee.userId) {
        await this.sendToUser(attendanceRecord.employee.userId, {
          title: 'Attendance Correction Required',
          message: `Your attendance for ${attendanceRecord.date} requires correction. Reason: ${reason}. Please submit a correction request.`,
          type: 'warning',
          category: 'attendance',
          metadata: {
            attendanceId: attendanceRecord.id,
            date: attendanceRecord.date,
            reason: reason,
            action: 'attendance_correction_required'
          },
        }, {
          sendEmail: true // 🔥 Enable email for correction requests
        });
      }
    } catch (error) {
      logger.error('Failed to send correction required notification:', error);
    }
  }

  /**
   * 🔥 NEW: Password reset notification (with email)
   */
  async notifyPasswordReset(userId, resetToken) {
    try {
      await this.sendToUser(userId, {
        title: 'Password Reset Request',
        message: 'You have requested to reset your password. Check your email for reset instructions.',
        type: 'info',
        category: 'account',
        metadata: {
          action: 'password_reset'
        },
      }, {
        sendEmail: true,
        emailData: {
          resetToken
        }
      });
    } catch (error) {
      logger.error('Failed to send password reset notification:', error);
    }
  }

  /**
   * 🔥 NEW: Account created notification (with email)
   */
  async notifyAccountCreated(userId, temporaryPassword) {
    try {
      await this.sendToUser(userId, {
        title: 'Welcome to HRM System',
        message: 'Your account has been created successfully. Check your email for login credentials.',
        type: 'success',
        category: 'account',
        metadata: {
          action: 'account_created'
        },
      }, {
        sendEmail: true,
        emailData: {
          temporaryPassword
        }
      });
    } catch (error) {
      logger.error('Failed to send account created notification:', error);
    }
  }

  /**
   * 🔥 NEW: Payslip generated notification (with email)
   */
  async notifyPayslipGenerated(userId, payslipData) {
    try {
      await this.sendToUser(userId, {
        title: 'Payslip Generated',
        message: `Your payslip for ${payslipData.month} ${payslipData.year} has been generated and is ready for download.`,
        type: 'success',
        category: 'payroll',
        metadata: {
          action: 'payslip_generated',
          month: payslipData.month,
          year: payslipData.year
        },
      }, {
        sendEmail: true,
        emailData: payslipData
      });
    } catch (error) {
      logger.error('Failed to send payslip notification:', error);
    }
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

  // ===================================================
  // WORKING RULE NOTIFICATION METHODS
  // ===================================================

  /**
   * Working rule created notification
   */
  async notifyWorkingRuleCreated(workingRule, createdBy) {
    const workingDaysText = workingRule.workingDays.map(day => {
      const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
      return days[day];
    }).join(', ');

    await this.sendToRoles(['SuperAdmin', 'HR', 'HR_Manager'], {
      title: '📋 New Working Rule Created',
      message: `Working rule "${workingRule.ruleName}" created by ${createdBy}. Working days: ${workingDaysText}`,
      type: 'info',
      category: 'system',
      metadata: {
        workingRuleId: workingRule.id,
        ruleName: workingRule.ruleName,
        workingDays: workingRule.workingDays,
        weekendDays: workingRule.weekendDays,
        effectiveFrom: workingRule.effectiveFrom,
        createdBy,
        action: 'created'
      }
    });
  }

  /**
   * Working rule updated notification
   */
  async notifyWorkingRuleUpdated(workingRule, changes, updatedBy, isHighPriority = false) {
    const changeText = changes.join('. ');
    const notificationType = isHighPriority ? 'warning' : 'info';
    const titlePrefix = isHighPriority ? '⚠️ CRITICAL:' : '📝';

    await this.sendToRoles(['SuperAdmin', 'HR', 'HR_Manager'], {
      title: `${titlePrefix} Working Rule Updated`,
      message: `Working rule "${workingRule.ruleName}" updated by ${updatedBy}. ${changeText}`,
      type: notificationType,
      category: 'system',
      metadata: {
        workingRuleId: workingRule.id,
        ruleName: workingRule.ruleName,
        changes,
        updatedBy,
        action: 'updated',
        isHighPriority
      }
    });
  }

  /**
   * Default working rule changed notification (CRITICAL)
   */
  async notifyDefaultWorkingRuleChanged(workingRule, updatedBy, oldDefaultRule = null) {
    const workingDaysText = workingRule.workingDays.map(day => {
      const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
      return days[day];
    }).join(', ');

    await this.sendToRoles(['SuperAdmin', 'HR', 'HR_Manager'], {
      title: '🚨 CRITICAL: Default Working Rule Changed',
      message: `"${workingRule.ruleName}" is now the default working rule. This affects all attendance and payroll. Working days: ${workingDaysText}. Changed by: ${updatedBy}`,
      type: 'error', // Highest priority
      category: 'system',
      metadata: {
        workingRuleId: workingRule.id,
        ruleName: workingRule.ruleName,
        workingDays: workingRule.workingDays,
        weekendDays: workingRule.weekendDays,
        oldDefaultRule,
        updatedBy,
        action: 'set_default',
        priority: 'CRITICAL',
        systemImpact: 'attendance_payroll'
      }
    });
  }

  /**
   * Working rule deleted notification
   */
  async notifyWorkingRuleDeleted(ruleDetails, deletedBy) {
    const notificationType = ruleDetails.isActive ? 'warning' : 'info';
    const title = ruleDetails.isActive ? '🗑️ Active Working Rule Deleted' : '🗑️ Working Rule Deleted';

    await this.sendToRoles(['SuperAdmin'], {
      title,
      message: `Working rule "${ruleDetails.ruleName}" has been deleted by ${deletedBy}`,
      type: notificationType,
      category: 'system',
      metadata: {
        deletedRuleId: ruleDetails.id,
        ruleName: ruleDetails.ruleName,
        workingDays: ruleDetails.workingDays,
        weekendDays: ruleDetails.weekendDays,
        wasActive: ruleDetails.isActive,
        deletedBy,
        action: 'deleted'
      }
    });
  }

  /**
   * 🔥 NEW: Send email notification using Resend
   * Handles different notification types with appropriate templates
   */
  async sendEmailNotification(userId, notificationData, emailData = {}) {
    try {
      // Get user and employee details
      const user = await User.findByPk(userId, {
        include: [{ model: Employee, as: 'employee' }],
      });

      if (!user || !user.email) {
        logger.warn(`Cannot send email: User ${userId} has no email`);
        return;
      }

      const employee = user.employee;

      // Route to appropriate email template based on notification type
      switch (notificationData.category) {
        case 'attendance':
          if (notificationData.type === 'error' && notificationData.message.includes('absent')) {
            await resendEmailService.sendAttendanceAbsentEmail(
              employee,
              emailData.date || new Date(),
              emailData.reason || 'No clock-in recorded'
            );
          } else if (notificationData.message.includes('correction')) {
            await resendEmailService.sendCorrectionRequiredEmail(
              employee,
              emailData.date || new Date(),
              emailData.issue || 'Missing clock-out'
            );
          }
          break;

        case 'leave':
          if (notificationData.type === 'success' && notificationData.message.includes('approved')) {
            await resendEmailService.sendLeaveApprovedEmail(
              employee,
              emailData.leaveRequest,
              emailData.approverName || 'Manager'
            );
          }
          break;

        default:
          logger.debug(`No email template for notification category: ${notificationData.category}`);
      }
    } catch (error) {
      logger.error(`Failed to send email notification for user ${userId}:`, error);
      // Don't throw - email failure shouldn't block notification
    }
  }

  /**
   * Determine if an email should be sent for this notification
   */
  shouldSendEmail(notificationData) {
    // Send emails for important notifications
    const emailableCategories = ['attendance', 'leave', 'correction'];
    const emailableTypes = ['error', 'warning', 'success'];

    return (
      emailableCategories.includes(notificationData.category) &&
      emailableTypes.includes(notificationData.type)
    );
  }
}

export default new NotificationService();