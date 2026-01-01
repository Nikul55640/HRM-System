import http from 'http';

function makeRequest(options, data = null) {
  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => body += chunk);
      res.on('end', () => {
        try {
          resolve({
            status: res.statusCode,
            data: JSON.parse(body)
          });
        } catch (e) {
          resolve({
            status: res.statusCode,
            data: body
          });
        }
      });
    });

    req.on('error', reject);
    
    if (data) {
      req.write(JSON.stringify(data));
    }
    
    req.end();
  });
}

async function loginAsHR() {
  console.log('🔐 Logging in as HR...');
  
  const options = {
    hostname: 'localhost',
    port: 5000,
    path: '/api/auth/login',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    }
  };

  try {
    const response = await makeRequest(options, {
      email: 'hr@hrm.com',
      password: 'hr123'
    });

    if (response.data.success && response.data.data.accessToken) {
      console.log('✅ HR login successful!');
      return response.data.data.accessToken;
    } else {
      console.log('❌ HR login failed:', response.data.message);
      return null;
    }
  } catch (error) {
    console.log('❌ HR login error:', error.message);
    return null;
  }
}

async function testDesignations(token) {
  console.log('\n📋 Testing designations endpoint...');
  
  const options = {
    hostname: 'localhost',
    port: 5000,
    path: '/api/admin/designations',
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`
    }
  };

  try {
    const response = await makeRequest(options);
    console.log(`Status: ${response.status}`);
    console.log('Response:', JSON.stringify(response.data, null, 2));
    
    if (response.data.success) {
      console.log('✅ Designations retrieved successfully!');
      console.log(`   Total designations: ${response.data.data?.length || 0}`);
      return response.data.data;
    } else {
      console.log('❌ Designations failed:', response.data.message);
      return null;
    }
  } catch (error) {
    console.log('❌ Designations error:', error.message);
    return null;
  }
}

async function testCreateDesignation(token) {
  console.log('\n➕ Testing create designation...');
  
  const timestamp = Date.now();
  const designationData = {
    title: `Test Developer ${timestamp}`,
    description: 'A test designation for development purposes',
    level: 'junior',
    departmentId: 1, // Assuming department ID 1 exists
    isActive: true
  };

  const options = {
    hostname: 'localhost',
    port: 5000,
    path: '/api/admin/designations',
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  };

  try {
    const response = await makeRequest(options, designationData);
    console.log(`Status: ${response.status}`);
    console.log('Response:', JSON.stringify(response.data, null, 2));
    
    if (response.data.success) {
      console.log('✅ Designation created successfully!');
      return response.data.data;
    } else {
      console.log('❌ Designation creation failed:', response.data.message);
      return null;
    }
  } catch (error) {
    console.log('❌ Designation creation error:', error.message);
    return null;
  }
}

async function runDesignationTests() {
  console.log('🚀 Starting Designation Tests...\n');

  // Step 1: Login as HR
  const token = await loginAsHR();
  if (!token) return;

  // Step 2: Test get designations
  await testDesignations(token);

  // Step 3: Test create designation
  await testCreateDesignation(token);

  // Step 4: Test get designations again to see the new one
  await testDesignations(token);

  console.log('\n🎉 Designation tests completed!');
}

runDesignationTests().catch(console.error);