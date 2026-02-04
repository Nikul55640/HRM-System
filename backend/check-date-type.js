/**
 * Check what type of day 2026-02-03 is (weekend, holiday, working day)
 */

import sequelize from './src/config/sequelize.js';
import { Holiday, WorkingRule } from './src/models/sequelize/index.js';

async function checkDateType() {
  try {
    console.log('🔍 Checking date type for 2026-02-03...');
    await sequelize.authenticate();
    console.log('✅ Database connected successfully');

    const dateString = '2026-02-03';
    const date = new Date(dateString);
    
    // Check what day of the week it is
    const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const dayOfWeek = dayNames[date.getDay()];
    
    console.log(`\n📅 Date: ${dateString}`);
    console.log(`📅 Day of Week: ${dayOfWeek}`);

    // Check if it's a holiday
    const isHoliday = await Holiday.isHoliday(dateString);
    console.log(`🎉 Is Holiday: ${isHoliday}`);

    // Check if it's a working day
    const isWorkingDay = await WorkingRule.isWorkingDay(dateString);
    console.log(`💼 Is Working Day: ${isWorkingDay}`);

    // Get working rule details
    const workingRule = await WorkingRule.findOne({
      where: {
        effectiveFrom: { [sequelize.Sequelize.Op.lte]: dateString },
        [sequelize.Sequelize.Op.or]: [
          { effectiveTo: null },
          { effectiveTo: { [sequelize.Sequelize.Op.gte]: dateString } }
        ],
        isActive: true
      },
      order: [['effectiveFrom', 'DESC']]
    });

    if (workingRule) {
      console.log(`\n📋 Working Rule Details:`);
      console.log(`   - Rule Name: ${workingRule.ruleName}`);
      console.log(`   - Working Days: ${JSON.stringify(workingRule.workingDays)}`);
      console.log(`   - Weekend Days: ${JSON.stringify(workingRule.weekendDays)}`);
    }

    // Final determination
    console.log(`\n🎯 Final Analysis:`);
    if (isHoliday) {
      console.log(`   ❌ This date is a HOLIDAY - finalization will be skipped`);
    } else if (!isWorkingDay) {
      console.log(`   ❌ This date is a WEEKEND - finalization will be skipped`);
    } else {
      console.log(`   ✅ This date is a WORKING DAY - finalization should process it`);
    }

  } catch (error) {
    console.error('❌ Error checking date type:', error);
  } finally {
    await sequelize.close();
    console.log('\n🔌 Database connection closed');
  }
}

// Run the check
checkDateType();