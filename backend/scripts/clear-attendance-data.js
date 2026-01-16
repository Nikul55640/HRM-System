/**
 * Clear All Attendance Data
 * Use this to remove all attendance records and start fresh
 * WARNING: This will delete ALL attendance data!
 */

import { AttendanceRecord } from '../src/models/sequelize/index.js';

async function clearAttendanceData() {
  console.log('⚠️  WARNING: This will delete ALL attendance records!');
  console.log('');

  try {
    // Count existing records
    const count = await AttendanceRecord.count();
    console.log(`📊 Found ${count} attendance records`);

    if (count === 0) {
      console.log('✅ No records to delete');
      return;
    }

    console.log('\n🗑️  Deleting all attendance records...');
    
    // Delete all records
    const deleted = await AttendanceRecord.destroy({
      where: {},
      truncate: true
    });

    console.log(`✅ Deleted ${deleted} attendance records`);
    console.log('\n✅ Attendance data cleared successfully!');
    console.log('You can now start fresh with clean attendance tracking.');

  } catch (error) {
    console.error('❌ Error clearing attendance data:', error);
    throw error;
  }
}

// Run the script
clearAttendanceData()
  .then(() => {
    console.log('\n✅ Script completed successfully');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Script failed:', error);
    process.exit(1);
  });
