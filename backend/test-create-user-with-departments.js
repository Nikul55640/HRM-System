import axios from 'axios';

const BASE_URL = 'http://localhost:5000/api';

async function testCreateUserWithDepartments() {
  try {
    console.log('🧪 Testing User Creation with Departments...\n');

    // Login as SuperAdmin
    console.log('1. Logging in as SuperAdmin...');
    const loginResponse = await axios.post(`${BASE_URL}/auth/login`, {
      email: 'admin@hrm.com',
      password: 'admin123'
    });

    const token = loginResponse.data.data.accessToken;
    console.log('✅ Login successful\n');

    const headers = {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    };

    // First, get available departments
    console.log('2. Fetching departments...');
    const deptResponse = await axios.get(`${BASE_URL}/admin/departments`, { headers });
    console.log('✅ Departments fetched');
    console.log(`📊 Available departments: ${deptResponse.data.data?.departments?.length || 0}`);
    
    if (deptResponse.data.data?.departments?.length > 0) {
      deptResponse.data.data.departments.forEach(dept => {
        console.log(`   - ${dept.name} (ID: ${dept.id})`);
      });
    }

    // If no departments exist, create one
    if (!deptResponse.data.data?.departments?.length) {
      console.log('\n3. Creating a test department...');
      const newDeptResponse = await axios.post(`${BASE_URL}/departments`, {
        name: 'Test Department',
        description: 'A test department for user assignment',
        code: 'TEST'
      }, { headers });
      
      console.log('✅ Test department created:', newDeptResponse.data.data.department.name);
    }

    // Get departments again to ensure we have at least one
    const updatedDeptResponse = await axios.get(`${BASE_URL}/departments`, { headers });
    const departments = updatedDeptResponse.data.data?.departments || [];
    
    if (departments.length > 0) {
      const firstDept = departments[0];
      
      console.log(`\n4. Creating HR_Manager user with department assignment...`);
      
      // Create a new HR_Manager user with department assignment
      const newUserResponse = await axios.post(`${BASE_URL}/users`, {
        email: 'test.hr.manager@hrm.com',
        password: 'TestHR123!',
        role: 'HR_Manager',
        assignedDepartments: [firstDept.id]
      }, { headers });
      
      console.log('✅ HR_Manager user created successfully');
      
      // Now fetch all users to see the department data
      console.log('\n5. Fetching all users to verify department data...');
      const usersResponse = await axios.get(`${BASE_URL}/users`, { headers });
      
      const hrManagerUser = usersResponse.data.data.users.find(u => u.email === 'test.hr.manager@hrm.com');
      
      if (hrManagerUser) {
        console.log('\n📋 HR Manager User Details:');
        console.log(`   Email: ${hrManagerUser.email}`);
        console.log(`   Role: ${hrManagerUser.role}`);
        console.log(`   Assigned Departments:`, hrManagerUser.assignedDepartments);
        
        if (hrManagerUser.assignedDepartments && hrManagerUser.assignedDepartments.length > 0) {
          hrManagerUser.assignedDepartments.forEach(dept => {
            console.log(`     ✅ ${dept.name} (ID: ${dept.id})`);
          });
        }
      }
      
      console.log('\n🎉 Test completed successfully! Department data is now properly populated.');
    }

  } catch (error) {
    console.error('❌ Test failed:', error.response?.data || error.message);
  }
}

testCreateUserWithDepartments();