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

async function debugTest() {
  console.log('\n🔍 Debug Session Test\n');
  
  // Step 1: Check current records
  console.log('📊 Step 1: Getting current attendance records...');
  let result = await makeRequest('GET', '/employee/attendance');
  if (result.success) {
    console.log('✅ Records retrieved');
    console.log('📋 Total records:', result.data.data?.length || 0);
    
    // Find today's record
    const today = new Date().toISOString().split('T')[0];
    const todayRecord = result.data.data?.find(record => 
      record.date?.startsWith(today)
    );
    
    if (todayRecord) {
      console.log('📅 Today\'s record found:');
      console.log('  - ID:', todayRecord.id);
      console.log('  - Date:', todayRecord.date);
      console.log('  - Sessions:', JSON.stringify(todayRecord.sessions, null, 2));
      console.log('  - Check In:', todayRecord.checkIn);
      console.log('  - Check Out:', todayRecord.checkOut);
    } else {
      console.log('📅 No record found for today');
    }
  } else {
    console.log('❌ Failed to get records:', result.data.message);
  }

  // Step 2: Start session
  console.log('\n🟢 Step 2: Starting session...');
  result = await makeRequest('POST', '/employee/attendance/session/start', {
    workLocation: 'office'
  });
  
  if (result.success) {
    console.log('✅ Session start response:');
    console.log(JSON.stringify(result.data, null, 2));
  } else {
    console.log('❌ Session start failed:');
    console.log(JSON.stringify(result.data, null, 2));
  }

  // Step 3: Check records again immediately
  console.log('\n📊 Step 3: Getting records after session start...');
  result = await makeRequest('GET', '/employee/attendance');
  if (result.success) {
    console.log('✅ Records retrieved after session start');
    
    // Find today's record
    const today = new Date().toISOString().split('T')[0];
    const todayRecord = result.data.data?.find(record => 
      record.date?.startsWith(today)
    );
    
    if (todayRecord) {
      console.log('📅 Today\'s record after session start:');
      console.log('  - ID:', todayRecord.id);
      console.log('  - Date:', todayRecord.date);
      console.log('  - Sessions count:', todayRecord.sessions?.length || 0);
      console.log('  - Sessions:', JSON.stringify(todayRecord.sessions, null, 2));
      console.log('  - Check In:', todayRecord.checkIn);
      console.log('  - Check Out:', todayRecord.checkOut);
    } else {
      console.log('📅 Still no record found for today');
    }
  }

  // Step 4: Check sessions endpoint
  console.log('\n📊 Step 4: Getting sessions...');
  result = await makeRequest('GET', '/employee/attendance/sessions');
  if (result.success) {
    console.log('✅ Sessions retrieved');
    console.log('📋 Total session records:', result.data.data?.length || 0);
    
    // Find today's record
    const today = new Date().toISOString().split('T')[0];
    const todayRecord = result.data.data?.find(record => 
      record.date?.startsWith(today)
    );
    
    if (todayRecord) {
      console.log('📅 Today\'s session record:');
      console.log('  - ID:', todayRecord.id);
      console.log('  - Date:', todayRecord.date);
      console.log('  - Sessions count:', todayRecord.sessions?.length || 0);
      console.log('  - Sessions:', JSON.stringify(todayRecord.sessions, null, 2));
    } else {
      console.log('📅 No session record found for today');
    }
  } else {
    console.log('❌ Failed to get sessions:', result.data.message);
  }
}

async function runTest() {
  console.log('🚀 Debug Session Test\n');
  
  const loginSuccess = await login();
  if (!loginSuccess) {
    console.log('❌ Cannot proceed without authentication');
    return;
  }
  
  await debugTest();
  
  console.log('\n✅ Debug test completed!');
}

runTest().catch(console.error);