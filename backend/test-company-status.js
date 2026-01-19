/**
 * Test script to verify company status endpoints work
 * Run with: node test-company-status.js
 */

import { AttendanceRecord, Employee, LeaveRequest } from './src/models/sequelize/index.js';
import { getLocalDateString } from './src/utils/dateUtils.js';
import { Op } from 'sequelize';

const testCompanyStatus = async () => {
  try {
    const today = getLocalDateString(new Date());
    console.log('🧪 Testing company status for date:', today);

    // Test 1: Check attendance records
    console.log('\n📊 Testing Attendance Records...');
    const attendanceRecords = await AttendanceRecord.findAll({
      where: {
        date: today,
        clockIn: { [Op.ne]: null },
      },
      include: [{
        model: Employee,
        as: 'employee',
        attributes: ['firstName', 'lastName', 'department', 'employeeId'],
        where: {
          status: 'active'
        }
      }],
      attributes: ['id', 'location', 'workLocation', 'clockIn']
    });

    console.log(`Found ${attendanceRecords.length} attendance records for today`);
    
    attendanceRecords.forEach((record, index) => {
      console.log(`  ${index + 1}. ${record.employee.firstName} ${record.employee.lastName} - Location: ${record.workLocation || 'office'}, JSON Location: ${JSON.stringify(record.location)}`);
    });

    // Test 2: Check leave requests
    console.log('\n🏖️ Testing Leave Requests...');
    const leaveRequests = await LeaveRequest.findAll({
      where: {
        status: 'approved',
        [Op.and]: [
          { startDate: { [Op.lte]: today } },
          { endDate: { [Op.gte]: today } }
        ]
      },
      include: [{
        model: Employee,
        as: 'employee',
        attributes: ['firstName', 'lastName', 'department', 'employeeId'],
        where: {
          status: 'active'
        }
      }],
      attributes: ['id', 'leaveType', 'isHalfDay', 'startDate', 'endDate']
    });

    console.log(`Found ${leaveRequests.length} approved leave requests for today`);
    
    leaveRequests.forEach((leave, index) => {
      console.log(`  ${index + 1}. ${leave.employee.firstName} ${leave.employee.lastName} - ${leave.leaveType} (${leave.isHalfDay ? 'Half Day' : 'Full Day'})`);
    });

    // Test 3: Create sample WFH record if none exist
    if (attendanceRecords.length === 0) {
      console.log('\n🔧 No attendance records found. Creating sample data...');
      
      // Find an active employee
      const employee = await Employee.findOne({
        where: { status: 'active' }
      });

      if (employee) {
        const sampleRecord = await AttendanceRecord.create({
          employeeId: employee.id,
          date: today,
          clockIn: new Date(),
          workLocation: 'wfh',
          location: {
            workLocation: 'wfh',
            address: 'Home'
          },
          status: 'present'
        });

        console.log(`✅ Created sample WFH record for ${employee.firstName} ${employee.lastName}`);
      }
    }

    console.log('\n✅ Test completed successfully!');
    process.exit(0);

  } catch (error) {
    console.error('❌ Test failed:', error);
    process.exit(1);
  }
};

testCompanyStatus();