import fetch from 'node-fetch';

const API_BASE = 'http://localhost:5000/api';

async function testLogin() {
  try {
    console.log('🔐 Testing login...');
    
    const response = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'john@hrm.com',
        password: 'john123'
      })
    });
    
    const data = await response.json();
    
    console.log('Response status:', response.status);
    console.log('Response data:', JSON.stringify(data, null, 2));
    
    if (data.success && data.data?.accessToken) {
      console.log('✅ Login successful!');
      
      // Test company endpoints with token
      const token = data.data.accessToken;
      const headers = {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      };
      
      console.log('\n🏢 Testing company endpoints...');
      
      const leaveResponse = await fetch(`${API_BASE}/employee/company/leave-today`, { headers });
      const leaveData = await leaveResponse.json();
      console.log('Leave endpoint:', leaveResponse.status, leaveData.success ? 'SUCCESS' : 'FAILED');
      if (leaveData.data) console.log('Leave data:', leaveData.data.length, 'employees');
      
      const wfhResponse = await fetch(`${API_BASE}/employee/company/wfh-today`, { headers });
      const wfhData = await wfhResponse.json();
      console.log('WFH endpoint:', wfhResponse.status, wfhData.success ? 'SUCCESS' : 'FAILED');
      if (wfhData.data) console.log('WFH data:', wfhData.data.length, 'employees');
      
    } else {
      console.log('❌ Login failed:', data.message);
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

testLogin();