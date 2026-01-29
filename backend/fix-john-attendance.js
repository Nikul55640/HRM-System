#!/usr/bin/env node

/**
 * Quick Fix Script for John's Incomplete Attendance Record
 * 
 * This script manually finalizes John's attendance record for January 29, 2026
 * that shows as "Incomplete" even though it has both clock-in and clock-out times.
 */

import { AttendanceRecord, EmployeeShift, Shift } from './src/models/index.js';
import { Op } from 'sequelize';
import logger from './src/utils/logger.js';

async function fixJohnAttendance() {
  try {
    console.log('🔧 Starting fix for John\'s attendance record...');

    // John's details from the provided information
    const employeeId = 3;
    const date = '2026-01-29';

    // Find John's attendance record
    const record = await AttendanceRecord.findOne({
      where: {
        employeeId: employeeId,
        date: date
      }
    });

    if (!record) {
      console.log('❌ No attendance record found for John on 2026-01-29');
      return;
    }

    console.log('📋 Current record status:');
    console.log(`   - Clock In: ${record.clockIn}`);
    console.log(`   - Clock Out: ${record.clockOut}`);
    console.log(`   - Status: ${record.status}`);
    console.log(`   - Work Hours: ${record.workHours}`);
    console.log(`   - Status Reason: ${record.statusReason}`);

    // Check if record has both clock-in and clock-out
    if (!record.clockIn || !record.clockOut) {
      console.log('❌ Record is genuinely incomplete - missing clock-in or clock-out');
      return;
    }

    // Get John's shift
    const employeeShift = await EmployeeShift.findOne({
      where: {
        employeeId: employeeId,
        isActive: true,
        effectiveDate: { [Op.lte]: date },
        [Op.or]: [
          { endDate: null },
          { endDate: { [Op.gte]: date } }
        ]
      }
    });

    if (!employeeShift) {
      console.log('❌ No active shift found for John');
      return;
    }

    const shift = await Shift.findByPk(employeeShift.shiftId);
    if (!shift) {
      console.log('❌ Shift details not found');
      return;
    }

    console.log('⚙️ Shift configuration:');
    console.log(`   - Full Day Hours: ${shift.fullDayHours}`);
    console.log(`   - Half Day Hours: ${shift.halfDayHours}`);
    console.log(`   - Shift Start: ${shift.shiftStartTime}`);
    console.log(`   - Shift End: ${shift.shiftEndTime}`);

    // Apply finalization
    console.log('🔄 Applying finalization...');
    await record.finalizeWithShift(shift);
    await record.save();

    console.log('✅ Finalization complete! New status:');
    console.log(`   - Status: ${record.status}`);
    console.log(`   - Work Hours: ${record.workHours}`);
    console.log(`   - Status Reason: ${record.statusReason}`);
    console.log(`   - Half Day Type: ${record.halfDayType}`);

    // Expected result for John (4.88 hours should be half_day)
    if (record.status === 'half_day') {
      console.log('🎯 SUCCESS: John\'s status correctly changed to "Half Day"');
    } else if (record.status === 'present') {
      console.log('🎯 SUCCESS: John\'s status correctly changed to "Present"');
    } else {
      console.log(`⚠️ Unexpected status: ${record.status}`);
    }

  } catch (error) {
    console.error('❌ Error fixing John\'s attendance:', error);
  } finally {
    process.exit(0);
  }
}

// Run the fix
fixJohnAttendance();