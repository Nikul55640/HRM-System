/**
 * Debug script to test the exact leave query used in employee calendar
 */

import { 
  LeaveRequest, 
  Employee
} from './src/models/sequelize/index.js';
import { Op } from 'sequelize';

const debugLeaveQuery = async () => {
  try {
    console.log('🔍 Debugging leave query for Employee Calendar...');

    // Test the exact query used in the employee calendar for January 12, 2026
    const testDate = new Date('2026-01-12');
    const start = new Date(testDate.setHours(0, 0, 0, 0));
    const end = new Date(testDate.setHours(23, 59, 59, 999));

    console.log(`\n📅 Testing date range: ${start.toISOString()} to ${end.toISOString()}`);

    // This is the EXACT query from the employee calendar controller
    const allLeaves = await LeaveRequest.findAll({
      where: {
        status: "approved",
        startDate: { [Op.lte]: end },
        endDate: { [Op.gte]: start }
      },
      include: [{
        model: Employee,
        as: 'employee',
        attributes: ['firstName', 'lastName', 'employeeId']
      }]
    });

    console.log(`\n✅ Found ${allLeaves.length} approved leaves for Jan 12, 2026:`);
    allLeaves.forEach(leave => {
      console.log(`   - ${leave.employee?.firstName} ${leave.employee?.lastName}: ${leave.leaveType}`);
      console.log(`     Start: ${leave.startDate}, End: ${leave.endDate}`);
      console.log(`     Status: ${leave.status}`);
    });

    // Also test February 4, 2026
    const testDate2 = new Date('2026-02-04');
    const start2 = new Date(testDate2.setHours(0, 0, 0, 0));
    const end2 = new Date(testDate2.setHours(23, 59, 59, 999));

    console.log(`\n📅 Testing date range: ${start2.toISOString()} to ${end2.toISOString()}`);

    const allLeaves2 = await LeaveRequest.findAll({
      where: {
        status: "approved",
        startDate: { [Op.lte]: end2 },
        endDate: { [Op.gte]: start2 }
      },
      include: [{
        model: Employee,
        as: 'employee',
        attributes: ['firstName', 'lastName', 'employeeId']
      }]
    });

    console.log(`\n✅ Found ${allLeaves2.length} approved leaves for Feb 4, 2026:`);
    allLeaves2.forEach(leave => {
      console.log(`   - ${leave.employee?.firstName} ${leave.employee?.lastName}: ${leave.leaveType}`);
      console.log(`     Start: ${leave.startDate}, End: ${leave.endDate}`);
      console.log(`     Status: ${leave.status}`);
    });

    // Let's also check ALL approved leaves to see what we have
    console.log('\n📋 ALL approved leaves in database:');
    const allApprovedLeaves = await LeaveRequest.findAll({
      where: {
        status: "approved"
      },
      include: [{
        model: Employee,
        as: 'employee',
        attributes: ['firstName', 'lastName', 'employeeId']
      }],
      order: [['startDate', 'ASC']]
    });

    console.log(`Found ${allApprovedLeaves.length} total approved leaves:`);
    allApprovedLeaves.forEach(leave => {
      console.log(`   - ${leave.employee?.firstName} ${leave.employee?.lastName}: ${leave.leaveType}`);
      console.log(`     Start: ${leave.startDate}, End: ${leave.endDate}`);
      console.log(`     Status: ${leave.status}`);
    });

    // Check if there's an issue with the Employee association
    console.log('\n🔗 Testing Employee association...');
    const leaveWithEmployee = await LeaveRequest.findOne({
      where: { status: "approved" },
      include: [{
        model: Employee,
        as: 'employee'
      }]
    });

    if (leaveWithEmployee) {
      console.log('✅ Employee association works:');
      console.log(`   Leave ID: ${leaveWithEmployee.id}`);
      console.log(`   Employee: ${leaveWithEmployee.employee?.firstName} ${leaveWithEmployee.employee?.lastName}`);
    } else {
      console.log('❌ No approved leaves found or Employee association issue');
    }

  } catch (error) {
    console.error('❌ Debug failed:', error.message);
    console.error(error);
  }
};

// Run the debug
debugLeaveQuery().then(() => {
  process.exit(0);
}).catch(error => {
  console.error('Script failed:', error);
  process.exit(1);
});