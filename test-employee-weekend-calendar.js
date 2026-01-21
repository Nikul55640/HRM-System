import axios from 'axios';

const BASE_URL = 'http://localhost:5000/api';

// Test credentials (using existing test user)
const testCredentials = {
  email: 'john@hrm.com',
  password: 'john123'
};

async function testEmployeeWeekendCalendar() {
  try {
    console.log('🔐 Logging in...');
    
    // Login to get token
    const loginResponse = await axios.post(`${BASE_URL}/auth/login`, testCredentials);
    
    if (!loginResponse.data.success) {
      throw new Error('Login failed: ' + loginResponse.data.message);
    }
    
    const token = loginResponse.data.data.accessToken;
    console.log('✅ Login successful');
    
    // Set up headers with token
    const headers = {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    };
    
    console.log('\n📅 Testing Employee Calendar API...');
    
    // Test employee monthly calendar
    const calendarResponse = await axios.get(`${BASE_URL}/employee/calendar/monthly`, {
      params: {
        year: 2025,
        month: 1
      },
      headers
    });
    
    if (calendarResponse.data.success) {
      console.log('✅ Employee Calendar API working');
      
      console.log('\n🔍 Employee Calendar Response Structure:');
      console.log('Keys:', Object.keys(calendarResponse.data));
      console.log('Data keys:', calendarResponse.data.data ? Object.keys(calendarResponse.data.data) : 'No data key');
      
      const calendarData = calendarResponse.data.calendar || calendarResponse.data.data?.calendar || {};
      console.log('Calendar data keys:', Object.keys(calendarData).slice(0, 10));
      
      console.log('\n🔍 Checking weekend detection in Employee Calendar...');
      
      // Check first few days of January 2025 (using day numbers as keys)
      const testDays = [1, 2, 3, 4, 5];
      
      testDays.forEach(day => {
        const dayData = calendarData[day];
        if (dayData) {
          const dayOfWeek = new Date(2025, 0, day).toLocaleDateString('en-US', { weekday: 'long' });
          console.log(`  Day ${day} (${dayOfWeek}): ${dayData.status || 'No status'} - isWeekend: ${dayData.isWeekend}, isWorkingDay: ${dayData.isWorkingDay}`);
        } else {
          console.log(`  Day ${day}: No data found`);
        }
      });
      
      // Check if we have weekend data
      const weekendDays = Object.keys(calendarData).filter(dayKey => {
        const dayData = calendarData[dayKey];
        return dayData && (dayData.isWeekend === true || dayData.status === 'WEEKEND');
      });
      
      console.log(`\n📊 Weekend days found: ${weekendDays.length}`);
      weekendDays.slice(0, 5).forEach(dayKey => {
        const day = parseInt(dayKey);
        const dayOfWeek = new Date(2025, 0, day).toLocaleDateString('en-US', { weekday: 'long' });
        console.log(`  Day ${day} (${dayOfWeek})`);
      });
      
    } else {
      console.error('❌ Employee Calendar API failed:', calendarResponse.data.message);
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    if (error.response) {
      console.error('Response data:', error.response.data);
    }
  }
}

// Run the test
testEmployeeWeekendCalendar();