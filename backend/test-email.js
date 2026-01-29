import dotenv from 'dotenv';
import emailService from './src/services/emailService.js';
import logger from './src/utils/logger.js';

// Load environment variables
dotenv.config();

/**
 * Test Email Functionality
 * Run this script to test if email service is working
 */
async function testEmailService() {
  console.log('🔧 Testing Email Service...\n');

  try {
    // Test 1: Check if email service is configured
    console.log('1. Checking email configuration...');
    if (!emailService.isConfigured) {
      console.log('❌ Email service is not configured');
      console.log('Please check your .env file for SMTP settings');
      return;
    }
    console.log('✅ Email service is configured');

    // Test 2: Verify connection
    console.log('\n2. Verifying SMTP connection...');
    const connectionStatus = await emailService.verifyConnection();
    if (!connectionStatus) {
      console.log('❌ SMTP connection failed');
      console.log('Please check your SMTP credentials');
      return;
    }
    console.log('✅ SMTP connection successful');

    // Test 3: Send test email
    console.log('\n3. Sending test email...');
    const testEmail = process.env.SMTP_USER; // Send to same email for testing
    
    if (!testEmail) {
      console.log('❌ No test email address found');
      return;
    }

    const result = await emailService.sendTestEmail(testEmail);
    
    if (result.success) {
      console.log(`✅ Test email sent successfully to ${testEmail}`);
      console.log(`Message ID: ${result.messageId}`);
    } else {
      console.log(`❌ Failed to send test email: ${result.error}`);
    }

    // Test 4: Test specific HRM email templates
    console.log('\n4. Testing HRM email templates...');
    
    // Test absent notification email
    const absentResult = await emailService.sendEmail({
      to: testEmail,
      subject: 'Test - Attendance Absent Notification',
      html: emailService.generateEmailTemplate({
        title: 'Attendance Marked Absent',
        message: `
          <p>Hello Test User,</p>
          <p>Your attendance for <strong>2026-01-29</strong> has been marked as <strong>ABSENT</strong>.</p>
          <p><strong>Reason:</strong> No clock-in recorded</p>
          <p>If this is incorrect, please submit a correction request immediately or contact HR.</p>
          <p>Thank you.</p>
        `,
        type: 'error',
        actionUrl: 'http://localhost:5174/attendance/corrections',
        actionText: 'Submit Correction Request'
      })
    });

    if (absentResult.success) {
      console.log('✅ Absent notification email template test successful');
    } else {
      console.log(`❌ Absent notification email template test failed: ${absentResult.error}`);
    }

    // Test leave approval email
    const leaveResult = await emailService.sendEmail({
      to: testEmail,
      subject: 'Test - Leave Request Approved',
      html: emailService.generateEmailTemplate({
        title: 'Leave Request Approved',
        message: `
          <p>Hello Test User,</p>
          <p>Your <strong>Annual Leave</strong> request has been <strong>APPROVED</strong>.</p>
          <p><strong>Leave Period:</strong> 2026-02-01 to 2026-02-03</p>
          <p><strong>Duration:</strong> 3 day(s)</p>
          <p><strong>Reason:</strong> Personal work</p>
          <p>Thank you.</p>
        `,
        type: 'success',
        actionUrl: 'http://localhost:5174/leave/requests',
        actionText: 'View Leave Requests'
      })
    });

    if (leaveResult.success) {
      console.log('✅ Leave approval email template test successful');
    } else {
      console.log(`❌ Leave approval email template test failed: ${leaveResult.error}`);
    }

    console.log('\n🎉 Email service testing completed!');
    console.log('\nNext steps:');
    console.log('1. Check your email inbox for test emails');
    console.log('2. Update SMTP credentials in .env if needed');
    console.log('3. Test with real HRM notifications');

  } catch (error) {
    console.error('❌ Email service test failed:', error);
  }
}

// Run the test
testEmailService().then(() => {
  process.exit(0);
}).catch((error) => {
  console.error('Test script error:', error);
  process.exit(1);
});