/**
 * Debug Absent Marking Issue
 * 
 * This script investigates why absent records are not being created
 * during attendance finalization.
 */

import { AttendanceRecord, Employee, EmployeeShift, Shift, Holiday, WorkingRule, LeaveRequest } from './src/models/index.js';
import { finalizeDailyAttendance } from './src/jobs/attendanceFinalization.js';
import { getLocalDateString } from './src/utils/dateUtils.js';
import { Op } from 'sequelize';

async function debugAbsentMarking() {
  console.log('🔍 DEBUGGING ABSENT MARKING ISSUE');
  console.log('=====================================\n');

  try {
    const testDate = getLocalDateString(new Date());
    console.log(`📅 Test Date: ${testDate}\n`);

    // Step 1: Check if today is a working day
    console.log('1️⃣ Checking if today is a working day...');
    const isHoliday = await Holiday.isHoliday(testDate);
    const isWorkingDay = await WorkingRule.isWorkingDay(testDate);
    
    console.log(`   Holiday: ${isHoliday}`);
    console.log(`   Working Day: ${isWorkingDay}`);
    
    if (isHoliday) {
      console.log('❌ Today is a holiday - finalization will be skipped');
      return;
    }
    
    if (!isWorkingDay) {
      console.log('❌ Today is not a working day - finalization will be skipped');
      return;
    }
    
    console.log('✅ Today is a valid working day\n');

    // Step 2: Get all active employees
    console.log('2️⃣ Getting active employees...');
    const employees = await Employee.findAll({
      where: { 
        isActive: true,
        status: 'Active'
      },
      limit: 5 // Limit for debugging
    });
    
    console.log(`   Found ${employees.length} active employees\n`);

    // Step 3: Check each employee's situation
    for (const employee of employees) {
      console.log(`👤 Employee ID: ${employee.id} (${employee.firstName} ${employee.lastName})`);
      
      // Check shift assignment
      const employeeShift = await EmployeeShift.findOne({
        where: {
          employeeId: employee.id,
          isActive: true,
          effectiveDate: { [Op.lte]: testDate },
          [Op.or]: [
            { endDate: null },
            { endDate: { [Op.gte]: testDate } }
          ]
        },
        include: [
          {
            model: Shift,
            attributes: ['id', 'shiftStartTime', 'shiftEndTime', 'fullDayHours', 'halfDayHours']
          }
        ]
      });

      if (!employeeShift) {
        console.log('   ❌ No active shift assignment found');
        console.log('   🔍 This employee will be SKIPPED during finalization\n');
        continue;
      }

      const shift = employeeShift.Shift;
      console.log(`   ✅ Shift: ${shift.shiftStartTime} - ${shift.shiftEndTime}`);

      // Check if shift has ended
      const now = new Date();
      const [hours, minutes] = shift.shiftEndTime.split(':').map(Number);
      const shiftEndDateTime = new Date();
      shiftEndDateTime.setHours(hours, minutes, 0, 0);
      shiftEndDateTime.setMinutes(shiftEndDateTime.getMinutes() + 30); // 30-min buffer

      const shiftEnded = now >= shiftEndDateTime;
      console.log(`   ⏰ Current time: ${now.toLocaleTimeString()}`);
      console.log(`   ⏰ Shift end + buffer: ${shiftEndDateTime.toLocaleTimeString()}`);
      console.log(`   ${shiftEnded ? '✅' : '❌'} Shift ended: ${shiftEnded}`);

      if (!shiftEnded) {
        console.log('   🔍 This employee will be SKIPPED (shift not ended)\n');
        continue;
      }

      // Check existing attendance record
      const record = await AttendanceRecord.findOne({
        where: { 
          employeeId: employee.id, 
          date: testDate 
        }
      });

      if (record) {
        console.log(`   📋 Existing record: Status = ${record.status}`);
        if (record.status !== 'incomplete') {
          console.log('   🔍 Already finalized - will be SKIPPED\n');
          continue;
        }
        console.log(`   ⏳ Record is incomplete - will be processed`);
        console.log(`   🕐 Clock In: ${record.clockIn || 'None'}`);
        console.log(`   🕐 Clock Out: ${record.clockOut || 'None'}`);
      } else {
        console.log('   📋 No attendance record found');
      }

      // Check if on approved leave
      const leaveRequest = await LeaveRequest.findOne({
        where: {
          employeeId: employee.id,
          status: 'approved',
          startDate: { [Op.lte]: testDate },
          endDate: { [Op.gte]: testDate }
        }
      });

      if (leaveRequest) {
        console.log('   🏖️ Employee is on approved leave - will be SKIPPED');
        console.log(`   📅 Leave: ${leaveRequest.startDate} to ${leaveRequest.endDate}\n`);
        continue;
      }

      // Predict what will happen
      if (!record) {
        console.log('   🎯 PREDICTION: Will create ABSENT record');
      } else if (record.clockIn && !record.clockOut) {
        console.log('   🎯 PREDICTION: Will mark as PENDING_CORRECTION');
      } else if (!record.clockIn) {
        console.log('   🎯 PREDICTION: Will mark as ABSENT');
      } else {
        console.log('   🎯 PREDICTION: Will calculate final status');
      }

      console.log('');
    }

    // Step 4: Run actual finalization
    console.log('4️⃣ Running actual finalization...');
    const result = await finalizeDailyAttendance();
    
    console.log('📊 Finalization Results:');
    console.log(`   Processed: ${result.processed}`);
    console.log(`   Skipped: ${result.skipped}`);
    console.log(`   Present: ${result.present}`);
    console.log(`   Half Day: ${result.halfDay}`);
    console.log(`   Absent: ${result.absent}`);
    console.log(`   Leave: ${result.leave}`);
    console.log(`   Pending Correction: ${result.pendingCorrection}`);
    console.log(`   Errors: ${result.errors}`);

    // Step 5: Check what records were actually created/updated
    console.log('\n5️⃣ Checking final attendance records...');
    const finalRecords = await AttendanceRecord.findAll({
      where: { date: testDate },
      include: [
        {
          model: Employee,
          attributes: ['id', 'firstName', 'lastName']
        }
      ]
    });

    console.log(`\n📋 Final Records for ${testDate}:`);
    for (const record of finalRecords) {
      console.log(`   ${record.Employee.firstName} ${record.Employee.lastName}: ${record.status} (${record.statusReason || 'No reason'})`);
    }

    // Step 6: Identify potential issues
    console.log('\n6️⃣ Issue Analysis:');
    
    if (result.absent === 0) {
      console.log('❌ NO ABSENT RECORDS CREATED');
      console.log('   Possible causes:');
      console.log('   • All employees have shift assignments that haven\'t ended yet');
      console.log('   • All employees already have attendance records');
      console.log('   • All employees are on approved leave');
      console.log('   • Shift end buffer (30 minutes) is preventing marking');
    } else {
      console.log(`✅ ${result.absent} absent records created successfully`);
    }

    if (result.skipped > result.processed) {
      console.log('⚠️  More employees skipped than processed');
      console.log('   This suggests shift timing or assignment issues');
    }

  } catch (error) {
    console.error('❌ Debug failed:', error);
  }
}

// Run the debug
debugAbsentMarking();