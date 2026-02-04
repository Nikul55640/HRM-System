/**
 * Test script to manually run the finalization job and see what happens
 */

import sequelize from './src/config/sequelize.js';
import { finalizeDailyAttendance } from './src/jobs/attendanceFinalization.js';
import { AttendanceRecord } from './src/models/sequelize/index.js';

async function testFinalization() {
  try {
    console.log('🔧 Testing attendance finalization...');
    await sequelize.authenticate();
    console.log('✅ Database connected successfully');

    // Check records with "completed" status before finalization
    const completedRecords = await AttendanceRecord.findAll({
      where: { status: 'completed' },
      order: [['date', 'DESC']],
      limit: 10
    });

    console.log(`\n📊 Found ${completedRecords.length} records with "completed" status:`);
    completedRecords.forEach(record => {
      console.log(`   - ${record.date}: Employee ${record.employeeId}, ${record.workHours}h`);
    });

    // Run the finalization job manually
    console.log('\n🔄 Running finalization job...');
    const result = await finalizeDailyAttendance();
    
    console.log('\n✅ Finalization result:', result);

    // Check records after finalization
    const completedRecordsAfter = await AttendanceRecord.findAll({
      where: { status: 'completed' },
      order: [['date', 'DESC']],
      limit: 10
    });

    console.log(`\n📊 After finalization: ${completedRecordsAfter.length} records still "completed"`);
    if (completedRecordsAfter.length > 0) {
      console.log('Records still completed:');
      completedRecordsAfter.forEach(record => {
        console.log(`   - ${record.date}: Employee ${record.employeeId}, ${record.workHours}h`);
      });
    }

    // Check what statuses we have now
    const statusCounts = await AttendanceRecord.findAll({
      attributes: [
        'status',
        [sequelize.fn('COUNT', sequelize.col('id')), 'count']
      ],
      group: ['status'],
      raw: true
    });

    console.log('\n📈 Current status distribution:');
    statusCounts.forEach(stat => {
      console.log(`   - ${stat.status}: ${stat.count} records`);
    });

  } catch (error) {
    console.error('❌ Error testing finalization:', error);
  } finally {
    await sequelize.close();
    console.log('\n🔌 Database connection closed');
  }
}

// Run the test
testFinalization();