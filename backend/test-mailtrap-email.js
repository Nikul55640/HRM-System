/**
 * Test Script: Send Real Email via Mailtrap to np425771@gmail.com
 * 
 * This script tests the Mailtrap email service by sending actual emails
 * to verify the implementation works correctly.
 */

import dotenv from 'dotenv';
import { sendEmail, verifyEmailConfig, getEmailProviderInfo } from './src/services/email/email.service.js';
import { render } from '@react-email/render';
import logger from './src/utils/logger.js';

// Load environment variables
dotenv.config();

async function testMailtrapEmailSending() {
  console.log('🚀 Starting Mailtrap Email Test to np425771@gmail.com');
  console.log('=' .repeat(60));

  try {
    // Test 1: Attendance Absent Email
    console.log('\n📧 Test 1: Attendance Absent Email');
    const { AttendanceAbsent } = await import('./src/emails/templates/AttendanceAbsent.js');
    
    const absentHtml = render(AttendanceAbsent({
      employeeName: 'Test Employee',
      date: new Date().toLocaleDateString(),
      reason: 'Test email via Mailtrap - No clock-in recorded for testing purposes',
      actionUrl: `${process.env.FRONTEND_URL}/attendance/corrections`
    }));
    
    const absentResult = await sendEmail({
      to: 'np425771@gmail.com',
      subject: `[TEST] Attendance Marked as Absent - ${new Date().toLocaleDateString()}`,
      html: absentHtml,
      text: 'Test email: Your attendance was marked as absent for testing purposes.'
    });
    
    if (absentResult.success) {
      console.log('✅ Attendance Absent email sent successfully');
      console.log(`   Message ID: ${absentResult.messageId}`);
      console.log(`   Provider: ${absentResult.provider}`);
    } else {
      console.log('❌ Attendance Absent email failed');
      console.log(`   Error: ${absentResult.error}`);
    }

    // Wait 3 seconds between emails
    await new Promise(resolve => setTimeout(resolve, 3000));

    // Test 2: Correction Required Email
    console.log('\n📧 Test 2: Correction Required Email');
    const { CorrectionRequired } = await import('./src/emails/templates/CorrectionRequired.js');
    
    const correctionHtml = render(CorrectionRequired({
      employeeName: 'Test Employee',
      date: new Date().toLocaleDateString(),
      issue: 'Test email via Mailtrap - Missing clock-out time for testing purposes',
      actionUrl: `${process.env.FRONTEND_URL}/attendance/corrections`
    }));
    
    const correctionResult = await sendEmail({
      to: 'np425771@gmail.com',
      subject: `[TEST] Attendance Correction Required - ${new Date().toLocaleDateString()}`,
      html: correctionHtml,
      text: 'Test email: Your attendance requires correction for testing purposes.'
    });
    
    if (correctionResult.success) {
      console.log('✅ Correction Required email sent successfully');
      console.log(`   Message ID: ${correctionResult.messageId}`);
      console.log(`   Provider: ${correctionResult.provider}`);
    } else {
      console.log('❌ Correction Required email failed');
      console.log(`   Error: ${correctionResult.error}`);
    }

    // Wait 3 seconds between emails
    await new Promise(resolve => setTimeout(resolve, 3000));

    // Test 3: Leave Approved Email
    console.log('\n📧 Test 3: Leave Approved Email');
    const { LeaveApproved } = await import('./src/emails/templates/LeaveApproved.js');
    
    const startDate = new Date('2026-02-01').toLocaleDateString();
    const endDate = new Date('2026-02-03').toLocaleDateString();
    
    const leaveHtml = render(LeaveApproved({
      employeeName: 'Test Employee',
      leaveType: 'Annual Leave',
      startDate,
      endDate,
      days: 3,
      approverName: 'Test Manager',
      actionUrl: `${process.env.FRONTEND_URL}/leave/my-leaves`
    }));
    
    const leaveResult = await sendEmail({
      to: 'np425771@gmail.com',
      subject: `[TEST] Leave Request Approved - ${startDate} to ${endDate}`,
      html: leaveHtml,
      text: 'Test email: Your leave request has been approved for testing purposes.'
    });
    
    if (leaveResult.success) {
      console.log('✅ Leave Approved email sent successfully');
      console.log(`   Message ID: ${leaveResult.messageId}`);
      console.log(`   Provider: ${leaveResult.provider}`);
    } else {
      console.log('❌ Leave Approved email failed');
      console.log(`   Error: ${leaveResult.error}`);
    }

    console.log('\n' + '=' .repeat(60));
    console.log('🎉 Mailtrap email testing completed!');
    console.log('📬 Check np425771@gmail.com inbox (and spam folder)');
    console.log('📊 Monitor delivery at: https://mailtrap.io/inboxes');
    console.log('=' .repeat(60));

  } catch (error) {
    console.error('💥 Mailtrap email test failed:', error);
    process.exit(1);
  }
}

// Verify configuration first
async function verifyConfig() {
  console.log('🔧 Verifying email configuration...');
  
  const config = await verifyEmailConfig();
  const providerInfo = getEmailProviderInfo();
  
  if (!config.valid) {
    console.error('❌ Email configuration invalid:', config.error);
    console.log('\n📝 Required environment variables for Mailtrap:');
    console.log('   - EMAIL_PROVIDER=MAILTRAP');
    console.log('   - MAILTRAP_API_TOKEN');
    console.log('   - EMAIL_FROM');
    console.log('   - FRONTEND_URL');
    process.exit(1);
  }
  
  console.log('✅ Email configuration is valid');
  console.log(`   Provider: ${providerInfo.provider}`);
  console.log(`   From: ${providerInfo.fromEmail}`);
  console.log(`   Base URL: ${providerInfo.baseUrl}`);
  
  return config;
}

// Main execution
async function main() {
  try {
    await verifyConfig();
    await testMailtrapEmailSending();
  } catch (error) {
    console.error('💥 Test script failed:', error);
    process.exit(1);
  }
}

// Run the test
main();