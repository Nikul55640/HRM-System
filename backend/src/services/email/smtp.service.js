/**
 * SMTP Email Service
 * 
 * Universal SMTP provider for Gmail, Outlook, Office365, Zoho, etc.
 * Works as fallback or primary provider for corporate environments
 * 
 * 🔥 CRITICAL: This is the SMTP provider implementation
 */

import nodemailer from 'nodemailer';
import logger from '../../utils/logger.js';

class SMTPService {
  constructor() {
    this.transporter = null;
  }

  /**
   * Initialize SMTP transporter
   */
  _initializeTransporter() {
    if (!this.transporter) {
      const config = {
        host: process.env.SMTP_HOST,
        port: Number(process.env.SMTP_PORT) || 587,
        secure: process.env.SMTP_SECURE === 'true', // true for 465, false for 587
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS,
        },
      };

      // Add additional options for common providers
      if (process.env.SMTP_HOST?.includes('gmail')) {
        config.service = 'gmail';
      } else if (process.env.SMTP_HOST?.includes('outlook') || process.env.SMTP_HOST?.includes('hotmail')) {
        config.service = 'hotmail';
      }

      this.transporter = nodemailer.createTransport(config);
    }
    return this.transporter;
  }

  /**
   * Send email via SMTP
   * @param {Object} options - Email options
   * @param {string} options.to - Recipient email
   * @param {string} options.subject - Email subject
   * @param {string} options.html - HTML content
   * @param {string} options.text - Plain text content (optional)
   * @returns {Promise<Object>} Send result
   */
  async sendSMTPEmail({ to, subject, html, text }) {
    try {
      if (!process.env.SMTP_HOST || !process.env.SMTP_USER || !process.env.SMTP_PASS) {
        throw new Error('SMTP configuration incomplete. Check SMTP_HOST, SMTP_USER, SMTP_PASS');
      }

      if (!to) {
        throw new Error('Recipient email is required');
      }

      const transporter = this._initializeTransporter();
      
      // Extract from email and name
      const fromEmail = process.env.EMAIL_FROM.includes('<') 
        ? process.env.EMAIL_FROM.split('<')[1].replace('>', '')
        : process.env.EMAIL_FROM;

      const fromName = process.env.EMAIL_FROM.includes('<')
        ? process.env.EMAIL_FROM.split('<')[0].trim()
        : 'HRMS';

      const mailOptions = {
        from: `${fromName} <${fromEmail}>`,
        to,
        subject,
        html,
        text: text || html.replace(/<[^>]*>/g, ''), // Strip HTML if no text provided
      };

      const result = await transporter.sendMail(mailOptions);

      logger.info(`SMTP email sent successfully to ${to}`, {
        messageId: result.messageId,
        subject,
        provider: 'smtp',
        smtpHost: process.env.SMTP_HOST
      });

      return {
        success: true,
        messageId: result.messageId,
        message: 'Email sent successfully via SMTP',
        provider: 'smtp'
      };

    } catch (error) {
      logger.error(`❌ SMTP email failed to ${to}:`, error);
      return {
        success: false,
        error: error.message,
        provider: 'smtp'
      };
    }
  }

  /**
   * Verify SMTP connection and configuration
   */
  async verifySMTPConfig() {
    try {
      if (!process.env.SMTP_HOST) {
        return {
          valid: false,
          error: 'SMTP_HOST not configured'
        };
      }

      if (!process.env.SMTP_USER) {
        return {
          valid: false,
          error: 'SMTP_USER not configured'
        };
      }

      if (!process.env.SMTP_PASS) {
        return {
          valid: false,
          error: 'SMTP_PASS not configured'
        };
      }

      if (!process.env.EMAIL_FROM) {
        return {
          valid: false,
          error: 'EMAIL_FROM not configured'
        };
      }

      // Test connection
      const transporter = this._initializeTransporter();
      await transporter.verify();

      return {
        valid: true,
        provider: 'SMTP',
        host: process.env.SMTP_HOST,
        port: process.env.SMTP_PORT || 587,
        secure: process.env.SMTP_SECURE === 'true',
        fromEmail: process.env.EMAIL_FROM,
        message: 'SMTP email service is properly configured and connected'
      };
    } catch (error) {
      return {
        valid: false,
        error: `SMTP connection failed: ${error.message}`
      };
    }
  }

  /**
   * Send test email
   */
  async sendTestEmail(to) {
    const testHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #2563eb;">🧪 SMTP Test Email</h2>
        <p>This is a test email from your HRM System SMTP configuration.</p>
        <div style="background: #f3f4f6; padding: 15px; border-radius: 8px; margin: 20px 0;">
          <strong>Provider:</strong> SMTP<br>
          <strong>Host:</strong> ${process.env.SMTP_HOST}<br>
          <strong>Port:</strong> ${process.env.SMTP_PORT || 587}<br>
          <strong>Secure:</strong> ${process.env.SMTP_SECURE === 'true' ? 'Yes (SSL)' : 'No (TLS)'}<br>
          <strong>Time:</strong> ${new Date().toLocaleString()}
        </div>
        <p style="color: #059669;">✅ If you received this email, SMTP is working correctly!</p>
      </div>
    `;

    return this.sendSMTPEmail({
      to,
      subject: '🧪 HRM System - SMTP Test Email',
      html: testHtml
    });
  }
}

// Export singleton instance
const smtpService = new SMTPService();

export const sendSMTPEmail = smtpService.sendSMTPEmail.bind(smtpService);
export const verifySMTPConfig = smtpService.verifySMTPConfig.bind(smtpService);
export const sendSMTPTestEmail = smtpService.sendTestEmail.bind(smtpService);

export default smtpService;