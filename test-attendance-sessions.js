#!/usr/bin/env node

/**
 * Session-Based Attendance Testing Script
 * Tests the new session-based attendance system
 */

const http = require('http');

const BASE_URL = 'http://localhost:5000/api';
let authToken = null;

// Helper function to make HTTP requests
function makeRequest(method, path, data = null, headers = {}) {
  return new Promise((resolve, reject) => {
    const url = new URL(BASE_URL + path);
    
    const options = {
      hostname: url.hostname,
      port: url.port,
      path: url.pathname + url.search,
      method: method,
      headers: {
        'Content-Type': 'application/json',
        ...headers
      }
    };

    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => body += chunk);
      res.on('end', () => {
        try {
          const response = JSON.parse(body);
          resolve({ status: res.statusCode, data: response });
        } catch (e) {
          resolve({ status: res.statusCode, data: body });
        }
      });
    });

    req.on('error', reject);

    if (data) {
      req.write(JSON.stringify(data));
    }
    req.end();
  });
}

// Test authentication
async function testAuth() {
  console.log('\n🔐 Testing Authentication...');
  
  try {
    const response = await makeRequest('POST', '/auth/login', {
      email: 'john.doe@hrms.com',
      password: 'emp12323'
    });

    if (response.status === 200 && response.data.success) {
      authToken = response.data.data.token || response.data.data.accessToken;
      console.log('✅ Login successful');
      return true;
    } else {
      console.log('❌ Login failed:', response.data);
      return false;
    }
  } catch (error) {
    console.log('❌ Login error:', error.message);
    return false;
  }
}

// Test session-based attendance flow
async function testSessionFlow() {
  console.log('\n🎯 Testing Session-Based Attendance Flow...');
  
  if (!authToken) {
    console.log('❌ No auth token available');
    return;
  }

  const headers = { 'Authorization': `Bearer ${authToken}` };

  try {
    // 1. Get current attendance records
    console.log('  📊 Step 1: Getting current attendance records...');
    const response1 = await makeRequest('GET', '/employee/attendance', null, headers);
    console.log('    Status:', response1.status);
    console.log('    Success:', response1.data.success);
    if (response1.data.data) {
      console.log('    Records found:', response1.data.data.length);
    }

    // 2. Start a work session (Office)
    console.log('  🟢 Step 2: Starting work session (Office)...');
    const response2 = await makeRequest('POST', '/employee/attendance/sessions/start', {
      workLocation: 'office'
    }, headers);
    console.log('    Status:', response2.status);
    console.log('    Success:', response2.data.success);
    if (response2.data.message) {
      console.log('    Message:', response2.data.message);
    }

    // Wait a moment
    await new Promise(resolve => setTimeout(resolve, 2000));

    // 3. Start a break
    console.log('  ☕ Step 3: Starting break...');
    const response3 = await makeRequest('POST', '/employee/attendance/break/start', {}, headers);
    console.log('    Status:', response3.status);
    console.log('    Success:', response3.data.success);
    if (response3.data.message) {
      console.log('    Message:', response3.data.message);
    }

    // Wait a moment
    await new Promise(resolve => setTimeout(resolve, 2000));

    // 4. End break
    console.log('  ☕ Step 4: Ending break...');
    const response4 = await makeRequest('POST', '/employee/attendance/break/end', {}, headers);
    console.log('    Status:', response4.status);
    console.log('    Success:', response4.data.success);
    if (response4.data.message) {
      console.log('    Message:', response4.data.message);
    }

    // Wait a moment
    await new Promise(resolve => setTimeout(resolve, 2000));

    // 5. End work session
    console.log('  🔴 Step 5: Ending work session...');
    const response5 = await makeRequest('POST', '/employee/attendance/sessions/end', {}, headers);
    console.log('    Status:', response5.status);
    console.log('    Success:', response5.data.success);
    if (response5.data.message) {
      console.log('    Message:', response5.data.message);
    }

    // 6. Get updated attendance records
    console.log('  📊 Step 6: Getting updated attendance records...');
    const response6 = await makeRequest('GET', '/employee/attendance', null, headers);
    console.log('    Status:', response6.status);
    console.log('    Success:', response6.data.success);
    if (response6.data.data && response6.data.data.length > 0) {
      const todayRecord = response6.data.data[0];
      console.log('    Today\'s record:');
      console.log('      Date:', todayRecord.date);
      console.log('      Sessions:', todayRecord.sessions ? todayRecord.sessions.length : 0);
      if (todayRecord.sessions && todayRecord.sessions.length > 0) {
        const session = todayRecord.sessions[0];
        console.log('      Session status:', session.status);
        console.log('      Work location:', session.workLocation);
        console.log('      Worked minutes:', session.workedMinutes);
        console.log('      Breaks:', session.breaks ? session.breaks.length : 0);
      }
    }

    // 7. Start another session (WFH)
    console.log('  🏠 Step 7: Starting another session (WFH)...');
    const response7 = await makeRequest('POST', '/employee/attendance/sessions/start', {
      workLocation: 'wfh'
    }, headers);
    console.log('    Status:', response7.status);
    console.log('    Success:', response7.data.success);
    if (response7.data.message) {
      console.log('    Message:', response7.data.message);
    }

    // 8. End second session
    console.log('  🔴 Step 8: Ending second session...');
    const response8 = await makeRequest('POST', '/employee/attendance/sessions/end', {}, headers);
    console.log('    Status:', response8.status);
    console.log('    Success:', response8.data.success);
    if (response8.data.message) {
      console.log('    Message:', response8.data.message);
    }

    // 9. Get final attendance records
    console.log('  📊 Step 9: Getting final attendance records...');
    const response9 = await makeRequest('GET', '/employee/attendance', null, headers);
    console.log('    Status:', response9.status);
    console.log('    Success:', response9.data.success);
    if (response9.data.data && response9.data.data.length > 0) {
      const todayRecord = response9.data.data[0];
      console.log('    Final today\'s record:');
      console.log('      Date:', todayRecord.date);
      console.log('      Total sessions:', todayRecord.sessions ? todayRecord.sessions.length : 0);
      console.log('      Total worked minutes:', todayRecord.workedMinutes);
      console.log('      Work hours:', todayRecord.workHours);
    }

  } catch (error) {
    console.log('❌ Session flow test error:', error.message);
  }
}

// Test session history
async function testSessionHistory() {
  console.log('\n📚 Testing Session History...');
  
  if (!authToken) {
    console.log('❌ No auth token available');
    return;
  }

  const headers = { 'Authorization': `Bearer ${authToken}` };

  try {
    const response = await makeRequest('GET', '/employee/attendance/sessions', null, headers);
    console.log('  Status:', response.status);
    console.log('  Success:', response.data.success);
    if (response.data.data) {
      console.log('  Session records found:', response.data.data.length);
    }
  } catch (error) {
    console.log('❌ Session history test error:', error.message);
  }
}

// Main test runner
async function runTests() {
  console.log('🚀 Starting Session-Based Attendance Tests...');
  console.log('🎯 Target:', BASE_URL);
  
  const authSuccess = await testAuth();
  
  if (authSuccess) {
    await testSessionFlow();
    await testSessionHistory();
  }
  
  console.log('\n✅ Session Attendance Testing Complete!');
}

// Run the tests
runTests().catch(console.error);