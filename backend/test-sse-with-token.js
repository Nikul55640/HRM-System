import fetch from 'node-fetch';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

const testSSEWithToken = async () => {
  try {
    console.log('🧪 Testing SSE with valid token...');
    
    // Create a valid JWT token for testing
    const payload = {
      id: 1,
      email: 'admin@hrms.com',
      role: 'Admin'
    };
    
    const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '15m' });
    console.log('✅ Generated test token for user 1');
    
    // Test with valid token in Authorization header
    console.log('\n1️⃣ Testing with Authorization header:');
    const response1 = await fetch('http://localhost:5000/api/employee/notifications/stream', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    console.log('Status:', response1.status);
    console.log('Headers:', Object.fromEntries(response1.headers.entries()));
    
    if (response1.status === 200) {
      console.log('✅ SSE connection successful with Authorization header!');
      
      // Read a few bytes to see if it's streaming
      const reader = response1.body.getReader();
      const { value } = await reader.read();
      if (value) {
        console.log('📨 Received data:', new TextDecoder().decode(value));
      }
      reader.releaseLock();
    } else {
      const text = await response1.text();
      console.log('❌ Response:', text);
    }
    
    // Test with token as query parameter
    console.log('\n2️⃣ Testing with query parameter:');
    const response2 = await fetch(`http://localhost:5000/api/employee/notifications/stream?token=${encodeURIComponent(token)}`, {
      method: 'GET'
    });
    
    console.log('Status:', response2.status);
    
    if (response2.status === 200) {
      console.log('✅ SSE connection successful with query parameter!');
    } else {
      const text = await response2.text();
      console.log('❌ Response:', text);
    }
    
    console.log('\n✅ Test completed');
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  }
};

testSSEWithToken();