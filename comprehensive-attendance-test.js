const axios = require('axios');

const BASE_URL = 'http://localhost:5000/api';

// Test user credentials
const testUser = {
  email: 'john.doe@hrms.com',
  password: 'emp123'
};

let authToken = '';

async function login() {
  try {
    console.log('🔐 Logging in...');
    const response = await axios.post(`${BASE_URL}/auth/login`, testUser);
    
    if (response.data.success) {
      authToken = response.data.data.accessToken;
      console.log('✅ Login successful');
      console.log('👤 User:', response.data.data.user?.fullName);
      console.log('🏢 Employee ID:', response.data.data.user?.employeeId);
      return true;
    }
    return false;
  } catch (error) {
    console.error('❌ Login failed:', error.response?.data || error.message);
    return false;
  }
}

async function makeRequest(method, endpoint, data = null) {
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
    return {
      success: true,
      status: response.status,
      data: response.data
    };
  } catch (error) {
    return {
      success: false,
      status: error.response?.status || 0,
      data: error.response?.data || { message: error.message }
    };
  }
}

async function testCompleteFlow() {
  console.log('\n🚀 Testing Complete Attendance Flow...\n');
  
  // Step 1: Check current status
  console.log('📊 Step 1: Checking current attendance status...');
  let result = await makeRequest('GET', '/employee/attendance/sessions');
  if (result.success) {
    console.log('✅ Current sessions retrieved');
    const todayRecords = result.data.data.filter(record => {
      const recordDate = new Date(record.date).toDateString();
      const today = new Date().toDateString();
      return recordDate === today;
    });
    console.log(`📅 Today's records: ${todayRecords.length}`);
    if (todayRecords.length > 0) {
      const record = todayRecords[0];
      console.log(`📋 Sessions in today's record: ${record.sessions?.length || 0}`);
      if (record.sessions?.length > 0) {
        record.sessions.forEach((session, index) => {
          console.log(`  Session ${index + 1}: ${session.status} (${session.workLocation})`);
        });
      }
    }
  } else {
    console.log('❌ Failed to get current status:', result.data.message);
  }

  // Step 2: Start a new session
  console.log('\n🟢 Step 2: Starting new work session...');
  result = await makeRequest('POST', '/employee/attendance/session/start', {
    workLocation: 'office'
  });
  if (result.success) {
    console.log('✅ Session started successfully');
    console.log('📍 Location:', result.data.data?.session?.workLocation);
    console.log('🆔 Session ID:', result.data.data?.session?.sessionId);
  } else {
    console.log('❌ Failed to start session:', result.data.message);
    if (result.data.message?.includes('Already clocked in')) {
      console.log('ℹ️  Already have an active session, continuing with break test...');
    } else {
      return; // Exit if we can't start a session
    }
  }

  // Wait a moment
  await new Promise(resolve => setTimeout(resolve, 1000));

  // Step 3: Start a break
  console.log('\n☕ Step 3: Starting break...');
  result = await makeRequest('POST', '/employee/attendance/break/start');
  if (result.success) {
    console.log('✅ Break started successfully');
    console.log('🆔 Break ID:', result.data.data?.break?.breakId);
  } else {
    console.log('❌ Failed to start break:', result.data.message);
  }

  // Wait a moment
  await new Promise(resolve => setTimeout(resolve, 2000));

  // Step 4: End the break
  console.log('\n☕ Step 4: Ending break...');
  result = await makeRequest('POST', '/employee/attendance/break/end');
  if (result.success) {
    console.log('✅ Break ended successfully');
    console.log('⏱️  Break duration:', result.data.data?.break?.durationMinutes, 'minutes');
  } else {
    console.log('❌ Failed to end break:', result.data.message);
  }

  // Step 5: Check updated status
  console.log('\n📊 Step 5: Checking updated status...');
  result = await makeRequest('GET', '/employee/attendance/sessions');
  if (result.success) {
    console.log('✅ Updated sessions retrieved');
    const todayRecords = result.data.data.filter(record => {
      const recordDate = new Date(record.date).toDateString();
      const today = new Date().toDateString();
      return recordDate === today;
    });
    if (todayRecords.length > 0) {
      const record = todayRecords[0];
      console.log(`📋 Sessions in today's record: ${record.sessions?.length || 0}`);
      if (record.sessions?.length > 0) {
        const activeSession = record.sessions.find(s => s.status === 'active' || s.status === 'on_break');
        if (activeSession) {
          console.log(`🔄 Active session status: ${activeSession.status}`);
          console.log(`☕ Breaks taken: ${activeSession.breaks?.length || 0}`);
          console.log(`⏱️  Total break time: ${activeSession.totalBreakMinutes || 0} minutes`);
        }
      }
    }
  }

  // Step 6: End the session
  console.log('\n🔴 Step 6: Ending work session...');
  result = await makeRequest('POST', '/employee/attendance/session/end');
  if (result.success) {
    console.log('✅ Session ended successfully');
    console.log('⏱️  Worked minutes:', result.data.data?.session?.workedMinutes);
  } else {
    console.log('❌ Failed to end session:', result.data.message);
  }

  // Step 7: Final status check
  console.log('\n📊 Step 7: Final status check...');
  result = await makeRequest('GET', '/employee/attendance/sessions');
  if (result.success) {
    console.log('✅ Final sessions retrieved');
    const todayRecords = result.data.data.filter(record => {
      const recordDate = new Date(record.date).toDateString();
      const today = new Date().toDateString();
      return recordDate === today;
    });
    if (todayRecords.length > 0) {
      const record = todayRecords[0];
      console.log(`📋 Total sessions today: ${record.sessions?.length || 0}`);
      const completedSessions = record.sessions?.filter(s => s.status === 'completed') || [];
      console.log(`✅ Completed sessions: ${completedSessions.length}`);
      
      if (completedSessions.length > 0) {
        const totalWorked = completedSessions.reduce((sum, s) => sum + (s.workedMinutes || 0), 0);
        console.log(`⏱️  Total worked time today: ${totalWorked} minutes (${(totalWorked / 60).toFixed(2)} hours)`);
      }
    }
  }
}

async function runTest() {
  console.log('🚀 Comprehensive Attendance System Test\n');
  
  const loginSuccess = await login();
  if (!loginSuccess) {
    console.log('❌ Cannot proceed without authentication');
    return;
  }
  
  await testCompleteFlow();
  
  console.log('\n✅ Test completed!');
}

runTest().catch(console.error);