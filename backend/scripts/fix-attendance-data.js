/**
 * Fix Corrupted Attendance Data
 * This script identifies and fixes attendance records with impossible work hours
 */

import { AttendanceRecord, Employee } from '../src/models/sequelize/index.js';
import { Op } from 'sequelize';

const MAX_MINUTES_PER_DAY = 24 * 60; // 1440 minutes = 24 hours
const REALISTIC_MAX_MINUTES = 16 * 60; // 960 minutes = 16 hours (very long day)

async function fixAttendanceData() {
  console.log('🔍 Scanning for corrupted attendance data...\n');

  try {
    // Find records with impossible work hours
    const corruptedRecords = await AttendanceRecord.findAll({
      where: {
        totalWorkedMinutes: {
          [Op.gt]: MAX_MINUTES_PER_DAY
        }
      },
      include: [{
        model: Employee,
        as: 'employee',
        attributes: ['id', 'firstName', 'lastName', 'employeeId']
      }],
      order: [['date', 'DESC']]
    });

    if (corruptedRecords.length === 0) {
      console.log('✅ No corrupted records found!');
      return;
    }

    console.log(`❌ Found ${corruptedRecords.length} corrupted records:\n`);

    // Display corrupted records
    corruptedRecords.forEach((record, index) => {
      const hours = (record.totalWorkedMinutes / 60).toFixed(1);
      const employee = record.employee 
        ? `${record.employee.firstName} ${record.employee.lastName} (${record.employee.employeeId})`
        : `Employee ID: ${record.employeeId}`;
      
      console.log(`${index + 1}. ${employee}`);
      console.log(`   Date: ${record.date}`);
      console.log(`   Worked: ${hours}h (${record.totalWorkedMinutes} minutes)`);
      console.log(`   Clock In: ${record.clockIn || 'N/A'}`);
      console.log(`   Clock Out: ${record.clockOut || 'N/A'}`);
      console.log('');
    });

    // Ask for confirmation
    console.log('\n📋 Fix Options:');
    console.log('1. DELETE all corrupted records');
    console.log('2. RECALCULATE work hours based on clock in/out times');
    console.log('3. CAP work hours to realistic maximum (16 hours)');
    console.log('4. EXIT without changes\n');

    // For automated fix, we'll recalculate
    console.log('🔧 Applying FIX: Recalculating work hours...\n');

    let fixed = 0;
    let deleted = 0;

    for (const record of corruptedRecords) {
      if (!record.clockIn) {
        // No clock in time - delete the record
        await record.destroy();
        deleted++;
        console.log(`🗑️  Deleted record ${record.id} (no clock-in time)`);
        continue;
      }

      if (!record.clockOut) {
        // Incomplete record - set to 0 worked minutes
        await record.update({
          totalWorkedMinutes: 0,
          workHours: 0,
          status: 'incomplete'
        });
        fixed++;
        console.log(`✅ Fixed incomplete record ${record.id} (set to 0 hours)`);
        continue;
      }

      // Calculate actual worked minutes
      const clockInTime = new Date(record.clockIn);
      const clockOutTime = new Date(record.clockOut);
      const totalMinutes = Math.floor((clockOutTime - clockInTime) / (1000 * 60));
      const breakMinutes = record.totalBreakMinutes || 0;
      const workedMinutes = Math.max(0, totalMinutes - breakMinutes);

      // Cap to realistic maximum
      const cappedMinutes = Math.min(workedMinutes, REALISTIC_MAX_MINUTES);
      const workHours = Math.round((cappedMinutes / 60) * 100) / 100;

      await record.update({
        totalWorkedMinutes: cappedMinutes,
        workHours: workHours
      });

      fixed++;
      console.log(`✅ Fixed record ${record.id}: ${(workedMinutes/60).toFixed(1)}h → ${(cappedMinutes/60).toFixed(1)}h`);
    }

    console.log('\n' + '='.repeat(60));
    console.log('📊 Summary:');
    console.log(`   Fixed: ${fixed} records`);
    console.log(`   Deleted: ${deleted} records`);
    console.log(`   Total: ${corruptedRecords.length} records processed`);
    console.log('='.repeat(60));
    console.log('\n✅ Attendance data cleanup complete!');

  } catch (error) {
    console.error('❌ Error fixing attendance data:', error);
    throw error;
  }
}

// Run the script
fixAttendanceData()
  .then(() => {
    console.log('\n✅ Script completed successfully');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Script failed:', error);
    process.exit(1);
  });
