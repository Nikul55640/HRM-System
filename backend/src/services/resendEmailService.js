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
import { AttendanceIncomplete } from '../emails/templates/AttendanceIncomplete.js';
import { CorrectionRequired } from '../emails/templates/CorrectionRequired.js';
import { LeaveApproved } from '../emails/templates/LeaveApproved.js';

class ResendEmailService {
  constructor() {
    this.resend = null;
    this.fromEmail = process.env.RESEND_FROM_EMAIL || process.env.EMAIL_FROM || 'onboarding@resend.dev';
    this.baseUrl = process.env.APP_BASE_URL || 'http://localhost:5174';
  }

  // Initialize Resend only when needed
  _initializeResend() {
    if (!this.resend && process.env.RESEND_API_KEY) {
      this.resend = new Resend(process.env.RESEND_API_KEY);
    }
    return this.resend;
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

      // Initialize Resend
      const resend = this._initializeResend();
      if (!resend) {
        throw new Error('Resend API key not configured');
      }

      // Render React component to HTML
      const html = render(template);

      // Send via Resend
      const response = await resend.emails.send({
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
   * Send attendance incomplete notification (friendly, optional correction)
   */
  async sendAttendanceIncompleteEmail(employee, date, issue = 'Missing clock-out time') {
    const template = AttendanceIncomplete({
      employeeName: `${employee.firstName} ${employee.lastName}`,
      date: new Date(date).toLocaleDateString(),
      issue,
      actionUrl: `${this.baseUrl}/employee/attendance/corrections`
    });

    return this.sendEmail({
      to: employee.user?.email,
      subject: `Attendance Notice - ${date}`,
      template,
      metadata: {
        category: 'attendance',
        type: 'incomplete_notice',
        employeeId: employee.id,
        date,
      },
    });
  }

  /**
   * Send correction required notification (for urgent cases)
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
   * Send simple HTML email (for testing)
   * @param {Object} options - Email options
   * @param {string} options.to - Recipient email
   * @param {string} options.subject - Email subject
   * @param {string} options.html - HTML content
   * @param {string} options.text - Plain text content (optional)
   * @returns {Promise<Object>} Send result
   */
  async sendSimpleEmail({ to, subject, html, text }) {
    try {
      if (!to) {
        throw new Error('Recipient email is required');
      }

      if (!html) {
        throw new Error('HTML content is required');
      }

      // Initialize Resend
      const resend = this._initializeResend();
      if (!resend) {
        throw new Error('Resend API key not configured');
      }

      // Send via Resend with HTML directly
      const response = await resend.emails.send({
        from: this.fromEmail,
        to,
        subject,
        html,
        text: text || html.replace(/<[^>]*>/g, ''), // Strip HTML for text version
        tags: [
          { name: 'category', value: 'test' },
          { name: 'type', value: 'simple_email' },
        ],
      });

      if (response.error) {
        throw new Error(`Resend API error: ${response.error.message}`);
      }

      logger.info(`Simple email sent successfully to ${to}`, {
        emailId: response.data?.id,
        subject,
      });

      return {
        success: true,
        id: response.data?.id,
        messageId: response.data?.id,
        message: 'Email sent successfully',
      };
    } catch (error) {
      logger.error(`Failed to send simple email to ${to}:`, error);
      return {
        success: false,
        error: error.message,
      };
    }
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