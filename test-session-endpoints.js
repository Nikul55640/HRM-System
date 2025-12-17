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
      console.log('👤 User:', response.data.data.user?.fullName || response.data.data.user?.name || 'Unknown');
      console.log('🏢 Employee ID:', response.data.data.user?.employeeId || 'N/A');
      console.log('🔑 Role:', response.data.data.user?.role || 'Unknown');
      return true;
    }
    return false;
  } catch (error) {
    console.error('❌ Login failed:', error.response?.data || error.message);
    return false;
  }
}

async function testEndpoint(method, endpoint, data = null) {
  try {
    console.log(`\n🔍 Testing ${method.toUpperCase()} ${endpoint}`);
    
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
    console.log(`✅ Status: ${response.status}`);
    console.log(`✅ Success: ${response.data.success}`);
    
    if (response.data.message) {
      console.log(`📝 Message: ${response.data.message}`);
    }
    
    return response.data;
  } catch (error) {
    console.log(`❌ Status: ${error.response?.status || 'Network Error'}`);
    console.log(`❌ Success: false`);
    console.log(`📝 Message: ${error.response?.data?.message || error.message}`);
    return null;
  }
}

async function runTests() {
  console.log('🚀 Testing Session Endpoints...\n');
  
  // Login first
  const loginSuccess = await login();
  if (!loginSuccess) {
    console.log('❌ Cannot proceed without authentication');
    return;
  }
  
  // Test 1: Get current attendance records
  await testEndpoint('GET', '/employee/attendance');
  
  // Test 2: Try session start endpoint
  await testEndpoint('POST', '/employee/attendance/session/start', {
    workLocation: 'office'
  });
  
  // Test 3: Try break start endpoint
  await testEndpoint('POST', '/employee/attendance/break/start');
  
  // Test 4: Try break end endpoint
  await testEndpoint('POST', '/employee/attendance/break/end');
  
  // Test 5: Try session end endpoint
  await testEndpoint('POST', '/employee/attendance/session/end');
  
  // Test 6: Get sessions
  await testEndpoint('GET', '/employee/attendance/sessions');
  
  console.log('\n✅ Testing complete!');
}

runTests().catch(console.error);