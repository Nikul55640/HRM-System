/**
 * Test Session API with Fixed Backend
 */

const axios = require('axios');

const BASE_URL = 'http://localhost:5000';

const testSessionAPI = async () => {
  console.log('🧪 Testing Session API with Backend Fix');
  console.log('=' .repeat(50));

  try {
    // 1. Login
    console.log('🔐 Logging in...');
    const loginResponse = await axios.post(`${BASE_URL}/api/auth/login`, {
      email: 'john.doe@hrms.com',
      password: 'emp123'
    });

    if (!loginResponse.data.success) {
      console.log('❌ Login failed');
      return;
    }

    const token = loginResponse.data.data.accessToken;
    console.log('✅ Login successful');
    console.log(`   User: ${loginResponse.data.data.user.fullName}`);
    console.log(`   Employee ID: ${loginResponse.data.data.user.employeeId}`);

    const headers = { 'Authorization': `Bearer ${token}` };

    // 2. Test Session Start
    console.log('\n🟢 Testing Session Start...');
    try {
      const sessionStart = await axios.post(`${BASE_URL}/api/employee/attendance/session/start`, {
        workLocation: 'office',
        locationDetails: 'Main Office - Floor 3'
      }, { headers });

      if (sessionStart.data.success) {
        console.log('✅ Session start: SUCCESS');
        console.log(`   Session ID: ${sessionStart.data.data.session.sessionId}`);
        console.log(`   Status: ${sessionStart.data.data.session.status}`);
      } else {
        console.log('❌ Session start: FAILED');
        console.log(`   Message: ${sessionStart.data.message}`);
      }
    } catch (error) {
      console.log('❌ Session start: ERROR');
      console.log(`   Status: ${error.response?.status}`);
      console.log(`   Message: ${error.response?.data?.message}`);
      console.log(`   Error: ${error.response?.data?.error}`);
    }

    // 3. Test Break Start
    console.log('\n☕ Testing Break Start...');
    try {
      const breakStart = await axios.post(`${BASE_URL}/api/employee/attendance/break/start`, {}, { headers });

      if (breakStart.data.success) {
        console.log('✅ Break start: SUCCESS');
        console.log(`   Break ID: ${breakStart.data.data.break.breakId}`);
      } else {
        console.log('❌ Break start: FAILED');
        console.log(`   Message: ${breakStart.data.message}`);
      }
    } catch (error) {
      console.log('❌ Break start: ERROR');
      console.log(`   Status: ${error.response?.status}`);
      console.log(`   Message: ${error.response?.data?.message}`);
    }

    // 4. Test Break End
    console.log('\n🟢 Testing Break End...');
    try {
      const breakEnd = await axios.post(`${BASE_URL}/api/employee/attendance/break/end`, {}, { headers });

      if (breakEnd.data.success) {
        console.log('✅ Break end: SUCCESS');
      } else {
        console.log('❌ Break end: FAILED');
        console.log(`   Message: ${breakEnd.data.message}`);
      }
    } catch (error) {
      console.log('❌ Break end: ERROR');
      console.log(`   Status: ${error.response?.status}`);
      console.log(`   Message: ${error.response?.data?.message}`);
    }

    // 5. Test Session End
    console.log('\n🔴 Testing Session End...');
    try {
      const sessionEnd = await axios.post(`${BASE_URL}/api/employee/attendance/session/end`, {}, { headers });

      if (sessionEnd.data.success) {
        console.log('✅ Session end: SUCCESS');
        console.log(`   Worked minutes: ${sessionEnd.data.data.session.workedMinutes}`);
      } else {
        console.log('❌ Session end: FAILED');
        console.log(`   Message: ${sessionEnd.data.message}`);
      }
    } catch (error) {
      console.log('❌ Session end: ERROR');
      console.log(`   Status: ${error.response?.status}`);
      console.log(`   Message: ${error.response?.data?.message}`);
    }

    // 6. Test Live Attendance (Admin)
    console.log('\n📡 Testing Live Attendance...');
    try {
      const liveAttendance = await axios.get(`${BASE_URL}/api/admin/attendance/live`, { headers });

      if (liveAttendance.data.success) {
        console.log('✅ Live attendance: SUCCESS');
        console.log(`   Active employees: ${liveAttendance.data.data.length}`);
        console.log(`   Summary: ${JSON.stringify(liveAttendance.data.summary)}`);
      } else {
        console.log('❌ Live attendance: FAILED');
        console.log(`   Message: ${liveAttendance.data.message}`);
      }
    } catch (error) {
      console.log('❌ Live attendance: ERROR');
      console.log(`   Status: ${error.response?.status}`);
      console.log(`   Message: ${error.response?.data?.message}`);
    }

  } catch (error) {
    console.log('❌ Test failed:', error.message);
  }

  console.log('\n' + '=' .repeat(50));
  console.log('🎯 Test Complete');
};

testSessionAPI().catch(console.error);