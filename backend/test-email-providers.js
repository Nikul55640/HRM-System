/**
 * Standalone Email Provider Test
 * 
 * Tests all three email providers without requiring the full server
 * Run with: node test-email-providers.js your-email@example.com
 */

import dotenv from 'dotenv';
import { sendMailtrapEmail } from './src/services/email/mailtrap.service.js';
import { sendSMTPEmail } from './src/services/email/smtp.service.js';
import resendEmailService from './src/services/resendEmailService.js';

// Load environment variables
dotenv.config();

const testEmail = process.argv[2];

if (!testEmail) {
  console.log('❌ Please provide an email address');
  console.log('Usage: node test-email-providers.js your-email@example.com');
  process.exit(1);
}

console.log('🧪 Testing Email Providers');
console.log('==========================');
console.log(`📧 Test email: ${testEmail}`);
console.log('');

const testResults = {
  mailtrap: { success: false, error: null, messageId: null },
  resend: { success: false, error: null, messageId: null },
  smtp: { success: false, error: null, messageId: null }
};

const testPayload = {
  to: testEmail,
  subject: 'HRM System - Email Provider Test',
  html: `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <h2 style="color: #333; border-bottom: 2px solid #007bff; padding-bottom: 10px;">
        📧 Email Provider Test
      </h2>
      <p>This is a test email from your HRM System.</p>
      <div style="background: #f8f9fa; padding: 15px; border-radius: 5px; margin: 20px 0;">
        <p><strong>Provider:</strong> {{PROVIDER}}</p>
        <p><strong>Timestamp:</strong> ${new Date().toISOString()}</p>
        <p><strong>Test Status:</strong> ✅ Working correctly!</p>
      </div>
      <p>If you received this email, the <strong>{{PROVIDER}}</strong> email provider is configured and working correctly!</p>
      <hr style="margin: 20px 0; border: none; border-top: 1px solid #eee;">
      <p style="font-size: 12px; color: #666;">
        This is an automated test email from your HRM System.
      </p>
    </div>
  `,
  text: 'HRM System Email Provider Test - Provider: {{PROVIDER}} - Timestamp: ' + new Date().toISOString()
};

// Test Mailtrap
async function testMailtrap() {
  console.log('🔵 Testing Mailtrap...');
  
  if (!process.env.MAILTRAP_API_TOKEN || !process.env.MAILTRAP_ACCOUNT_ID) {
    console.log('   ⚠️  Mailtrap not configured (missing MAILTRAP_TOKEN or MAILTRAP_ACCOUNT_ID)');
    testResults.mailtrap = { success: false, error: 'Not configured', messageId: null };
    return;
  }

  try {
    const mailtrapPayload = {
      ...testPayload,
      html: testPayload.html.replace(/{{PROVIDER}}/g, 'Mailtrap'),
      text: testPayload.text.replace('{{PROVIDER}}', 'Mailtrap')
    };
    
    const result = await sendMailtrapEmail(mailtrapPayload);
    testResults.mailtrap = {
      success: true,
      messageId: result.messageId || result.response,
      error: null
    };
    console.log('   ✅ Mailtrap test successful!');
    console.log(`   📨 Message ID: ${result.messageId || result.response}`);
  } catch (error) {
    testResults.mailtrap = {
      success: false,
      error: error.message,
      messageId: null
    };
    console.log('   ❌ Mailtrap test failed:', error.message);
  }
}

// Test Resend
async function testResend() {
  console.log('🟢 Testing Resend...');
  
  if (!process.env.RESEND_API_KEY) {
    console.log('   ⚠️  Resend not configured (missing RESEND_API_KEY)');
    testResults.resend = { success: false, error: 'Not configured', messageId: null };
    return;
  }

  try {
    const resendPayload = {
      ...testPayload,
      html: testPayload.html.replace(/{{PROVIDER}}/g, 'Resend'),
      text: testPayload.text.replace('{{PROVIDER}}', 'Resend')
    };
    
    const result = await resendEmailService.sendSimpleEmail(resendPayload);
    testResults.resend = {
      success: result.success,
      messageId: result.id || result.messageId,
      error: result.success ? null : result.error
    };
    
    if (result.success) {
      console.log('   ✅ Resend test successful!');
      console.log(`   📨 Message ID: ${result.id || result.messageId}`);
    } else {
      console.log('   ❌ Resend test failed:', result.error);
    }
  } catch (error) {
    testResults.resend = {
      success: false,
      error: error.message,
      messageId: null
    };
    console.log('   ❌ Resend test failed:', error.message);
  }
}

// Test SMTP
async function testSMTP() {
  console.log('🟡 Testing SMTP...');
  
  if (!process.env.SMTP_HOST || !process.env.SMTP_USER || !process.env.SMTP_PASS) {
    console.log('   ⚠️  SMTP not configured (missing SMTP_HOST, SMTP_USER, or SMTP_PASS)');
    testResults.smtp = { success: false, error: 'Not configured', messageId: null };
    return;
  }

  try {
    const smtpPayload = {
      ...testPayload,
      html: testPayload.html.replace(/{{PROVIDER}}/g, 'SMTP'),
      text: testPayload.text.replace('{{PROVIDER}}', 'SMTP')
    };
    
    const result = await sendSMTPEmail(smtpPayload);
    testResults.smtp = {
      success: result.success,
      messageId: result.messageId,
      error: result.success ? null : result.error
    };
    
    if (result.success) {
      console.log('   ✅ SMTP test successful!');
      console.log(`   📨 Message ID: ${result.messageId}`);
    } else {
      console.log('   ❌ SMTP test failed:', result.error);
    }
  } catch (error) {
    testResults.smtp = {
      success: false,
      error: error.message,
      messageId: null
    };
    console.log('   ❌ SMTP test failed:', error.message);
  }
}

// Run all tests
async function runTests() {
  console.log('Starting email provider tests...\n');
  
  await testMailtrap();
  console.log('');
  await testResend();
  console.log('');
  await testSMTP();
  console.log('');
  
  // Summary
  console.log('📊 Test Results Summary');
  console.log('=======================');
  
  const successCount = Object.values(testResults).filter(result => result.success).length;
  const totalCount = Object.keys(testResults).length;
  
  console.log(`✅ Successful: ${successCount}/${totalCount} providers`);
  console.log('');
  
  Object.entries(testResults).forEach(([provider, result]) => {
    const status = result.success ? '✅' : (result.error === 'Not configured' ? '⚠️' : '❌');
    const message = result.success 
      ? `Working (ID: ${result.messageId})` 
      : result.error;
    console.log(`${status} ${provider.toUpperCase()}: ${message}`);
  });
  
  console.log('');
  
  if (successCount === 0) {
    console.log('❌ No email providers are working. Please check your configuration.');
    process.exit(1);
  } else if (successCount < totalCount) {
    console.log('⚠️  Some email providers need configuration. Check the .env file.');
  } else {
    console.log('🎉 All email providers are working correctly!');
  }
  
  console.log('');
  console.log('💡 Configuration Help:');
  console.log('   Mailtrap: Set MAILTRAP_TOKEN and MAILTRAP_ACCOUNT_ID');
  console.log('   Resend: Set RESEND_API_KEY');
  console.log('   SMTP: Set SMTP_HOST, SMTP_USER, SMTP_PASS, SMTP_PORT');
}

// Run the tests
runTests().catch(error => {
  console.error('❌ Test runner failed:', error);
  process.exit(1);
});