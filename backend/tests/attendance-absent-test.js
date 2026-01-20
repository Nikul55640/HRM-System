/**
 * Test to verify that employees who don't clock in are properly marked as absent
 * This test checks the attendance finalization system
 */

import { AttendanceRecord, Employee, Shift, EmployeeShift, Holiday, WorkingRule } from '../src/models/index.js';
import { finalizeDailyAttendance } from '../src/jobs/attendanceFinalization.js';
import { getLocalDateString } from '../src/utils/dateUtils.js';

async function testAbsentMarking() {
  console.log('🧪 Testing Absent Marking for Employees Who Don\'t Clock In');
  console.log('=' .repeat(60));

  try {
    // Get yesterday's date for testing (to avoid conflicts with today's data)
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const testDate = getLocalDateString(yesterday);
    
    console.log(`📅 Testing for date: ${testDate}`);

    // Step 1: Check if test date is a working day
    const isWorkingDay = await WorkingRule.isWorkingDay(testDate);
    const isHoliday = await Holiday.isHoliday(testDate);
    
    console.log(`📋 Date Status:`);
    console.log(`   - Is Working Day: ${isWorkingDay}`);
    console.log(`   - Is Holiday: ${isHoliday}`);
    
    if (!isWorkingDay || isHoliday) {
      console.log('⚠️  Test date is not a working day or is a holiday. Skipping test.');
      return;
    }

    // Step 2: Find active employees
    const employees = await Employee.findAll({
      where: { 
        isActive: true,
        status: 'Active'
      },
      include: [
        { 
          model: EmployeeShift, 
          as: 'shiftAssignments',
          where: {
            isActive: true
          },
          required: false,
          include: [{ model: Shift, as: 'shift' }],
          limit: 1,
          order: [['effectiveFrom', 'DESC']]
        }
      ],
      limit: 5 // Test with first 5 employees
    });

    console.log(`\n👥 Found ${employees.length} active employees to test`);

    if (employees.length === 0) {
      console.log('❌ No active employees found. Please seed the database first.');
      return;
    }

    // Step 3: Check current attendance records for test date
    console.log(`\n📊 Current Attendance Records for ${testDate}:`);
    
    const results = [];
    
    for (const employee of employees) {
      const existingRecord = await AttendanceRecord.findOne({
        where: { 
          employeeId: employee.id, 
          date: testDate 
        }
      });

      const shift = employee.shiftAssignments?.[0]?.shift;
      
      const employeeInfo = {
        id: employee.id,
        name: `${employee.firstName} ${employee.lastName}`,
        employeeId: employee.employeeId,
        shift: shift ? `${shift.shiftName} (${shift.shiftStartTime}-${shift.shiftEndTime})` : 'No shift assigned',
        currentStatus: existingRecord ? existingRecord.status : 'No record',
        clockIn: existingRecord?.clockIn || 'None',
        clockOut: existingRecord?.clockOut || 'None',
        statusReason: existingRecord?.statusReason || 'N/A'
      };

      results.push(employeeInfo);
      
      console.log(`   ${employee.employeeId}: ${employeeInfo.name}`);
      console.log(`      Shift: ${employeeInfo.shift}`);
      console.log(`      Status: ${employeeInfo.currentStatus}`);
      console.log(`      Clock In: ${employeeInfo.clockIn}`);
      console.log(`      Clock Out: ${employeeInfo.clockOut}`);
      console.log(`      Reason: ${employeeInfo.statusReason}`);
      console.log('');
    }

    // Step 4: Test the finalization process
    console.log(`🔄 Running Attendance Finalization for ${testDate}...`);
    
    const finalizationStats = await finalizeDailyAttendance(yesterday);
    
    console.log(`\n📈 Finalization Results:`);
    console.log(`   - Processed: ${finalizationStats.processed || 0}`);
    console.log(`   - Skipped: ${finalizationStats.skipped || 0}`);
    console.log(`   - Present: ${finalizationStats.present || 0}`);
    console.log(`   - Half Day: ${finalizationStats.halfDay || 0}`);
    console.log(`   - Absent: ${finalizationStats.absent || 0}`);
    console.log(`   - Leave: ${finalizationStats.leave || 0}`);
    console.log(`   - Pending Correction: ${finalizationStats.pendingCorrection || 0}`);
    console.log(`   - Errors: ${finalizationStats.errors || 0}`);

    // Step 5: Check updated attendance records
    console.log(`\n📊 Updated Attendance Records for ${testDate}:`);
    
    const updatedResults = [];
    
    for (const employee of employees) {
      const updatedRecord = await AttendanceRecord.findOne({
        where: { 
          employeeId: employee.id, 
          date: testDate 
        }
      });

      const shift = employee.shiftAssignments?.[0]?.shift;
      
      const updatedInfo = {
        id: employee.id,
        name: `${employee.firstName} ${employee.lastName}`,
        employeeId: employee.employeeId,
        shift: shift ? `${shift.shiftName} (${shift.shiftStartTime}-${shift.shiftEndTime})` : 'No shift assigned',
        finalStatus: updatedRecord ? updatedRecord.status : 'No record created',
        clockIn: updatedRecord?.clockIn || 'None',
        clockOut: updatedRecord?.clockOut || 'None',
        workHours: updatedRecord?.workHours || 0,
        statusReason: updatedRecord?.statusReason || 'N/A',
        wasAbsent: updatedRecord?.status === 'absent'
      };

      updatedResults.push(updatedInfo);
      
      console.log(`   ${employee.employeeId}: ${updatedInfo.name}`);
      console.log(`      Final Status: ${updatedInfo.finalStatus}`);
      console.log(`      Clock In: ${updatedInfo.clockIn}`);
      console.log(`      Clock Out: ${updatedInfo.clockOut}`);
      console.log(`      Work Hours: ${updatedInfo.workHours}`);
      console.log(`      Reason: ${updatedInfo.statusReason}`);
      console.log(`      Was Marked Absent: ${updatedInfo.wasAbsent ? '✅ YES' : '❌ NO'}`);
      console.log('');
    }

    // Step 6: Summary and Analysis
    console.log(`\n📋 Test Summary:`);
    
    const absentEmployees = updatedResults.filter(emp => emp.wasAbsent);
    const employeesWithoutClockIn = updatedResults.filter(emp => emp.clockIn === 'None');
    
    console.log(`   - Total Employees Tested: ${updatedResults.length}`);
    console.log(`   - Employees Without Clock-In: ${employeesWithoutClockIn.length}`);
    console.log(`   - Employees Marked as Absent: ${absentEmployees.length}`);
    
    if (employeesWithoutClockIn.length > 0) {
      console.log(`\n👥 Employees Without Clock-In:`);
      employeesWithoutClockIn.forEach(emp => {
        console.log(`   - ${emp.employeeId}: ${emp.name} → Status: ${emp.finalStatus}`);
      });
    }
    
    if (absentEmployees.length > 0) {
      console.log(`\n❌ Employees Marked as Absent:`);
      absentEmployees.forEach(emp => {
        console.log(`   - ${emp.employeeId}: ${emp.name} → Reason: ${emp.statusReason}`);
      });
    }

    // Step 7: Validation
    console.log(`\n✅ Validation Results:`);
    
    const validationPassed = employeesWithoutClockIn.every(emp => emp.wasAbsent);
    
    if (validationPassed && employeesWithoutClockIn.length > 0) {
      console.log(`   ✅ PASS: All employees without clock-in were properly marked as absent`);
    } else if (employeesWithoutClockIn.length === 0) {
      console.log(`   ⚠️  INFO: No employees found without clock-in records to test`);
      console.log(`   💡 TIP: To test this functionality, you can:`);
      console.log(`      1. Delete some attendance records for yesterday`);
      console.log(`      2. Or create test employees without attendance records`);
      console.log(`      3. Then run this test again`);
    } else {
      console.log(`   ❌ FAIL: Some employees without clock-in were NOT marked as absent`);
      const notMarkedAbsent = employeesWithoutClockIn.filter(emp => !emp.wasAbsent);
      notMarkedAbsent.forEach(emp => {
        console.log(`      - ${emp.employeeId}: ${emp.name} → Status: ${emp.finalStatus} (Expected: absent)`);
      });
    }

    return {
      success: true,
      testDate,
      totalEmployees: updatedResults.length,
      employeesWithoutClockIn: employeesWithoutClockIn.length,
      employeesMarkedAbsent: absentEmployees.length,
      validationPassed,
      finalizationStats,
      employeeDetails: updatedResults
    };

  } catch (error) {
    console.error('❌ Error during absent marking test:', error);
    return {
      success: false,
      error: error.message,
      stack: error.stack
    };
  }
}

// Function to create a test scenario by removing attendance records
async function createTestScenario(employeeIds, testDate) {
  console.log(`🧪 Creating test scenario by removing attendance records for ${testDate}...`);
  
  try {
    const deletedCount = await AttendanceRecord.destroy({
      where: {
        employeeId: employeeIds,
        date: testDate
      }
    });
    
    console.log(`   ✅ Removed ${deletedCount} attendance records`);
    return deletedCount;
  } catch (error) {
    console.error('❌ Error creating test scenario:', error);
    throw error;
  }
}

// Function to check specific employee attendance
async function checkEmployeeAttendance(employeeId, date) {
  try {
    const employee = await Employee.findByPk(employeeId, {
      include: [
        { 
          model: EmployeeShift, 
          as: 'shiftAssignments',
          where: { isActive: true },
          required: false,
          include: [{ model: Shift, as: 'shift' }],
          limit: 1,
          order: [['effectiveFrom', 'DESC']]
        }
      ]
    });

    if (!employee) {
      return { error: 'Employee not found' };
    }

    const attendance = await AttendanceRecord.findOne({
      where: { 
        employeeId: employeeId, 
        date: date 
      }
    });

    return {
      employee: {
        id: employee.id,
        name: `${employee.firstName} ${employee.lastName}`,
        employeeId: employee.employeeId,
        shift: employee.shiftAssignments?.[0]?.shift?.shiftName || 'No shift'
      },
      attendance: attendance ? {
        status: attendance.status,
        clockIn: attendance.clockIn,
        clockOut: attendance.clockOut,
        workHours: attendance.workHours,
        statusReason: attendance.statusReason
      } : null
    };
  } catch (error) {
    return { error: error.message };
  }
}

// Export functions for use
export {
  testAbsentMarking,
  createTestScenario,
  checkEmployeeAttendance
};

// Run the test if this file is executed directly
if (process.argv[1] === new URL(import.meta.url).pathname) {
  testAbsentMarking()
    .then(result => {
      console.log('\n🏁 Test completed');
      if (result.success) {
        process.exit(0);
      } else {
        process.exit(1);
      }
    })
    .catch(error => {
      console.error('💥 Test failed:', error);
      process.exit(1);
    });
}