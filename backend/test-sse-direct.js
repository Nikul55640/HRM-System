import fetch from 'node-fetch';

const testSSEDirect = async () => {
  try {
    console.log('🧪 Testing SSE endpoint directly...');
    
    // Test without authentication (should fail)
    console.log('\n1️⃣ Testing without authentication:');
    const response1 = await fetch('http://localhost:5000/api/employee/notifications/stream', {
      method: 'GET',
    });
    
    console.log('Status:', response1.status);
    console.log('Headers:', Object.fromEntries(response1.headers.entries()));
    
    if (response1.status !== 200) {
      const text = await response1.text();
      console.log('Response:', text);
    }
    
    // Test with a fake token (should also fail)
    console.log('\n2️⃣ Testing with fake token:');
    const response2 = await fetch('http://localhost:5000/api/employee/notifications/stream', {
      method: 'GET',
      headers: {
        'Authorization': 'Bearer fake-token'
      }
    });
    
    console.log('Status:', response2.status);
    if (response2.status !== 200) {
      const text = await response2.text();
      console.log('Response:', text);
    }
    
    console.log('\n✅ Test completed');
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  }
};

testSSEDirect();