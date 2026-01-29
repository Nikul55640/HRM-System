/**
 * Email Setup Verification Script
 * Run this to verify that the Resend + React Email setup is working
 */

import resendEmailService from './src/services/resendEmailService.js';
import logger from './src/utils/logger.js';

async function verifyEmailSetup() {
  console.log('🔍 Verifying Resend + React Email setup...\n');

  try {
    // 1. Check configuration
    console.log('1. Checking configuration...');
    const config = await resendEmailService.verifyConfiguration();
    
    if (config.valid) {
      console.log('✅ Configuration is valid');
      console.log(`   From Email: ${config.fromEmail}`);
    } else {
      console.log('❌ Configuration is invalid:', config.error);
      return;
    }

    // 2. Test template rendering
    console.log('\n2. Testing template rendering...');
    
    const testEmployee = {
      firstName: 'Test',
      lastName: 'Employee',
      user: { email: 'test@example.com' }
    };

    // Test attendance absent email
    console.log('   Testing AttendanceAbsent template...');
    const absentResult = await resendEmailService.sendAttendanceAbsentEmail(
      testEmployee,
      '2026-01-29',
      'Test verification - No clock-in recorded'
    );
    
    if (absentResult.success) {
      console.log('✅ AttendanceAbsent template rendered and sent successfully');
      console.log(`   Email ID: ${absentResult.emailId}`);
    } else {
      console.log('❌ AttendanceAbsent template failed:', absentResult.error);
    }

    // Test correction required email
    console.log('   Testing CorrectionRequired template...');
    const correctionResult = await resendEmailService.sendCorrectionRequiredEmail(
      testEmployee,
      '2026-01-29',
      'Test verification - Missing clock-out'
    );
    
    if (correctionResult.success) {
      console.log('✅ CorrectionRequired template rendered and sent successfully');
      console.log(`   Email ID: ${correctionResult.emailId}`);
    } else {
      console.log('❌ CorrectionRequired template failed:', correctionResult.error);
    }

    // Test leave approved email
    console.log('   Testing LeaveApproved template...');
    const leaveRequest = {
      leaveType: 'Annual Leave',
      startDate: '2026-02-01',
      endDate: '2026-02-03',
      numberOfDays: 3
    };
    
    const leaveResult = await resendEmailService.sendLeaveApprovedEmail(
      testEmployee,
      leaveRequest,
      'Test Manager'
    );
    
    if (leaveResult.success) {
      console.log('✅ LeaveApproved template rendered and sent successfully');
      console.log(`   Email ID: ${leaveResult.emailId}`);
    } else {
      console.log('❌ LeaveApproved template failed:', leaveResult.error);
    }

    console.log('\n🎉 Email setup verification complete!');
    console.log('\n📧 Check your email inbox for test emails.');
    console.log('📊 Check Resend dashboard: https://resend.com');

  } catch (error) {
    console.error('❌ Verification failed:', error);
    logger.error('Email verification failed:', error);
  }
}

// Run verification
verifyEmailSetup().then(() => {
  console.log('\n✅ Verification script completed');
  process.exit(0);
}).catch((error) => {
  console.error('❌ Verification script failed:', error);
  process.exit(1);
});