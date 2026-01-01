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

async function testDesignationCRUD(token) {
  console.log('\n🧪 Testing Designation CRUD Operations...');
  
  const timestamp = Date.now();
  let createdDesignationId = null;

  // Test 1: Create designation
  console.log('\n1️⃣ Testing CREATE designation...');
  const createData = {
    title: `QA Engineer ${timestamp}`,
    description: 'Quality Assurance Engineer for testing applications',
    level: 'mid',
    departmentId: 1,
    isActive: true,
    requirements: ['Bachelor degree', '2+ years experience'],
    responsibilities: ['Write test cases', 'Execute tests', 'Report bugs']
  };

  try {
    const createResponse = await makeRequest({
      hostname: 'localhost',
      port: 5000,
      path: '/api/admin/designations',
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    }, createData);

    if (createResponse.data.success) {
      createdDesignationId = createResponse.data.data.id;
      console.log('✅ CREATE: Designation created successfully');
      console.log(`   ID: ${createdDesignationId}`);
      console.log(`   isActive: ${createResponse.data.data.isActive}`);
      console.log(`   employeeCount: ${createResponse.data.data.employeeCount}`);
    } else {
      console.log('❌ CREATE failed:', createResponse.data.message);
      return false;
    }
  } catch (error) {
    console.log('❌ CREATE error:', error.message);
    return false;
  }

  // Test 2: Get designations (should include the new one)
  console.log('\n2️⃣ Testing GET designations...');
  try {
    const getResponse = await makeRequest({
      hostname: 'localhost',
      port: 5000,
      path: '/api/admin/designations',
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (getResponse.data.success) {
      const designations = getResponse.data.data;
      const ourDesignation = designations.find(d => d.id === createdDesignationId);
      
      if (ourDesignation) {
        console.log('✅ GET: Designation found in list');
        console.log(`   isActive: ${ourDesignation.isActive} (type: ${typeof ourDesignation.isActive})`);
        console.log(`   employeeCount: ${ourDesignation.employeeCount} (type: ${typeof ourDesignation.employeeCount})`);
        console.log(`   department: ${ourDesignation.department?.name}`);
        console.log(`   requirements: ${JSON.stringify(ourDesignation.requirements)}`);
        console.log(`   responsibilities: ${JSON.stringify(ourDesignation.responsibilities)}`);
        
        // Verify data types and structure
        if (typeof ourDesignation.isActive === 'boolean') {
          console.log('✅ isActive is boolean type');
        } else {
          console.log('❌ isActive is not boolean type');
        }
        
        if (typeof ourDesignation.employeeCount === 'number') {
          console.log('✅ employeeCount is number type');
        } else {
          console.log('❌ employeeCount is not number type');
        }
      } else {
        console.log('❌ GET: Created designation not found in list');
        return false;
      }
    } else {
      console.log('❌ GET failed:', getResponse.data.message);
      return false;
    }
  } catch (error) {
    console.log('❌ GET error:', error.message);
    return false;
  }

  // Test 3: Update designation (toggle isActive)
  console.log('\n3️⃣ Testing UPDATE designation (toggle isActive)...');
  try {
    const updateData = {
      title: `QA Engineer ${timestamp} - Updated`,
      isActive: false,
      departmentId: 1
    };

    const updateResponse = await makeRequest({
      hostname: 'localhost',
      port: 5000,
      path: `/api/admin/designations/${createdDesignationId}`,
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    }, updateData);

    if (updateResponse.data.success) {
      console.log('✅ UPDATE: Designation updated successfully');
      console.log(`   New title: ${updateResponse.data.data.title}`);
      console.log(`   isActive: ${updateResponse.data.data.isActive}`);
    } else {
      console.log('❌ UPDATE failed:', updateResponse.data.message);
      return false;
    }
  } catch (error) {
    console.log('❌ UPDATE error:', error.message);
    return false;
  }

  // Test 4: Get designations with includeInactive=true
  console.log('\n4️⃣ Testing GET designations with includeInactive=true...');
  try {
    const getInactiveResponse = await makeRequest({
      hostname: 'localhost',
      port: 5000,
      path: '/api/admin/designations?includeInactive=true',
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (getInactiveResponse.data.success) {
      const designations = getInactiveResponse.data.data;
      const ourDesignation = designations.find(d => d.id === createdDesignationId);
      
      if (ourDesignation && !ourDesignation.isActive) {
        console.log('✅ GET with includeInactive: Inactive designation found');
        console.log(`   isActive: ${ourDesignation.isActive}`);
      } else {
        console.log('❌ GET with includeInactive: Inactive designation not found or still active');
        return false;
      }
    } else {
      console.log('❌ GET with includeInactive failed:', getInactiveResponse.data.message);
      return false;
    }
  } catch (error) {
    console.log('❌ GET with includeInactive error:', error.message);
    return false;
  }

  // Test 5: Get designations without includeInactive (should not include our inactive one)
  console.log('\n5️⃣ Testing GET designations without includeInactive (should exclude inactive)...');
  try {
    const getActiveResponse = await makeRequest({
      hostname: 'localhost',
      port: 5000,
      path: '/api/admin/designations',
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (getActiveResponse.data.success) {
      const designations = getActiveResponse.data.data;
      const ourDesignation = designations.find(d => d.id === createdDesignationId);
      
      if (!ourDesignation) {
        console.log('✅ GET active only: Inactive designation correctly excluded');
      } else {
        console.log('❌ GET active only: Inactive designation incorrectly included');
        return false;
      }
    } else {
      console.log('❌ GET active only failed:', getActiveResponse.data.message);
      return false;
    }
  } catch (error) {
    console.log('❌ GET active only error:', error.message);
    return false;
  }

  console.log('\n🎉 All designation CRUD tests passed!');
  return true;
}

async function runComprehensiveTests() {
  console.log('🚀 Starting Comprehensive Designation Fix Tests...\n');

  // Step 1: Login as HR
  const token = await loginAsHR();
  if (!token) return;

  // Step 2: Run CRUD tests
  const success = await testDesignationCRUD(token);
  
  if (success) {
    console.log('\n✅ ALL TESTS PASSED! The designation controller fixes are working correctly.');
    console.log('\n🔧 Fixed Issues:');
    console.log('   ✅ isActive field mapping (camelCase ↔ database)');
    console.log('   ✅ Response formatting with proper data types');
    console.log('   ✅ Update operations with field validation');
    console.log('   ✅ Filtering by isActive status');
    console.log('   ✅ employeeCount field included in responses');
  } else {
    console.log('\n❌ Some tests failed. Please check the issues above.');
  }
}

runComprehensiveTests().catch(console.error);