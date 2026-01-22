/**
 * Analyze Attendance Data for 2026-01-21
 * 
 * This script examines the specific date to understand why absent records
 * are not being created during finalization.
 */

import { AttendanceRecord, Employee, EmployeeShift, Shift, Holiday, WorkingRule, LeaveRequest } from './src/models/index.js';
import { finalizeDailyAttendance } from './src/jobs/attendanceFinalization.js';
import { Op } from 'sequelize';

const TARGET_DATE = '2026-01-21';

async function analyzeDate() {
  console.log('🔍 ANALYZING ATTENDANCE DATA FOR 2026-01-21');
  console.log('==============================================\n');

  try {
    // Step 1: Check if date is valid for processing
    console.log('1️⃣ Checking date validity...');
    const isHoliday = await Holiday.isHoliday(TARGET_DATE);
    const isWorkingDay = await WorkingRule.isWorkingDay(TARGET_DATE);
    
    console.log(`   📅 Date: ${TARGET_DATE}`);
    console.log(`   🏖️ Holiday: ${isHoliday}`);
    console.log(`   💼 Working Day: ${isWorkingDay}`);
    
    if (isHoliday) {
      console.log('❌ This date is a holiday - finalization would be skipped');
      return;
    }
    
    if (!isWorkingDay) {
      console.log('❌ This date is not a working day - finalization would be skipped');
      return;
    }
    
    console.log('✅ Date is valid for attendance processing\n');

    // Step 2: Get all active employees
    console.log('2️⃣ Getting active employees...');
    const employees = await Employee.findAll({
      where: { 
        isActive: true,
        status: 'Active'
      }
    });
    
    console.log(`   Found ${employees.length} active employees\n`);

    // Step 3: Check existing attendance records for this date
    console.log('3️⃣ Checking existing attendance records...');
    const existingRecords = await AttendanceRecord.findAll({
      where: { date: TARGET_DATE },
      include: [
        {
          model: Employee,
          as: 'employee',
          attributes: ['id', 'firstName', 'lastName']
        }
      ]
    });

    console.log(`   Found ${existingRecords.length} existing attendance records:`);
    for (const record of existingRecords) {
      console.log(`   • ${record.employee.firstName} ${record.employee.lastName}: ${record.status} (Clock-in: ${record.clockIn ? 'Yes' : 'No'}, Clock-out: ${record.clockOut ? 'Yes' : 'No'})`);
    }
    console.log('');

    // Step 4: Analyze each employee's situation
    console.log('4️⃣ Analyzing each employee...');
    let eligibleForAbsent = 0;
    let skippedReasons = {
      noShift: 0,
      shiftNotEnded: 0,
      alreadyFinalized: 0,
      onLeave: 0,
      hasRecord: 0
    };

    for (const employee of employees) {
      console.log(`\n👤 Employee: ${employee.firstName} ${employee.lastName} (ID: ${employee.id})`);
      
      // Check shift assignment
      const employeeShift = await EmployeeShift.findOne({
        where: {
          employeeId: employee.id,
          isActive: true,
          effectiveDate: { [Op.lte]: TARGET_DATE },
          [Op.or]: [
            { endDate: null },
            { endDate: { [Op.gte]: TARGET_DATE } }
          ]
        },
        include: [
          {
            model: Shift,
            as: 'shift',
            attributes: ['id', 'shiftStartTime', 'shiftEndTime', 'fullDayHours', 'halfDayHours']
          }
        ]
      });

      if (!employeeShift) {
        console.log('   ❌ No active shift assignment');
        skippedReasons.noShift++;
        continue;
      }

      const shift = employeeShift.shift;
      console.log(`   ✅ Shift: ${shift.shiftStartTime} - ${shift.shiftEndTime}`);

      // For past dates, shift has definitely ended
      console.log('   ✅ Shift has ended (past date)');

      // Check existing attendance record
      const record = existingRecords.find(r => r.employeeId === employee.id);
      
      if (record) {
        console.log(`   📋 Has attendance record: ${record.status}`);
        if (record.status !== 'incomplete') {
          console.log('   ⏭️ Already finalized - would be skipped');
          skippedReasons.alreadyFinalized++;
          continue;
        } else {
          console.log('   ⏳ Record is incomplete - would be processed');
          skippedReasons.hasRecord++;
          continue;
        }
      } else {
        console.log('   📋 No attendance record found');
      }

      // Check if on approved leave
      const leaveRequest = await LeaveRequest.findOne({
        where: {
          employeeId: employee.id,
          status: 'approved',
          startDate: { [Op.lte]: TARGET_DATE },
          endDate: { [Op.gte]: TARGET_DATE }
        }
      });

      if (leaveRequest) {
        console.log('   🏖️ On approved leave - would be skipped');
        console.log(`   📅 Leave: ${leaveRequest.startDate} to ${leaveRequest.endDate}`);
        skippedReasons.onLeave++;
        continue;
      }

      // This employee would be marked absent
      console.log('   🎯 ELIGIBLE FOR ABSENT MARKING');
      eligibleForAbsent++;
    }

    // Step 5: Summary
    console.log('\n5️⃣ Analysis Summary:');
    console.log('===================');
    console.log(`Total Active Employees: ${employees.length}`);
    console.log(`Existing Records: ${existingRecords.length}`);
    console.log(`Eligible for Absent: ${eligibleForAbsent}`);
    console.log('\nSkipped Reasons:');
    console.log(`• No Shift Assignment: ${skippedReasons.noShift}`);
    console.log(`• Shift Not Ended: ${skippedReasons.shiftNotEnded}`);
    console.log(`• Already Finalized: ${skippedReasons.alreadyFinalized}`);
    console.log(`• On Leave: ${skippedReasons.onLeave}`);
    console.log(`• Has Incomplete Record: ${skippedReasons.hasRecord}`);

    // Step 6: Run actual finalization for this date
    console.log('\n6️⃣ Running finalization for this date...');
    const result = await finalizeDailyAttendance(new Date(TARGET_DATE));
    
    console.log('\n📊 Finalization Results:');
    console.log(`   Processed: ${result.processed}`);
    console.log(`   Skipped: ${result.skipped}`);
    console.log(`   Present: ${result.present}`);
    console.log(`   Half Day: ${result.halfDay}`);
    console.log(`   Absent: ${result.absent}`);
    console.log(`   Leave: ${result.leave}`);
    console.log(`   Pending Correction: ${result.pendingCorrection}`);
    console.log(`   Errors: ${result.errors}`);

    // Step 7: Check final state
    console.log('\n7️⃣ Final attendance records after finalization:');
    const finalRecords = await AttendanceRecord.findAll({
      where: { date: TARGET_DATE },
      include: [
        {
          model: Employee,
          as: 'employee',
          attributes: ['id', 'firstName', 'lastName']
        }
      ]
    });

    console.log(`\n📋 Final Records (${finalRecords.length} total):`);
    const statusCounts = {};
    for (const record of finalRecords) {
      const status = record.status;
      statusCounts[status] = (statusCounts[status] || 0) + 1;
      console.log(`   • ${record.employee.firstName} ${record.employee.lastName}: ${status} ${record.statusReason ? `(${record.statusReason})` : ''}`);
    }

    console.log('\n📊 Status Distribution:');
    Object.entries(statusCounts).forEach(([status, count]) => {
      console.log(`   ${status}: ${count}`);
    });

    // Step 8: Identify issues
    console.log('\n8️⃣ Issue Analysis:');
    console.log('==================');
    
    if (result.absent === 0 && eligibleForAbsent > 0) {
      console.log('❌ ISSUE FOUND: Expected absent records but none were created');
      console.log('   Possible causes:');
      console.log('   • Finalization logic has a bug');
      console.log('   • Shift end guard is preventing marking');
      console.log('   • Database transaction issues');
    } else if (result.absent > 0) {
      console.log(`✅ ${result.absent} absent records created successfully`);
    } else {
      console.log('ℹ️ No employees eligible for absent marking');
    }

    if (result.skipped > result.processed) {
      console.log('⚠️ More employees skipped than processed');
      console.log('   This suggests configuration or timing issues');
    }

    if (result.errors > 0) {
      console.log(`❌ ${result.errors} errors occurred during processing`);
    }

  } catch (error) {
    console.error('❌ Analysis failed:', error);
    console.error('Stack trace:', error.stack);
  }
}

// Run the analysis
analyzeDate();