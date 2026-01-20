/**
 * Simple test to manually mark employees as absent who don't have attendance records
 */

import { AttendanceRecord, Employee } from './src/models/index.js';
import { getLocalDateString } from './src/utils/dateUtils.js';

async function simpleAbsentTest() {
  console.log('🧪 Simple Absent Marking Test');
  console.log('=' .repeat(40));

  try {
    // Test with yesterday's date
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const testDate = getLocalDateString(yesterday);
    
    console.log(`📅 Testing for date: ${testDate}`);

    // Get all active employees
    const employees = await Employee.findAll({
      where: { 
        isActive: true,
        status: 'Active'
      }
    });

    console.log(`\n👥 Found ${employees.length} active employees`);

    // Check which employees don't have attendance records
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
        console.log(`   ❌ ${employee.employeeId}: ${employee.firstName} ${employee.lastName} - No record`);
      } else {
        console.log(`   ✅ ${employee.employeeId}: ${employee.firstName} ${employee.lastName} - Has record (${existingRecord.status})`);
      }
    }

    console.log(`\n🚨 Employees without records: ${employeesWithoutRecords.length}`);

    if (employeesWithoutRecords.length === 0) {
      console.log('✅ All employees already have attendance records.');
      return { success: true, message: 'No employees to mark absent' };
    }

    // Manually create absent records for employees without attendance
    console.log(`\n🔄 Creating absent records for employees without attendance...`);
    
    const createdRecords = [];
    
    for (const employee of employeesWithoutRecords) {
      try {
        const absentRecord = await AttendanceRecord.create({
          employeeId: employee.id,
          shiftId: null, // No shift assigned or unknown
          date: testDate,
          status: 'absent',
          statusReason: 'Auto marked absent (no clock-in)',
          clockIn: null,
          clockOut: null,
          workHours: 0,
          totalWorkedMinutes: 0,
          totalBreakMinutes: 0,
          lateMinutes: 0,
          earlyExitMinutes: 0,
          overtimeMinutes: 0,
          overtimeHours: 0,
          isLate: false,
          isEarlyDeparture: false,
          correctionRequested: false
        });

        createdRecords.push({
          employee: employee,
          record: absentRecord
        });

        console.log(`   ✅ Created absent record for ${employee.employeeId}: ${employee.firstName} ${employee.lastName}`);
        
      } catch (error) {
        console.error(`   ❌ Failed to create record for ${employee.employeeId}:`, error.message);
      }
    }

    console.log(`\n📊 Results:`);
    console.log(`   - Employees without records: ${employeesWithoutRecords.length}`);
    console.log(`   - Successfully created absent records: ${createdRecords.length}`);
    console.log(`   - Failed: ${employeesWithoutRecords.length - createdRecords.length}`);

    // Verify the created records
    console.log(`\n🔍 Verifying created records:`);
    
    for (const { employee, record } of createdRecords) {
      const verifyRecord = await AttendanceRecord.findOne({
        where: { 
          employeeId: employee.id, 
          date: testDate 
        }
      });

      if (verifyRecord && verifyRecord.status === 'absent') {
        console.log(`   ✅ ${employee.employeeId}: Correctly marked as absent`);
      } else {
        console.log(`   ❌ ${employee.employeeId}: Verification failed`);
      }
    }

    // Final summary
    console.log(`\n📋 Test Summary:`);
    if (createdRecords.length === employeesWithoutRecords.length) {
      console.log(`   ✅ SUCCESS: All employees without clock-in were marked as absent`);
    } else {
      console.log(`   ⚠️  PARTIAL SUCCESS: ${createdRecords.length}/${employeesWithoutRecords.length} employees marked as absent`);
    }

    return {
      success: true,
      testDate,
      employeesWithoutRecords: employeesWithoutRecords.length,
      createdAbsentRecords: createdRecords.length,
      details: createdRecords.map(cr => ({
        employeeId: cr.employee.employeeId,
        name: `${cr.employee.firstName} ${cr.employee.lastName}`,
        recordId: cr.record.id,
        status: cr.record.status
      }))
    };

  } catch (error) {
    console.error('❌ Error during simple absent test:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

// Function to check current attendance status
async function checkCurrentStatus() {
  console.log('\n🔍 Current Attendance Status Check');
  console.log('=' .repeat(40));

  try {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const testDate = getLocalDateString(yesterday);

    const today = new Date();
    const todayStr = getLocalDateString(today);

    // Get all attendance records for yesterday and today
    const yesterdayRecords = await AttendanceRecord.findAll({
      where: { date: testDate },
      include: [{ model: Employee, as: 'employee' }]
    });

    const todayRecords = await AttendanceRecord.findAll({
      where: { date: todayStr },
      include: [{ model: Employee, as: 'employee' }]
    });

    console.log(`\n📊 Yesterday (${testDate}) - ${yesterdayRecords.length} records:`);
    const yesterdayStats = {
      present: 0,
      absent: 0,
      half_day: 0,
      leave: 0,
      incomplete: 0,
      other: 0
    };

    yesterdayRecords.forEach(record => {
      const status = record.status;
      if (yesterdayStats.hasOwnProperty(status)) {
        yesterdayStats[status]++;
      } else {
        yesterdayStats.other++;
      }

      console.log(`   ${record.employee.employeeId}: ${record.employee.firstName} ${record.employee.lastName} - ${status}`);
    });

    console.log(`\n   Summary: Present: ${yesterdayStats.present}, Absent: ${yesterdayStats.absent}, Half Day: ${yesterdayStats.half_day}, Leave: ${yesterdayStats.leave}, Incomplete: ${yesterdayStats.incomplete}, Other: ${yesterdayStats.other}`);

    console.log(`\n📊 Today (${todayStr}) - ${todayRecords.length} records:`);
    const todayStats = {
      present: 0,
      absent: 0,
      half_day: 0,
      leave: 0,
      incomplete: 0,
      other: 0
    };

    todayRecords.forEach(record => {
      const status = record.status;
      if (todayStats.hasOwnProperty(status)) {
        todayStats[status]++;
      } else {
        todayStats.other++;
      }

      console.log(`   ${record.employee.employeeId}: ${record.employee.firstName} ${record.employee.lastName} - ${status}`);
    });

    console.log(`\n   Summary: Present: ${todayStats.present}, Absent: ${todayStats.absent}, Half Day: ${todayStats.half_day}, Leave: ${todayStats.leave}, Incomplete: ${todayStats.incomplete}, Other: ${todayStats.other}`);

    return {
      yesterday: { date: testDate, records: yesterdayRecords.length, stats: yesterdayStats },
      today: { date: todayStr, records: todayRecords.length, stats: todayStats }
    };

  } catch (error) {
    console.error('❌ Error checking current status:', error);
    return { error: error.message };
  }
}

// Run the tests
async function runTests() {
  console.log('🚀 Starting Attendance Tests\n');
  
  // First check current status
  await checkCurrentStatus();
  
  // Then run the absent marking test
  const result = await simpleAbsentTest();
  
  // Check status again after the test
  console.log('\n🔄 Checking status after test...');
  await checkCurrentStatus();
  
  console.log('\n🏁 All tests completed');
  return result;
}

runTests()
  .then(result => {
    process.exit(result?.success ? 0 : 1);
  })
  .catch(error => {
    console.error('💥 Test failed:', error);
    process.exit(1);
  });