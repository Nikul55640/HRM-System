const axios = require('axios');

const BASE_URL = 'http://localhost:5000/api';

// Test different user credentials
const testUsers = [
  { email: 'admin@hrms.com', password: 'admin123' },
  { email: 'hr@hrms.com', password: 'hr123' },
  { email: 'john.smith@hrms.com', password: 'emp123' },
  { email: 'sarah.johnson@hrms.com', password: 'emp123' },
  { email: 'michael.brown@hrms.com', password: 'emp123' },
  { email: 'emily.davis@hrms.com', password: 'emp123' },
  { email: 'james.wilson@hrms.com', password: 'emp123' }
];

async function testLogin(user) {
  try {
    console.log(`\n🔐 Testing login for: ${user.email}`);
    const response = await axios.post(`${BASE_URL}/auth/login`, user);
    
    if (response.data.success) {
      console.log('✅ Login successful');
      console.log('👤 User:', response.data.data.user?.fullName || response.data.data.user?.name || 'Unknown');
      console.log('🏢 Employee ID:', response.data.data.user?.employeeId || 'N/A');
      console.log('🔑 Role:', response.data.data.user?.role || 'Unknown');
      return response.data.data.user;
    }
    return null;
  } catch (error) {
    console.log('❌ Login failed:', error.response?.data?.error?.message || error.message);
    return null;
  }
}

async function checkAllUsers() {
  console.log('🚀 Checking all test users...\n');
  
  const validUsers = [];
  
  for (const user of testUsers) {
    const result = await testLogin(user);
    if (result) {
      validUsers.push({ ...user, userData: result });
    }
  }
  
  console.log('\n📊 Summary:');
  console.log(`✅ Valid users found: ${validUsers.length}`);
  console.log(`❌ Invalid users: ${testUsers.length - validUsers.length}`);
  
  if (validUsers.length > 0) {
    console.log('\n🎯 Valid users with employee profiles:');
    validUsers.forEach(user => {
      if (user.userData.employeeId) {
        console.log(`  - ${user.email} (${user.userData.role}) - Employee ID: ${user.userData.employeeId}`);
      }
    });
  }
}

checkAllUsers().catch(console.error);