/**
 * Test Dashboard Endpoints
 * Tests the employee dashboard endpoints including company status
 */

import fetch from 'node-fetch';

const API_BASE = 'http://localhost:5000/api';

// Test credentials
const testCredentials = {
  email: 'john@hrm.com',
  password: 'john123'
};

async function testDashboardEndpoints() {
  try {
    console.log('🔐 [TEST] Logging in to get fresh token...');
    
    // Login to get fresh token
    const loginResponse = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(testCredentials)
    });
    
    const loginData = await loginResponse.json();
    
    if (!loginData.success) {
      console.error('❌ [TEST] Login failed:', loginData.message);
      return;
    }
    
    const token = loginData.data.token;
    const user = loginData.data.user;
    
    console.log('✅ [TEST] Login successful:', {
      user: user.email,
      role: user.role,
      tokenLength: token.length
    });
    
    const headers = {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    };
    
    // Test endpoints
    const endpoints = [
      '/employee/company/leave-today',
      '/employee/company/wfh-today',
      '/employee/company/status-today',
      '/employee/calendar/monthly?year=2026&month=1',
      '/employee/calendar/daily?date=2026-01-20'
    ];
    
    console.log('\n📊 [TEST] Testing dashboard endpoints...\n');
    
    for (const endpoint of endpoints) {
      try {
        console.log(`🔍 [TEST] Testing: ${endpoint}`);
        const response = await fetch(`${API_BASE}${endpoint}`, { headers });
        const data = await response.json();
        
        if (data.success) {
          console.log(`✅ [TEST] ${endpoint}: SUCCESS`);
          
          if (endpoint.includes('leave-today')) {
            console.log(`   - Leave data: ${data.data?.length || 0} employees`);
          } else if (endpoint.includes('wfh-today')) {
            console.log(`   - WFH data: ${data.data?.length || 0} employees`);
          } else if (endpoint.includes('status-today')) {
            console.log(`   - Status data: ${data.data?.length || 0} employees`);
          } else if (endpoint.includes('calendar/monthly')) {
            const calendar = data.calendar || {};
            const daysWithEvents = Object.values(calendar).filter(day => 
              (day.holidays && day.holidays.length > 0) ||
              (day.birthdays && day.birthdays.length > 0) ||
              (day.anniversaries && day.anniversaries.length > 0) ||
              (day.leaves && day.leaves.length > 0) ||
              (day.events && day.events.length > 0)
            ).length;
            console.log(`   - Calendar: ${daysWithEvents} days with events`);
          } else if (endpoint.includes('calendar/daily')) {
            const eventData = data.data || {};
            const eventCount = (eventData.holidays?.length || 0) + 
                             (eventData.birthdays?.length || 0) + 
                             (eventData.anniversaries?.length || 0) + 
                             (eventData.leaves?.length || 0) + 
                             (eventData.events?.length || 0);
            console.log(`   - Daily events: ${eventCount} total`);
          }
        } else {
          console.log(`❌ [TEST] ${endpoint}: FAILED - ${data.message}`);
        }
      } catch (error) {
        console.log(`❌ [TEST] ${endpoint}: ERROR - ${error.message}`);
      }
      
      console.log(''); // Empty line for readability
    }
    
    console.log('🎯 [TEST] Dashboard endpoint testing completed!');
    
  } catch (error) {
    console.error('❌ [TEST] Test failed:', error.message);
  }
}

// Run the test
testDashboardEndpoints();