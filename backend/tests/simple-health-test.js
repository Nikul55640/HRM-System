// Simple health check test - Use this to verify your setup
import axios from 'axios';

const BASE_URL = process.env.API_URL || 'http://localhost:5000';

async function quickHealthCheck() {
  console.log('🔍 Testing HRM Backend API...\n');
  
  try {
    // Test 1: Health endpoint
    console.log('1. Testing health endpoint...');
    const health = await axios.get(`${BASE_URL}/health`);
    console.log('   ✅ Health check passed:', health.data.message);
    
    // Test 2: API base
    console.log('\n2. Testing API base...');
    const api = await axios.get(`${BASE_URL}/api/config`);
    console.log('   ✅ API is responding');
    
    console.log('\n✨ Backend is ready for testing!');
    console.log('\nNext step: Run full test suite with:');
    console.log('   npm run test:api\n');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error('\n⚠️  Make sure:');
    console.error('   1. Backend server is running (npm run dev)');
    console.error('   2. Database is connected');
    console.error('   3. Port 5000 is not blocked\n');
    process.exit(1);
  }
}

quickHealthCheck();
