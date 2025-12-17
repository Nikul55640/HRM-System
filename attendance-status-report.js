/**
 * Attendance System Status Report
 * Comprehensive test of all attendance functionality
 */

const axios = require('axios');

const BASE_URL = 'http://localhost:5000';

const generateReport = async () => {
  console.log('📊 ATTENDANCE SYSTEM STATUS REPORT');
  console.log('=' .repeat(60));
  console.log(`🕒 Generated: ${new Date().toLocaleString()}`);
  console.log(`🌐 Backend URL: ${BASE_URL}`);
  console.log('');

  const results = {
    backend: { status: 'unknown', message: '' },
    authentication: { status: 'unknown', message: '', users: [] },
    employeeAttendance: { status: 'unknown', message: '', endpoints: [] },
    adminAttendance: { status: 'unknown', message: '', endpoints: [] },
    sessionManagement: { status: 'unknown', message: '', endpoints: [] },
    breakManagement: { status: 'unknown', message: '', endpoints: [] }
  };

  // 1. Test Backend Health
  console.log('🏥 BACKEND HEALTH CHECK');
  console.log('-' .repeat(30));
  try {
    const health = await axios.get(`${BASE_URL}/health`, { timeout: 5000 });
    if (health.status === 200) {
      results.backend = { status: 'healthy', message: 'Backend server is running' };
      console.log('✅ Backend: HEALTHY');
      console.log(`   Message: ${health.data.message}`);
    }
  } catch (error) {
    results.backend = { status: 'error', message: error.message };
    console.log('❌ Backend: ERROR');
    console.log(`   Error: ${error.message}`);
    return results; // Can't continue without backend
  }

  // 2. Test Authentication
  console.log('\n🔐 AUTHENTICATION TEST');
  console.log('-' .repeat(30));
  
  const testUsers = [
    { email: 'admin@hrms.com', password: 'admin123', role: 'SuperAdmin' },
    { email: 'hr@hrms.com', password: 'hr123', role: 'HR Administrator' },
    { email: 'john.smith@hrms.com', password: 'emp123', role: 'Employee' }
  ];

  let validToken = null;
  let employeeToken = null;

  for (const user of testUsers) {
    try {
      const login = await axios.post(`${BASE_URL}/api/auth/login`, {
        email: user.email,
        password: user.password
      });

      if (login.data.success && login.data.data.accessToken) {
        console.log(`✅ ${user.role}: Login successful`);
        console.log(`   Email: ${user.email}`);
        console.log(`   User: ${login.data.data.user.fullName}`);
        console.log(`   Employee ID: ${login.data.data.user.employeeId || 'None'}`);
        
        results.authentication.users.push({
          email: user.email,
          role: user.role,
          status: 'success',
          hasEmployeeId: !!login.data.data.user.employeeId
        });

        if (!validToken) validToken = login.data.data.accessToken;
        if (login.data.data.user.employeeId && !employeeToken) {
          employeeToken = login.data.data.accessToken;
        }
      }
    } catch (error) {
      console.log(`❌ ${user.role}: Login failed`);
      console.log(`   Error: ${error.response?.data?.message || error.message}`);
      results.authentication.users.push({
        email: user.email,
        role: user.role,
        status: 'failed',
        error: error.response?.data?.message || error.message
      });
    }
  }

  if (validToken) {
    results.authentication = { status: 'working', message: 'Authentication system functional' };
  } else {
    results.authentication = { status: 'failed', message: 'No valid logins found' };
    console.log('\n❌ Cannot continue without authentication');
    return results;
  }

  // 3. Test Employee Attendance Endpoints
  console.log('\n👤 EMPLOYEE ATTENDANCE ENDPOINTS');
  console.log('-' .repeat(30));
  
  const employeeEndpoints = [
    { method: 'GET', path: '/api/employee/attendance', name: 'Get Records' },
    { method: 'GET', path: '/api/employee/attendance/summary', name: 'Monthly Summary' },
    { method: 'POST', path: '/api/employee/attendance/check-in', name: 'Legacy Check-in' },
    { method: 'POST', path: '/api/employee/attendance/check-out', name: 'Legacy Check-out' }
  ];

  const testToken = employeeToken || validToken;
  
  for (const endpoint of employeeEndpoints) {
    try {
      const config = {
        method: endpoint.method,
        url: `${BASE_URL}${endpoint.path}`,
        headers: { 'Authorization': `Bearer ${testToken}` },
        timeout: 5000,
        validateStatus: () => true
      };

      if (endpoint.method === 'POST') {
        config.data = { location: { address: 'Test' }, remarks: 'API Test' };
      }

      const response = await axios(config);
      
      let status = 'unknown';
      let message = '';
      
      if (response.status === 200) {
        status = 'working';
        message = 'Success';
      } else if (response.status === 403) {
        status = 'auth_issue';
        message = 'Employee profile required';
      } else if (response.status === 400) {
        status = 'validation';
        message = response.data?.message || 'Validation error';
      } else if (response.status === 500) {
        status = 'server_error';
        message = 'Server error';
      }

      console.log(`${status === 'working' ? '✅' : status === 'auth_issue' ? '⚠️' : '❌'} ${endpoint.name}: ${response.status} - ${message}`);
      
      results.employeeAttendance.endpoints.push({
        name: endpoint.name,
        method: endpoint.method,
        path: endpoint.path,
        status,
        httpStatus: response.status,
        message
      });
      
    } catch (error) {
      console.log(`❌ ${endpoint.name}: Request failed - ${error.message}`);
      results.employeeAttendance.endpoints.push({
        name: endpoint.name,
        status: 'error',
        message: error.message
      });
    }
  }

  // 4. Test Session Management
  console.log('\n🎯 SESSION MANAGEMENT ENDPOINTS');
  console.log('-' .repeat(30));
  
  const sessionEndpoints = [
    { method: 'POST', path: '/api/employee/attendance/session/start', name: 'Start Session' },
    { method: 'POST', path: '/api/employee/attendance/session/end', name: 'End Session' },
    { method: 'GET', path: '/api/employee/attendance/sessions', name: 'Get Sessions' }
  ];

  for (const endpoint of sessionEndpoints) {
    try {
      const config = {
        method: endpoint.method,
        url: `${BASE_URL}${endpoint.path}`,
        headers: { 'Authorization': `Bearer ${testToken}` },
        timeout: 5000,
        validateStatus: () => true
      };

      if (endpoint.method === 'POST' && endpoint.name === 'Start Session') {
        config.data = { workLocation: 'office', locationDetails: 'Test Office' };
      }

      const response = await axios(config);
      
      let status = response.status === 200 ? 'working' : 
                   response.status === 403 ? 'auth_issue' :
                   response.status === 400 ? 'validation' : 'error';
      
      console.log(`${status === 'working' ? '✅' : status === 'auth_issue' ? '⚠️' : '❌'} ${endpoint.name}: ${response.status}`);
      
      results.sessionManagement.endpoints.push({
        name: endpoint.name,
        status,
        httpStatus: response.status,
        message: response.data?.message || ''
      });
      
    } catch (error) {
      console.log(`❌ ${endpoint.name}: ${error.message}`);
    }
  }

  // 5. Test Break Management
  console.log('\n☕ BREAK MANAGEMENT ENDPOINTS');
  console.log('-' .repeat(30));
  
  const breakEndpoints = [
    { method: 'POST', path: '/api/employee/attendance/break/start', name: 'Start Break' },
    { method: 'POST', path: '/api/employee/attendance/break/end', name: 'End Break' }
  ];

  for (const endpoint of breakEndpoints) {
    try {
      const response = await axios({
        method: endpoint.method,
        url: `${BASE_URL}${endpoint.path}`,
        headers: { 'Authorization': `Bearer ${testToken}` },
        timeout: 5000,
        validateStatus: () => true
      });
      
      let status = response.status === 200 ? 'working' : 
                   response.status === 403 ? 'auth_issue' :
                   response.status === 400 ? 'validation' : 'error';
      
      console.log(`${status === 'working' ? '✅' : status === 'auth_issue' ? '⚠️' : '❌'} ${endpoint.name}: ${response.status}`);
      
    } catch (error) {
      console.log(`❌ ${endpoint.name}: ${error.message}`);
    }
  }

  // 6. Test Admin Live Attendance
  console.log('\n📡 ADMIN LIVE ATTENDANCE');
  console.log('-' .repeat(30));
  
  try {
    const response = await axios({
      method: 'GET',
      url: `${BASE_URL}/api/admin/attendance/live`,
      headers: { 'Authorization': `Bearer ${validToken}` },
      timeout: 5000,
      validateStatus: () => true
    });
    
    if (response.status === 200) {
      console.log('✅ Live Attendance: Working');
      console.log(`   Active employees: ${response.data.data?.length || 0}`);
      console.log(`   Using mock data: ${response.data.meta?.usingMockData || false}`);
      results.adminAttendance = { status: 'working', message: 'Live attendance functional' };
    } else {
      console.log(`❌ Live Attendance: ${response.status} - ${response.data?.message}`);
      results.adminAttendance = { status: 'error', message: response.data?.message };
    }
  } catch (error) {
    console.log(`❌ Live Attendance: ${error.message}`);
    results.adminAttendance = { status: 'error', message: error.message };
  }

  // Generate Summary
  console.log('\n📋 SUMMARY');
  console.log('=' .repeat(60));
  
  const overallStatus = 
    results.backend.status === 'healthy' &&
    results.authentication.status === 'working' &&
    (results.adminAttendance.status === 'working' || results.adminAttendance.status === 'auth_issue');

  console.log(`🎯 Overall Status: ${overallStatus ? '✅ FUNCTIONAL' : '❌ ISSUES FOUND'}`);
  console.log('');
  console.log('Component Status:');
  console.log(`   Backend Health: ${results.backend.status === 'healthy' ? '✅' : '❌'} ${results.backend.status}`);
  console.log(`   Authentication: ${results.authentication.status === 'working' ? '✅' : '❌'} ${results.authentication.status}`);
  console.log(`   Admin Live View: ${results.adminAttendance.status === 'working' ? '✅' : '❌'} ${results.adminAttendance.status}`);
  
  const workingUsers = results.authentication.users.filter(u => u.status === 'success');
  const usersWithEmployee = workingUsers.filter(u => u.hasEmployeeId);
  
  console.log('');
  console.log('Authentication Details:');
  console.log(`   Working logins: ${workingUsers.length}/3`);
  console.log(`   Users with employee profiles: ${usersWithEmployee.length}`);
  
  if (usersWithEmployee.length === 0) {
    console.log('   ⚠️  No users have employee profiles - employee endpoints will fail');
  }

  console.log('');
  console.log('🚀 RECOMMENDATIONS:');
  
  if (results.backend.status !== 'healthy') {
    console.log('   1. ❌ Fix backend server issues');
  } else {
    console.log('   1. ✅ Backend is healthy');
  }
  
  if (results.authentication.status !== 'working') {
    console.log('   2. ❌ Fix authentication system');
  } else {
    console.log('   2. ✅ Authentication is working');
  }
  
  if (usersWithEmployee.length === 0) {
    console.log('   3. ⚠️  Run database seeding to create employee profiles');
    console.log('      Command: npm run seed (in backend directory)');
  } else {
    console.log('   3. ✅ Employee profiles exist');
  }
  
  if (results.adminAttendance.status === 'working') {
    console.log('   4. ✅ Live attendance dashboard is functional');
  } else {
    console.log('   4. ❌ Fix live attendance dashboard issues');
  }

  console.log('');
  console.log('🎉 NEXT STEPS:');
  console.log('   • Use the frontend AttendanceAPITester component for detailed testing');
  console.log('   • Test clock-in/out functionality with employee accounts');
  console.log('   • Verify session and break management workflows');
  console.log('   • Check admin live attendance dashboard in the UI');

  return results;
};

// Run the report
generateReport().catch(console.error);