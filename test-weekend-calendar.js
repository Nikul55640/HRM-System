import axios from 'axios';

const BASE_URL = 'http://localhost:5000/api';

// Test credentials (using existing test user)
const testCredentials = {
  email: 'john@hrm.com',
  password: 'john123'
};

async function testWeekendCalendar() {
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
    
    console.log('\n📅 Testing Smart Calendar API...');
    
    // Test smart monthly calendar
    const calendarResponse = await axios.get(`${BASE_URL}/calendar/smart/monthly`, {
      params: {
        year: 2025,
        month: 1
      },
      headers
    });
    
    if (calendarResponse.data.success) {
      console.log('✅ Smart Calendar API working');
      
      const calendarData = calendarResponse.data.data.calendar;
      console.log('\n🔍 Checking weekend detection...');
      
      // Check first few days of January 2025
      const testDates = ['2025-01-01', '2025-01-02', '2025-01-03', '2025-01-04', '2025-01-05'];
      
      testDates.forEach(date => {
        const dayData = calendarData[date];
        if (dayData) {
          const dayOfWeek = new Date(date).toLocaleDateString('en-US', { weekday: 'long' });
          console.log(`  ${date} (${dayOfWeek}): ${dayData.status} - isWeekend: ${dayData.isWeekend}, isWorkingDay: ${dayData.isWorkingDay}`);
        } else {
          console.log(`  ${date}: No data found`);
        }
      });
      
      // Check active working rule
      const activeRule = calendarResponse.data.data.activeWorkingRule;
      if (activeRule) {
        console.log('\n📋 Active Working Rule:');
        console.log(`  Rule Name: ${activeRule.ruleName}`);
        console.log(`  Working Days: ${activeRule.workingDays.join(', ')}`);
        console.log(`  Weekend Days: ${activeRule.weekendDays.join(', ')}`);
      } else {
        console.log('\n⚠️  No active working rule found');
      }
      
    } else {
      console.error('❌ Smart Calendar API failed:', calendarResponse.data.message);
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    if (error.response) {
      console.error('Response data:', error.response.data);
    }
  }
}

// Run the test
testWeekendCalendar();