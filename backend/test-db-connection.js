// Simple database connection test
import { connectDB } from './src/config/sequelize.js';
import { AttendanceRecord, Holiday, WorkingRule, Employee } from './src/models/index.js';
import { Op } from 'sequelize';

async function testConnection() {
  try {
    console.log('=== TESTING DATABASE CONNECTION ===\n');
    
    // Test connection
    await connectDB();
    console.log('✅ Database connection successful!\n');
    
    // Test queries
    console.log('1. WORKING RULES CHECK:');
    const workingRules = await WorkingRule.findAll({
      where: { isActive: true },
      order: [['effectiveFrom', 'DESC']]
    });
    
    if (workingRules.length === 0) {
      console.log('   ❌ NO ACTIVE WORKING RULES FOUND!');
    } else {
      workingRules.forEach(rule => {
        console.log(`   Rule: ${rule.ruleName}`);
        console.log(`   Working Days: ${rule.workingDays}`);
        console.log(`   Weekend Days: ${rule.weekendDays}`);
        console.log(`   Effective: ${rule.effectiveFrom} to ${rule.effectiveTo || 'ongoing'}`);
        console.log('');
      });
    }
    
    console.log('2. ACTIVE EMPLOYEES CHECK:');
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
    
    console.log('\n3. ATTENDANCE RECORDS CHECK FOR JAN 30, 2026:');
    const attendanceRecords = await AttendanceRecord.findAll({
      where: {
        date: '2026-01-30'
      }
    });
    
    if (attendanceRecords.length === 0) {
      console.log('   ❌ NO ATTENDANCE RECORDS FOUND for January 30, 2026!');
      console.log('   This confirms the issue - Friday should have attendance records.');
    } else {
      console.log(`   Found ${attendanceRecords.length} attendance records:`);
      attendanceRecords.forEach(record => {
        console.log(`   ${record.date}: Employee ID ${record.employeeId} - Status: ${record.status}`);
      });
    }
    
    console.log('\n=== CONNECTION TEST COMPLETE ===');
    
  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
  } finally {
    process.exit(0);
  }
}

testConnection();