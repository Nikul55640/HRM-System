import axios from 'axios';

const BASE_URL = 'http://localhost:5000/api';

async function testUserDepartments() {
  try {
    console.log('🧪 Testing User Departments Fix...\n');

    // First, login as SuperAdmin to get token
    console.log('1. Logging in as SuperAdmin...');
    const loginResponse = await axios.post(`${BASE_URL}/auth/login`, {
      email: 'admin@hrm.com',
      password: 'admin123'
    });

    const token = loginResponse.data.data.accessToken;
    console.log('✅ Login successful\n');

    // Set up headers with token
    const headers = {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    };

    // Test getting all users
    console.log('2. Fetching all users...');
    const usersResponse = await axios.get(`${BASE_URL}/users`, { headers });
    
    console.log('✅ Users fetched successfully');
    console.log(`📊 Total users: ${usersResponse.data.data.users.length}\n`);

    // Check each user for department data
    usersResponse.data.data.users.forEach((user, index) => {
      console.log(`👤 User ${index + 1}:`);
      console.log(`   Email: ${user.email}`);
      console.log(`   Role: ${user.role}`);
      console.log(`   Assigned Departments:`, user.assignedDepartments);
      
      if (user.assignedDepartments && user.assignedDepartments.length > 0) {
        user.assignedDepartments.forEach(dept => {
          console.log(`     - ${dept.name} (ID: ${dept.id})`);
        });
      } else {
        console.log('     - No departments assigned');
      }
      console.log('');
    });

    // Test getting a specific user (if any exist)
    if (usersResponse.data.data.users.length > 0) {
      const firstUser = usersResponse.data.data.users[0];
      console.log(`3. Testing getUserById for user: ${firstUser.email}`);
      
      const userResponse = await axios.get(`${BASE_URL}/users/${firstUser.id}`, { headers });
      console.log('✅ Single user fetched successfully');
      console.log('📋 User details:');
      console.log(`   Email: ${userResponse.data.data.user.email}`);
      console.log(`   Role: ${userResponse.data.data.user.role}`);
      console.log(`   Assigned Departments:`, userResponse.data.data.user.assignedDepartments);
    }

    console.log('\n🎉 Test completed successfully!');

  } catch (error) {
    console.error('❌ Test failed:', error.response?.data || error.message);
    
    if (error.response?.status === 401) {
      console.log('\n💡 Tip: Make sure the server is running and the SuperAdmin credentials are correct');
    }
  }
}

// Run the test
testUserDepartments();