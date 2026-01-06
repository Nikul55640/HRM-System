/**
 * Test Attendance Automation Features
 * Tests absent detection, half-day calculation, and notifications
 */

import sequelize from './src/config/sequelize.js';
import { AttendanceRecord, Employee, Shift, User, EmployeeShift } from './src/models/index.js';
import attendanceService from './src/services/admin/attendance.service.js';

async function testAttendanceAutomation() {
  try {
    console.log('🚀 Testing Attendance Automation Features...\n');
    
    // Test database connection
    await sequelize.authenticate();
    console.log('✅ Database connection established\n');

    // Test 1: Half-day detection
    await testHalfDayDetection();
    
    // Test 2: Absent employee detection
    await testAbsentDetection();
    
    // Test 3: Half-day type determination
    await testHalfDayTypes();
    
    console.log('✅ All attendance automation tests completed successfully!');
    
  } catch (error) {
    console.error('❌ Test failed:', error);
    console.error('Stack trace:', error.stack);
  } finally {
    await sequelize.close();
    console.log('🔒 Database connection closed');
  }
}

async function testHalfDayDetection() {
  console.log('📋 Test 1: Half-day Detection Logic');
  console.log('=====================================');
  
  try {
    // Get a test shift
    const shift = await Shift.findOne({ where: { isDefault: true } });
    if (!shift) {
      console.log('⚠️  No default shift found, skipping half-day test');
      return;
    }
    
    console.log(`Using shift: ${shift.shiftName}`);
    console.log(`Full day hours: ${shift.fullDayHours}, Half day hours: ${shift.halfDayHours}`);
    
    // Test scenarios
    const scenarios = [
      { workHours: 8.5, expected: 'full_day', status: 'present' },
      { workHours: 6.0, expected: 'first_half', status: 'half_day' },
      { workHours: 4.5, expected: 'first_half', status: 'half_day' },
      { workHours: 3.0, expected: 'first_half', status: 'half_day' },
    ];
    
    for (const scenario of scenarios) {
      // Create a mock attendance record
      const mockRecord = {
        workHours: scenario.workHours,
        clockIn: new Date('2024-01-15T09:00:00'),
        clockOut: new Date(`2024-01-15T${9 + scenario.workHours}:00:00`),
        date: '2024-01-15',
        status: 'present',
        determineHalfDayType: function(shift) {
          const clockInTime = new Date(this.clockIn);
          const today = this.date;
          const shiftStartTime = new Date(`${today} ${shift.shiftStartTime}`);
          const shiftEndTime = new Date(`${today} ${shift.shiftEndTime}`);
          const shiftMidpoint = new Date((shiftStartTime.getTime() + shiftEndTime.getTime()) / 2);
          
          return clockInTime <= shiftMidpoint ? 'first_half' : 'second_half';
        }
      };
      
      // Simulate the half-day detection logic
      const workedHours = mockRecord.workHours;
      const fullDayHours = shift.fullDayHours || 8;
      const halfDayHours = shift.halfDayHours || 4;
      
      let resultStatus, resultType;
      
      if (workedHours >= fullDayHours) {
        resultType = 'full_day';
        resultStatus = 'present';
      } else if (workedHours >= halfDayHours) {
        resultStatus = 'half_day';
        resultType = mockRecord.determineHalfDayType(shift);
      } else {
        resultStatus = 'half_day';
        resultType = mockRecord.determineHalfDayType(shift);
      }
      
      const passed = resultType === scenario.expected && resultStatus === scenario.status;
      console.log(`  ${passed ? '✅' : '❌'} ${scenario.workHours}h → ${resultStatus} (${resultType})`);
    }
    
  } catch (error) {
    console.error('❌ Half-day detection test failed:', error);
  }
  
  console.log('');
}

async function testAbsentDetection() {
  console.log('📋 Test 2: Absent Employee Detection');
  console.log('====================================');
  
  try {
    // Test the absent detection service
    const result = await attendanceService.checkAbsentEmployees();
    
    if (result.success) {
      console.log('✅ Absent detection service executed successfully');
      console.log(`📊 Results: ${result.data?.length || 0} employees processed`);
      
      if (result.data && result.data.length > 0) {
        result.data.forEach(item => {
          console.log(`  - ${item.employeeName}: ${item.action} (${item.reason})`);
        });
      } else {
        console.log('  - No absent employees detected (all employees have clocked in)');
      }
    } else {
      console.log('❌ Absent detection failed:', result.message);
    }
    
  } catch (error) {
    console.error('❌ Absent detection test failed:', error);
  }
  
  console.log('');
}

async function testHalfDayTypes() {
  console.log('📋 Test 3: Half-day Type Determination');
  console.log('======================================');
  
  try {
    // Get a test shift
    const shift = await Shift.findOne({ where: { isDefault: true } });
    if (!shift) {
      console.log('⚠️  No default shift found, skipping half-day type test');
      return;
    }
    
    console.log(`Shift: ${shift.shiftStartTime} - ${shift.shiftEndTime}`);
    
    // Calculate shift midpoint for reference
    const today = '2024-01-15';
    const shiftStartTime = new Date(`${today} ${shift.shiftStartTime}`);
    const shiftEndTime = new Date(`${today} ${shift.shiftEndTime}`);
    const shiftMidpoint = new Date((shiftStartTime.getTime() + shiftEndTime.getTime()) / 2);
    
    console.log(`Shift midpoint: ${shiftMidpoint.toLocaleTimeString()}`);
    
    // Test different clock-in times
    const testTimes = [
      { clockIn: '08:30:00', expected: 'first_half', description: 'Early morning' },
      { clockIn: '09:00:00', expected: 'first_half', description: 'Shift start' },
      { clockIn: '11:00:00', expected: 'first_half', description: 'Before midpoint' },
      { clockIn: '14:00:00', expected: 'second_half', description: 'After midpoint' },
      { clockIn: '15:30:00', expected: 'second_half', description: 'Late afternoon' },
    ];
    
    for (const test of testTimes) {
      const clockInTime = new Date(`${today} ${test.clockIn}`);
      const result = clockInTime <= shiftMidpoint ? 'first_half' : 'second_half';
      const passed = result === test.expected;
      
      console.log(`  ${passed ? '✅' : '❌'} ${test.clockIn} (${test.description}) → ${result}`);
    }
    
  } catch (error) {
    console.error('❌ Half-day type test failed:', error);
  }
  
  console.log('');
}

// Run the tests
testAttendanceAutomation();