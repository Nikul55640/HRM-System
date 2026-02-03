import { sendEmail } from '../../services/email/email.service.js';
import { sendMailtrapEmail } from '../../services/email/mailtrap.service.js';
import resendEmailService from '../../services/resendEmailService.js';
import { sendSMTPEmail } from '../../services/email/smtp.service.js';
import logger from '../../utils/logger.js';

/**
 * Email Testing Controller
 * Tests all three email providers: Mailtrap, Resend, and SMTP
 */

/**
 * Test all email providers
 */
export const testAllProviders = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Email address is required'
      });
    }

    const testResults = {
      mailtrap: { success: false, error: null, messageId: null },
      resend: { success: false, error: null, messageId: null },
      smtp: { success: false, error: null, messageId: null }
    };

    const testPayload = {
      to: email,
      subject: 'HRM System - Email Provider Test',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #333;">Email Provider Test</h2>
          <p>This is a test email from your HRM System.</p>
          <p><strong>Provider:</strong> {{PROVIDER}}</p>
          <p><strong>Timestamp:</strong> ${new Date().toISOString()}</p>
          <p>If you received this email, the email provider is working correctly!</p>
        </div>
      `,
      text: 'HRM System Email Provider Test - Provider: {{PROVIDER}} - Timestamp: ' + new Date().toISOString()
    };

    // Test Mailtrap
    try {
      const mailtrapPayload = {
        ...testPayload,
        html: testPayload.html.replace('{{PROVIDER}}', 'Mailtrap'),
        text: testPayload.text.replace('{{PROVIDER}}', 'Mailtrap')
      };
      const mailtrapResult = await sendMailtrapEmail(mailtrapPayload);
      testResults.mailtrap = {
        success: true,
        messageId: mailtrapResult.messageId || mailtrapResult.response,
        error: null
      };
      logger.info('Mailtrap test successful:', mailtrapResult);
    } catch (error) {
      testResults.mailtrap = {
        success: false,
        error: error.message,
        messageId: null
      };
      logger.error('Mailtrap test failed:', error);
    }

    // Test Resend
    try {
      const resendPayload = {
        ...testPayload,
        html: testPayload.html.replace('{{PROVIDER}}', 'Resend'),
        text: testPayload.text.replace('{{PROVIDER}}', 'Resend')
      };
      
      const resendResult = await resendEmailService.sendSimpleEmail(resendPayload);
      
      testResults.resend = {
        success: resendResult.success,
        messageId: resendResult.id || resendResult.messageId,
        error: resendResult.success ? null : resendResult.error
      };
      logger.info('Resend test result:', resendResult);
    } catch (error) {
      testResults.resend = {
        success: false,
        error: error.message,
        messageId: null
      };
      logger.error('Resend test failed:', error);
    }

    // Test SMTP
    try {
      const smtpPayload = {
        ...testPayload,
        html: testPayload.html.replace('{{PROVIDER}}', 'SMTP'),
        text: testPayload.text.replace('{{PROVIDER}}', 'SMTP')
      };
      const smtpResult = await sendSMTPEmail(smtpPayload);
      testResults.smtp = {
        success: true,
        messageId: smtpResult.messageId || smtpResult.response,
        error: null
      };
      logger.info('SMTP test successful:', smtpResult);
    } catch (error) {
      testResults.smtp = {
        success: false,
        error: error.message,
        messageId: null
      };
      logger.error('SMTP test failed:', error);
    }

    const successCount = Object.values(testResults).filter(result => result.success).length;
    
    return res.json({
      success: true,
      message: `Email provider test completed. ${successCount}/3 providers working.`,
      data: testResults
    });
  } catch (error) {
    logger.error('Error in testAllProviders:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

/**
 * Get email provider status
 */
export const getEmailProviderStatus = async (req, res) => {
  try {
    const status = {
      mailtrap: {
        configured: !!(process.env.MAILTRAP_TOKEN && process.env.MAILTRAP_ACCOUNT_ID),
        provider: 'Mailtrap',
        description: 'Email testing service'
      },
      resend: {
        configured: !!process.env.RESEND_API_KEY,
        provider: 'Resend',
        description: 'Production email service'
      },
      smtp: {
        configured: !!(process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS),
        provider: 'SMTP',
        description: 'Generic SMTP service'
      },
      current: process.env.EMAIL_PROVIDER || 'MAILTRAP'
    };

    return res.json({
      success: true,
      message: 'Email provider status retrieved',
      data: status
    });
  } catch (error) {
    logger.error('Error getting provider status:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

/**
 * Test specific email provider
 */
export const testSpecificProvider = async (req, res) => {
  try {
    const { provider, email } = req.body;

    if (!provider || !email) {
      return res.status(400).json({
        success: false,
        message: 'Provider and email address are required'
      });
    }

    const testPayload = {
      to: email,
      subject: `HRM System - ${provider.toUpperCase()} Test`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #333;">${provider.toUpperCase()} Email Test</h2>
          <p>This is a test email from your HRM System using ${provider.toUpperCase()}.</p>
          <p><strong>Timestamp:</strong> ${new Date().toISOString()}</p>
          <p>If you received this email, ${provider.toUpperCase()} is working correctly!</p>
        </div>
      `,
      text: `HRM System ${provider.toUpperCase()} Test - Timestamp: ${new Date().toISOString()}`
    };

    let result;
    switch (provider.toLowerCase()) {
      case 'mailtrap':
        result = await sendMailtrapEmail(testPayload);
        break;
      case 'resend':
        result = await resendEmailService.sendSimpleEmail(testPayload);
        break;
      case 'smtp':
        result = await sendSMTPEmail(testPayload);
        break;
      default:
        return res.status(400).json({
          success: false,
          message: 'Invalid provider. Use: mailtrap, resend, or smtp'
        });
    }

    logger.info(`${provider} test successful:`, result);
    
    return res.json({
      success: true,
      message: `${provider.toUpperCase()} test email sent successfully`,
      data: { 
        provider, 
        messageId: result.messageId || result.id || result.response,
        result 
      }
    });
  } catch (error) {
    logger.error(`Error testing ${req.body.provider}:`, error);
    return res.status(500).json({
      success: false,
      message: `Failed to send ${req.body.provider} test email`,
      error: error.message
    });
  }
};

/**
 * Test current email provider
 */
export const testCurrentProvider = async (req, res) => {
  try {
    const { email } = req.body;
    const provider = process.env.EMAIL_PROVIDER || 'MAILTRAP';

    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Email address is required'
      });
    }

    // Use the main email service which will use the current provider
    const result = await sendEmail({
      to: email,
      subject: `HRM System - Current Provider (${provider}) Test`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #333;">Current Email Provider Test</h2>
          <p>This is a test email from your HRM System using the current provider: <strong>${provider}</strong></p>
          <p><strong>Timestamp:</strong> ${new Date().toISOString()}</p>
          <p>If you received this email, your current email configuration is working correctly!</p>
        </div>
      `,
      text: `HRM System Current Provider (${provider}) Test - Timestamp: ${new Date().toISOString()}`
    });

    return res.json({
      success: result.success || true,
      message: `Current provider (${provider}) test completed`,
      data: { 
        provider, 
        result 
      }
    });
  } catch (error) {
    logger.error('Error testing current provider:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to test current email provider',
      error: error.message
    });
  }
};

/**
 * Verify current email configuration
 */
export const verifyCurrentConfig = async (req, res) => {
  try {
    const provider = process.env.EMAIL_PROVIDER || 'MAILTRAP';
    
    let configStatus;
    switch (provider.toUpperCase()) {
      case 'MAILTRAP':
        configStatus = {
          valid: !!(process.env.MAILTRAP_TOKEN && process.env.MAILTRAP_ACCOUNT_ID),
          provider: 'MAILTRAP',
          requiredVars: ['MAILTRAP_TOKEN', 'MAILTRAP_ACCOUNT_ID'],
          configured: {
            MAILTRAP_TOKEN: !!process.env.MAILTRAP_TOKEN,
            MAILTRAP_ACCOUNT_ID: !!process.env.MAILTRAP_ACCOUNT_ID
          }
        };
        break;
      case 'RESEND':
        configStatus = {
          valid: !!process.env.RESEND_API_KEY,
          provider: 'RESEND',
          requiredVars: ['RESEND_API_KEY'],
          configured: {
            RESEND_API_KEY: !!process.env.RESEND_API_KEY
          }
        };
        break;
      case 'SMTP':
        configStatus = {
          valid: !!(process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS),
          provider: 'SMTP',
          requiredVars: ['SMTP_HOST', 'SMTP_USER', 'SMTP_PASS'],
          configured: {
            SMTP_HOST: !!process.env.SMTP_HOST,
            SMTP_USER: !!process.env.SMTP_USER,
            SMTP_PASS: !!process.env.SMTP_PASS,
            SMTP_PORT: !!process.env.SMTP_PORT
          }
        };
        break;
      default:
        configStatus = {
          valid: false,
          error: `Unknown EMAIL_PROVIDER: ${provider}`
        };
    }

    return res.json({
      success: true,
      message: 'Email configuration verified',
      data: configStatus
    });
  } catch (error) {
    logger.error('Error verifying email config:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};