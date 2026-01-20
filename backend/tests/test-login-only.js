import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config({ path: '.env' });

const BASE_URL = process.env.API_URL || 'http://localhost:5000/api';

async function testLogin() {
  try {
    console.log('Testing login...');
    const response = await axios.post(`${BASE_URL}/auth/login`, {
      email: 'john@hrm.com',
      password: 'john123'
    });

    console.log('\n✅ Login Response:');
    console.log(JSON.stringify(response.data, null, 2));
    
  } catch (error) {
    console.log('\n❌ Login Error:');
    console.log(JSON.stringify(error.response?.data || error.message, null, 2));
  }
}

testLogin();
