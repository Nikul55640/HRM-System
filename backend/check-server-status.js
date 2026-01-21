import axios from 'axios';

const BASE_URL = 'http://localhost:5000';

async function checkServerStatus() {
  console.log('🔍 Checking server status...\n');
  
  try {
    // Check if server is running
    console.log('1. Testing server connectivity...');
    const healthResponse = await axios.get(`${BASE_URL}/api/health`, {
      timeout: 5000
    });
    console.log(`✅ Server is running: ${healthResponse.status}`);
    
  } catch (error) {
    if (error.code === 'ECONNREFUSED') {
      console.log('❌ Server is not running. Please start the server first:');
      console.log('   cd HRM-System/backend');
      console.log('   npm start');
      return false;
    } else {
      console.log(`⚠️  Server connectivity issue: ${error.message}`);
    }
  }

  try {
    // Test basic API endpoint
    console.log('\n2. Testing basic API endpoint...');
    const apiResponse = await axios.get(`${BASE_URL}/api`, {
      timeout: 5000
    });
    console.log(`✅ API endpoint accessible: ${apiResponse.status}`);
    
  } catch (error) {
    console.log(`❌ API endpoint not accessible: ${error.response?.status || error.message}`);
  }

  try {
    // Check if we can reach auth endpoint
    console.log('\n3. Testing auth endpoint availability...');
    const authResponse = await axios.post(`${BASE_URL}/api/auth/login`, {
      email: 'test@test.com',
      password: 'wrongpassword'
    });
    
  } catch (error) {
    if (error.response?.status === 400 || error.response?.status === 401) {
      console.log('✅ Auth endpoint is accessible (expected auth failure)');
    } else {
      console.log(`❌ Auth endpoint issue: ${error.response?.status || error.message}`);
    }
  }

  console.log('\n4. Server appears to be ready for testing! 🚀');
  return true;
}

// Run the check
checkServerStatus().then(isReady => {
  if (isReady) {
    console.log('\n💡 You can now run the attendance routes test:');
    console.log('   node simple-admin-attendance-test.js');
  }
}).catch(error => {
  console.error('❌ Server check failed:', error.message);
});