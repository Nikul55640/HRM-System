/**
 * Quick test script to check the new company status endpoints
 */

const API_BASE = 'http://localhost:5000/api';

// You'll need to replace this with a valid JWT token from your login
const TEST_TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MywiZW1haWwiOiJqb2huQGhybS5jb20iLCJyb2xlIjoiRW1wbG95ZWUiLCJhc3NpZ25lZERlcGFydG1lbnRzIjpbXSwiaWF0IjoxNzY4ODE3ODk1LCJleHAiOjE3Njg4MTg3OTV9.d6ymPr3RxS1xIBw_Q9FNBBZ2-lF98SYeUKYpdbmHSUk';

async function testEndpoint(endpoint, description) {
  try {
    console.log(`\n🧪 Testing ${description}...`);
    console.log(`📍 URL: ${API_BASE}${endpoint}`);
    
    const response = await fetch(`${API_BASE}${endpoint}`, {
      headers: {
        'Authorization': `Bearer ${TEST_TOKEN}`,
        'Content-Type': 'application/json'
      }
    });
    
    const data = await response.json();
    
    if (response.ok) {
      console.log('✅ Success:', data.message);
      console.log('📊 Data count:', data.data?.length || 0);
      if (data.data?.length > 0) {
        console.log('📋 Sample data:', JSON.stringify(data.data[0], null, 2));
      }
    } else {
      console.log('❌ Error:', response.status, data.message);
    }
  } catch (error) {
    console.log('💥 Request failed:', error.message);
  }
}

async function runTests() {
  console.log('🚀 Testing Company Status Endpoints');
  console.log('=====================================');
  
  await testEndpoint('/employee/company/debug-attendance', 'Debug Attendance Data');
  await testEndpoint('/employee/company/leave-today', 'Leave Today');
  await testEndpoint('/employee/company/wfh-today', 'WFH Today');
  await testEndpoint('/employee/company/status-today', 'Company Status Today');
  
  console.log('\n✨ Tests completed!');
}

// Run if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  runTests().catch(console.error);
}

export { testEndpoint, runTests };