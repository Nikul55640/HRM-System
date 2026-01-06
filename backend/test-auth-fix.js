import axios from 'axios';

async function testAuthFix() {
  try {
    console.log('🧪 Testing authentication fix...\n');
    
    // First, login to get a token
    console.log('1️⃣ Logging in...');
    const loginResponse = await axios.post('http://localhost:5000/api/auth/login', {
      email: 'john@hrm.com',
      password: 'john123'
    });
    
    const token = loginResponse.data.data.accessToken;
    console.log('✅ Login successful');
    console.log('📋 User data:', JSON.stringify(loginResponse.data.data.user, null, 2));
    
    // Test leave balance endpoint (requires employeeId)
    console.log('\n2️⃣ Testing leave balance endpoint...');
    const leaveBalanceResponse = await axios.get('http://localhost:5000/api/employee/leave-balance', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    console.log('✅ Leave balance request successful');
    console.log('📊 Leave balance data:', JSON.stringify(leaveBalanceResponse.data, null, 2));
    
    // Test creating a leave request
    console.log('\n3️⃣ Testing leave request creation...');
    const leaveRequestResponse = await axios.post('http://localhost:5000/api/employee/leave-requests', {
      type: 'Casual',
      startDate: '2026-01-10',
      endDate: '2026-01-10',
      reason: 'Test leave request',
      isHalfDay: false
    }, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    console.log('✅ Leave request creation successful');
    console.log('📝 Leave request data:', JSON.stringify(leaveRequestResponse.data, null, 2));
    
  } catch (error) {
    console.error('❌ Test failed:', error.response?.data || error.message);
    if (error.response?.data) {
      console.error('📋 Error details:', JSON.stringify(error.response.data, null, 2));
    }
  }
}

testAuthFix();