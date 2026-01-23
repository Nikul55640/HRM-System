// Debug script to test birthday processing logic
// Run this in browser console to debug the birthday filtering issue

const testBirthdays = [
  {
    employeeName: 'John Employee',
    date: '2026-02-02T00:00:00.000Z',
    title: "John Employee's Birthday"
  },
  {
    employeeName: 'Test Employee', 
    date: '2026-01-01T00:00:00.000Z',
    title: "Test Employee's Birthday"
  },
  {
    employeeName: 'Nikkl Prajap',
    date: '2026-10-01T00:00:00.000Z', 
    title: "Nikkl Prajap's Birthday"
  }
];

console.log('🎂 Testing birthday processing logic...');
console.log('Input birthdays:', testBirthdays);

const today = new Date();
const todayLocal = new Date(today.getFullYear(), today.getMonth(), today.getDate());
console.log('Today (local):', todayLocal);

const processedBirthdays = testBirthdays.map((birthday, index) => {
  console.log(`\n🎂 Processing birthday ${index + 1}:`, birthday);
  
  const dateStr = birthday.date;
  if (!dateStr) {
    console.warn('Missing date');
    return null;
  }
  
  let birthdayDate;
  try {
    if (dateStr.includes('T')) {
      birthdayDate = new Date(dateStr.split('T')[0] + 'T00:00:00');
    } else if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
      const [year, month, day] = dateStr.split('-').map(Number);
      birthdayDate = new Date(year, month - 1, day);
    } else {
      console.warn('Invalid date format:', dateStr);
      return null;
    }
    
    console.log('Parsed birthday date:', birthdayDate);
    
    const thisYear = todayLocal.getFullYear();
    const birthdayThisYear = new Date(thisYear, birthdayDate.getMonth(), birthdayDate.getDate());
    
    if (birthdayThisYear < todayLocal) {
      birthdayThisYear.setFullYear(thisYear + 1);
    }
    
    const daysUntil = Math.ceil((birthdayThisYear - todayLocal) / (1000 * 60 * 60 * 24));
    const isToday = birthdayThisYear.toDateString() === todayLocal.toDateString();
    
    console.log(`Result: ${birthdayThisYear.toDateString()} (${daysUntil} days until)`);
    
    return {
      ...birthday,
      nextBirthdayDate: birthdayThisYear,
      daysUntil: daysUntil,
      isToday: isToday
    };
    
  } catch (error) {
    console.error('Error processing:', error);
    return null;
  }
});

const validBirthdays = processedBirthdays.filter(b => {
  if (b === null) {
    console.log('Filtered out null birthday');
    return false;
  }
  
  const isWithinRange = b.daysUntil <= 180;
  if (!isWithinRange) {
    console.log(`Filtered out birthday beyond 6 months: ${b.employeeName} (${b.daysUntil} days)`);
  }
  return isWithinRange;
});

console.log('\n✅ Final result:', validBirthdays.length, 'birthdays');
validBirthdays.forEach((b, i) => {
  console.log(`${i + 1}. ${b.employeeName}: ${b.nextBirthdayDate.toDateString()} (${b.daysUntil} days)`);
});