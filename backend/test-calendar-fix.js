/**
 * Test script to verify the calendar day status fix
 * This will test the exact dates mentioned in the issue
 */

import CalendarDayStatusService from './src/services/calendar/calendarDayStatus.service.js';

// UTC-safe helper functions (same as in service)
function formatLocalDate(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

function getDayOfWeekUTC(year, month, day) {
  return new Date(Date.UTC(year, month - 1, day)).getUTCDay();
}

async function testCalendarFix() {
  console.log('🧪 Testing Calendar Day Status Fix');
  console.log('=====================================');
  
  // Test the problematic dates
  const testDates = [
    { date: '2026-01-01', expected: 'Thursday' },
    { date: '2026-01-02', expected: 'Friday' },
    { date: '2026-01-03', expected: 'Saturday' },
    { date: '2026-01-04', expected: 'Sunday' },
    { date: '2026-01-05', expected: 'Monday' }
  ];
  
  const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  
  console.log('\n📅 Testing UTC-safe weekday calculation:');
  for (const test of testDates) {
    const [year, month, day] = test.date.split('-').map(Number);
    const dayOfWeek = getDayOfWeekUTC(year, month, day);
    const dayName = dayNames[dayOfWeek];
    const status = dayName === test.expected ? '✅' : '❌';
    
    console.log(`${status} ${test.date} → ${dayName} (expected: ${test.expected})`);
  }
  
  console.log('\n🔍 Testing Calendar Service:');
  try {
    for (const test of testDates) {
      const dayStatus = await CalendarDayStatusService.getDayStatus(test.date);
      const dayName = dayNames[dayStatus.dayOfWeek];
      const status = dayName === test.expected ? '✅' : '❌';
      
      console.log(`${status} ${test.date} → ${dayName} (${dayStatus.status}) - expected: ${test.expected}`);
    }
    
    console.log('\n📊 Testing January 2026 range:');
    const startDate = new Date(2026, 0, 1); // Jan 1, 2026
    const endDate = new Date(2026, 0, 7);   // Jan 7, 2026
    
    const rangeResults = await CalendarDayStatusService.getDayStatusRange(startDate, endDate);
    
    rangeResults.forEach((day, index) => {
      const dayName = dayNames[day.dayOfWeek];
      console.log(`${day.date} → ${dayName} (${day.status})`);
    });
    
  } catch (error) {
    console.error('❌ Error testing calendar service:', error.message);
  }
}

// Run the test
testCalendarFix().catch(console.error);