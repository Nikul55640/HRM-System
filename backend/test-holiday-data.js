const { Holiday } = require('./src/models/index.js');

async function testHolidayData() {
  try {
    console.log('🔍 Testing Holiday Data...\n');
    
    // Get all holidays for January 2026
    const startDate = new Date(2026, 0, 1); // January 1, 2026
    const endDate = new Date(2026, 0, 31); // January 31, 2026
    
    console.log('📅 Fetching holidays for January 2026...');
    console.log('Start Date:', startDate.toISOString());
    console.log('End Date:', endDate.toISOString());
    
    const holidays = await Holiday.getHolidaysInRange(startDate, endDate);
    
    console.log(`\n✅ Found ${holidays.length} holidays in January 2026:`);
    
    holidays.forEach((holiday, index) => {
      console.log(`\n${index + 1}. ${holiday.name}`);
      console.log(`   Date: ${holiday.date}`);
      console.log(`   Type: ${holiday.type}`);
      console.log(`   Category: ${holiday.category}`);
      console.log(`   ID: ${holiday.id}`);
      console.log(`   Raw Date Object:`, typeof holiday.date, holiday.date);
      
      // Check if date is valid
      const testDate = new Date(holiday.date);
      console.log(`   Parsed Date: ${testDate.toISOString()}`);
      console.log(`   Is Valid Date: ${!isNaN(testDate.getTime())}`);
    });
    
    // Test specific dates
    console.log('\n🔍 Testing specific dates...');
    
    const jan14 = new Date(2026, 0, 14);
    const jan14Holidays = holidays.filter(h => {
      const hDate = new Date(h.date);
      return hDate.getDate() === 14 && hDate.getMonth() === 0 && hDate.getFullYear() === 2026;
    });
    
    console.log(`\n📅 Holidays on January 14, 2026: ${jan14Holidays.length}`);
    jan14Holidays.forEach(h => {
      console.log(`   - ${h.name} (${h.date})`);
    });
    
  } catch (error) {
    console.error('❌ Error testing holiday data:', error);
  }
}

testHolidayData();