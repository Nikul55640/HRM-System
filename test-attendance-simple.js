/**
 * Simple Attendance API Test
 * Quick test to verify attendance endpoints are working
 */

const axios = require('axios');

const BASE_URL = 'http://localhost:5000';

// Test without authentication first (should get 401)
const testEndpoints = async () => {
  console.log('🚀 Testing Attendance API Endpoints');
  console.log('=' .repeat(50));

  const endpoints = [
    { method: 'GET', url: '/health', name: 'Health Check', auth: false },
    { method: 'GET', url: '/api/employee/attendance', name: 'Get Attendance Records', auth: true },
    { method: 'GET', url: '/api/employee/attendance/summary', name: 'Get Monthly Summary', auth: true },
    { method: 'POST', url: '/api/employee/attendance/check-in', name: 'Legacy Check-in', auth: true },
    { method: 'POST', url: '/api/employee/attendance/session/start', name: 'Start Session', auth: true },
    { method: 'POST', url: '/api/employee/attendance/break/start', name: 'Start Break', auth: true },
    { method: 'GET', url: '/api/admin/attendance/live', name: 'Live Attendance', auth: true },
  ];

  for (const endpoint of endpoints) {
    try {
      console.log(`\n📡 Testing ${endpoint.name}...`);
      console.log(`   ${endpoint.method} ${endpoint.url}`);

      const config = {
        method: endpoint.method,
        url: `${BASE_URL}${endpoint.url}`,
        timeout: 5000,
        validateStatus: () => true // Don't throw on any status code
      };

      if (endpoint.auth) {
        // Add a dummy auth header to test auth requirement
        config.headers = { 'Authorization': 'Bearer dummy-token' };
      }

      const response = await axios(config);
      
      console.log(`   Status: ${response.status}`);
      
      if (endpoint.auth && response.status === 401) {
        console.log('   ✅ Authentication required (expected)');
      } else if (!endpoint.auth && response.status === 200) {
        console.log('   ✅ Endpoint accessible');
        if (response.data.message) {
          console.log(`   Message: ${response.data.message}`);
        }
      } else if (response.status === 404) {
        console.log('   ❌ Endpoint not found');
      } else if (response.status === 500) {
        console.log('   ❌ Server error');
        console.log(`   Error: ${response.data?.message || 'Unknown error'}`);
      } else {
        console.log(`   ℹ️  Response: ${response.data?.message || 'No message'}`);
      }

    } catch (error) {
      console.log(`   ❌ Request failed: ${error.message}`);
    }
  }

  console.log('\n' + '=' .repeat(50));
  console.log('✅ Endpoint Test Complete');
  console.log('\n📋 Summary:');
  console.log('   - Health endpoint should return 200');
  console.log('   - Authenticated endpoints should return 401 without token');
  console.log('   - No endpoints should return 404 (not found)');
  console.log('   - Check for any 500 errors that need fixing');
};

// Test with a real login attempt
const testWithAuth = async () => {
  console.log('\n🔐 Testing with Authentication...');
  
  try {
    // Try to login with employee credentials (has employeeId)
    const loginResponse = await axios.post(`${BASE_URL}/api/auth/login`, {
      email: 'john.smith@hrms.com',
      password: 'emp123'
    });

    if (loginResponse.data.success && loginResponse.data.data.accessToken) {
      console.log('✅ Login successful');
      const token = loginResponse.data.data.accessToken;
      
      // Test a few endpoints with real auth
      const authTests = [
        { method: 'GET', url: '/api/employee/attendance', name: 'Get Records' },
        { method: 'GET', url: '/api/admin/attendance/live', name: 'Live Attendance' }
      ];

      for (const test of authTests) {
        try {
          const response = await axios({
            method: test.method,
            url: `${BASE_URL}${test.url}`,
            headers: { 'Authorization': `Bearer ${token}` },
            timeout: 5000
          });
          
          console.log(`✅ ${test.name}: ${response.status} - ${response.data?.message || 'Success'}`);
          
          if (test.name === 'Live Attendance' && response.data?.data) {
            console.log(`   Active employees: ${response.data.data.length}`);
          }
          
        } catch (error) {
          console.log(`❌ ${test.name}: ${error.response?.status || 'Error'} - ${error.response?.data?.message || error.message}`);
        }
      }
    } else {
      console.log('❌ Login failed - using default credentials');
    }
  } catch (error) {
    console.log('❌ Authentication test failed:', error.response?.data?.message || error.message);
  }
};

// Run tests
const runTests = async () => {
  await testEndpoints();
  await testWithAuth();
  
  console.log('\n💡 Next Steps:');
  console.log('   1. If endpoints return 404, check route configuration');
  console.log('   2. If endpoints return 500, check server logs');
  console.log('   3. If authentication works, test the frontend components');
  console.log('   4. Use the AttendanceAPITester component for detailed testing');
};

runTests().catch(console.error);