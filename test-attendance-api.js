/**
 * Comprehensive Attendance API Test Script
 * Tests all attendance endpoints including sessions, breaks, and live monitoring
 */

const axios = require('axios');

// Configuration
const BASE_URL = 'http://localhost:5000/api';
const TEST_USER = {
  email: 'john.doe@company.com',
  password: 'password123'
};

let authToken = '';
let currentSessionId = '';
let currentBreakId = '';

// Helper function to make authenticated requests
const apiCall = async (method, endpoint, data = null) => {
  try {
    const config = {
      method,
      url: `${BASE_URL}${endpoint}`,
      headers: {
        'Authorization': `Bearer ${authToken}`,
        'Content-Type': 'application/json'
      }
    };
    
    if (data) {
      config.data = data;
    }
    
    const response = await axios(config);
    return { success: true, data: response.data };
  } catch (error) {
    return {
      success: false,
      error: error.response?.data || error.message,
      status: error.response?.status
    };
  }
};

// Test functions
const testLogin = async () => {
  console.log('\n🔐 Testing Login...');
  try {
    const response = await axios.post(`${BASE_URL}/auth/login`, TEST_USER);
    authToken = response.data.token;
    console.log('✅ Login successful');
    console.log(`   Token: ${authToken.substring(0, 20)}...`);
    return true;
  } catch (error) {
    console.log('❌ Login failed:', error.response?.data?.message || error.message);
    return false;
  }
};

const testLegacyAttendance = async () => {
  console.log('\n📊 Testing Legacy Attendance Endpoints...');
  
  // Test get attendance records
  console.log('  📋 Testing GET /employee/attendance');
  const records = await apiCall('GET', '/employee/attendance');
  console.log(records.success ? '  ✅ Get records: Success' : '  ❌ Get records: Failed', records.error?.message);
  
  // Test monthly summary
  console.log('  📈 Testing GET /employee/attendance/summary');
  const summary = await apiCall('GET', '/employee/attendance/summary');
  console.log(summary.success ? '  ✅ Monthly summary: Success' : '  ❌ Monthly summary: Failed', summary.error?.message);
  
  // Test legacy check-in
  console.log('  🟢 Testing POST /employee/attendance/check-in');
  const checkIn = await apiCall('POST', '/employee/attendance/check-in', {
    location: { address: 'Test Office' },
    remarks: 'Test check-in'
  });
  console.log(checkIn.success ? '  ✅ Legacy check-in: Success' : '  ❌ Legacy check-in: Failed', checkIn.error?.message);
  
  // Wait a moment
  await new Promise(resolve => setTimeout(resolve, 2000));
  
  // Test legacy check-out
  console.log('  🔴 Testing POST /employee/attendance/check-out');
  const checkOut = await apiCall('POST', '/employee/attendance/check-out', {
    location: { address: 'Test Office' },
    remarks: 'Test check-out'
  });
  console.log(checkOut.success ? '  ✅ Legacy check-out: Success' : '  ❌ Legacy check-out: Failed', checkOut.error?.message);
};

const testSessionManagement = async () => {
  console.log('\n🎯 Testing Enhanced Session Management...');
  
  // Test start session
  console.log('  🟢 Testing POST /attendance/session/start');
  const startSession = await apiCall('POST', '/attendance/session/start', {
    workLocation: 'office',
    locationDetails: 'Main Office - Floor 3'
  });
  
  if (startSession.success) {
    console.log('  ✅ Start session: Success');
    currentSessionId = startSession.data?.data?.session?.sessionId;
    console.log(`     Session ID: ${currentSessionId}`);
  } else {
    console.log('  ❌ Start session: Failed', startSession.error?.message);
    return false;
  }
  
  // Test get sessions
  console.log('  📋 Testing GET /attendance/sessions');
  const sessions = await apiCall('GET', '/attendance/sessions');
  console.log(sessions.success ? '  ✅ Get sessions: Success' : '  ❌ Get sessions: Failed', sessions.error?.message);
  
  return true;
};

const testBreakManagement = async () => {
  console.log('\n☕ Testing Break Management...');
  
  if (!currentSessionId) {
    console.log('  ⚠️  No active session, skipping break tests');
    return false;
  }
  
  // Test start break
  console.log('  🟡 Testing POST /attendance/break/start');
  const startBreak = await apiCall('POST', '/attendance/break/start', {
    breakType: 'lunch'
  });
  
  if (startBreak.success) {
    console.log('  ✅ Start break: Success');
    currentBreakId = startBreak.data?.data?.break?.breakId;
    console.log(`     Break ID: ${currentBreakId}`);
  } else {
    console.log('  ❌ Start break: Failed', startBreak.error?.message);
    return false;
  }
  
  // Wait a moment to simulate break time
  console.log('  ⏳ Simulating break time (3 seconds)...');
  await new Promise(resolve => setTimeout(resolve, 3000));
  
  // Test end break
  console.log('  🟢 Testing POST /attendance/break/end');
  const endBreak = await apiCall('POST', '/attendance/break/end');
  console.log(endBreak.success ? '  ✅ End break: Success' : '  ❌ End break: Failed', endBreak.error?.message);
  
  return true;
};

const testSessionEnd = async () => {
  console.log('\n🔴 Testing Session End...');
  
  if (!currentSessionId) {
    console.log('  ⚠️  No active session to end');
    return false;
  }
  
  // Test end session
  console.log('  🔴 Testing POST /attendance/session/end');
  const endSession = await apiCall('POST', '/attendance/session/end');
  
  if (endSession.success) {
    console.log('  ✅ End session: Success');
    console.log(`     Worked minutes: ${endSession.data?.data?.session?.workedMinutes}`);
  } else {
    console.log('  ❌ End session: Failed', endSession.error?.message);
  }
  
  return endSession.success;
};

const testLiveAttendance = async () => {
  console.log('\n📡 Testing Live Attendance (Admin)...');
  
  // Test get live attendance
  console.log('  📊 Testing GET /attendance/live');
  const liveAttendance = await apiCall('GET', '/attendance/live');
  
  if (liveAttendance.success) {
    console.log('  ✅ Live attendance: Success');
    const data = liveAttendance.data.data;
    console.log(`     Active employees: ${data.length}`);
    console.log(`     Summary: ${JSON.stringify(liveAttendance.data.summary)}`);
    
    if (data.length > 0) {
      console.log(`     First employee: ${data[0].fullName} (${data[0].currentSession.status})`);
    }
  } else {
    console.log('  ❌ Live attendance: Failed', liveAttendance.error?.message);
  }
  
  // Test get specific employee live status (using mock employee ID)
  console.log('  👤 Testing GET /attendance/live/:employeeId');
  const employeeLive = await apiCall('GET', '/attendance/live/mock-emp-1');
  console.log(employeeLive.success ? '  ✅ Employee live status: Success' : '  ❌ Employee live status: Failed', employeeLive.error?.message);
};

const testErrorCases = async () => {
  console.log('\n🚨 Testing Error Cases...');
  
  // Test double clock-in
  console.log('  🔄 Testing double session start (should fail)');
  await apiCall('POST', '/attendance/session/start', {
    workLocation: 'office'
  });
  
  const doubleStart = await apiCall('POST', '/attendance/session/start', {
    workLocation: 'office'
  });
  console.log(!doubleStart.success ? '  ✅ Double start prevented: Success' : '  ❌ Double start allowed: Failed');
  
  // Test break without session
  console.log('  ☕ Testing break without session (should fail)');
  await apiCall('POST', '/attendance/session/end'); // End any active session
  
  const breakWithoutSession = await apiCall('POST', '/attendance/break/start');
  console.log(!breakWithoutSession.success ? '  ✅ Break without session prevented: Success' : '  ❌ Break without session allowed: Failed');
  
  // Test invalid work location
  console.log('  📍 Testing invalid work location (should fail)');
  const invalidLocation = await apiCall('POST', '/attendance/session/start', {
    workLocation: 'invalid_location'
  });
  console.log(!invalidLocation.success ? '  ✅ Invalid location prevented: Success' : '  ❌ Invalid location allowed: Failed');
};

const runFullTest = async () => {
  console.log('🚀 Starting Comprehensive Attendance API Test');
  console.log('=' .repeat(60));
  
  // Login first
  const loginSuccess = await testLogin();
  if (!loginSuccess) {
    console.log('\n❌ Cannot proceed without authentication');
    return;
  }
  
  // Test all endpoints
  await testLegacyAttendance();
  await testSessionManagement();
  await testBreakManagement();
  await testSessionEnd();
  await testLiveAttendance();
  await testErrorCases();
  
  console.log('\n' + '=' .repeat(60));
  console.log('✅ Attendance API Test Complete');
  console.log('\n📋 Summary:');
  console.log('   - Legacy attendance endpoints tested');
  console.log('   - Enhanced session management tested');
  console.log('   - Break management tested');
  console.log('   - Live attendance monitoring tested');
  console.log('   - Error handling tested');
  console.log('\n💡 Check the console output above for detailed results');
};

// Run the test
if (require.main === module) {
  runFullTest().catch(console.error);
}

module.exports = {
  runFullTest,
  testLogin,
  testLegacyAttendance,
  testSessionManagement,
  testBreakManagement,
  testLiveAttendance
};