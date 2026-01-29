import resendEmailService from '../../services/resendEmailService.js';
import logger from '../../utils/logger.js';
import { ROLES } from '../../config/rolePermissions.js';

/**
 * Email Configuration Controller
 * Handles email testing and configuration management
 */

/**
 * Test email functionality
 */
export const testEmail = async (req, res) => {
  try {
    // Only Super Admin can test email
    if (req.user.role !== ROLES.SUPER_ADMIN) {
      return res.status(403).json({
        success: false,
        message: 'Only Super Admin can test email functionality'
      });
    }

    const { email, type = 'attendance_absent', data = {} } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Email address is required'
      });
    }

    // Create test employee data
    const testEmployee = {
      firstName: data.employeeName || 'Test',
      lastName: 'Employee',
      user: { email }
    };

    let result;

    // Send different types of test emails
    switch (type) {
      case 'attendance_absent':
        result = await resendEmailService.sendAttendanceAbsentEmail(
          testEmployee,
          data.date || new Date().toISOString().split('T')[0],
          data.reason || 'Test email - No clock-in recorded'
        );
        break;
      
      case 'correction_required':
        result = await resendEmailService.sendCorrectionRequiredEmail(
          testEmployee,
          data.date || new Date().toISOString().split('T')[0],
          data.issue || 'Test email - Missing clock-out'
        );
        break;
      
      case 'leave_approved':
        const testLeaveRequest = {
          leaveType: data.leaveType || 'Annual Leave',
          startDate: data.startDate || new Date().toISOString().split('T')[0],
          endDate: data.endDate || new Date().toISOString().split('T')[0],
          numberOfDays: data.days || 1
        };
        result = await resendEmailService.sendLeaveApprovedEmail(
          testEmployee,
          testLeaveRequest,
          data.approverName || 'Test Manager'
        );
        break;
      
      default:
        return res.status(400).json({
          success: false,
          message: 'Invalid email type. Use: attendance_absent, correction_required, or leave_approved'
        });
    }

    if (result.success) {
      logger.info(`Test email sent successfully to ${email}`);
      return res.json({
        success: true,
        message: 'Test email sent successfully',
        data: { emailId: result.emailId, type }
      });
    } else {
      logger.error(`Test email failed for ${email}:`, result.error);
      return res.status(500).json({
        success: false,
        message: 'Failed to send test email',
        error: result.error
      });
    }
  } catch (error) {
    logger.error('Error in test email:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

/**
 * Get email service status
 */
export const getEmailStatus = async (req, res) => {
  try {
    // Only Super Admin and HR Admin can check email status
    if (![ROLES.SUPER_ADMIN, ROLES.HR_ADMIN].includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: 'Insufficient permissions'
      });
    }

    const configStatus = await resendEmailService.verifyConfiguration();

    return res.json({
      success: true,
      data: {
        isConfigured: configStatus.valid,
        service: 'Resend',
        fromEmail: process.env.RESEND_FROM_EMAIL || 'Not configured',
        baseUrl: process.env.APP_BASE_URL || 'Not configured',
        apiKeyConfigured: !!process.env.RESEND_API_KEY,
        lastChecked: new Date().toISOString(),
        ...configStatus
      }
    });
  } catch (error) {
    logger.error('Error getting email status:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

/**
 * Send notification with email to specific user (for testing)
 */
export const sendTestNotification = async (req, res) => {
  try {
    // Only Super Admin can send test notifications
    if (req.user.role !== ROLES.SUPER_ADMIN) {
      return res.status(403).json({
        success: false,
        message: 'Only Super Admin can send test notifications'
      });
    }

    const { userId, title, message, type = 'info', category = 'system', sendEmail = true } = req.body;

    if (!userId || !title || !message) {
      return res.status(400).json({
        success: false,
        message: 'userId, title, and message are required'
      });
    }

    // Import notification service
    const notificationService = (await import('../../services/notificationService.js')).default;

    // Send notification with email
    const notification = await notificationService.sendToUser(userId, {
      title,
      message,
      type,
      category,
      metadata: {
        action: 'test_notification',
        sentBy: req.user.id
      }
    }, {
      sendEmail
    });

    return res.json({
      success: true,
      message: 'Test notification sent successfully',
      data: notification
    });
  } catch (error) {
    logger.error('Error sending test notification:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};