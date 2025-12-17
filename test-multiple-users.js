const axios = require('axios');

const BASE_URL = 'http://localhost:5000/api';

// Test users to check
const testUsers = [
  { email: 'john.doe@hrms.com', password: 'emp123', name: 'John Doe' },
  { email: 'alice.johnson@hrms.com', password: 'emp123', name: 'Alice Johnson' },
  { email: 'david.wilson@hrms.com', password: 'emp123', name: 'David Wilson' },
  { email: 'emma.davis@hrms.com', password: 'emp123', name: 'Emma Davis' }
];

async function testUserLogin(user) {
  try {
    console.log(`\n🔐 Testing login for: ${user.name} (${user.email})`);
    const response = await axios.post(`${BASE_URL}/auth/login`, {
      email: user.email,
      password: user.password
    });
    
    if (response.data.success) {
      const userData = response.data.data.user;
      console.log('✅ Login successful');
      console.log(`👤 User: ${userData.fullName}`);
      console.log(`🏢 Employee ID: ${userData.employeeId}`);
      console.log(`🔑 Role: ${userData.role}`);
      
      return {
        success: true,
        token: response.data.data.accessToken,
        user: userData
      };
    }
    return { success: false, error: 'Login failed' };
  } catch (error) {
    console.log('❌ Login failed:', error.response?.data?.error?.message || error.message);
    return { success: false, error: error.response?.data?.error?.message || error.message };
  }
}

async function testAttendanceFlow(user, token) {
  try {
    console.log(`\n🧪 Testing attendance flow for: ${user.fullName}`);
    
    const headers = {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    };

    // Test 1: Get current attendance
    console.log('📊 Step 1: Getting current attendance...');
    let response = await axios.get(`${BASE_URL}/employee/attendance`, { headers });
    console.log(`✅ Current records: ${response.data.data?.length || 0}`);

    // Test 2: Start session
    console.log('🟢 Step 2: Starting session...');
    response = await axios.post(`${BASE_URL}/employee/attendance/session/start`, {
      workLocation: 'office'
    }, { headers });
    
    if (response.data.success) {
      console.log('✅ Session started successfully');
      console.log(`🆔 Session ID: ${response.data.data.session.sessionId}`);
      
      // Test 3: Check if session persists
      console.log('📊 Step 3: Checking session persistence...');
      response = await axios.get(`${BASE_URL}/employee/attendance/sessions`, { headers });
      
      const today = new Date().toISOString().split('T')[0];
      const todayRecord = response.data.data?.find(record => 
        record.date?.startsWith(today)
      );
      
      if (todayRecord && todayRecord.sessions?.length > 0) {
        console.log('✅ Session persisted successfully');
        console.log(`📋 Sessions count: ${todayRecord.sessions.length}`);
        
        // Test 4: Try break
        console.log('☕ Step 4: Testing break...');
        response = await axios.post(`${BASE_URL}/employee/attendance/break/start`, {}, { headers });
        
        if (response.data.success) {
          console.log('✅ Break started successfully');
          
          // End break
          await new Promise(resolve => setTimeout(resolve, 1000));
          response = await axios.post(`${BASE_URL}/employee/attendance/break/end`, {}, { headers });
          
          if (response.data.success) {
            console.log('✅ Break ended successfully');
          } else {
            console.log('❌ Break end failed:', response.data.message);
          }
        } else {
          console.log('❌ Break start failed:', response.data.message);
        }
        
        // Test 5: End session
        console.log('🔴 Step 5: Ending session...');
        response = await axios.post(`${BASE_URL}/employee/attendance/session/end`, {}, { headers });
        
        if (response.data.success) {
          console.log('✅ Session ended successfully');
          console.log(`⏱️  Worked minutes: ${response.data.data.session.workedMinutes}`);
        } else {
          console.log('❌ Session end failed:', response.data.message);
        }
        
        return { success: true, sessionPersisted: true };
      } else {
        console.log('❌ Session did NOT persist in database');
        return { success: false, sessionPersisted: false };
      }
    } else {
      console.log('❌ Session start failed:', response.data.message);
      return { success: false, sessionPersisted: false };
    }
    
  } catch (error) {
    console.log('❌ Attendance flow error:', error.response?.data?.message || error.message);
    return { success: false, error: error.response?.data?.message || error.message };
  }
}

async function runMultiUserTest() {
  console.log('🚀 Multi-User Attendance System Test\n');
  console.log('=' .repeat(60));
  
  const results = [];
  
  for (const testUser of testUsers) {
    const loginResult = await testUserLogin(testUser);
    
    if (loginResult.success) {
      const attendanceResult = await testAttendanceFlow(loginResult.user, loginResult.token);
      results.push({
        user: testUser.name,
        email: testUser.email,
        loginSuccess: true,
        attendanceSuccess: attendanceResult.success,
        sessionPersisted: attendanceResult.sessionPersisted,
        error: attendanceResult.error
      });
    } else {
      results.push({
        user: testUser.name,
        email: testUser.email,
        loginSuccess: false,
        attendanceSuccess: false,
        sessionPersisted: false,
        error: loginResult.error
      });
    }
    
    console.log('\n' + '-'.repeat(60));
  }
  
  // Summary
  console.log('\n📊 TEST SUMMARY');
  console.log('=' .repeat(60));
  
  const successful = results.filter(r => r.loginSuccess);
  const sessionWorking = results.filter(r => r.sessionPersisted);
  
  console.log(`👥 Total users tested: ${results.length}`);
  console.log(`✅ Successful logins: ${successful.length}`);
  console.log(`🔄 Sessions persisting: ${sessionWorking.length}`);
  console.log(`❌ Failed tests: ${results.length - successful.length}`);
  
  if (sessionWorking.length === 0 && successful.length > 0) {
    console.log('\n⚠️  ISSUE IDENTIFIED: Session persistence problem affects ALL users');
    console.log('💡 This suggests a system-wide issue, not user-specific');
  } else if (sessionWorking.length < successful.length) {
    console.log('\n⚠️  ISSUE IDENTIFIED: Session persistence problem affects SOME users');
    console.log('💡 This suggests user-specific or data-related issues');
  } else if (sessionWorking.length === successful.length && successful.length > 0) {
    console.log('\n✅ SUCCESS: All sessions are persisting correctly');
    console.log('💡 The attendance system is working properly');
  }
  
  console.log('\n📋 Detailed Results:');
  results.forEach(result => {
    console.log(`\n👤 ${result.user} (${result.email})`);
    console.log(`   Login: ${result.loginSuccess ? '✅' : '❌'}`);
    console.log(`   Attendance: ${result.attendanceSuccess ? '✅' : '❌'}`);
    console.log(`   Session Persist: ${result.sessionPersisted ? '✅' : '❌'}`);
    if (result.error) {
      console.log(`   Error: ${result.error}`);
    }
  });
  
  console.log('\n✅ Multi-user test completed!');
}

runMultiUserTest().catch(console.error);