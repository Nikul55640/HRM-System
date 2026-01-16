// Diagnostic script to check why tests are failing
import axios from 'axios';

const BASE_URL = process.env.API_URL || 'http://localhost:5000';

console.log('🔍 Diagnosing API Test Issues...\n');

async function diagnose() {
  console.log('Step 1: Checking if backend server is running...');
  
  try {
    const response = await axios.get(`${BASE_URL}/health`, { timeout: 3000 });
    console.log('✅ Backend server is running!');
    console.log('   Response:', response.data);
    console.log('\n✨ Server is ready! You can now run: npm run test:api\n');
  } catch (error) {
    if (error.code === 'ECONNREFUSED') {
      console.log('❌ Backend server is NOT running!\n');
      console.log('📋 To fix this:\n');
      console.log('1. Open a NEW terminal window');
      console.log('2. Navigate to backend folder:');
      console.log('   cd HRM-System/backend\n');
      console.log('3. Start the backend server:');
      console.log('   npm run dev\n');
      console.log('4. Wait for "Server running on port 5000" message\n');
      console.log('5. Keep that terminal open (server must stay running)\n');
      console.log('6. In THIS terminal, run tests again:');
      console.log('   npm run test:api\n');
    } else if (error.code === 'ETIMEDOUT') {
      console.log('❌ Connection timeout!\n');
      console.log('The server might be starting up. Wait a few seconds and try again.\n');
    } else {
      console.log('❌ Error:', error.message);
      console.log('\nCheck if:');
      console.log('- Backend server is running on port 5000');
      console.log('- No firewall is blocking the connection');
      console.log('- Database is connected\n');
    }
  }
}

diagnose();
