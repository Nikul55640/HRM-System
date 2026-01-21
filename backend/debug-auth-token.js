import axios from 'axios';

const BASE_URL = 'http://localhost:5000/api';

const ADMIN_CREDENTIALS = {
  email: 'admin@hrm.com',
  password: 'admin123'
};

async function debugAuth() {
  try {
    console.log('🔐 Logging in...');
    const loginResponse = await axios.post(`${BASE_URL}/auth/login`, ADMIN_CREDENTIALS);
    
    console.log('Login response:', JSON.stringify(loginResponse.data, null, 2));
    
    if (loginResponse.data.success && loginResponse.data.data.accessToken) {
      const token = loginResponse.data.data.accessToken;
      console.log('\n🎫 Token received:', token.substring(0, 50) + '...');
      
      // Test a simple endpoint
      console.log('\n🧪 Testing simple endpoint with token...');
      
      try {
        const testResponse = await axios.get(`${BASE_URL}/admin/attendance`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
        
        console.log('✅ Success:', testResponse.status);
        console.log('Response:', testResponse.data);
        
      } catch (error) {
        console.log('❌ Error:', error.response?.status);
        console.log('Error data:', error.response?.data);
        console.log('Error headers:', error.response?.headers);
        
        // Check if it's a token format issue
        console.log('\n🔍 Debugging token format...');
        console.log('Authorization header sent:', `Bearer ${token}`);
      }
    }
    
  } catch (error) {
    console.error('Login failed:', error.response?.data || error.message);
  }
}

debugAuth();