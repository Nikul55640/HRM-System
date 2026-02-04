/**
 * Fix all "completed" records by running finalization for their dates
 */

import sequelize from './src/config/sequelize.js';
import { finalizeDailyAttendance } from './src/jobs/attendanceFinalization.js';
import { AttendanceRecord } from './src/models/sequelize/index.js';

async function fixCompletedRecords() {
  try {
    console.log('🔧 Fixing all "completed" records...');
    await sequelize.authenticate();
    console.log('✅ Database connected successfully');

    // Get all unique dates that have "completed" records
    const completedDates = await AttendanceRecord.findAll({
      attributes: ['date'],
      where: { status: 'completed' },
      group: ['date'],
      order: [['date', 'ASC']],
      raw: true
    });

    console.log(`\n📊 Found "completed" records on ${completedDates.length} dates:`);
    completedDates.forEach(record => {
      console.log(`   - ${record.date}`);
    });

    if (completedDates.length === 0) {
      console.log('✅ No "completed" records found to fix');
      return;
    }

    // Process each date
    let fixedDates = 0;
    let totalFixed = 0;

    for (const dateRecord of completedDates) {
      const dateString = dateRecord.date;
      console.log(`\n🔄 Processing ${dateString}...`);

      // Count completed records before
      const beforeCount = await AttendanceRecord.count({
        where: { 
          date: dateString,
          status: 'completed' 
        }
      });

      console.log(`   - Found ${beforeCount} completed records`);

      // Run finalization for this specific date
      const result = await finalizeDailyAttendance(new Date(dateString));
      console.log(`   - Finalization result:`, result);

      // Count completed records after
      const afterCount = await AttendanceRecord.count({
        where: { 
          date: dateString,
          status: 'completed' 
        }
      });

      const fixed = beforeCount - afterCount;
      if (fixed > 0) {
        console.log(`   ✅ Fixed ${fixed} records`);
        totalFixed += fixed;
        fixedDates++;
      } else {
        console.log(`   ⚠️  No records were fixed (might be skipped due to weekend/holiday)`);
      }
    }

    console.log(`\n🎉 Summary:`);
    console.log(`   - Processed ${completedDates.length} dates`);
    console.log(`   - Fixed records on ${fixedDates} dates`);
    console.log(`   - Total records fixed: ${totalFixed}`);

    // Final check
    const remainingCompleted = await AttendanceRecord.count({
      where: { status: 'completed' }
    });

    console.log(`\n📊 Remaining "completed" records: ${remainingCompleted}`);

    if (remainingCompleted > 0) {
      console.log('\n⚠️  Some records are still "completed". This might be because:');
      console.log('   - They are from weekends or holidays');
      console.log('   - They have missing shift assignments');
      console.log('   - They have data issues');
      
      // Show remaining records
      const remaining = await AttendanceRecord.findAll({
        where: { status: 'completed' },
        order: [['date', 'DESC']],
        limit: 5
      });
      
      console.log('\nRemaining records:');
      remaining.forEach(record => {
        console.log(`   - ${record.date}: Employee ${record.employeeId}, ${record.workHours}h`);
      });
    }

  } catch (error) {
    console.error('❌ Error fixing completed records:', error);
  } finally {
    await sequelize.close();
    console.log('\n🔌 Database connection closed');
  }
}

// Run the fix
fixCompletedRecords();