import axios from 'axios';

// Configuration
const BASE_URL = 'http://localhost:5000/api';

// Test credentials - adjust these based on your seeded data
const ADMIN_CREDENTIALS = {
  email: 'admin@hrm.com',
  password: 'admin123'
};

async function testAdminAttendanceRoutes() {
  console.log('🚀 Testing Admin Attendance Routes\n');
  
  let adminToken;
  
  try {
    // Step 1: Login as admin
    console.log('🔐 Logging in as admin...');
    const loginResponse = await axios.post(`${BASE_URL}/auth/login`, ADMIN_CREDENTIALS);
    
    if (!loginResponse.data.success) {
      throw new Error('Admin login failed');
    }
    
    adminToken = loginResponse.data.data.accessToken;
    console.log('✅ Admin login successful\n');
    
    // Headers for authenticated requests
    const headers = {
      'Authorization': `Bearer ${adminToken}`,
      'Content-Type': 'application/json'
    };

    // Test endpoints one by one
    const endpoints = [
      {
        method: 'GET',
        url: '/admin/attendance',
        description: 'Get all attendance records'
      },
      {
        method: 'GET', 
        url: '/admin/attendance/live',
        description: 'Get live attendance sessions'
      },
      {
        method: 'GET',
        url: '/admin/attendance/analytics',
        description: 'Get attendance analytics'
      },
      {
        method: 'GET',
        url: '/admin/attendance/corrections/pending',
        description: 'Get pending corrections'
      },
      {
        method: 'GET',
        url: '/admin/attendance/reports/late-arrivals',
        description: 'Get late arrivals report'
      },
      {
        method: 'GET',
        url: '/admin/attendance/reports/early-departures', 
        description: 'Get early departures report'
      },
      {
        method: 'GET',
        url: '/admin/attendance/reports/overtime',
        description: 'Get overtime report'
      },
      {
        method: 'GET',
        url: '/admin/attendance/reports/break-violations',
        description: 'Get break violations report'
      },
      {
        method: 'GET',
        url: '/admin/attendance/export',
        description: 'Export attendance data'
      },
      {
        method: 'GET',
        url: '/admin/attendance/all',
        description: 'Get all employees attendance (legacy)'
      },
      {
        method: 'GET',
        url: '/admin/attendance/export-legacy',
        description: 'Export legacy'
      }
    ];

    let passCount = 0;
    let failCount = 0;

    for (const endpoint of endpoints) {
      try {
        console.log(`🧪 Testing: ${endpoint.method} ${endpoint.url}`);
        console.log(`   Description: ${endpoint.description}`);
        
        const response = await axios({
          method: endpoint.method.toLowerCase(),
          url: `${BASE_URL}${endpoint.url}`,
          headers
        });

        console.log(`✅ Status: ${response.status} - ${response.data?.message || 'Success'}`);
        
        if (response.data?.data) {
          if (Array.isArray(response.data.data)) {
            console.log(`   📊 Data: Array with ${response.data.data.length} items`);
          } else if (typeof response.data.data === 'object') {
            console.log(`   📊 Data: Object with ${Object.keys(response.data.data).length} properties`);
          } else {
            console.log(`   📊 Data: ${typeof response.data.data}`);
          }
        }
        
        passCount++;
        
      } catch (error) {
        console.log(`❌ Status: ${error.response?.status || 'Network Error'}`);
        console.log(`   Error: ${error.response?.data?.message || error.message}`);
        failCount++;
      }
      
      console.log(''); // Empty line for readability
    }

    // Test POST endpoints with sample data
    console.log('🔄 Testing POST endpoints...\n');
    
    const postEndpoints = [
      {
        method: 'POST',
        url: '/admin/attendance/process-end-of-day',
        description: 'Process end-of-day attendance',
        data: { date: new Date().toISOString().split('T')[0] }
      },
      {
        method: 'POST',
        url: '/admin/attendance/check-absent',
        description: 'Check absent employees',
        data: { date: new Date().toISOString().split('T')[0] }
      }
    ];

    for (const endpoint of postEndpoints) {
      try {
        console.log(`🧪 Testing: ${endpoint.method} ${endpoint.url}`);
        console.log(`   Description: ${endpoint.description}`);
        
        const response = await axios({
          method: endpoint.method.toLowerCase(),
          url: `${BASE_URL}${endpoint.url}`,
          headers,
          data: endpoint.data
        });

        console.log(`✅ Status: ${response.status} - ${response.data?.message || 'Success'}`);
        passCount++;
        
      } catch (error) {
        console.log(`❌ Status: ${error.response?.status || 'Network Error'}`);
        console.log(`   Error: ${error.response?.data?.message || error.message}`);
        failCount++;
      }
      
      console.log('');
    }

    // Test endpoints with parameters (using sample IDs)
    console.log('🔄 Testing parameterized endpoints...\n');
    
    const currentYear = new Date().getFullYear();
    const currentMonth = new Date().getMonth() + 1;
    const sampleEmployeeId = 1; // Adjust based on your data
    
    const paramEndpoints = [
      {
        method: 'GET',
        url: `/admin/attendance/summary/${sampleEmployeeId}/${currentYear}/${currentMonth}`,
        description: `Monthly summary for employee ${sampleEmployeeId}`
      },
      {
        method: 'GET',
        url: `/admin/attendance/live/${sampleEmployeeId}`,
        description: `Live status for employee ${sampleEmployeeId}`
      }
    ];

    for (const endpoint of paramEndpoints) {
      try {
        console.log(`🧪 Testing: ${endpoint.method} ${endpoint.url}`);
        console.log(`   Description: ${endpoint.description}`);
        
        const response = await axios({
          method: endpoint.method.toLowerCase(),
          url: `${BASE_URL}${endpoint.url}`,
          headers
        });

        console.log(`✅ Status: ${response.status} - ${response.data?.message || 'Success'}`);
        passCount++;
        
      } catch (error) {
        console.log(`❌ Status: ${error.response?.status || 'Network Error'}`);
        console.log(`   Error: ${error.response?.data?.message || error.message}`);
        failCount++;
      }
      
      console.log('');
    }

    // Summary
    const totalTests = passCount + failCount;
    console.log('='.repeat(50));
    console.log('📊 TEST SUMMARY');
    console.log('='.repeat(50));
    console.log(`Total Tests: ${totalTests}`);
    console.log(`✅ Passed: ${passCount}`);
    console.log(`❌ Failed: ${failCount}`);
    console.log(`Success Rate: ${((passCount / totalTests) * 100).toFixed(1)}%`);
    
  } catch (error) {
    console.error('❌ Test setup failed:', error.message);
    if (error.response?.data) {
      console.error('Response data:', error.response.data);
    }
  }
}

// Run the test
testAdminAttendanceRoutes();