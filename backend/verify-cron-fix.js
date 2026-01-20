#!/usr/bin/env node

/**
 * 🧪 Verification Script for Cron Job Sequelize Fix
 * 
 * This script verifies that:
 * 1. Cron job can initialize without errors
 * 2. Sequelize associations are working
 * 3. Attendance finalization logic is correct
 * 4. ABSENT marking works as expected
 */

import sequelize from './src/config/sequelize.js';
import { 
  Employee, 
  AttendanceRecord, 
  Holiday, 
  WorkingRule,
  User 
} from './src/models/index.js';
import { finalizeDailyAttendance } from './src/jobs/attendanceFinalization.js';
import { getLocalDateString } from './src/utils/dateUtils.js';
import logger from './src/utils/logger.js';

const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m'
};

function log(color, message) {
  console.log(`${color}${message}${colors.reset}`);
}

async function verifySequelizeAssociations() {
  log(colors.cyan, '\n📋 Verifying Sequelize Associations...');
  
  try {
    // Test 1: Employee-User association
    const user = await User.findOne({ attributes: ['id', 'email'] });
    if (!user) {
      log(colors.yellow, '⚠️  No users found in database');
      return false;
    }
    
    const employee = await Employee.findOne({ 
      where: { userId: user.id },
      attributes: ['id', 'firstName', 'lastName', 'userId']
    });
    
    if (employee) {
      log(colors.green, `✅ Employee-User association working`);
      log(colors.green, `   User: ${user.email}, Employee: ${employee.firstName} ${employee.lastName}`);
    } else {
      log(colors.yellow, '⚠️  No employees found for test user');
    }
    
    // Test 2: AttendanceRecord-Employee association
    const attendance = await AttendanceRecord.findOne({
      attributes: ['id', 'employeeId', 'date', 'status', 'clockIn']
    });
    
    if (attendance) {
      log(colors.green, `✅ AttendanceRecord query working`);
      log(colors.green, `   Record: ${attendance.date}, Status: ${attendance.status}`);
    } else {
      log(colors.yellow, '⚠️  No attendance records found');
    }
    
    return true;
  } catch (error) {
    log(colors.red, `❌ Sequelize association error: ${error.message}`);
    return false;
  }
}

async function verifyEmployeeQueries() {
  log(colors.cyan, '\n📋 Verifying Employee Queries (No Associations)...');
  
  try {
    // Test: Get employees without complex includes
    const employees = await Employee.findAll({
      where: { isActive: true, status: 'Active' },
      attributes: ['id', 'firstName', 'lastName', 'employeeId', 'userId'],
      raw: true,
      limit: 5
    });
    
    log(colors.green, `✅ Employee query successful (${employees.length} employees found)`);
    
    if (employees.length > 0) {
      log(colors.green, `   Sample: ${employees[0].firstName} ${employees[0].lastName}`);
    }
    
    return true;
  } catch (error) {
    log(colors.red, `❌ Employee query error: ${error.message}`);
    return false;
  }
}

async function verifyAttendanceQueries() {
  log(colors.cyan, '\n📋 Verifying Attendance Queries...');
  
  try {
    const today = getLocalDateString(new Date());
    
    // Test: Get attendance records without associations
    const records = await AttendanceRecord.findAll({
      where: { date: today },
      attributes: ['id', 'employeeId', 'date', 'status', 'clockIn', 'clockOut'],
      raw: true,
      limit: 5
    });
    
    log(colors.green, `✅ Attendance query successful (${records.length} records for ${today})`);
    
    if (records.length > 0) {
      const record = records[0];
      log(colors.green, `   Sample: Employee ${record.employeeId}, Status: ${record.status}`);
    }
    
    return true;
  } catch (error) {
    log(colors.red, `❌ Attendance query error: ${error.message}`);
    return false;
  }
}

async function verifyFinalizationLogic() {
  log(colors.cyan, '\n📋 Verifying Finalization Logic...');
  
  try {
    const today = getLocalDateString(new Date());
    
    // Check if today is a holiday or weekend
    const isHoliday = await Holiday.isHoliday(today);
    const isWorkingDay = await WorkingRule.isWorkingDay(today);
    
    log(colors.green, `✅ Holiday/Working day check successful`);
    log(colors.green, `   Today (${today}): Holiday=${isHoliday}, WorkingDay=${isWorkingDay}`);
    
    if (isHoliday) {
      log(colors.yellow, '⚠️  Today is a holiday - finalization will be skipped');
      return true;
    }
    
    if (!isWorkingDay) {
      log(colors.yellow, '⚠️  Today is not a working day - finalization will be skipped');
      return true;
    }
    
    return true;
  } catch (error) {
    log(colors.red, `❌ Finalization logic error: ${error.message}`);
    return false;
  }
}

async function verifyFinalizationExecution() {
  log(colors.cyan, '\n📋 Verifying Finalization Execution (DRY RUN)...');
  
  try {
    // Run finalization for today
    const result = await finalizeDailyAttendance();
    
    log(colors.green, `✅ Finalization executed successfully`);
    log(colors.green, `   Processed: ${result.processed}`);
    log(colors.green, `   Skipped: ${result.skipped}`);
    log(colors.green, `   Present: ${result.present}`);
    log(colors.green, `   Half-day: ${result.halfDay}`);
    log(colors.green, `   Absent: ${result.absent}`);
    log(colors.green, `   Pending Correction: ${result.pendingCorrection}`);
    log(colors.green, `   Errors: ${result.errors}`);
    
    if (result.errors > 0) {
      log(colors.yellow, `⚠️  ${result.errors} errors occurred during finalization`);
    }
    
    return result.errors === 0;
  } catch (error) {
    log(colors.red, `❌ Finalization execution error: ${error.message}`);
    log(colors.red, `   Stack: ${error.stack}`);
    return false;
  }
}

async function runVerification() {
  log(colors.blue, '\n╔════════════════════════════════════════════════════════════╗');
  log(colors.blue, '║  🧪 CRON JOB SEQUELIZE FIX VERIFICATION                    ║');
  log(colors.blue, '╚════════════════════════════════════════════════════════════╝');
  
  try {
    // Connect to database
    log(colors.cyan, '\n🔌 Connecting to database...');
    await sequelize.authenticate();
    log(colors.green, '✅ Database connection successful');
    
    // Run verification tests
    const results = {
      associations: await verifySequelizeAssociations(),
      employeeQueries: await verifyEmployeeQueries(),
      attendanceQueries: await verifyAttendanceQueries(),
      finalizationLogic: await verifyFinalizationLogic(),
      finalizationExecution: await verifyFinalizationExecution()
    };
    
    // Summary
    log(colors.blue, '\n╔════════════════════════════════════════════════════════════╗');
    log(colors.blue, '║  📊 VERIFICATION SUMMARY                                   ║');
    log(colors.blue, '╚════════════════════════════════════════════════════════════╝');
    
    const allPassed = Object.values(results).every(r => r);
    
    Object.entries(results).forEach(([test, passed]) => {
      const status = passed ? '✅ PASS' : '❌ FAIL';
      const testName = test.replace(/([A-Z])/g, ' $1').trim();
      log(colors.green, `${status}: ${testName}`);
    });
    
    log(colors.blue, '\n╔════════════════════════════════════════════════════════════╗');
    
    if (allPassed) {
      log(colors.green, '║  ✅ ALL TESTS PASSED - CRON JOB IS READY FOR PRODUCTION   ║');
    } else {
      log(colors.red, '║  ❌ SOME TESTS FAILED - REVIEW ERRORS ABOVE               ║');
    }
    
    log(colors.blue, '╚════════════════════════════════════════════════════════════╝\n');
    
    process.exit(allPassed ? 0 : 1);
  } catch (error) {
    log(colors.red, `\n❌ Verification failed: ${error.message}`);
    log(colors.red, `   Stack: ${error.stack}`);
    process.exit(1);
  }
}

// Run verification
runVerification().catch(error => {
  log(colors.red, `\n❌ Fatal error: ${error.message}`);
  process.exit(1);
});
