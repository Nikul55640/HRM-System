const axios = require('axios');

// Test the leave API endpoints
const BASE_URL = 'http://localhost:5000/api';

// Test data - using admin credentials since they should have access
const testUser = {
  email: 'admin@hrms.com',
  password: 'admin123'
};

let authToken = '';

async function login() {
  try {
    console.log('🔐 Logging in...');
    const response = await axios.post(`${BASE_URL}/auth/login`, testUser);
    
    if (response.data.success) {
      authToken = response.data.token;
      console.log('✅ Login successful');
      return true;
    } else {
      console.log('❌ Login failed:', response.data.message);
      return false;
    }
  } catch (error) {
    console.log('❌ Login error:', error.response?.data?.message || error.message);
    return false;
  }
}

async function testLeaveBalance() {
  try {
    console.log('\n📊 Testing leave balance endpoint...');
    const response = await axios.get(`${BASE_URL}/employee/leave-balance`, {
      headers: {
        'Authorization': `Bearer ${authToken}`
      }
    });
    
    console.log('✅ Leave balance response:', JSON.stringify(response.data, null, 2));
  } catch (error) {
    console.log('❌ Leave balance error:', error.response?.data?.message || error.message);
    console.log('Response data:', error.response?.data);
  }
}

async function testLeaveHistory() {
  try {
    console.log('\n📋 Testing leave history endpoint...');
    const response = await axios.get(`${BASE_URL}/employee/leave-requests`, {
      headers: {
        'Authorization': `Bearer ${authToken}`
      }
    });
    
    console.log('✅ Leave history response:', JSON.stringify(response.data, null, 2));
  } catch (error) {
    console.log('❌ Leave history error:', error.response?.data?.message || error.message);
    console.log('Response data:', error.response?.data);
  }
}

async function testCreateLeaveRequest() {
  try {
    console.log('\n📝 Testing create leave request endpoint...');
    
    const leaveRequest = {
      type: 'annual',
      startDate: '2024-01-15',
      endDate: '2024-01-17',
      reason: 'Family vacation',
      isHalfDay: false
    };
    
    const response = await axios.post(`${BASE_URL}/employee/leave-requests`, leaveRequest, {
      headers: {
        'Authorization': `Bearer ${authToken}`,
        'Content-Type': 'application/json'
      }
    });
    
    console.log('✅ Create leave request response:', JSON.stringify(response.data, null, 2));
  } catch (error) {
    console.log('❌ Create leave request error:', error.response?.data?.message || error.message);
    console.log('Response data:', error.response?.data);
  }
}

async function testAdminLeaveRequests() {
  try {
    console.log('\n👨‍💼 Testing admin leave requests endpoint...');
    const response = await axios.get(`${BASE_URL}/admin/leave/leave-requests`, {
      headers: {
        'Authorization': `Bearer ${authToken}`
      }
    });
    
    console.log('✅ Admin leave requests response:', JSON.stringify(response.data, null, 2));
  } catch (error) {
    console.log('❌ Admin leave requests error:', error.response?.data?.message || error.message);
    console.log('Response data:', error.response?.data);
  }
}

async function runTests() {
  console.log('🧪 Starting Leave API Tests...\n');
  
  const loginSuccess = await login();
  if (!loginSuccess) {
    console.log('❌ Cannot proceed without authentication');
    return;
  }
  
  await testLeaveBalance();
  await testLeaveHistory();
  await testCreateLeaveRequest();
  await testAdminLeaveRequests();
  
  console.log('\n🏁 Tests completed!');
}

// Run the tests
runTests().catch(console.error);