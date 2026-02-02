// Script to test the attendance finalization job
import { connectDB } from './src/config/sequelize.js';
import { manualFinalizeAttendance } from './src/jobs/attendanceFinalization.js';

async function testAttendanceJob() {
  try {
    console.log('=== TESTING ATTENDANCE FINALIZATION JOB ===\n');
    
    // Connect to database
    await connectDB();
    console.log('✅ Database connected\n');
    
    // Test the job for January 30, 2026
    console.log('1. TESTING MANUAL FINALIZATION FOR JAN 30, 2026:');
    const result = await manualFinalizeAttendance('2026-01-30');
    
    console.log('   Job Result:', JSON.stringify(result, null, 2));
    
    // Test for today's date
    console.log('\n2. TESTING MANUAL FINALIZATION FOR TODAY:');
    const todayResult = await manualFinalizeAttendance();
    
    console.log('   Today\'s Job Result:', JSON.stringify(todayResult, null, 2));
    
    console.log('\n✅ ATTENDANCE JOB TEST COMPLETE');
    
  } catch (error) {
    console.error('❌ Error testing attendance job:', error.message);
    console.error(error.stack);
  } finally {
    process.exit(0);
  }
}

testAttendanceJob();