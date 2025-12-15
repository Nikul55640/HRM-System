import nodemailer from 'nodemailer';
import logger from '../utils/logger.js';

/**
 * Email Notification Service
 * Handles all email notifications
 */

// Create reusable transporter
let transporter = null;

/**
 * Initialize email transporter
 */
const initializeTransporter = () => {
  if (transporter) {
    return transporter;
  }

  // Configure transporter based on environment
  const emailConfig = {
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.SMTP_PORT || '587', 10),
    secure: process.env.SMTP_SECURE === 'true', // true for 465, false for other ports
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASSWORD,
    },
  };

  // In development, use ethereal email for testing if no SMTP configured
  if (process.env.NODE_ENV === 'development' && !process.env.SMTP_USER) {
    logger.warn('No SMTP configuration found. Email sending will be simulated in development mode.');
    // Return a mock transporter for development
    transporter = {
      sendMail: async (mailOptions) => {
        logger.info('Mock email sent:', {
          to: mailOptions.to,
          subject: mailOptions.subject,
        });
        return { messageId: 'mock-message-id' };
      },
    };
    return transporter;
  }

  transporter = nodemailer.createTransport(emailConfig);

  // Verify transporter configuration
  transporter.verify((error) => {
    if (error) {
      logger.error('Email transporter verification failed:', error);
    } else {
      logger.info('Email transporter is ready to send emails');
    }
  });

  return transporter;
};

/**
 * Send email
 * @param {Object} mailOptions - Email options (to, subject, html, text)
 * @returns {Promise<Object>} Email send result
 */
const sendEmail = async (mailOptions) => {
  try {
    const emailTransporter = initializeTransporter();

    const defaultOptions = {
      from: process.env.SMTP_FROM || '"HRMS System" <noreply@hrms.com>',
    };

    const result = await emailTransporter.sendMail({
      ...defaultOptions,
      ...mailOptions,
    });

    logger.info(`Email sent successfully to ${mailOptions.to}`);
    return result;
  } catch (error) {
    logger.error('Error sending email:', error);
    throw error;
  }
};

/**
 * Send welcome email to new employee
 * @param {Object} employee - Employee object
 * @param {String} temporaryPassword - Temporary password (optional)
 * @returns {Promise<Object>} Email send result
 */
const sendWelcomeEmail = async (employee, temporaryPassword = null) => {
  try {
    const { firstName, lastName } = employee.personalInfo;
    const { email } = employee.contactInfo;
    const { jobTitle } = employee.jobInfo;

    const subject = 'Welcome to the Organization!';

    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background-color: #4F46E5; color: white; padding: 20px; text-align: center; }
          .content { padding: 20px; background-color: #f9f9f9; }
          .footer { padding: 20px; text-align: center; font-size: 12px; color: #666; }
          .button { display: inline-block; padding: 10px 20px; background-color: #4F46E5; color: white; text-decoration: none; border-radius: 5px; margin: 10px 0; }
          .info-box { background-color: #fff; padding: 15px; border-left: 4px solid #4F46E5; margin: 15px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Welcome to Our Organization!</h1>
          </div>
          <div class="content">
            <h2>Hello ${firstName} ${lastName},</h2>
            <p>We are excited to welcome you to our team as a <strong>${jobTitle}</strong>!</p>
            
            <p>Your employee profile has been created in our HR Management System. Here are your details:</p>
            
            <div class="info-box">
              <p><strong>Employee ID:</strong> ${employee.employeeId}</p>
              <p><strong>Email:</strong> ${email}</p>
              <p><strong>Job Title:</strong> ${jobTitle}</p>
              <p><strong>Start Date:</strong> ${new Date(employee.jobInfo.hireDate).toLocaleDateString()}</p>
            </div>
            
            ${temporaryPassword ? `
              <div class="info-box" style="border-left-color: #EF4444;">
                <p><strong>Temporary Password:</strong> ${temporaryPassword}</p>
                <p style="color: #EF4444; font-size: 14px;">
                  <strong>Important:</strong> Please change your password immediately after your first login for security purposes.
                </p>
              </div>
            ` : ''}
            
            <p>You can access the HR portal using the link below:</p>
            <p style="text-align: center;">
              <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}/login" class="button">
                Access HR Portal
              </a>
            </p>
            
            <p>If you have any questions or need assistance, please don't hesitate to contact the HR department.</p>
            
            <p>We look forward to working with you!</p>
            
            <p>Best regards,<br>HR Team</p>
          </div>
          <div class="footer">
            <p>This is an automated message from the HR Management System.</p>
            <p>Please do not reply to this email.</p>
          </div>
        </div>
      </body>
      </html>
    `;

    const textContent = `
Welcome to Our Organization!

Hello ${firstName} ${lastName},

We are excited to welcome you to our team as a ${jobTitle}!

Your employee profile has been created in our HR Management System.

Employee Details:
- Employee ID: ${employee.employeeId}
- Email: ${email}
- Job Title: ${jobTitle}
- Start Date: ${new Date(employee.jobInfo.hireDate).toLocaleDateString()}

${temporaryPassword ? `
Temporary Password: ${temporaryPassword}
IMPORTANT: Please change your password immediately after your first login for security purposes.
` : ''}

You can access the HR portal at: ${process.env.FRONTEND_URL || 'http://localhost:3000'}/login

If you have any questions or need assistance, please contact the HR department.

We look forward to working with you!

Best regards,
HR Team

---
This is an automated message from the HR Management System.
Please do not reply to this email.
    `;

    return await sendEmail({
      to: email,
      subject,
      html: htmlContent,
      text: textContent,
    });
  } catch (error) {
    logger.error('Error sending welcome email:', error);
    // Don't throw error - email failure shouldn't block employee creation
    return null;
  }
};

/**
 * Send profile update notification email
 * @param {Object} employee - Employee object
 * @param {Array} changes - Array of changes made
 * @param {Object} updatedBy - User who made the update
 * @returns {Promise<Object>} Email send result
 */
const sendProfileUpdateEmail = async (employee, changes, updatedBy) => {
  try {
    const { firstName, lastName } = employee.personalInfo;
    const { email } = employee.contactInfo;

    // Filter critical changes that require notification
    const criticalFields = ['jobTitle', 'department', 'manager', 'status', 'employmentType'];
    const criticalChanges = changes.filter((change) => criticalFields.some((field) => change.field.toLowerCase().includes(field.toLowerCase())));

    // Only send email if there are critical changes
    if (criticalChanges.length === 0) {
      logger.info('No critical changes to notify employee about');
      return null;
    }

    const subject = 'Your Employee Profile Has Been Updated';

    const changesHtml = criticalChanges
      .map(
        (change) => `
        <tr>
          <td style="padding: 10px; border-bottom: 1px solid #ddd;"><strong>${change.field}</strong></td>
          <td style="padding: 10px; border-bottom: 1px solid #ddd;">${change.oldValue || 'N/A'}</td>
          <td style="padding: 10px; border-bottom: 1px solid #ddd;">${change.newValue || 'N/A'}</td>
        </tr>
      `,
      )
      .join('');

    const changesText = criticalChanges
      .map((change) => `- ${change.field}: ${change.oldValue || 'N/A'} → ${change.newValue || 'N/A'}`)
      .join('\n');

    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background-color: #4F46E5; color: white; padding: 20px; text-align: center; }
          .content { padding: 20px; background-color: #f9f9f9; }
          .footer { padding: 20px; text-align: center; font-size: 12px; color: #666; }
          .button { display: inline-block; padding: 10px 20px; background-color: #4F46E5; color: white; text-decoration: none; border-radius: 5px; margin: 10px 0; }
          table { width: 100%; border-collapse: collapse; margin: 15px 0; background-color: white; }
          th { background-color: #4F46E5; color: white; padding: 10px; text-align: left; }
          td { padding: 10px; border-bottom: 1px solid #ddd; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Profile Update Notification</h1>
          </div>
          <div class="content">
            <h2>Hello ${firstName} ${lastName},</h2>
            <p>Your employee profile has been updated by ${updatedBy.email || 'HR Administrator'}.</p>
            
            <p>The following changes were made:</p>
            
            <table>
              <thead>
                <tr>
                  <th>Field</th>
                  <th>Previous Value</th>
                  <th>New Value</th>
                </tr>
              </thead>
              <tbody>
                ${changesHtml}
              </tbody>
            </table>
            
            <p>You can view your complete profile in the HR portal:</p>
            <p style="text-align: center;">
              <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}/profile" class="button">
                View My Profile
              </a>
            </p>
            
            <p>If you have any questions about these changes, please contact the HR department.</p>
            
            <p>Best regards,<br>HR Team</p>
          </div>
          <div class="footer">
            <p>This is an automated message from the HR Management System.</p>
            <p>Please do not reply to this email.</p>
          </div>
        </div>
      </body>
      </html>
    `;

    const textContent = `
Profile Update Notification

Hello ${firstName} ${lastName},

Your employee profile has been updated by ${updatedBy.email || 'HR Administrator'}.

The following changes were made:
${changesText}

You can view your complete profile in the HR portal at: ${process.env.FRONTEND_URL || 'http://localhost:3000'}/profile

If you have any questions about these changes, please contact the HR department.

Best regards,
HR Team

---
This is an automated message from the HR Management System.
Please do not reply to this email.
    `;

    return await sendEmail({
      to: email,
      subject,
      html: htmlContent,
      text: textContent,
    });
  } catch (error) {
    logger.error('Error sending profile update email:', error);
    // Don't throw error - email failure shouldn't block profile update
    return null;
  }
};

/**
 * Send password reset email
 * @param {String} email - User email
 * @param {String} resetToken - Password reset token
 * @param {String} userName - User name
 * @returns {Promise<Object>} Email send result
 */
const sendPasswordResetEmail = async (email, resetToken, userName) => {
  try {
    const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/reset-password?token=${resetToken}`;
    const subject = 'Password Reset Request';

    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background-color: #4F46E5; color: white; padding: 20px; text-align: center; }
          .content { padding: 20px; background-color: #f9f9f9; }
          .footer { padding: 20px; text-align: center; font-size: 12px; color: #666; }
          .button { display: inline-block; padding: 10px 20px; background-color: #4F46E5; color: white; text-decoration: none; border-radius: 5px; margin: 10px 0; }
          .warning { background-color: #FEF3C7; padding: 15px; border-left: 4px solid #F59E0B; margin: 15px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Password Reset Request</h1>
          </div>
          <div class="content">
            <h2>Hello ${userName},</h2>
            <p>We received a request to reset your password for your HRMS account.</p>
            
            <p>Click the button below to reset your password:</p>
            <p style="text-align: center;">
              <a href="${resetUrl}" class="button">Reset Password</a>
            </p>
            
            <div class="warning">
              <p><strong>Important:</strong></p>
              <ul>
                <li>This link will expire in 1 hour</li>
                <li>If you didn't request this reset, please ignore this email</li>
                <li>Your password will remain unchanged until you create a new one</li>
              </ul>
            </div>
            
            <p>If the button doesn't work, copy and paste this link into your browser:</p>
            <p style="word-break: break-all; color: #4F46E5;">${resetUrl}</p>
            
            <p>Best regards,<br>HR Team</p>
          </div>
          <div class="footer">
            <p>This is an automated message from the HR Management System.</p>
            <p>Please do not reply to this email.</p>
          </div>
        </div>
      </body>
      </html>
    `;

    const textContent = `
Password Reset Request

Hello ${userName},

We received a request to reset your password for your HRMS account.

Click the link below to reset your password:
${resetUrl}

Important:
- This link will expire in 1 hour
- If you didn't request this reset, please ignore this email
- Your password will remain unchanged until you create a new one

Best regards,
HR Team

---
This is an automated message from the HR Management System.
Please do not reply to this email.
    `;

    return await sendEmail({
      to: email,
      subject,
      html: htmlContent,
      text: textContent,
    });
  } catch (error) {
    logger.error('Error sending password reset email:', error);
    throw error;
  }
};

export default {
  sendEmail,
  sendWelcomeEmail,
  sendProfileUpdateEmail,
  sendPasswordResetEmail,
  initializeTransporter,
};
