// Debug script to check why Jan 30, 31, and Feb 1 are not showing attendance data
import dotenv from 'dotenv';
import { AttendanceRecord, Holiday, WorkingRule, Employee } from './backend/src/models/index.js';
import { Op } from 'sequelize';

// Load environment variables from backend/.env
dotenv.config({ path: './backend/.env' });

async function debugDates() {
  try {
    console.log('=== DEBUGGING ATTENDANCE DATES ===\n');
    
    const dates = ['2026-01-30', '2026-01-31', '2026-02-01'];
    const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    
    // Check day of week for each date
    console.log('1. DAY OF WEEK CHECK:');
    dates.forEach(dateStr => {
      const date = new Date(dateStr);
      const dayOfWeek = date.getDay();
      console.log(`   ${dateStr}: ${dayNames[dayOfWeek]} (Day index: ${dayOfWeek})`);
    });
    console.log('');
    
    // Check working rules
    console.log('2. WORKING RULES CHECK:');
    const workingRules = await WorkingRule.findAll({
      where: { isActive: true },
      order: [['effectiveFrom', 'DESC']]
    });
    
    if (workingRules.length === 0) {
      console.log('   ❌ NO ACTIVE WORKING RULES FOUND!');
    } else {
      workingRules.forEach(rule => {
        console.log(`   Rule: ${rule.ruleName}`);
        console.log(`   Working Days: ${rule.workingDays} (${rule.workingDays.map(d => dayNames[d]).join(', ')})`);
        console.log(`   Weekend Days: ${rule.weekendDays} (${rule.weekendDays.map(d => dayNames[d]).join(', ')})`);
        console.log(`   Effective: ${rule.effectiveFrom} to ${rule.effectiveTo || 'ongoing'}`);
        console.log(`   Default: ${rule.isDefault}, Active: ${rule.isActive}`);
        console.log('');
      });
    }
    
    // Check holidays
    console.log('3. HOLIDAY CHECK:');
    const holidays = await Holiday.findAll({
      where: {
        date: { [Op.in]: dates },
        isActive: true
      }
    });
    
    if (holidays.length === 0) {
      console.log('   ✅ No holidays found for these dates');
    } else {
      holidays.forEach(holiday => {
        console.log(`   ${holiday.date}: ${holiday.name} (${holiday.type})`);
      });
    }
    console.log('');
    
    // Check attendance records
    console.log('4. ATTENDANCE RECORDS CHECK:');
    const attendanceRecords = await AttendanceRecord.findAll({
      where: {
        date: { [Op.in]: dates }
      },
      include: [{
        model: Employee,
        as: 'employee',
        attributes: ['firstName', 'lastName', 'employeeId']
      }],
      order: [['date', 'ASC'], ['employeeId', 'ASC']]
    });
    
    if (attendanceRecords.length === 0) {
      console.log('   ❌ NO ATTENDANCE RECORDS FOUND for these dates!');
    } else {
      console.log(`   Found ${attendanceRecords.length} attendance records:`);
      attendanceRecords.forEach(record => {
        const employeeName = record.employee ? 
          `${record.employee.firstName} ${record.employee.lastName} (${record.employee.employeeId})` : 
          `Employee ID: ${record.employeeId}`;
        console.log(`   ${record.date}: ${employeeName} - Status: ${record.status}`);
      });
    }
    console.log('');
    
    // Check if working day logic works
    console.log('5. WORKING DAY LOGIC TEST:');
    for (const dateStr of dates) {
      const date = new Date(dateStr);
      const dayOfWeek = date.getDay();
      
      // Test with default working rule logic
      const isWorkingDayDefault = [1, 2, 3, 4, 5].includes(dayOfWeek); // Mon-Fri
      const isWeekendDefault = [0, 6].includes(dayOfWeek); // Sun, Sat
      
      console.log(`   ${dateStr} (${dayNames[dayOfWeek]}):`);
      console.log(`     Default logic: Working=${isWorkingDayDefault}, Weekend=${isWeekendDefault}`);
      
      // Test with actual working rule
      try {
        const isWorkingDay = await WorkingRule.isWorkingDay(dateStr);
        const isWeekend = await WorkingRule.isWeekend(dateStr);
        console.log(`     Rule logic: Working=${isWorkingDay}, Weekend=${isWeekend}`);
      } catch (error) {
        console.log(`     Rule logic: ERROR - ${error.message}`);
      }
    }
    console.log('');
    
    // Check active employees
    console.log('6. ACTIVE EMPLOYEES CHECK:');
    const activeEmployees = await Employee.findAll({
      where: { 
        isActive: true,
        status: 'Active'
      },
      attributes: ['id', 'firstName', 'lastName', 'employeeId']
    });
    
    console.log(`   Found ${activeEmployees.length} active employees`);
    if (activeEmployees.length > 0) {
      console.log('   Sample employees:');
      activeEmployees.slice(0, 3).forEach(emp => {
        console.log(`     ${emp.firstName} ${emp.lastName} (${emp.employeeId})`);
      });
    }
    
    console.log('\n=== ANALYSIS ===');
    console.log('Based on the checks above:');
    console.log('- Jan 30 (Friday): Should have attendance records if it\'s a working day');
    console.log('- Jan 31 (Saturday): Should NOT have records if it\'s a weekend');
    console.log('- Feb 1 (Sunday): Should NOT have records if it\'s a weekend');
    console.log('\nIf Jan 30 is missing records but should be a working day, check:');
    console.log('1. Are there active employees?');
    console.log('2. Is the attendance finalization job running?');
    console.log('3. Are working rules configured correctly?');
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    process.exit(0);
  }
}

debugDates();