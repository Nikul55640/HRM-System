/**
 * Mailtrap Email Service
 * 
 * Handles all email sending through Mailtrap Email API
 * Clean integration for testing, staging, and production
 * 
 * 🔥 CRITICAL: This is the Mailtrap provider implementation
 */

import fetch from 'node-fetch';
import logger from '../../utils/logger.js';

const MAILTRAP_URL = 'https://send.api.mailtrap.io/api/send';

export const sendMailtrapEmail = async ({
  to,
  subject,
  html,
  text
}) => {
  try {
    if (!process.env.MAILTRAP_API_TOKEN) {
      throw new Error('MAILTRAP_API_TOKEN is not configured');
    }

    if (!to) {
      throw new Error('Recipient email is required');
    }

    // Extract email from "Name <email@domain.com>" format
    const fromEmail = process.env.EMAIL_FROM.includes('<') 
      ? process.env.EMAIL_FROM.split('<')[1].replace('>', '')
      : process.env.EMAIL_FROM;

    const fromName = process.env.EMAIL_FROM.includes('<')
      ? process.env.EMAIL_FROM.split('<')[0].trim()
      : 'HRMS';

    const response = await fetch(MAILTRAP_URL, {
      method: 'POST',
      headers: {
        'Api-Token': process.env.MAILTRAP_API_TOKEN,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        from: {
          email: fromEmail,
          name: fromName
        },
        to: [{ email: to }],
        subject,
        html,
        text: text || html.replace(/<[^>]*>/g, '') // Strip HTML if no text provided
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Mailtrap API error: ${response.status} - ${errorText}`);
    }

    const result = await response.json();

    logger.info(`Mailtrap email sent successfully to ${to}`, {
      messageId: result.message_id,
      subject,
      provider: 'mailtrap'
    });

    return {
      success: true,
      messageId: result.message_id,
      message: 'Email sent successfully via Mailtrap',
      provider: 'mailtrap'
    };

  } catch (error) {
    logger.error(`❌ Mailtrap email failed to ${to}:`, error);
    return {
      success: false,
      error: error.message,
      provider: 'mailtrap'
    };
  }
};

/**
 * Verify Mailtrap configuration
 */
export const verifyMailtrapConfig = async () => {
  try {
    if (!process.env.MAILTRAP_API_TOKEN) {
      return {
        valid: false,
        error: 'MAILTRAP_API_TOKEN not configured'
      };
    }

    if (!process.env.EMAIL_FROM) {
      return {
        valid: false,
        error: 'EMAIL_FROM not configured'
      };
    }

    return {
      valid: true,
      provider: 'Mailtrap',
      fromEmail: process.env.EMAIL_FROM,
      message: 'Mailtrap email service is properly configured'
    };
  } catch (error) {
    return {
      valid: false,
      error: error.message
    };
  }
};