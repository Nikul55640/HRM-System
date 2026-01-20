import { Holiday } from './src/models/index.js';
import { getLocalDateString } from './src/utils/dateUtils.js';

async function fixHolidayDates() {
  try {
    console.log('🔧 Fixing Holiday Dates...\n');
    
    // Get all holidays
    const holidays = await Holiday.findAll({
      where: {
        type: 'ONE_TIME'
      }
    });
    
    console.log(`📅 Found ${holidays.length} one-time holidays to check`);
    
    let fixedCount = 0;
    
    for (const holiday of holidays) {
      console.log(`\n🔍 Checking: ${holiday.name}`);
      console.log(`   Current date: ${holiday.date} (${typeof holiday.date})`);
      
      if (holiday.date) {
        try {
          // Try to parse the current date
          const currentDate = new Date(holiday.date);
          
          if (isNaN(currentDate.getTime())) {
            console.log(`   ❌ Invalid date detected: ${holiday.date}`);
            continue;
          }
          
          // Get the properly formatted date string
          const fixedDate = getLocalDateString(currentDate);
          
          if (holiday.date !== fixedDate) {
            console.log(`   🔧 Fixing date: ${holiday.date} → ${fixedDate}`);
            
            await holiday.update({
              date: fixedDate
            });
            
            fixedCount++;
          } else {
            console.log(`   ✅ Date is correct: ${holiday.date}`);
          }
          
        } catch (error) {
          console.log(`   ❌ Error processing ${holiday.name}: ${error.message}`);
        }
      } else {
        console.log(`   ⚠️  No date set for ${holiday.name}`);
      }
    }
    
    console.log(`\n✅ Fixed ${fixedCount} holiday dates`);
    
    // Now check for January 2026 holidays specifically
    console.log('\n📅 January 2026 holidays after fix:');
    const jan2026Holidays = await Holiday.findAll({
      where: {
        date: {
          [Holiday.sequelize.Op.between]: ['2026-01-01', '2026-01-31']
        }
      },
      order: [['date', 'ASC']]
    });
    
    jan2026Holidays.forEach(h => {
      console.log(`   ${h.date}: ${h.name}`);
    });
    
  } catch (error) {
    console.error('❌ Error fixing holiday dates:', error);
  }
}

fixHolidayDates();