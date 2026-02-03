/**
 * Email Provider Wrapper Service
 * 
 * This makes your HRM future-proof by providing a single interface
 * for multiple email providers (Mailtrap, Resend, etc.)
 * 
 * 🔥 CRITICAL: HRM will only call this service, never providers directly
 */

import { sendMailtrapEmail, verifyMailtrapConfig } from './mailtrap.service.js';
import { sendSMTPEmail, verifySMTPConfig } from './smtp.service.js';
import resendEmailService from '../resendEmailService.js';
import logger from '../../utils/logger.js';

/**
 * Send email using configured provider
 * @param {Object} options - Email options
 * @param {string} options.to - Recipient email
 * @param {string} options.subject - Email subject
 * @param {string} options.html - HTML content
 * @param {string} options.text - Plain text content (optional)
 * @param {Object} options.metadata - Optional metadata for tracking
 * @returns {Promise<Object>} Send result
 */
export const sendEmail = async ({ to, subject, html, text, metadata = {} }) => {
  const provider = process.env.EMAIL_PROVIDER || 'MAILTRAP';

  try {
    logger.info(`Sending email via ${provider} to ${to}`, { subject, provider });

    switch (provider.toUpperCase()) {
      case 'MAILTRAP':
        return await sendMailtrapEmail({ to, subject, html, text });
      
      case 'RESEND':
        // Convert to Resend format (React component)
        return await resendEmailService.sendEmail({
          to,
          subject,
          template: html, // Resend expects React component, but we'll handle HTML too
          metadata
        });
      
      case 'SMTP':
        return await sendSMTPEmail({ to, subject, html, text });
      
      default:
        throw new Error(`Unknown EMAIL_PROVIDER: ${provider}. Use MAILTRAP, RESEND, or SMTP`);
    }
  } catch (error) {
    logger.error(`Email sending failed with provider ${provider}:`, error);
    return {
      success: false,
      error: error.message,
      provider: provider.toLowerCase()
    };
  }
};

/**
 * Verify email configuration for current provider
 */
export const verifyEmailConfig = async () => {
  const provider = process.env.EMAIL_PROVIDER || 'MAILTRAP';

  try {
    switch (provider.toUpperCase()) {
      case 'MAILTRAP':
        return await verifyMailtrapConfig();
      
      case 'RESEND':
        return await resendEmailService.verifyConfiguration();
      
      case 'SMTP':
        return await verifySMTPConfig();
      
      default:
        return {
          valid: false,
          error: `Unknown EMAIL_PROVIDER: ${provider}`
        };
    }
  } catch (error) {
    return {
      valid: false,
      error: error.message
    };
  }
};

/**
 * Get current email provider info
 */
export const getEmailProviderInfo = () => {
  const provider = process.env.EMAIL_PROVIDER || 'MAILTRAP';
  
  return {
    provider: provider.toUpperCase(),
    fromEmail: process.env.EMAIL_FROM || process.env.RESEND_FROM_EMAIL || 'Not configured',
    baseUrl: process.env.FRONTEND_URL || process.env.APP_BASE_URL || 'Not configured',
    configured: !!(
      (provider.toUpperCase() === 'MAILTRAP' && process.env.MAILTRAP_API_TOKEN) ||
      (provider.toUpperCase() === 'RESEND' && process.env.RESEND_API_KEY) ||
      (provider.toUpperCase() === 'SMTP' && process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS)
    )
  };
};