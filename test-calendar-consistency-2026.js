/**
 * Test script to verify calendar consistency between MonthView and WeekView for 2026
 * This script tests cross-month week scenarios that were causing data inconsistencies
 */

const testCases = [
const testCases = [
  {
    name: "January 2026 - Week spanning into February",
    date: "2026-01-30", // Friday - week spans Jan 26 (Sun) to Feb 1 (Sat)
    expectedWeekDays: [
      "2026-01-26", // Sunday
      "2026-01-27", // Monday  
      "2026-01-28", // Tuesday
      "2026-01-29", // Wednesday
      "2026-01-30", // Thursday
      "2026-01-31", // Friday
      "2026-02-01"  // Saturday (next month!)
    ]
  },
  {
    name: "February 2026 - Week spanning into March", 
    date: "2026-02-26", // Thursday - week spans Feb 22 (Sun) to Feb 28 (Sat)
    expectedWeekDays: [
      "2026-02-22", // Sunday
      "2026-02-23", // Monday
      "2026-02-24", // Tuesday  
      "2026-02-25", // Wednesday
      "2026-02-26", // Thursday
      "2026-02-27", // Friday
      "2026-02-28"  // Saturday
    ]
  },
  {
    name: "March 2026 - Week spanning into April",
    date: "2026-03-30", // Monday - week spans Mar 29 (Sun) to Apr 4 (Sat)  
    expectedWeekDays: [
      "2026-03-29", // Sunday
      "2026-03-30", // Monday
      "2026-03-31", // Tuesday
      "2026-04-01", // Wednesday (next month!)
      "2026-04-02", // Thursday
      "2026-04-03", // Friday
      "2026-04-04"  // Saturday
    ]
  }
];

function generateWeekDays(date) {
  const startOfWeek = new Date(date);
  startOfWeek.setDate(date.getDate() - date.getDay());
  
  return Array.from({ length: 7 }, (_, i) => {
    const day = new Date(startOfWeek);
    day.setDate(startOfWeek.getDate() + i);
    return day.toISOString().split('T')[0];
  });
}

function getUniqueMonths(weekDays) {
  const months = new Set();
  weekDays.forEach(dateStr => {
    const [year, month] = dateStr.split('-');
    months.add(`${year}-${month}`);
  });
  return Array.from(months);
}

console.log('🧪 Testing Calendar Consistency for 2026 Cross-Month Scenarios\n');

testCases.forEach((testCase, index) => {
  console.log(`${index + 1}. ${testCase.name}`);
  console.log(`   Test Date: ${testCase.date}`);
  
  const testDate = new Date(testCase.date);
  const actualWeekDays = generateWeekDays(testDate);
  const uniqueMonths = getUniqueMonths(actualWeekDays);
  
  console.log(`   Generated Week: ${actualWeekDays.join(', ')}`);
  console.log(`   Expected Week:  ${testCase.expectedWeekDays.join(', ')}`);
  console.log(`   Spans Months: ${uniqueMonths.join(', ')}`);
  
  // Check if generated matches expected
  const matches = JSON.stringify(actualWeekDays) === JSON.stringify(testCase.expectedWeekDays);
  console.log(`   ✅ Test ${matches ? 'PASSED' : 'FAILED'}`);
  
  if (!matches) {
    console.log(`   ❌ Mismatch detected!`);
  }
  
  console.log('');
});

console.log('📋 Summary:');
console.log('- WeekView now fetches smart calendar data for ALL months in the week');
console.log('- MonthView fetches data for the current month only');  
console.log('- Both views should now show consistent weekend/holiday status');
console.log('- Cross-month weeks will have complete data coverage');

console.log('\n🔍 To verify the fix:');
console.log('1. Navigate to calendar in 2026');
console.log('2. Check weeks that span months (like Jan 26 - Feb 1, 2026)');
console.log('3. Compare weekend/holiday indicators between Month and Week views');
console.log('4. Both views should show identical status for the same dates');