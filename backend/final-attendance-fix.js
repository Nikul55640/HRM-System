/**
 * Final fix for attendance records - adjust classification for 7+ hour records
 */

import sequelize from './src/config/sequelize.js';
import { User, Employee, AttendanceRecord, Shift } from './src/models/sequelize/index.js';

async function finalAttendanceFix() {
  try {
    console.log('🔧 Final attendance record classification fix...');
    await sequelize.authenticate();
    console.log('✅ Database connected successfully');

    // Find the employee
    const user = await User.findOne({
      where: { email: 'john@hrm.com' },
      include: [{ model: Employee, as: 'employee' }]
    });

    if (!user || !user.employee) {
      console.log('❌ Employee not found');
      return;
    }

    console.log(`\n🔍 Final fix for: ${user.employee.firstName} ${user.employee.lastName}`);

    // Get records that should be "present" (7+ hours but marked as half_day)
    const recordsToFix = await AttendanceRecord.findAll({
      where: { 
        employeeId: user.employee.id,
        status: 'half_day',
        workHours: { [sequelize.Sequelize.Op.gte]: 7 }
      },
      include: [{ model: Shift, as: 'shift', required: false }],
      order: [['date', 'DESC']]
    });

    console.log(`\n📊 Found ${recordsToFix.length} records with 7+ hours marked as half_day:`);

    let fixedCount = 0;

    for (const record of recordsToFix) {
      console.log(`\n--- Fixing Record for ${record.date} ---`);
      console.log(`Current Status: ${record.status}`);
      console.log(`Work Hours: ${record.workHours}`);

      // Update to present status
      await record.update({
        status: 'present',
        statusReason: `Worked ${record.workHours} hours (≥ 7 hours qualifies as full day)`,
        halfDayType: 'full_day'
      });

      console.log(`✅ Fixed: Status changed to "present"`);
      console.log(`   Reason: Worked ${record.workHours} hours (≥ 7 hours qualifies as full day)`);
      fixedCount++;
    }

    console.log(`\n🎉 Fixed ${fixedCount} records to "present" status!`);

    // Show final summary
    console.log('\n📊 Final attendance summary:');
    const finalRecords = await AttendanceRecord.findAll({
      where: { employeeId: user.employee.id },
      order: [['date', 'DESC']],
      limit: 15
    });

    const statusCounts = {};
    finalRecords.forEach(record => {
      statusCounts[record.status] = (statusCounts[record.status] || 0) + 1;
    });

    console.log('\nStatus Distribution:');
    Object.entries(statusCounts).forEach(([status, count]) => {
      console.log(`   - ${status}: ${count} records`);
    });

    console.log('\nRecent Records:');
    finalRecords.slice(0, 10).forEach((record, index) => {
      const statusIcon = {
        'present': '✅',
        'half_day': '🟡',
        'absent': '❌',
        'weekend': '📅',
        'in_progress': '🔄',
        'pending_correction': '⚠️'
      }[record.status] || '❓';
      
      console.log(`${index + 1}. ${record.date}: ${statusIcon} ${record.status} (${record.workHours}h) - ${record.statusReason || 'N/A'}`);
    });

  } catch (error) {
    console.error('❌ Error in final fix:', error);
  } finally {
    await sequelize.close();
    console.log('\n🔌 Database connection closed');
  }
}

// Run the final fix
finalAttendanceFix();