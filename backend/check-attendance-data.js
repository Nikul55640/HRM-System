/**
 * Simple script to check attendance data and absent marking
 */

import { AttendanceRecord, Employee, Shift, EmployeeShift } from './src/models/index.js';
import { getLocalDateString } from './src/utils/dateUtils.js';

async function checkAttendanceData() {
  console.log('🔍 Checking Attendance Data for Absent Marking');
  console.log('=' .repeat(50));

  try {
    // Get yesterday's date
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = getLocalDateString(yesterday);
    
    // Get today's date
    const today = new Date();
    const todayStr = getLocalDateString(today);
    
    console.log(`📅 Checking dates:`);
    console.log(`   - Yesterday: ${yesterdayStr}`);
    console.log(`   - Today: ${todayStr}`);

    // Check active employees
    const employees = await Employee.findAll({
      where: { 
        isActive: true,
        status: 'Active'
      },
      limit: 10 // Check first 10 employees
    });

    console.log(`\n👥 Found ${employees.length} active employees`);

    if (employees.length === 0) {
      console.log('❌ No active employees found. Database might be empty.');
      return;
    }

    // Check attendance records for yesterday
    console.log(`\n📊 Attendance Records for Yesterday (${yesterdayStr}):`);
    
    for (const employee of employees) {
      const attendance = await AttendanceRecord.findOne({
        where: { 
          employeeId: employee.id, 
          date: yesterdayStr 
        }
      });

      console.log(`   ${employee.employeeId}: ${employee.firstName} ${employee.lastName}`);
      
      if (attendance) {
        console.log(`      Status: ${attendance.status}`);
        console.log(`      Clock In: ${attendance.clockIn || 'None'}`);
        console.log(`      Clock Out: ${attendance.clockOut || 'None'}`);
        console.log(`      Reason: ${attendance.statusReason || 'N/A'}`);
        
        // Check if absent without clock-in (this is what we're testing)
        if (attendance.status === 'absent' && !attendance.clockIn) {
          console.log(`      ✅ CORRECTLY marked absent (no clock-in)`);
        } else if (!attendance.clockIn && attendance.status !== 'absent') {
          console.log(`      ❌ NOT marked absent despite no clock-in (Status: ${attendance.status})`);
        }
      } else {
        console.log(`      ❌ No attendance record found`);
      }
      console.log('');
    }

    // Check attendance records for today
    console.log(`\n📊 Attendance Records for Today (${todayStr}):`);
    
    for (const employee of employees) {
      const attendance = await AttendanceRecord.findOne({
        where: { 
          employeeId: employee.id, 
          date: todayStr 
        }
      });

      console.log(`   ${employee.employeeId}: ${employee.firstName} ${employee.lastName}`);
      
      if (attendance) {
        console.log(`      Status: ${attendance.status}`);
        console.log(`      Clock In: ${attendance.clockIn || 'None'}`);
        console.log(`      Clock Out: ${attendance.clockOut || 'None'}`);
        console.log(`      Reason: ${attendance.statusReason || 'N/A'}`);
      } else {
        console.log(`      ❌ No attendance record found for today`);
      }
      console.log('');
    }

    // Summary statistics
    const yesterdayRecords = await AttendanceRecord.findAll({
      where: { date: yesterdayStr }
    });

    const todayRecords = await AttendanceRecord.findAll({
      where: { date: todayStr }
    });

    console.log(`\n📈 Summary Statistics:`);
    console.log(`   Yesterday (${yesterdayStr}):`);
    console.log(`      - Total Records: ${yesterdayRecords.length}`);
    console.log(`      - Present: ${yesterdayRecords.filter(r => r.status === 'present').length}`);
    console.log(`      - Absent: ${yesterdayRecords.filter(r => r.status === 'absent').length}`);
    console.log(`      - Half Day: ${yesterdayRecords.filter(r => r.status === 'half_day').length}`);
    console.log(`      - Leave: ${yesterdayRecords.filter(r => r.status === 'leave').length}`);
    console.log(`      - Incomplete: ${yesterdayRecords.filter(r => r.status === 'incomplete').length}`);
    
    console.log(`   Today (${todayStr}):`);
    console.log(`      - Total Records: ${todayRecords.length}`);
    console.log(`      - Present: ${todayRecords.filter(r => r.status === 'present').length}`);
    console.log(`      - Absent: ${todayRecords.filter(r => r.status === 'absent').length}`);
    console.log(`      - Half Day: ${todayRecords.filter(r => r.status === 'half_day').length}`);
    console.log(`      - Leave: ${todayRecords.filter(r => r.status === 'leave').length}`);
    console.log(`      - Incomplete: ${todayRecords.filter(r => r.status === 'incomplete').length}`);

    // Check for employees without any attendance records
    const employeesWithoutYesterdayRecord = [];
    const employeesWithoutTodayRecord = [];

    for (const employee of employees) {
      const yesterdayRecord = yesterdayRecords.find(r => r.employeeId === employee.id);
      const todayRecord = todayRecords.find(r => r.employeeId === employee.id);
      
      if (!yesterdayRecord) {
        employeesWithoutYesterdayRecord.push(employee);
      }
      
      if (!todayRecord) {
        employeesWithoutTodayRecord.push(employee);
      }
    }

    console.log(`\n🚨 Employees Without Attendance Records:`);
    console.log(`   Yesterday: ${employeesWithoutYesterdayRecord.length} employees`);
    employeesWithoutYesterdayRecord.forEach(emp => {
      console.log(`      - ${emp.employeeId}: ${emp.firstName} ${emp.lastName}`);
    });
    
    console.log(`   Today: ${employeesWithoutTodayRecord.length} employees`);
    employeesWithoutTodayRecord.forEach(emp => {
      console.log(`      - ${emp.employeeId}: ${emp.firstName} ${emp.lastName}`);
    });

    console.log(`\n✅ Data check completed successfully`);

  } catch (error) {
    console.error('❌ Error checking attendance data:', error);
  }
}

// Run the check
checkAttendanceData();