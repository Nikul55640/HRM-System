/**
 * Email Providers Test Suite
 * 
 * Test all three email providers: Mailtrap, Resend, SMTP
 * Verify configurations and send test emails
 * 
 * Usage:
 * node tests/email-providers-test.js
 */

import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Load environment variables
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '../.env') });

// Import services
import { sendEmail, verifyEmailConfig, getEmailProviderInfo } from '../src/services/email/email.service.js';
import { sendMailtrapEmail, verifyMailtrapConfig } from '../src/services/email/mailtrap.service.js';
import { sendSMTPEmail, verifySMTPConfig, sendSMTPTestEmail } from '../src/services/email/smtp.service.js';
import resendEmailService from '../src/services/resendEmailService.js';

// Test configuration
const TEST_EMAIL = process.env.TEST_EMAIL || 'test@example.com';
const COLORS = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m'
};

function log(message, color = 'reset') {
  console.log(`${COLORS[color]}${message}${COLORS.reset}`);
}

function logHeader(title) {
  log('\n' + '='.repeat(60), 'cyan');
  log(`  ${title}`, 'bright');
  log('='.repeat(60), 'cyan');
}

function logResult(provider, success, message, details = {}) {
  const status = success ? '✅' : '❌';
  const color = success ? 'green' : 'red';
  log(`${status} ${provider}: ${message}`, color);
  
  if (Object.keys(details).length > 0) {
    Object.entries(details).forEach(([key, value]) => {
      log(`   ${key}: ${value}`, 'yellow');
    });
  }
}

async function testProviderConfiguration() {
  logHeader('EMAIL PROVIDER CONFIGURATION TEST');
  
  // Current provider info
  const providerInfo = getEmailProviderInfo();
  log(`Current Provider: ${providerInfo.provider}`, 'blue');
  log(`From Email: ${providerInfo.fromEmail}`, 'blue');
  log(`Configured: ${providerInfo.configured ? 'Yes' : 'No'}`, providerInfo.configured ? 'green' : 'red');
  
  // Test Mailtrap configuration
  log('\n📧 Testing Mailtrap Configuration...', 'yellow');
  const mailtrapConfig = await verifyMailtrapConfig();
  logResult('Mailtrap Config', mailtrapConfig.valid, mailtrapConfig.message || mailtrapConfig.error, {
    'API Token': process.env.MAILTRAP_API_TOKEN ? 'Configured' : 'Missing',
    'From Email': process.env.EMAIL_FROM || 'Not set'
  });
  
  // Test Resend configuration
  log('\n📧 Testing Resend Configuration...', 'yellow');
  const resendConfig = await resendEmailService.verifyConfiguration();
  logResult('Resend Config', resendConfig.valid, resendConfig.message || resendConfig.error, {
    'API Key': process.env.RESEND_API_KEY ? 'Configured' : 'Missing',
    'From Email': process.env.RESEND_FROM_EMAIL || 'Not set'
  });
  
  // Test SMTP configuration
  log('\n📧 Testing SMTP Configuration...', 'yellow');
  const smtpConfig = await verifySMTPConfig();
  logResult('SMTP Config', smtpConfig.valid, smtpConfig.message || smtpConfig.error, {
    'Host': process.env.SMTP_HOST || 'Not set',
    'Port': process.env.SMTP_PORT || 'Not set',
    'User': process.env.SMTP_USER || 'Not set',
    'Password': process.env.SMTP_PASS ? 'Configured' : 'Missing'
  });
}

async function testCurrentProvider() {
  logHeader('CURRENT PROVIDER TEST');
  
  const provider = process.env.EMAIL_PROVIDER || 'MAILTRAP';
  log(`Testing current provider: ${provider}`, 'blue');
  log(`Test email will be sent to: ${TEST_EMAIL}`, 'blue');
  
  const testHtml = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <h2 style="color: #2563eb;">🧪 HRM System Email Test</h2>
      <p>This is a test email from your HRM System using the <strong>${provider}</strong> provider.</p>
      <div style="background: #f3f4f6; padding: 15px; border-radius: 8px; margin: 20px 0;">
        <strong>Provider:</strong> ${provider}<br>
        <strong>Environment:</strong> ${process.env.NODE_ENV}<br>
        <strong>Time:</strong> ${new Date().toLocaleString()}<br>
        <strong>Test Type:</strong> Current Provider Test
      </div>
      <p style="color: #059669;">✅ If you received this email, ${provider} is working correctly!</p>
      <hr style="margin: 20px 0; border: none; border-top: 1px solid #e5e7eb;">
      <p style="font-size: 12px; color: #6b7280;">
        This is an automated test email from HRM System Email Testing Suite.
      </p>
    </div>
  `;

  try {
    const result = await sendEmail({
      to: TEST_EMAIL,
      subject: `🧪 HRM System - ${provider} Test Email`,
      html: testHtml
    });

    logResult(provider, result.success, result.message || result.error, {
      'Message ID': result.messageId || 'N/A',
      'Provider': result.provider || provider.toLowerCase()
    });
  } catch (error) {
    logResult(provider, false, error.message);
  }
}

async function testAllProviders() {
  logHeader('ALL PROVIDERS TEST');
  
  log(`Test emails will be sent to: ${TEST_EMAIL}`, 'blue');
  
  const results = {};
  
  // Test Mailtrap
  log('\n📧 Testing Mailtrap...', 'yellow');
  if (process.env.MAILTRAP_API_TOKEN) {
    try {
      const result = await sendMailtrapEmail({
        to: TEST_EMAIL,
        subject: '🧪 HRM System - Mailtrap Direct Test',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <h2 style="color: #2563eb;">📧 Mailtrap Test</h2>
            <p>This email was sent directly via <strong>Mailtrap</strong> provider.</p>
            <div style="background: #f3f4f6; padding: 15px; border-radius: 8px; margin: 20px 0;">
              <strong>Provider:</strong> Mailtrap<br>
              <strong>API Token:</strong> ${process.env.MAILTRAP_API_TOKEN.substring(0, 8)}...<br>
              <strong>Time:</strong> ${new Date().toLocaleString()}
            </div>
            <p style="color: #059669;">✅ Mailtrap is working correctly!</p>
          </div>
        `
      });
      results.mailtrap = result;
      logResult('Mailtrap', result.success, result.message || result.error, {
        'Message ID': result.messageId || 'N/A'
      });
    } catch (error) {
      results.mailtrap = { success: false, error: error.message };
      logResult('Mailtrap', false, error.message);
    }
  } else {
    results.mailtrap = { success: false, error: 'MAILTRAP_API_TOKEN not configured' };
    logResult('Mailtrap', false, 'MAILTRAP_API_TOKEN not configured');
  }
  
  // Test Resend
  log('\n📧 Testing Resend...', 'yellow');
  if (process.env.RESEND_API_KEY) {
    try {
      const result = await resendEmailService.sendEmail({
        to: TEST_EMAIL,
        subject: '🧪 HRM System - Resend Direct Test',
        template: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <h2 style="color: #2563eb;">📧 Resend Test</h2>
            <p>This email was sent directly via <strong>Resend</strong> provider.</p>
            <div style="background: #f3f4f6; padding: 15px; border-radius: 8px; margin: 20px 0;">
              <strong>Provider:</strong> Resend<br>
              <strong>API Key:</strong> ${process.env.RESEND_API_KEY.substring(0, 8)}...<br>
              <strong>Time:</strong> ${new Date().toLocaleString()}
            </div>
            <p style="color: #059669;">✅ Resend is working correctly!</p>
          </div>
        `,
        metadata: { category: 'test', type: 'provider_test' }
      });
      results.resend = result;
      logResult('Resend', result.success, result.message || result.error, {
        'Email ID': result.emailId || 'N/A'
      });
    } catch (error) {
      results.resend = { success: false, error: error.message };
      logResult('Resend', false, error.message);
    }
  } else {
    results.resend = { success: false, error: 'RESEND_API_KEY not configured' };
    logResult('Resend', false, 'RESEND_API_KEY not configured');
  }
  
  // Test SMTP
  log('\n📧 Testing SMTP...', 'yellow');
  if (process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS) {
    try {
      const result = await sendSMTPTestEmail(TEST_EMAIL);
      results.smtp = result;
      logResult('SMTP', result.success, result.message || result.error, {
        'Host': process.env.SMTP_HOST,
        'Port': process.env.SMTP_PORT || 587,
        'Message ID': result.messageId || 'N/A'
      });
    } catch (error) {
      results.smtp = { success: false, error: error.message };
      logResult('SMTP', false, error.message);
    }
  } else {
    results.smtp = { success: false, error: 'SMTP configuration incomplete' };
    logResult('SMTP', false, 'SMTP configuration incomplete (missing SMTP_HOST, SMTP_USER, or SMTP_PASS)');
  }
  
  // Summary
  logHeader('TEST SUMMARY');
  const successful = Object.values(results).filter(r => r.success).length;
  const total = Object.keys(results).length;
  
  log(`Total Providers: ${total}`, 'blue');
  log(`Successful: ${successful}`, successful > 0 ? 'green' : 'red');
  log(`Failed: ${total - successful}`, total - successful > 0 ? 'red' : 'green');
  
  if (successful === 0) {
    log('\n⚠️  No email providers are working. Check your configuration!', 'red');
  } else if (successful < total) {
    log('\n⚠️  Some email providers failed. Check the configuration for failed providers.', 'yellow');
  } else {
    log('\n🎉 All configured email providers are working correctly!', 'green');
  }
}

async function runTests() {
  log('🧪 HRM System Email Providers Test Suite', 'bright');
  log(`Test Email: ${TEST_EMAIL}`, 'blue');
  log(`Environment: ${process.env.NODE_ENV}`, 'blue');
  
  try {
    await testProviderConfiguration();
    await testCurrentProvider();
    await testAllProviders();
    
    logHeader('TEST COMPLETE');
    log('✅ Email provider testing completed successfully!', 'green');
    log('\n💡 Tips:', 'yellow');
    log('   - Check your email inbox for test messages', 'yellow');
    log('   - Configure missing providers in .env file', 'yellow');
    log('   - Use EMAIL_PROVIDER to switch between providers', 'yellow');
    
  } catch (error) {
    log('\n❌ Test suite failed:', 'red');
    log(error.message, 'red');
    process.exit(1);
  }
}

// Handle command line arguments
const args = process.argv.slice(2);
if (args.includes('--help') || args.includes('-h')) {
  log('HRM System Email Providers Test Suite', 'bright');
  log('\nUsage:', 'yellow');
  log('  node tests/email-providers-test.js [options]', 'blue');
  log('\nOptions:', 'yellow');
  log('  --help, -h     Show this help message', 'blue');
  log('\nEnvironment Variables:', 'yellow');
  log('  TEST_EMAIL     Email address to send test emails to (default: test@example.com)', 'blue');
  log('  EMAIL_PROVIDER Current email provider (MAILTRAP, RESEND, SMTP)', 'blue');
  process.exit(0);
}

// Run the tests
runTests().catch(error => {
  log(`\n❌ Unexpected error: ${error.message}`, 'red');
  process.exit(1);
});