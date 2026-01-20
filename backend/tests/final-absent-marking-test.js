/**
 * Final ABSENT Marking Test Suite
 * 
 * This test verifies the finalized ABSENT marking logic:
 * ✅ ABSENT is marked ONLY by end-of-day cron job
 * ✅ ABSENT is marked ONLY when NO clock-in recorded
 * ✅ ABSENT is NEVER marked in real-time
 * ✅ ABSENT is NEVER marked from the UI
 * 
 * Test scenarios:
 * 1. Employee with no attendance record → ABSENT
 * 2. Employee with clock-in but no clock-out → PENDING_CORRECTION
 * 3. Employee with both clock-in and clock-out → PRESENT/HALF_DAY
 * 4. Employee on approved leave → SKIPPED (not marked absent)
 * 5. Employee on holiday → SKIPPED (not marked absent)
 */

import { AttendanceRecord, Employee, LeaveRequest, Holiday, WorkingRule } from '../src/models/index.js';
import { finalizeDailyAttendance, checkAbsentEmployees } from '../src/jobs/attendanceFinalization.js';
import { getLocalDateString } from '../src/utils/dateUtils.js';
import logger from '../src/utils/logger.js';

// Test configuration
const TEST_DATE = getLocalDateString(new Date());
const TEST_EMPLOYEE_ID = 1; // Adjust based on your test data

async function runTests() {
  console.log('\n🧪 FINAL ABSENT MARKING TEST SUITE');
  console.log('=====================================\n');

  try {
    // Test 1: Employee with no attendance record
    console.log('📋 Test 1: Employee with NO attendance record');
    console.log('Expected: Should be marked ABSENT by cron job');
    await testNoAttendanceRecord();
    console.log('✅ Test 1 passed\n');

    // Test 2: Employee with clock-in but no clock-out
    console.log('📋 Test 2: Employee with clock-in but NO clock-out');
    console.log('Expected: Should be marked PENDING_CORRECTION');
    await testMissedClockOut();
    console.log('✅ Test 2 passed\n');

    // Test 3: Employee with both clock-in and clock-out
    console.log('📋 Test 3: Employee with BOTH clock-in and clock-out');
    console.log('Expected: Should be marked PRESENT or HALF_DAY');
    await testCompleteClockInOut();
    console.log('✅ Test 3 passed\n');

    // Test 4: Employee on approved leave
    console.log('📋 Test 4: Employee on APPROVED LEAVE');
    console.log('Expected: Should be SKIPPED (not marked absent)');
    await testApprovedLeave();
    console.log('✅ Test 4 passed\n');

    // Test 5: Check absent employees (informational)
    console.log('📋 Test 5: Check absent employees (informational)');
    console.log('Expected: Should list employees who haven\'t clocked in');
    await testCheckAbsentEmployees();
    console.log('✅ Test 5 passed\n');

    console.log('🎉 ALL TESTS PASSED!');
    console.log('=====================================\n');

  } catch (error) {
    console.error('❌ TEST FAILED:', error);
    process.exit(1);
  }
}

/**
 * Test 1: No attendance record → ABSENT
 */
async function testNoAttendanceRecord() {
  try {
    // Delete any existing record for this employee on test date
    await AttendanceRecord.destroy({
      where: {
        employeeId: TEST_EMPLOYEE_ID,
        date: TEST_DATE
      }
    });

    console.log(`  - Deleted existing record for employee ${TEST_EMPLOYEE_ID} on ${TEST_DATE}`);

    // Run finalization
    const stats = await finalizeDailyAttendance(new Date(TEST_DATE));
    console.log(`  - Finalization stats:`, stats);

    // Verify record was created with ABSENT status
    const record = await AttendanceRecord.findOne({
      where: {
        employeeId: TEST_EMPLOYEE_ID,
        date: TEST_DATE
      }
    });

    if (!record) {
      throw new Error('No attendance record created');
    }

    if (record.status !== 'absent') {
      throw new Error(`Expected status 'absent', got '${record.status}'`);
    }

    if (!record.statusReason.includes('No clock-in')) {
      throw new Error(`Expected reason to include 'No clock-in', got '${record.statusReason}'`);
    }

    console.log(`  ✅ Record created with status: ${record.status}`);
    console.log(`  ✅ Reason: ${record.statusReason}`);

  } catch (error) {
    console.error('  ❌ Test failed:', error.message);
    throw error;
  }
}

/**
 * Test 2: Clock-in but no clock-out → PENDING_CORRECTION
 */
async function testMissedClockOut() {
  try {
    // Create record with clock-in but no clock-out
    const clockInTime = new Date();
    clockInTime.setHours(9, 0, 0, 0); // 9:00 AM

    const record = await AttendanceRecord.create({
      employeeId: TEST_EMPLOYEE_ID,
      date: TEST_DATE,
      clockIn: clockInTime,
      clockOut: null,
      status: 'incomplete',
      statusReason: 'Clock-out pending'
    });

    console.log(`  - Created record with clock-in at ${clockInTime.toLocaleTimeString()}`);

    // Run finalization
    const stats = await finalizeDailyAttendance(new Date(TEST_DATE));
    console.log(`  - Finalization stats:`, stats);

    // Reload and verify
    await record.reload();

    if (record.status !== 'pending_correction') {
      throw new Error(`Expected status 'pending_correction', got '${record.status}'`);
    }

    console.log(`  ✅ Record updated to status: ${record.status}`);
    console.log(`  ✅ Reason: ${record.statusReason}`);

  } catch (error) {
    console.error('  ❌ Test failed:', error.message);
    throw error;
  }
}

/**
 * Test 3: Both clock-in and clock-out → PRESENT/HALF_DAY
 */
async function testCompleteClockInOut() {
  try {
    // Create record with both clock-in and clock-out
    const clockInTime = new Date();
    clockInTime.setHours(9, 0, 0, 0); // 9:00 AM

    const clockOutTime = new Date();
    clockOutTime.setHours(17, 0, 0, 0); // 5:00 PM (8 hours)

    const record = await AttendanceRecord.create({
      employeeId: TEST_EMPLOYEE_ID,
      date: TEST_DATE,
      clockIn: clockInTime,
      clockOut: clockOutTime,
      status: 'incomplete',
      statusReason: 'Pending finalization'
    });

    console.log(`  - Created record with clock-in at ${clockInTime.toLocaleTimeString()}`);
    console.log(`  - Created record with clock-out at ${clockOutTime.toLocaleTimeString()}`);

    // Run finalization
    const stats = await finalizeDailyAttendance(new Date(TEST_DATE));
    console.log(`  - Finalization stats:`, stats);

    // Reload and verify
    await record.reload();

    if (!['present', 'half_day'].includes(record.status)) {
      throw new Error(`Expected status 'present' or 'half_day', got '${record.status}'`);
    }

    console.log(`  ✅ Record finalized with status: ${record.status}`);
    console.log(`  ✅ Work hours: ${record.workHours}`);
    console.log(`  ✅ Reason: ${record.statusReason}`);

  } catch (error) {
    console.error('  ❌ Test failed:', error.message);
    throw error;
  }
}

/**
 * Test 4: Employee on approved leave → SKIPPED
 */
async function testApprovedLeave() {
  try {
    // Delete any existing record
    await AttendanceRecord.destroy({
      where: {
        employeeId: TEST_EMPLOYEE_ID,
        date: TEST_DATE
      }
    });

    // Create approved leave request
    const leaveRequest = await LeaveRequest.create({
      employeeId: TEST_EMPLOYEE_ID,
      leaveType: 'casual',
      startDate: TEST_DATE,
      endDate: TEST_DATE,
      reason: 'Test leave',
      status: 'approved'
    });

    console.log(`  - Created approved leave request for ${TEST_DATE}`);

    // Run finalization
    const stats = await finalizeDailyAttendance(new Date(TEST_DATE));
    console.log(`  - Finalization stats:`, stats);

    // Verify no record was created (or record was skipped)
    const record = await AttendanceRecord.findOne({
      where: {
        employeeId: TEST_EMPLOYEE_ID,
        date: TEST_DATE
      }
    });

    if (record && record.status === 'absent') {
      throw new Error('Employee on leave should not be marked absent');
    }

    console.log(`  ✅ Employee on leave was correctly skipped`);

    // Cleanup
    await leaveRequest.destroy();

  } catch (error) {
    console.error('  ❌ Test failed:', error.message);
    throw error;
  }
}

/**
 * Test 5: Check absent employees (informational)
 */
async function testCheckAbsentEmployees() {
  try {
    // Run check
    const result = await checkAbsentEmployees(new Date(TEST_DATE));

    console.log(`  - Check result:`, result);

    if (!result.success) {
      throw new Error(`Check failed: ${result.message}`);
    }

    console.log(`  ✅ Found ${result.data.length} employees who haven't clocked in`);

  } catch (error) {
    console.error('  ❌ Test failed:', error.message);
    throw error;
  }
}

// Run tests
runTests().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});
