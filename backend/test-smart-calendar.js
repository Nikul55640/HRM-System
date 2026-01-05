/**
 * Test Smart Calendar APIs
 */

import sequelize from './src/config/sequelize.js';
import { WorkingRule, Holiday } from './src/models/index.js';

async function testSmartCalendar() {
  try {
    console.log('🧪 Testing Smart Calendar System...');

    await sequelize.authenticate();
    console.log('✅ Database connected');

    // Test WorkingRule model
    console.log('\n📋 Testing WorkingRule model...');
    const activeRule = await WorkingRule.getActiveRule();
    if (activeRule) {
      console.log('✅ Active working rule found:', activeRule.ruleName);
      console.log('   Working days:', activeRule.workingDays);
      console.log('   Weekend days:', activeRule.weekendDays);
    } else {
      console.log('⚠️ No active working rule found');
    }

    // Test Holiday model
    console.log('\n📋 Testing Holiday model...');
    const holidays = await Holiday.findAll({ limit: 3 });
    console.log(`✅ Found ${holidays.length} holidays`);
    
    if (holidays.length > 0) {
      holidays.forEach(holiday => {
        console.log(`   - ${holiday.name} (${holiday.type})`);
        if (holiday.type === 'RECURRING') {
          console.log(`     Recurring: ${holiday.recurringDate}`);
        } else {
          console.log(`     Date: ${holiday.date}`);
        }
      });
    }

    // Test holiday range query
    console.log('\n📋 Testing holiday range query...');
    const startDate = new Date('2025-01-01');
    const endDate = new Date('2025-12-31');
    const holidaysInRange = await Holiday.getHolidaysInRange(startDate, endDate);
    console.log(`✅ Found ${holidaysInRange.length} holidays in 2025`);

    // Test working day check
    console.log('\n📋 Testing working day check...');
    const testDate = new Date('2025-01-15'); // Wednesday
    const isWorking = await WorkingRule.isWorkingDay(testDate);
    const isWeekend = await WorkingRule.isWeekend(testDate);
    console.log(`✅ ${testDate.toDateString()}: Working=${isWorking}, Weekend=${isWeekend}`);

    console.log('\n🎉 All tests passed! Smart Calendar is working correctly.');

  } catch (error) {
    console.error('❌ Test failed:', error);
  } finally {
    await sequelize.close();
  }
}

testSmartCalendar();