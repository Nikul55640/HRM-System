import axios from 'axios';

async function testUserAuth() {
  try {
    console.log('🧪 Testing user authentication and role...\n');
    
    // Login with john@hrm.com
    console.log('1️⃣ Logging in as john@hrm.com...');
    const loginResponse = await axios.post('http://localhost:5000/api/auth/login', {
      email: 'john@hrm.com',
      password: 'john123'
    });
    
    console.log('✅ Login successful');
    console.log('📋 User data from login:', JSON.stringify(loginResponse.data.data.user, null, 2));
    
    const token = loginResponse.data.data.accessToken;
    
    // Test accessing shifts endpoint
    console.log('\n2️⃣ Testing shifts endpoint access...');
    try {
      const shiftsResponse = await axios.get('http://localhost:5000/api/employee/shifts', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      console.log('✅ Shifts endpoint accessible');
      console.log('📊 Shifts response:', JSON.stringify(shiftsResponse.data, null, 2));
    } catch (shiftsError) {
      console.log('❌ Shifts endpoint error:', shiftsError.response?.status, shiftsError.response?.data);
    }
    
    // Test accessing my-shifts endpoint
    console.log('\n3️⃣ Testing my-shifts endpoint access...');
    try {
      const myShiftsResponse = await axios.get('http://localhost:5000/api/employee/shifts/my-shifts', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      console.log('✅ My-shifts endpoint accessible');
      console.log('📊 My-shifts response:', JSON.stringify(myShiftsResponse.data, null, 2));
    } catch (myShiftsError) {
      console.log('❌ My-shifts endpoint error:', myShiftsError.response?.status, myShiftsError.response?.data);
    }
    
    // Test accessing current shift endpoint
    console.log('\n4️⃣ Testing current shift endpoint access...');
    try {
      const currentShiftResponse = await axios.get('http://localhost:5000/api/employee/shifts/current', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      console.log('✅ Current shift endpoint accessible');
      console.log('📊 Current shift response:', JSON.stringify(currentShiftResponse.data, null, 2));
    } catch (currentShiftError) {
      console.log('❌ Current shift endpoint error:', currentShiftError.response?.status, currentShiftError.response?.data);
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error.response?.data || error.message);
  }
}

testUserAuth();