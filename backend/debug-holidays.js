// Simple debug script to check holiday data structure
import { Holiday } from './src/models/index.js';

async function debugHolidays() {
  try {
    console.log('🔍 Debugging Holiday Data Structure...\n');
    
    // Get holidays for January 2026
    const startDate = new Date(2026, 0, 1);
    const endDate = new Date(2026, 0, 31);
    
    console.log('📅 Date Range:');
    console.log('Start:', startDate.toISOString());
    console.log('End:', endDate.toISOString());
    
    const holidays = await Holiday.getHolidaysInRange(startDate, endDate);
    
    console.log(`\n✅ Found ${holidays.length} holidays:`);
    
    holidays.forEach((holiday, index) => {
      console.log(`\n${index + 1}. Holiday Data Structure:`);
      console.log('   Raw Object:', JSON.stringify(holiday, null, 2));
      console.log('   Name:', holiday.name);
      console.log('   Date:', holiday.date);
      console.log('   Date Type:', typeof holiday.date);
      console.log('   Date Constructor:', holiday.date?.constructor?.name);
      
      if (holiday.date) {
        try {
          const parsedDate = new Date(holiday.date);
          console.log('   Parsed Date:', parsedDate.toISOString());
          console.log('   Is Valid:', !isNaN(parsedDate.getTime()));
        } catch (e) {
          console.log('   Parse Error:', e.message);
        }
      }
    });
    
    // Check for duplicates on same date
    const dateGroups = {};
    holidays.forEach(h => {
      const dateKey = h.date;
      if (!dateGroups[dateKey]) dateGroups[dateKey] = [];
      dateGroups[dateKey].push(h.name);
    });
    
    console.log('\n📊 Holidays by Date:');
    Object.entries(dateGroups).forEach(([date, names]) => {
      console.log(`   ${date}: ${names.join(', ')} (${names.length} holidays)`);
    });
    
  } catch (error) {
    console.error('❌ Error:', error);
  }
}

debugHolidays();