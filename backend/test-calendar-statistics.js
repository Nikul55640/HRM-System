/**
 * Test Calendar Statistics Endpoints
 * Tests the new statistics endpoints for calendar management
 */

import axios from 'axios';

const BASE_URL = 'http://localhost:3000/api';

// Test configuration
const TEST_CONFIG = {
  adminCredentials: {
    email: 'admin@hrm.com',
    password: 'admin123'
  }
};

let authToken = '';

/**
 * Login and get authentication token
 */
async function login() {
  try {
    console.log('🔐 Logging in as admin...');
    const response = await axios.post(`${BASE_URL}/auth/login`, TEST_CONFIG.adminCredentials);
    
    if (response.data.success && response.data.data.token) {
      authToken = response.data.data.token;
      console.log('✅ Login successful');
      return true;
    } else {
      console.error('❌ Login failed:', response.data.message);
      return false;
    }
  } catch (error) {
    console.error('❌ Login error:', error.response?.data?.message || error.message);
    return false;
  }
}

/**
 * Test calendar events statistics endpoint
 */
async function testEventsStatistics() {
  try {
    console.log('\n📊 Testing calendar events statistics...');
    
    const response = await axios.get(
      `${BASE_URL}/calendar/events/statistics`,
      {
        headers: { Authorization: `Bearer ${authToken}` }
      }
    );
    
    if (response.data.success) {
      console.log('✅ Events statistics retrieved successfully!');
      console.log('📈 Events Statistics:');
      console.log(`   Total Events: ${response.data.data.totalEvents}`);
      console.log(`   This Month: ${response.data.data.thisMonth}`);
      console.log(`   Total Attendees: ${response.data.data.totalAttendees}`);
      console.log(`   Year: ${response.data.data.year}`);
      console.log(`   Month: ${response.data.data.month}`);
      
      if (response.data.data.eventsByType && Object.keys(response.data.data.eventsByType).length > 0) {
        console.log('   Events by Type:');
        Object.entries(response.data.data.eventsByType).forEach(([type, count]) => {
          console.log(`     ${type}: ${count}`);
        });
      }
      
      return response.data.data;
    } else {
      console.error('❌ Failed to get events statistics:', response.data.message);
      return null;
    }
  } catch (error) {
    console.error('❌ Error getting events statistics:', error.response?.data?.message || error.message);
    return null;
  }
}

/**
 * Test calendar holidays statistics endpoint
 */
async function testHolidaysStatistics() {
  try {
    console.log('\n🎄 Testing calendar holidays statistics...');
    
    const response = await axios.get(
      `${BASE_URL}/calendar/holidays/statistics`,
      {
        headers: { Authorization: `Bearer ${authToken}` }
      }
    );
    
    if (response.data.success) {
      console.log('✅ Holidays statistics retrieved successfully!');
      console.log('📈 Holidays Statistics:');
      console.log(`   Total Holidays: ${response.data.data.totalHolidays}`);
      console.log(`   Paid Holidays: ${response.data.data.paidHolidays}`);
      console.log(`   Unpaid Holidays: ${response.data.data.unpaidHolidays}`);
      console.log(`   Year: ${response.data.data.year}`);
      
      if (response.data.data.holidaysByType && Object.keys(response.data.data.holidaysByType).length > 0) {
        console.log('   Holidays by Type:');
        Object.entries(response.data.data.holidaysByType).forEach(([type, count]) => {
          console.log(`     ${type}: ${count}`);
        });
      }
      
      if (response.data.data.holidaysByCategory && Object.keys(response.data.data.holidaysByCategory).length > 0) {
        console.log('   Holidays by Category:');
        Object.entries(response.data.data.holidaysByCategory).forEach(([category, count]) => {
          console.log(`     ${category}: ${count}`);
        });
      }
      
      return response.data.data;
    } else {
      console.error('❌ Failed to get holidays statistics:', response.data.message);
      return null;
    }
  } catch (error) {
    console.error('❌ Error getting holidays statistics:', error.response?.data?.message || error.message);
    return null;
  }
}

/**
 * Test the frontend API calls that CalendarManagement component makes
 */
async function testFrontendAPICalls() {
  try {
    console.log('\n🖥️ Testing frontend API calls...');
    
    // Test the exact same calls that the frontend makes
    const [eventsResponse, holidaysResponse] = await Promise.all([
      axios.get(`${BASE_URL}/calendar/events/statistics`, {
        headers: { Authorization: `Bearer ${authToken}` }
      }),
      axios.get(`${BASE_URL}/calendar/holidays/statistics`, {
        headers: { Authorization: `Bearer ${authToken}` }
      })
    ]);

    if (eventsResponse.data.success && holidaysResponse.data.success) {
      const eventStats = eventsResponse.data.data;
      const holidayStats = holidaysResponse.data.data;
      
      const frontendStats = {
        totalEvents: eventStats.totalEvents || 0,
        thisMonth: eventStats.thisMonth || 0,
        holidays: holidayStats.totalHolidays || 0,
        attendees: eventStats.totalAttendees || 0
      };
      
      console.log('✅ Frontend API calls successful!');
      console.log('📊 Stats that frontend would display:');
      console.log(`   Total Events: ${frontendStats.totalEvents}`);
      console.log(`   This Month: ${frontendStats.thisMonth}`);
      console.log(`   Holidays: ${frontendStats.holidays}`);
      console.log(`   Attendees: ${frontendStats.attendees}`);
      
      return frontendStats;
    } else {
      console.error('❌ One or both API calls failed');
      return null;
    }
  } catch (error) {
    console.error('❌ Error in frontend API calls:', error.response?.data?.message || error.message);
    return null;
  }
}

/**
 * Main test function
 */
async function runTests() {
  console.log('🧪 Starting Calendar Statistics Tests\n');
  console.log('=' .repeat(60));
  
  // Step 1: Login
  const loginSuccess = await login();
  if (!loginSuccess) {
    console.log('\n❌ Tests aborted - login failed');
    return;
  }
  
  // Step 2: Test events statistics
  console.log('\n🧪 TEST 1: EVENTS STATISTICS');
  console.log('-'.repeat(40));
  const eventsStats = await testEventsStatistics();
  
  // Step 3: Test holidays statistics
  console.log('\n🧪 TEST 2: HOLIDAYS STATISTICS');
  console.log('-'.repeat(40));
  const holidaysStats = await testHolidaysStatistics();
  
  // Step 4: Test frontend integration
  console.log('\n🧪 TEST 3: FRONTEND INTEGRATION');
  console.log('-'.repeat(40));
  const frontendStats = await testFrontendAPICalls();
  
  // Summary
  console.log('\n' + '='.repeat(60));
  console.log('🏁 TEST SUMMARY');
  console.log('='.repeat(60));
  console.log(`✅ Login: ${loginSuccess ? 'PASSED' : 'FAILED'}`);
  console.log(`✅ Events Statistics: ${eventsStats ? 'PASSED' : 'FAILED'}`);
  console.log(`✅ Holidays Statistics: ${holidaysStats ? 'PASSED' : 'FAILED'}`);
  console.log(`✅ Frontend Integration: ${frontendStats ? 'PASSED' : 'FAILED'}`);
  
  if (loginSuccess && eventsStats && holidaysStats && frontendStats) {
    console.log('\n🎉 All tests PASSED! Calendar statistics endpoints are working correctly.');
    console.log('\n💡 The CalendarManagement component should now show live data instead of hardcoded values.');
  } else {
    console.log('\n⚠️ Some tests FAILED. Please check the implementation.');
  }
}

// Run the tests
runTests().catch(error => {
  console.error('💥 Unexpected error:', error);
});