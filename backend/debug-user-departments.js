import axios from 'axios';

const BASE_URL = 'http://localhost:5000/api';

async function debugLogin() {
  try {
    console.log('🔍 Debugging login response...\n');

    const loginResponse = await axios.post(`${BASE_URL}/auth/login`, {
      email: 'admin@hrm.com',
      password: 'admin123'
    });

    console.log('✅ Login successful');
    console.log('📋 Full response:', JSON.stringify(loginResponse.data, null, 2));
    
    // Try to extract token from different possible locations
    const possibleTokens = [
      loginResponse.data.token,
      loginResponse.data.data?.token,
      loginResponse.data.accessToken,
      loginResponse.data.data?.accessToken
    ];
    
    console.log('\n🔑 Possible token locations:');
    possibleTokens.forEach((token, index) => {
      console.log(`  ${index + 1}. ${token ? 'Found token' : 'No token'}: ${token ? token.substring(0, 20) + '...' : 'undefined'}`);
    });

  } catch (error) {
    console.error('❌ Login failed:', error.response?.data || error.message);
  }
}

debugLogin();