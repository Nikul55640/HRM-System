/**
 * Resend Email Service
 * 
 * Handles all email sending through Resend API
 * Uses @react-email/components for professional templates
 * 
 * 🔥 CRITICAL: This is the single source of truth for email sending
 */

import { Resend } from 'resend';
import { render } from '@react-email/render';
import logger from '../utils/logger.js';

// Import React Email templates
import { AttendanceAbsent } from '../emails/templates/AttendanceAbsent.js';
import { CorrectionRequired } from '../emails/templates/CorrectionRequired.js';
import { LeaveApproved } from '../emails/templates/LeaveApproved.js';

class ResendEmailService {
  constructor() {
    this.resend = new Resend(process.env.RESEND_API_KEY);
    this.fromEmail = process.env.RESEND_FROM_EMAIL || 'noreply@hrm.local';
    this.baseUrl = process.env.APP_BASE_URL || 'http://localhost:5174';
  }

  /**
   * Send email using Resend
   * @param {Object} options - Email options
   * @param {string} options.to - Recipient email
   * @param {string} options.subject - Email subject
   * @param {React.Component} options.template - React Email template component
   * @param {Object} options.metadata - Optional metadata for tracking
   * @returns {Promise<Object>} Resend response
   */
  async sendEmail({ to, subject, template, metadata = {} }) {
    try {
      if (!to) {
        throw new Error('Recipient email is required');
      }

      if (!template) {
        throw new Error('Email template is required');
      }

      // Render React component to HTML
      const html = render(template);

      // Send via Resend
      const response = await this.resend.emails.send({
        from: this.fromEmail,
        to,
        subject,
        html,
        tags: [
          { name: 'category', value: metadata.category || 'notification' },
          { name: 'type', value: metadata.type || 'general' },
        ],
      });

      if (response.error) {
        throw new Error(`Resend API error: ${response.error.message}`);
      }

      logger.info(`Email sent successfully to ${to}`, {
        emailId: response.data?.id,
        subject,
        type: metadata.type,
      });

      return {
        success: true,
        emailId: response.data?.id,
        message: 'Email sent successfully',
      };
    } catch (error) {
      logger.error(`Failed to send email to ${to}:`, error);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * Send attendance absent notification
   */
  async sendAttendanceAbsentEmail(employee, date, reason = 'No clock-in recorded') {
    const template = AttendanceAbsent({
      employeeName: `${employee.firstName} ${employee.lastName}`,
      date: new Date(date).toLocaleDateString(),
      reason,
      actionUrl: `${this.baseUrl}/attendance/corrections`
    });

    return this.sendEmail({
      to: employee.user?.email,
      subject: `Attendance Marked as Absent - ${date}`,
      template,
      metadata: {
        category: 'attendance',
        type: 'absent_notification',
        employeeId: employee.id,
        date,
      },
    });
  }

  /**
   * Send leave approved notification
   */
  async sendLeaveApprovedEmail(employee, leaveRequest, approverName) {
    const startDate = new Date(leaveRequest.startDate).toLocaleDateString();
    const endDate = new Date(leaveRequest.endDate).toLocaleDateString();
    const days = leaveRequest.numberOfDays || 1;

    const template = LeaveApproved({
      employeeName: `${employee.firstName} ${employee.lastName}`,
      leaveType: leaveRequest.leaveType || 'Leave',
      startDate,
      endDate,
      days,
      approverName,
      actionUrl: `${this.baseUrl}/leave/my-leaves`
    });

    return this.sendEmail({
      to: employee.user?.email,
      subject: `Leave Request Approved - ${startDate} to ${endDate}`,
      template,
      metadata: {
        category: 'leave',
        type: 'leave_approved',
        employeeId: employee.id,
        leaveRequestId: leaveRequest.id,
      },
    });
  }

  /**
   * Send correction required notification
   */
  async sendCorrectionRequiredEmail(employee, date, issue = 'Missing clock-out') {
    const template = CorrectionRequired({
      employeeName: `${employee.firstName} ${employee.lastName}`,
      date: new Date(date).toLocaleDateString(),
      issue,
      actionUrl: `${this.baseUrl}/attendance/corrections`
    });

    return this.sendEmail({
      to: employee.user?.email,
      subject: `Attendance Correction Required - ${date}`,
      template,
      metadata: {
        category: 'attendance',
        type: 'correction_required',
        employeeId: employee.id,
        date,
      },
    });
  }

  /**
   * Send custom email with React template
   */
  async sendCustomEmail(to, subject, template, metadata = {}) {
    return this.sendEmail({
      to,
      subject,
      template,
      metadata,
    });
  }

  /**
   * Verify email configuration
   */
  async verifyConfiguration() {
    try {
      if (!process.env.RESEND_API_KEY) {
        return {
          valid: false,
          error: 'RESEND_API_KEY not configured',
        };
      }

      if (!process.env.RESEND_FROM_EMAIL) {
        return {
          valid: false,
          error: 'RESEND_FROM_EMAIL not configured',
        };
      }

      return {
        valid: true,
        fromEmail: this.fromEmail,
        message: 'Resend email service is properly configured',
      };
    } catch (error) {
      return {
        valid: false,
        error: error.message,
      };
    }
  }
}

export default new ResendEmailService();