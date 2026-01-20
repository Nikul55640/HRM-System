/**
 * Test script to manually trigger attendance finalization and check absent marking
 */

import { finalizeDailyAttendance } from './src/jobs/attendanceFinalization.js';
import { AttendanceRecord, Employee } from './src/models/index.js';
import { getLocalDateString } from './src/utils/dateUtils.js';

async function testAbsentMarking() {
  console.log('🧪 Testing Absent Marking Functionality');
  console.log('=' .repeat(50));

  try {
    // Test with yesterday's date
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const testDate = getLocalDateString(yesterday);
    
    console.log(`📅 Testing absent marking for: ${testDate}`);

    // Get employees without attendance records for yesterday
    const employees = await Employee.findAll({
      where: { 
        isActive: true,
        status: 'Active'
      }
    });

    console.log(`\n👥 Found ${employees.length} active employees`);

    // Check which employees don't have attendance records for yesterday
    const employeesWithoutRecords = [];
    
    for (const employee of employees) {
      const existingRecord = await AttendanceRecord.findOne({
        where: { 
          employeeId: employee.id, 
          date: testDate 
        }
      });

      if (!existingRecord) {
        employeesWithoutRecords.push(employee);
        console.log(`   ❌ ${employee.employeeId}: ${employee.firstName} ${employee.lastName} - No attendance record`);
      } else {
        console.log(`   ✅ ${employee.employeeId}: ${employee.firstName} ${employee.lastName} - Has record (${existingRecord.status})`);
      }
    }

    console.log(`\n🚨 Employees without attendance records: ${employeesWithoutRecords.length}`);

    if (employeesWithoutRecords.length === 0) {
      console.log('✅ All employees already have attendance records. Creating a test scenario...');
      
      // Delete one employee's record to create a test case
      if (employees.length > 0) {
        const testEmployee = employees[0];
        const deletedCount = await AttendanceRecord.destroy({
          where: {
            employeeId: testEmployee.id,
            date: testDate
          }
        });
        
        if (deletedCount > 0) {
          console.log(`   🗑️  Deleted attendance record for ${testEmployee.employeeId} to create test scenario`);
          employeesWithoutRecords.push(testEmployee);
        } else {
          console.log(`   ℹ️  No existing record found for ${testEmployee.employeeId} to delete`);
        }
      }
    }

    // Now run the attendance finalization
    console.log(`\n🔄 Running attendance finalization for ${testDate}...`);
    
    const result = await finalizeDailyAttendance(yesterday);
    
    console.log(`\n📊 Finalization Results:`);
    console.log(`   - Processed: ${result.processed || 0}`);
    console.log(`   - Skipped: ${result.skipped || 0}`);
    console.log(`   - Present: ${result.present || 0}`);
    console.log(`   - Half Day: ${result.halfDay || 0}`);
    console.log(`   - Absent: ${result.absent || 0}`);
    console.log(`   - Leave: ${result.leave || 0}`);
    console.log(`   - Pending Correction: ${result.pendingCorrection || 0}`);
    console.log(`   - Errors: ${result.errors || 0}`);

    // Check if the employees without records are now marked as absent
    console.log(`\n🔍 Checking if employees are now marked as absent:`);
    
    let correctlyMarkedAbsent = 0;
    
    for (const employee of employeesWithoutRecords) {
      const newRecord = await AttendanceRecord.findOne({
        where: { 
          employeeId: employee.id, 
          date: testDate 
        }
      });

      if (newRecord) {
        console.log(`   ${employee.employeeId}: ${employee.firstName} ${employee.lastName}`);
        console.log(`      Status: ${newRecord.status}`);
        console.log(`      Reason: ${newRecord.statusReason}`);
        console.log(`      Clock In: ${newRecord.clockIn || 'None'}`);
        
        if (newRecord.status === 'absent' && !newRecord.clockIn) {
          console.log(`      ✅ CORRECTLY marked as absent`);
          correctlyMarkedAbsent++;
        } else {
          console.log(`      ❌ NOT marked as absent (Status: ${newRecord.status})`);
        }
      } else {
        console.log(`   ${employee.employeeId}: ${employee.firstName} ${employee.lastName}`);
        console.log(`      ❌ Still no attendance record created`);
      }
      console.log('');
    }

    // Summary
    console.log(`\n📋 Test Summary:`);
    console.log(`   - Employees without records: ${employeesWithoutRecords.length}`);
    console.log(`   - Correctly marked absent: ${correctlyMarkedAbsent}`);
    console.log(`   - Success rate: ${employeesWithoutRecords.length > 0 ? Math.round((correctlyMarkedAbsent / employeesWithoutRecords.length) * 100) : 0}%`);

    if (correctlyMarkedAbsent === employeesWithoutRecords.length && employeesWithoutRecords.length > 0) {
      console.log(`\n✅ TEST PASSED: All employees without clock-in were correctly marked as absent`);
    } else if (employeesWithoutRecords.length === 0) {
      console.log(`\n⚠️  TEST INCONCLUSIVE: No employees found without attendance records to test`);
    } else {
      console.log(`\n❌ TEST FAILED: Some employees were not correctly marked as absent`);
    }

    return {
      success: true,
      testDate,
      employeesWithoutRecords: employeesWithoutRecords.length,
      correctlyMarkedAbsent,
      finalizationResult: result
    };

  } catch (error) {
    console.error('❌ Error during absent marking test:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

// Run the test
testAbsentMarking()
  .then(result => {
    console.log('\n🏁 Test completed');
    process.exit(result.success ? 0 : 1);
  })
  .catch(error => {
    console.error('💥 Test failed:', error);
    process.exit(1);
  });