/**
 * Simple Absent Analysis for 2026-01-21
 * 
 * This script analyzes why absent records aren't being created
 * without using complex Sequelize associations.
 */

import { AttendanceRecord, Employee, EmployeeShift, Shift, Holiday, WorkingRule, LeaveRequest } from './src/models/index.js';
import { finalizeDailyAttendance } from './src/jobs/attendanceFinalization.js';
import { Op } from 'sequelize';

const TARGET_DATE = '2026-01-21';

async function simpleAnalysis() {
  console.log('🔍 SIMPLE ABSENT ANALYSIS FOR 2026-01-21');
  console.log('==========================================\n');

  try {
    // Step 1: Basic date validation
    console.log('1️⃣ Date validation...');
    const isHoliday = await Holiday.isHoliday(TARGET_DATE);
    const isWorkingDay = await WorkingRule.isWorkingDay(TARGET_DATE);
    
    console.log(`   Date: ${TARGET_DATE}`);
    console.log(`   Holiday: ${isHoliday}`);
    console.log(`   Working Day: ${isWorkingDay}`);
    
    if (isHoliday || !isWorkingDay) {
      console.log('❌ Date not valid for processing');
      return;
    }
    console.log('✅ Date is valid\n');

    // Step 2: Get employees and records separately
    console.log('2️⃣ Getting data...');
    const employees = await Employee.findAll({
      where: { isActive: true, status: 'Active' },
      attributes: ['id', 'firstName', 'lastName']
    });
    
    const existingRecords = await AttendanceRecord.findAll({
      where: { date: TARGET_DATE },
      attributes: ['id', 'employeeId', 'status', 'clockIn', 'clockOut', 'statusReason']
    });
    
    console.log(`   Active employees: ${employees.length}`);
    console.log(`   Existing records: ${existingRecords.length}\n`);

    // Step 3: Analyze each employee
    console.log('3️⃣ Employee analysis...');
    let analysis = {
      total: employees.length,
      hasRecord: 0,
      noRecord: 0,
      eligibleForAbsent: 0,
      skipped: {
        noShift: 0,
        onLeave: 0,
        alreadyFinalized: 0
      }
    };

    for (const employee of employees) {
      console.log(`\n👤 ${employee.firstName} ${employee.lastName} (ID: ${employee.id})`);
      
      // Check if has existing record
      const record = existingRecords.find(r => r.employeeId === employee.id);
      
      if (record) {
        analysis.hasRecord++;
        console.log(`   📋 Has record: ${record.status}`);
        if (record.status !== 'incomplete') {
          analysis.skipped.alreadyFinalized++;
          console.log('   ⏭️ Already finalized - would skip');
          continue;
        }
      } else {
        analysis.noRecord++;
        console.log('   📋 No record found');
      }

      // Check shift assignment
      const shiftAssignment = await EmployeeShift.findOne({
        where: {
          employeeId: employee.id,
          isActive: true,
          effectiveDate: { [Op.lte]: TARGET_DATE },
          [Op.or]: [
            { endDate: null },
            { endDate: { [Op.gte]: TARGET_DATE } }
          ]
        }
      });

      if (!shiftAssignment) {
        analysis.skipped.noShift++;
        console.log('   ❌ No shift assignment - would skip');
        continue;
      }

      const shift = await Shift.findByPk(shiftAssignment.shiftId, {
        attributes: ['shiftStartTime', 'shiftEndTime']
      });
      
      console.log(`   ✅ Has shift: ${shift.shiftStartTime} - ${shift.shiftEndTime}`);

      // Check leave
      const leave = await LeaveRequest.findOne({
        where: {
          employeeId: employee.id,
          status: 'approved',
          startDate: { [Op.lte]: TARGET_DATE },
          endDate: { [Op.gte]: TARGET_DATE }
        }
      });

      if (leave) {
        analysis.skipped.onLeave++;
        console.log('   🏖️ On leave - would skip');
        continue;
      }

      // This employee should be processed
      if (!record) {
        analysis.eligibleForAbsent++;
        console.log('   🎯 ELIGIBLE FOR ABSENT MARKING');
      } else {
        console.log('   🔄 Would process existing incomplete record');
      }
    }

    // Step 4: Summary
    console.log('\n4️⃣ Analysis Summary:');
    console.log('====================');
    console.log(`Total Employees: ${analysis.total}`);
    console.log(`Has Record: ${analysis.hasRecord}`);
    console.log(`No Record: ${analysis.noRecord}`);
    console.log(`Eligible for Absent: ${analysis.eligibleForAbsent}`);
    console.log('\nSkip Reasons:');
    console.log(`• No Shift: ${analysis.skipped.noShift}`);
    console.log(`• On Leave: ${analysis.skipped.onLeave}`);
    console.log(`• Already Finalized: ${analysis.skipped.alreadyFinalized}`);

    // Step 5: Run finalization
    console.log('\n5️⃣ Running finalization...');
    const result = await finalizeDailyAttendance(new Date(TARGET_DATE));
    
    console.log('\n📊 Finalization Results:');
    console.log(`   Processed: ${result.processed || 0}`);
    console.log(`   Skipped: ${result.skipped || 0}`);
    console.log(`   Present: ${result.present || 0}`);
    console.log(`   Half Day: ${result.halfDay || 0}`);
    console.log(`   Absent: ${result.absent || 0}`);
    console.log(`   Leave: ${result.leave || 0}`);
    console.log(`   Pending Correction: ${result.pendingCorrection || 0}`);
    console.log(`   Errors: ${result.errors || 0}`);

    // Step 6: Check final state
    console.log('\n6️⃣ Final state check...');
    const finalRecords = await AttendanceRecord.findAll({
      where: { date: TARGET_DATE },
      attributes: ['employeeId', 'status', 'statusReason', 'clockIn', 'clockOut']
    });

    console.log(`\nFinal records: ${finalRecords.length}`);
    const statusCounts = {};
    
    for (const record of finalRecords) {
      const employee = employees.find(e => e.id === record.employeeId);
      const status = record.status;
      statusCounts[status] = (statusCounts[status] || 0) + 1;
      
      console.log(`   • ${employee?.firstName || 'Unknown'} ${employee?.lastName || ''}: ${status}`);
    }

    console.log('\nStatus counts:');
    Object.entries(statusCounts).forEach(([status, count]) => {
      console.log(`   ${status}: ${count}`);
    });

    // Step 7: Issue identification
    console.log('\n7️⃣ Issue Analysis:');
    console.log('==================');
    
    if (analysis.eligibleForAbsent > 0 && (result.absent || 0) === 0) {
      console.log('❌ CRITICAL ISSUE: Expected absent records but none created');
      console.log('\nPossible causes:');
      console.log('• Finalization job has a bug in absent marking logic');
      console.log('• Shift end guard is too restrictive for past dates');
      console.log('• Database transaction or constraint issues');
      console.log('• Logic error in finalizeEmployeeAttendance function');
    } else if ((result.absent || 0) > 0) {
      console.log(`✅ Successfully created ${result.absent} absent records`);
    } else {
      console.log('ℹ️ No employees were eligible for absent marking');
    }

    if ((result.errors || 0) > 0) {
      console.log(`❌ ${result.errors} errors occurred during processing`);
    }

    if (analysis.skipped.noShift > 0) {
      console.log(`⚠️ ${analysis.skipped.noShift} employees have no shift assignments`);
    }

  } catch (error) {
    console.error('❌ Analysis failed:', error.message);
    console.error('Stack trace:', error.stack);
  }
}

// Run the analysis
simpleAnalysis();