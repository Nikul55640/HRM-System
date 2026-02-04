/**
 * Script to update existing records with the new 6-hour rule
 * This will change records with 6+ hours from half_day to present
 */

import sequelize from './src/config/sequelize.js';
import { AttendanceRecord } from './src/models/sequelize/index.js';

async function updateSixHourRule() {
  try {
    console.log('🔧 Updating records with new 6-hour rule...');
    await sequelize.authenticate();
    console.log('✅ Database connected successfully');

    // Find records with 6+ hours but marked as half_day
    const recordsToUpdate = await AttendanceRecord.findAll({
      where: { 
        status: 'half_day',
        workHours: { [sequelize.Sequelize.Op.gte]: 6 }
      }
    });

    console.log(`\n📊 Found ${recordsToUpdate.length} records with 6+ hours marked as half_day`);

    let updatedCount = 0;

    for (const record of recordsToUpdate) {
      await record.update({
        status: 'present',
        statusReason: `Worked ${record.workHours} hours (≥ 6 hours qualifies as full day)`,
        halfDayType: 'full_day'
      });

      console.log(`✅ Updated ${record.date}: ${record.workHours}h -> present`);
      updatedCount++;
    }

    console.log(`\n🎉 Updated ${updatedCount} records to use the new 6-hour rule!`);

  } catch (error) {
    console.error('❌ Error updating records:', error);
  } finally {
    await sequelize.close();
    console.log('\n🔌 Database connection closed');
  }
}

// Run the update
updateSixHourRule();