const axios = require('axios');

// Debug leave requests - check database and create test data
const BASE_URL = 'http://localhost:5000/api';

// Admin credentials
const adminUser = {
  email: 'admin@hrms.com',
  password: 'admin123'
};

let authToken = '';

async function login() {
  try {
    console.log('🔐 Logging in as admin...');
    const response = await axios.post(`${BASE_URL}/auth/login`, adminUser);
    
    if (response.data.success) {
      authToken = response.data.data.accessToken;
      console.log('✅ Login successful');
      console.log('Response data:', JSON.stringify(response.data, null, 2));
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

async function checkLeaveRequests() {
  try {
    console.log('\n📋 Checking existing leave requests...');
    const response = await axios.get(`${BASE_URL}/admin/leave/leave-requests`, {
      headers: {
        'Authorization': `Bearer ${authToken}`
      }
    });
    
    console.log('✅ Leave requests response:', {
      success: response.data.success,
      count: response.data.data?.length || 0,
      pagination: response.data.pagination
    });
    
    if (response.data.data && response.data.data.length > 0) {
      console.log('📄 Sample leave request:', response.data.data[0]);
    } else {
      console.log('📭 No leave requests found in database');
    }
    
    return response.data.data || [];
  } catch (error) {
    console.log('❌ Error checking leave requests:', error.response?.data?.message || error.message);
    if (error.response?.data) {
      console.log('Response data:', JSON.stringify(error.response.data, null, 2));
    }
    return [];
  }
}

async function checkEmployees() {
  try {
    console.log('\n👥 Checking employees...');
    const response = await axios.get(`${BASE_URL}/employees`, {
      headers: {
        'Authorization': `Bearer ${authToken}`
      }
    });
    
    console.log('✅ Employees found:', response.data.data?.length || 0);
    if (response.data.data && response.data.data.length > 0) {
      console.log('👤 Sample employee:', {
        id: response.data.data[0].id,
        employeeId: response.data.data[0].employeeId,
        name: response.data.data[0].personalInfo?.firstName + ' ' + response.data.data[0].personalInfo?.lastName
      });
    }
    
    return response.data.data || [];
  } catch (error) {
    console.log('❌ Error checking employees:', error.response?.data?.message || error.message);
    return [];
  }
}

async function createTestLeaveRequest(employeeId) {
  try {
    console.log('\n📝 Creating test leave request...');
    
    const leaveRequest = {
      type: 'annual',
      startDate: '2024-12-20',
      endDate: '2024-12-22',
      reason: 'Christmas vacation - test request',
      isHalfDay: false
    };
    
    // First try employee endpoint
    const response = await axios.post(`${BASE_URL}/employee/leave-requests`, leaveRequest, {
      headers: {
        'Authorization': `Bearer ${authToken}`,
        'Content-Type': 'application/json'
      }
    });
    
    console.log('✅ Test leave request created:', response.data);
    return response.data;
  } catch (error) {
    console.log('❌ Error creating test leave request:', error.response?.data?.message || error.message);
    if (error.response?.data) {
      console.log('Response data:', JSON.stringify(error.response.data, null, 2));
    }
    return null;
  }
}

async function checkLeaveBalance() {
  try {
    console.log('\n💰 Checking leave balance...');
    const response = await axios.get(`${BASE_URL}/employee/leave-balance`, {
      headers: {
        'Authorization': `Bearer ${authToken}`
      }
    });
    
    console.log('✅ Leave balance response:', response.data);
    return response.data;
  } catch (error) {
    console.log('❌ Error checking leave balance:', error.response?.data?.message || error.message);
    if (error.response?.data) {
      console.log('Response data:', JSON.stringify(error.response.data, null, 2));
    }
    return null;
  }
}

async function runDebug() {
  console.log('🔍 Starting Leave Requests Debug...\n');
  
  const loginSuccess = await login();
  if (!loginSuccess) {
    console.log('❌ Cannot proceed without authentication');
    return;
  }
  
  // Check current state
  const employees = await checkEmployees();
  const existingRequests = await checkLeaveRequests();
  await checkLeaveBalance();
  
  // If no requests exist and we have employees, create a test request
  if (existingRequests.length === 0 && employees.length > 0) {
    console.log('\n🧪 No leave requests found. Creating test data...');
    await createTestLeaveRequest(employees[0].id);
    
    // Check again after creating test data
    await checkLeaveRequests();
  }
  
  console.log('\n🏁 Debug completed!');
}

// Run the debug
runDebug().catch(console.error);