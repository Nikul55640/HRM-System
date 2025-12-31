import fetch from 'node-fetch';

const BASE_URL = 'http://localhost:5000/api';

// Test data - you'll need to replace with actual token and employee ID
const TEST_TOKEN = 'your-jwt-token-here';
const TEST_EMPLOYEE_ID = 1;

async function testAttendanceCorrections() {
  console.log('🧪 Testing Attendance Corrections API...\n');

  const headers = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${TEST_TOKEN}`
  };

  try {
    // Test 1: Get pending corrections
    console.log('1. Testing GET /admin/attendance-corrections/pending');
    const pendingResponse = await fetch(`${BASE_URL}/admin/attendance-corrections/pending`, {
      headers
    });
    
    if (pendingResponse.ok) {
      const pendingData = await pendingResponse.json();
      console.log('✅ Pending corrections endpoint working');
      console.log(`   Found ${pendingData.data?.length || 0} pending corrections\n`);
    } else {
      console.log(`❌ Pending corrections failed: ${pendingResponse.status} ${pendingResponse.statusText}`);
      const errorText = await pendingResponse.text();
      console.log(`   Error: ${errorText}\n`);
    }

    // Test 2: Get correction history
    console.log('2. Testing GET /admin/attendance-corrections/history');
    const historyResponse = await fetch(`${BASE_URL}/admin/attendance-corrections/history`, {
      headers
    });
    
    if (historyResponse.ok) {
      const historyData = await historyResponse.json();
      console.log('✅ Correction history endpoint working');
      console.log(`   Found ${historyData.data?.length || 0} historical corrections\n`);
    } else {
      console.log(`❌ Correction history failed: ${historyResponse.status} ${historyResponse.statusText}`);
      const errorText = await historyResponse.text();
      console.log(`   Error: ${errorText}\n`);
    }

    // Test 3: Test authentication without token
    console.log('3. Testing authentication (without token)');
    const noAuthResponse = await fetch(`${BASE_URL}/admin/attendance-corrections/pending`);
    
    if (noAuthResponse.status === 401) {
      console.log('✅ Authentication working - returns 401 without token\n');
    } else {
      console.log(`❌ Authentication issue: Expected 401, got ${noAuthResponse.status}\n`);
    }

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

// Instructions for manual testing
console.log('📋 Manual Testing Instructions:');
console.log('1. Make sure the backend server is running on port 5000');
console.log('2. Login to get a valid JWT token');
console.log('3. Replace TEST_TOKEN in this file with your actual token');
console.log('4. Run: node test-attendance-corrections.js\n');

// Run basic connectivity test
testAttendanceCorrections();