/**
 * Quick verification script for calendar statistics fix
 * Tests if the CalendarManagement component can now get live data
 */

import axios from 'axios';

const BASE_URL = 'http://localhost:3000/api';

async function quickTest() {
  try {
    console.log('🔍 Quick Calendar Statistics Fix Verification\n');
    
    // Login
    console.log('1. Logging in...');
    const loginResponse = await axios.post(`${BASE_URL}/auth/login`, {
      email: 'admin@hrm.com',
      password: 'admin123'
    });
    
    if (!loginResponse.data.success) {
      console.log('❌ Login failed');
      return;
    }
    
    const token = loginResponse.data.data.token;
    console.log('✅ Login successful');
    
    // Test the exact API calls that CalendarManagement makes
    console.log('\n2. Testing calendar statistics endpoints...');
    
    const [eventsRes, holidaysRes] = await Promise.all([
      axios.get(`${BASE_URL}/calendar/events/statistics`, {
        headers: { Authorization: `Bearer ${token}` }
      }),
      axios.get(`${BASE_URL}/calendar/holidays/statistics`, {
        headers: { Authorization: `Bearer ${token}` }
      })
    ]);
    
    if (eventsRes.data.success && holidaysRes.data.success) {
      const eventStats = eventsRes.data.data;
      const holidayStats = holidaysRes.data.data;
      
      console.log('✅ Both endpoints working!');
      console.log('\n📊 Live Statistics:');
      console.log(`   Total Events: ${eventStats.totalEvents || 0}`);
      console.log(`   This Month: ${eventStats.thisMonth || 0}`);
      console.log(`   Holidays: ${holidayStats.totalHolidays || 0}`);
      console.log(`   Attendees: ${eventStats.totalAttendees || 0}`);
      
      console.log('\n🎉 SUCCESS: CalendarManagement will now show live data!');
      console.log('💡 The Quick Stats Cards should display real numbers instead of hardcoded values.');
      
    } else {
      console.log('❌ One or both endpoints failed');
    }
    
  } catch (error) {
    if (error.response?.status === 404) {
      console.log('❌ Endpoints not found - routes may not be registered correctly');
    } else if (error.response?.status === 403) {
      console.log('❌ Access denied - check user permissions');
    } else {
      console.log('❌ Error:', error.response?.data?.message || error.message);
    }
  }
}

quickTest();