import axios from 'axios';

const BASE_URL = 'http://localhost:5000/api';

const ADMIN_CREDENTIALS = {
  email: 'admin@hrm.com',
  password: 'admin123'
};

async function debugUserRole() {
  try {
    console.log('🔐 Logging in...');
    const loginResponse = await axios.post(`${BASE_URL}/auth/login`, ADMIN_CREDENTIALS);
    
    console.log('Login response user data:');
    console.log(JSON.stringify(loginResponse.data.data.user, null, 2));
    
    const token = loginResponse.data.data.accessToken;
    
    // Decode the JWT token to see what's inside
    const tokenParts = token.split('.');
    const payload = JSON.parse(Buffer.from(tokenParts[1], 'base64').toString());
    
    console.log('\nJWT Token payload:');
    console.log(JSON.stringify(payload, null, 2));
    
    // Test a simple endpoint that should work
    console.log('\n🧪 Testing a working endpoint for comparison...');
    try {
      const testResponse = await axios.get(`${BASE_URL}/admin/attendance`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      console.log('✅ Admin attendance endpoint works - Status:', testResponse.status);
    } catch (error) {
      console.log('❌ Admin attendance endpoint failed:', error.response?.status);
    }
    
    // Test the finalization endpoint
    console.log('\n🧪 Testing finalization endpoint...');
    try {
      const finalizationResponse = await axios.get(`${BASE_URL}/admin/attendance-finalization/status`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      console.log('✅ Finalization endpoint works - Status:', finalizationResponse.status);
    } catch (error) {
      console.log('❌ Finalization endpoint failed:', error.response?.status);
      console.log('Error details:', error.response?.data);
    }
    
  } catch (error) {
    console.error('Error:', error.response?.data || error.message);
  }
}

debugUserRole();