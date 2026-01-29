/**
 * Test Script: Send Real Email to np425771@gmail.com
 * 
 * This script tests the Resend email service by sending actual emails
 * to verify the implementation works correctly.
 */

import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Get current directory for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables from the correct path
dotenv.config({ path: path.join(__dirname, '.env') });

// Verify environment variables are loaded
console.log('🔧 Environment Check:');
console.log(`   RESEND_API_KEY: ${process.env.RESEND_API_KEY ? '✅ Set' : '❌ Missing'}`);
console.log(`   RESEND_FROM_EMAIL: ${process.env.RESEND_FROM_EMAIL || '❌ Missing'}`);
console.log(`   APP_BASE_URL: ${process.env.APP_BASE_URL || '❌ Missing'}`);

import resendEmailService from './src/services/resendEmailService.js';
import logger from './src/utils/logger.js';

const testEmployee = {
  firstName: 'Test',
  lastName: 'Employee',
  user: { email: 'np425771@gmail.com' }
};

async function testEmailSending() {
  console.log('🚀 Starting Email Test to np425771@gmail.com');
  console.log('=' .repeat(50));

  try {
    // Test 1: Attendance Absent Email
    console.log('\n📧 Test 1: Attendance Absent Email');
    const absentResult = await resendEmailService.sendAttendanceAbsentEmail(
      testEmployee,
      '2026-01-29',
      'Test email - No clock-in recorded for testing purposes'
    );
    
    if (absentResult.success) {
      console.log('✅ Attendance Absent email sent successfully');
      console.log(`   Email ID: ${absentResult.emailId}`);
    } else {
      console.log('❌ Attendance Absent email failed');
      console.log(`   Error: ${absentResult.error}`);
    }

    // Wait 2 seconds between emails
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Test 2: Correction Required Email
    console.log('\n📧 Test 2: Correction Required Email');
    const correctionResult = await resendEmailService.sendCorrectionRequiredEmail(
      testEmployee,
      '2026-01-29',
      'Test email - Missing clock-out time for testing purposes'
    );
    
    if (correctionResult.success) {
      console.log('✅ Correction Required email sent successfully');
      console.log(`   Email ID: ${correctionResult.emailId}`);
    } else {
      console.log('❌ Correction Required email failed');
      console.log(`   Error: ${correctionResult.error}`);
    }

    // Wait 2 seconds between emails
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Test 3: Leave Approved Email
    console.log('\n📧 Test 3: Leave Approved Email');
    const testLeaveRequest = {
      leaveType: 'Annual Leave',
      startDate: '2026-02-01',
      endDate: '2026-02-03',
      numberOfDays: 3,
      id: 'test-123'
    };
    
    const leaveResult = await resendEmailService.sendLeaveApprovedEmail(
      testEmployee,
      testLeaveRequest,
      'Test Manager'
    );
    
    if (leaveResult.success) {
      console.log('✅ Leave Approved email sent successfully');
      console.log(`   Email ID: ${leaveResult.emailId}`);
    } else {
      console.log('❌ Leave Approved email failed');
      console.log(`   Error: ${leaveResult.error}`);
    }

    console.log('\n' + '=' .repeat(50));
    console.log('🎉 Email testing completed!');
    console.log('📬 Check np425771@gmail.com inbox (and spam folder)');
    console.log('📊 Monitor delivery at: https://resend.com/emails');
    console.log('=' .repeat(50));

  } catch (error) {
    console.error('💥 Email test failed:', error);
    process.exit(1);
  }
}

// Verify configuration first
async function verifyConfig() {
  console.log('🔧 Verifying email configuration...');
  
  const config = await resendEmailService.verifyConfiguration();
  
  if (!config.valid) {
    console.error('❌ Email configuration invalid:', config.error);
    console.log('\n📝 Required environment variables:');
    console.log('   - RESEND_API_KEY');
    console.log('   - RESEND_FROM_EMAIL');
    console.log('   - APP_BASE_URL');
    process.exit(1);
  }
  
  console.log('✅ Email configuration is valid');
  console.log(`   From: ${config.fromEmail}`);
  console.log(`   Service: Resend`);
  
  return config;
}

// Main execution
async function main() {
  try {
    await verifyConfig();
    await testEmailSending();
  } catch (error) {
    console.error('💥 Test script failed:', error);
    process.exit(1);
  }
}

// Run the test
main();