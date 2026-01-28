/**
 * Test script to verify MonthlyAttendanceCalendar APIs
 * Run this in browser console to test the API endpoints
 */

// Test the monthly attendance API
async function testMonthlyAttendanceAPI() {
  try {
    console.log('🧪 Testing Monthly Attendance Calendar APIs...');
    
    const currentDate = new Date();
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth() + 1;
    
    console.log(`📅 Testing for ${year}-${month}`);
    
    // Test 1: Monthly attendance records
    console.log('1️⃣ Testing attendance records...');
    const attendanceResponse = await fetch(`/api/employee/attendance?month=${month}&year=${year}&limit=50`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (attendanceResponse.ok) {
      const attendanceData = await attendanceResponse.json();
      console.log('✅ Attendance records:', attendanceData);
    } else {
      console.error('❌ Attendance records failed:', attendanceResponse.status);
    }
    
    // Test 2: Monthly calendar data (holidays, events)
    console.log('2️⃣ Testing calendar data...');
    const calendarResponse = await fetch(`/api/employee/calendar/monthly?year=${year}&month=${month}`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (calendarResponse.ok) {
      const calendarData = await calendarResponse.json();
      console.log('✅ Calendar data:', calendarData);
    } else {
      console.error('❌ Calendar data failed:', calendarResponse.status);
    }
    
    // Test 3: Attendance summary
    console.log('3️⃣ Testing attendance summary...');
    const summaryResponse = await fetch(`/api/employee/attendance/summary/${year}/${month}`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (summaryResponse.ok) {
      const summaryData = await summaryResponse.json();
      console.log('✅ Attendance summary:', summaryData);
    } else {
      console.error('❌ Attendance summary failed:', summaryResponse.status);
    }
    
    console.log('🎉 API testing completed!');
    
  } catch (error) {
    console.error('💥 Test failed:', error);
  }
}

// Export for use in browser console
window.testMonthlyAttendanceAPI = testMonthlyAttendanceAPI;

console.log('📋 Monthly Attendance Calendar Test loaded!');
console.log('💡 Run testMonthlyAttendanceAPI() in console to test APIs');