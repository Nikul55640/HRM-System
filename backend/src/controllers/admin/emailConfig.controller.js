import { sendEmail, verifyEmailConfig, getEmailProviderInfo } from '../../services/email/email.service.js';
import { render } from '@react-email/render';
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
        // Import and render template
        const { AttendanceAbsent } = await import('../../emails/templates/AttendanceAbsent.js');
        const absentHtml = render(AttendanceAbsent({
          employeeName: data.employeeName || 'Test Employee',
          date: new Date(data.date || new Date().toISOString().split('T')[0]).toLocaleDateString(),
          reason: data.reason || 'Test email - No clock-in recorded',
          actionUrl: `${process.env.FRONTEND_URL}/attendance/corrections`
        }));
        
        result = await sendEmail({
          to: email,
          subject: `Attendance Marked as Absent - ${data.date || new Date().toISOString().split('T')[0]}`,
          html: absentHtml,
          text: `Test email: Your attendance was marked as absent. Reason: ${data.reason || 'No clock-in recorded'}`
        });
        break;
      
      case 'correction_required':
        const { CorrectionRequired } = await import('../../emails/templates/CorrectionRequired.js');
        const correctionHtml = render(CorrectionRequired({
          employeeName: data.employeeName || 'Test Employee',
          date: new Date(data.date || new Date().toISOString().split('T')[0]).toLocaleDateString(),
          issue: data.issue || 'Test email - Missing clock-out',
          actionUrl: `${process.env.FRONTEND_URL}/attendance/corrections`
        }));
        
        result = await sendEmail({
          to: email,
          subject: `Attendance Correction Required - ${data.date || new Date().toISOString().split('T')[0]}`,
          html: correctionHtml,
          text: `Test email: Your attendance requires correction. Issue: ${data.issue || 'Missing clock-out'}`
        });
        break;
      
      case 'leave_approved':
        const { LeaveApproved } = await import('../../emails/templates/LeaveApproved.js');
        const startDate = new Date(data.startDate || new Date().toISOString().split('T')[0]).toLocaleDateString();
        const endDate = new Date(data.endDate || new Date().toISOString().split('T')[0]).toLocaleDateString();
        const days = data.days || 1;
        
        const leaveHtml = render(LeaveApproved({
          employeeName: data.employeeName || 'Test Employee',
          leaveType: data.leaveType || 'Annual Leave',
          startDate,
          endDate,
          days,
          approverName: data.approverName || 'Test Manager',
          actionUrl: `${process.env.FRONTEND_URL}/leave/my-leaves`
        }));
        
        result = await sendEmail({
          to: email,
          subject: `Leave Request Approved - ${startDate} to ${endDate}`,
          html: leaveHtml,
          text: `Test email: Your ${data.leaveType || 'Annual Leave'} request has been approved.`
        });
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
        data: { 
          emailId: result.messageId || result.emailId, 
          type,
          provider: result.provider 
        }
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

    const configStatus = await verifyEmailConfig();
    const providerInfo = getEmailProviderInfo();

    return res.json({
      success: true,
      data: {
        isConfigured: configStatus.valid,
        service: providerInfo.provider,
        provider: providerInfo.provider,
        fromEmail: providerInfo.fromEmail,
        baseUrl: providerInfo.baseUrl,
        configured: providerInfo.configured,
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