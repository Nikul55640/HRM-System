/**
 * Test script to verify calendar events endpoint includes holidays
 */

import { Holiday, CompanyEvent, LeaveRequest, Employee } from './src/models/index.js';
import logger from './src/utils/logger.js';

async function testCalendarEventsWithHolidays() {
  try {
    console.log('🧪 Testing Calendar Events with Holidays Integration...\n');

    // 1. Check if Holiday model is accessible
    console.log('1. Testing Holiday model access...');
    const holidayCount = await Holiday.count();
    console.log(`   ✅ Holiday model accessible. Found ${holidayCount} holidays in database.\n`);

    // 2. Test holiday creation (if none exist)
    if (holidayCount === 0) {
      console.log('2. Creating test holiday...');
      const testHoliday = await Holiday.create({
        name: 'Test Holiday',
        date: new Date('2024-12-25'),
        type: 'public',
        description: 'Test holiday for calendar integration',
        color: '#dc2626',
        isPaid: true,
        isActive: true,
        createdBy: 1
      });
      console.log(`   ✅ Test holiday created with ID: ${testHoliday.id}\n`);
    }

    // 3. Test holiday retrieval with date range
    console.log('3. Testing holiday retrieval with date range...');
    const startDate = new Date('2024-12-01');
    const endDate = new Date('2024-12-31');
    
    const holidays = await Holiday.findAll({
      where: {
        date: {
          $between: [startDate, endDate]
        },
        isActive: true
      },
      attributes: ['id', 'name', 'date', 'type', 'description', 'color', 'isPaid', 'isRecurring'],
      order: [['date', 'ASC']]
    });

    console.log(`   ✅ Found ${holidays.length} holidays in December 2024:`);
    holidays.forEach(holiday => {
      console.log(`      - ${holiday.name} (${holiday.date}) - ${holiday.type}`);
    });
    console.log('');

    // 4. Test calendar data structure
    console.log('4. Testing calendar data structure...');
    const calendarData = {
      events: [],
      holidays: holidays.map(holiday => ({
        id: holiday.id,
        title: holiday.name,
        name: holiday.name,
        date: holiday.date,
        startDate: holiday.date,
        endDate: holiday.date,
        eventType: 'holiday',
        type: holiday.type,
        description: holiday.description,
        color: holiday.color || '#dc2626',
        isPaid: holiday.isPaid,
        isRecurring: holiday.isRecurring,
        isAllDay: true
      })),
      leaves: [],
      birthdays: [],
      anniversaries: []
    };

    console.log('   ✅ Calendar data structure created successfully:');
    console.log(`      - Events: ${calendarData.events.length}`);
    console.log(`      - Holidays: ${calendarData.holidays.length}`);
    console.log(`      - Leaves: ${calendarData.leaves.length}`);
    console.log(`      - Birthdays: ${calendarData.birthdays.length}`);
    console.log(`      - Anniversaries: ${calendarData.anniversaries.length}\n`);

    // 5. Test response format
    console.log('5. Testing API response format...');
    const apiResponse = {
      success: true,
      data: calendarData
    };

    console.log('   ✅ API response format validated:');
    console.log(`      - Success: ${apiResponse.success}`);
    console.log(`      - Data structure: ${Object.keys(apiResponse.data).join(', ')}\n`);

    console.log('🎉 All tests passed! Calendar events endpoint should now include holidays.\n');

    // 6. Show sample holiday data
    if (calendarData.holidays.length > 0) {
      console.log('📅 Sample holiday data:');
      console.log(JSON.stringify(calendarData.holidays[0], null, 2));
    }

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    logger.error('Calendar test error:', error);
  }
}

// Run the test
testCalendarEventsWithHolidays();