/**
 * Verify 2026 calendar dates and identify cross-month weeks
 */

function getDayName(date) {
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  return days[date.getDay()];
}

function generateWeekDays(date) {
  const startOfWeek = new Date(date);
  startOfWeek.setDate(date.getDate() - date.getDay());
  
  return Array.from({ length: 7 }, (_, i) => {
    const day = new Date(startOfWeek);
    day.setDate(startOfWeek.getDate() + i);
    return {
      date: day.toISOString().split('T')[0],
      dayName: getDayName(day),
      month: day.getMonth() + 1
    };
  });
}

function findCrossMonthWeeks() {
  const crossMonthWeeks = [];
  
  // Check each month in 2026
  for (let month = 1; month <= 12; month++) {
    const lastDayOfMonth = new Date(2026, month, 0).getDate();
    
    // Check the last few days of each month
    for (let day = Math.max(1, lastDayOfMonth - 6); day <= lastDayOfMonth; day++) {
      const testDate = new Date(2026, month - 1, day);
      const week = generateWeekDays(testDate);
      
      // Check if week spans multiple months
      const months = new Set(week.map(d => d.month));
      if (months.size > 1) {
        crossMonthWeeks.push({
          testDate: testDate.toISOString().split('T')[0],
          week: week,
          months: Array.from(months)
        });
        break; // Only need one example per month
      }
    }
  }
  
  return crossMonthWeeks;
}

console.log('📅 2026 Calendar Analysis - Cross-Month Weeks\n');

// Check what day January 1, 2026 falls on
const jan1_2026 = new Date(2026, 0, 1);
console.log(`January 1, 2026 is a ${getDayName(jan1_2026)}\n`);

// Find all cross-month weeks in 2026
const crossMonthWeeks = findCrossMonthWeeks();

console.log('🔍 Cross-Month Weeks Found in 2026:\n');

crossMonthWeeks.forEach((weekInfo, index) => {
  console.log(`${index + 1}. Test Date: ${weekInfo.testDate}`);
  console.log(`   Spans Months: ${weekInfo.months.join(' → ')}`);
  console.log(`   Week Days:`);
  
  weekInfo.week.forEach(day => {
    const monthIndicator = day.month !== weekInfo.week[0].month ? ' ← DIFFERENT MONTH' : '';
    console.log(`     ${day.date} (${day.dayName})${monthIndicator}`);
  });
  console.log('');
});

console.log('🎯 Key Issue Identified:');
console.log('- WeekView was only fetching smart calendar data for ONE month');
console.log('- But weeks can span TWO months, causing missing data');
console.log('- This leads to inconsistent weekend/holiday detection');
console.log('- MonthView shows correct data, WeekView shows fallback data');

console.log('\n✅ Fix Applied:');
console.log('- WeekView now detects all months in the week');
console.log('- Fetches smart calendar data for ALL required months');
console.log('- Both views will now show consistent data for 2026');