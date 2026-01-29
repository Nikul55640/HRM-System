/**
 * Test Script: Send Real Email via Resend to np425771@gmail.com
 * 
 * This script tests the Resend email service by sending actual emails
 * to verify the implementation works correctly.
 */

import dotenv from 'dotenv';
import { sendEmail, verifyEmailConfig } from './src/services/email/email.service.js';
import { AttendanceAbsent } from './src/emails/templates/AttendanceAbsent.js';
import { CorrectionRequired } from './src/emails/templates/CorrectionRequired.js';
import { LeaveApproved } from './src/emails/templates/LeaveApproved.js';
import { render } from '@react-email/render';
import logger from './src/utils/logger.js';

// Load environment variables
dotenv.config();

async function testResendEmailSending() {
  console.log('🚀 Starting Resend Email Test to np425771@gmail.com');
  console.log('=' .repeat(60));

  try {
    // Test 1: Attendance Absent Email
    console.log('\n📧 Test 1: Attendance Absent Email');
    const absentTemplate = AttendanceAbsent({
      employeeName: 'Test Employee',
      date: new Date().toLocaleDateString(),
      reason: 'Test email via Resend - No clock-in recorded for testing purposes',
      actionUrl: `${process.env.FRONTEND_URL}/attendance/corrections`
    });
    
    const absentResult = await sendEmail({
      to: 'np425771@gmail.com',
      subject: '[TEST] Attendance Marked as Absent - ' + new Date().toLocaleDateString(),
      html: render(absentTemplate),
      metadata: {
        category: 'attendance',
        type: 'absent_test'
      }
    });
    
    if (absentResult.success) {
      console.log('✅ Attendance Absent email sent successfully');
      console.log(`   Message ID: ${absentResult.messageId}`);
    } else {
      console.log('❌ Attendance Absent email failed');
      console.log(`   Error: ${absentResult.error}`);
    }

    // Wait 2 seconds between emails
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Test 2: Correction Required Email
    console.log('\n📧 Test 2: Correction Required Email');
    const correctionTemplate = CorrectionRequired({
      employeeName: 'Test Employee',
      date: new Date().toLocaleDateString(),
      issue: 'Test email via Resend - Missing clock-out time for testing purposes',
      actionUrl: `${process.env.FRONTEND_URL}/attendance/corrections`
    });
    
    const correctionResult = await sendEmail({
      to: 'np425771@gmail.com',
      subject: '[TEST] Attendance Correction Required - ' + new Date().toLocaleDateString(),
      html: render(correctionTemplate),
      metadata: {
        category: 'attendance',
        type: 'correction_test'
      }
    });
    
    if (correctionResult.success) {
      console.log('✅ Correction Required email sent successfully');
      console.log(`   Message ID: ${correctionResult.messageId}`);
    } else {
      console.log('❌ Correction Required email failed');
      console.log(`   Error: ${correctionResult.error}`);
    }

    // Wait 2 seconds between emails
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Test 3: Leave Approved Email
    console.log('\n📧 Test 3: Leave Approved Email');
    const leaveTemplate = LeaveApproved({
      employeeName: 'Test Employee',
      leaveType: 'Annual Leave',
      startDate: '1/2/2026',
      endDate: '3/2/2026',
      days: 3,
      approverName: 'Test Manager',
      actionUrl: `${process.env.FRONTEND_URL}/leave/my-leaves`
    });
    
    const leaveResult = await sendEmail({
      to: 'np425771@gmail.com',
      subject: '[TEST] Leave Request Approved - 1/2/2026 to 3/2/2026',
      html: render(leaveTemplate),
      metadata: {
        category: 'leave',
        type: 'approval_test'
      }
    });
    
    if (leaveResult.success) {
      console.log('✅ Leave Approved email sent successfully');
      console.log(`   Message ID: ${leaveResult.messageId}`);
    } else {
      console.log('❌ Leave Approved email failed');
      console.log(`   Error: ${leaveResult.error}`);
    }

    console.log('\n' + '=' .repeat(60));
    console.log('🎉 Resend email testing completed!');
    console.log('📬 Check np425771@gmail.com inbox (and spam folder)');
    console.log('📊 Monitor delivery at: https://resend.com/emails');
    console.log('=' .repeat(60));

  } catch (error) {
    console.error('💥 Resend email test failed:', error);
    process.exit(1);
  }
}

// Verify configuration first
async function verifyConfig() {
  console.log('🔧 Verifying email configuration...');
  
  const config = await verifyEmailConfig();
  
  if (!config.valid) {
    console.error('❌ Email configuration invalid:', config.error);
    console.log('\n📝 Required environment variables for Resend:');
    console.log('   - EMAIL_PROVIDER=RESEND');
    console.log('   - RESEND_API_KEY');
    console.log('   - RESEND_FROM_EMAIL');
    console.log('   - EMAIL_FROM');
    console.log('   - FRONTEND_URL');
    process.exit(1);
  }
  
  console.log('✅ Email configuration is valid');
  console.log(`   Provider: ${config.provider}`);
  console.log(`   From: ${config.fromEmail}`);
  console.log(`   Base URL: ${config.baseUrl}`);
  
  return config;
}

// Main execution
async function main() {
  try {
    await verifyConfig();
    await testResendEmailSending();
  } catch (error) {
    console.error('💥 Test script failed:', error);
    process.exit(1);
  }
}

// Run the test
main();