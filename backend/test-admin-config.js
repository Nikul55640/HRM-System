/**
 * Test script for Admin Configuration endpoints
 * Run this to verify the admin config endpoints are working
 */

import axios from 'axios';

const API_BASE = 'http://localhost:5000/api';

// Test configuration
const testConfig = {
  // You'll need to replace this with a valid SuperAdmin JWT token
  authToken: 'your-superadmin-jwt-token-here',
  baseURL: API_BASE
};

const api = axios.create({
  baseURL: testConfig.baseURL,
  headers: {
    'Authorization': `Bearer ${testConfig.authToken}`,
    'Content-Type': 'application/json'
  }
});

async function testAdminConfigEndpoints() {
  console.log('🧪 Testing Admin Configuration Endpoints...\n');

  try {
    // Test 1: Get System Configuration
    console.log('1️⃣ Testing GET /admin/config/system');
    try {
      const systemResponse = await api.get('/admin/config/system');
      console.log('✅ System config retrieved:', systemResponse.data);
    } catch (error) {
      console.log('❌ System config failed:', error.response?.data || error.message);
    }

    // Test 2: Get Notification Settings
    console.log('\n2️⃣ Testing GET /admin/config/notifications');
    try {
      const notificationResponse = await api.get('/admin/config/notifications');
      console.log('✅ Notification settings retrieved:', notificationResponse.data);
    } catch (error) {
      console.log('❌ Notification settings failed:', error.response?.data || error.message);
    }

    // Test 3: Get Security Settings
    console.log('\n3️⃣ Testing GET /admin/config/security');
    try {
      const securityResponse = await api.get('/admin/config/security');
      console.log('✅ Security settings retrieved:', securityResponse.data);
    } catch (error) {
      console.log('❌ Security settings failed:', error.response?.data || error.message);
    }

    // Test 4: Get Backup Settings
    console.log('\n4️⃣ Testing GET /admin/config/backup');
    try {
      const backupResponse = await api.get('/admin/config/backup');
      console.log('✅ Backup settings retrieved:', backupResponse.data);
    } catch (error) {
      console.log('❌ Backup settings failed:', error.response?.data || error.message);
    }

    // Test 5: Update System Configuration
    console.log('\n5️⃣ Testing PUT /admin/config/system');
    try {
      const updateResponse = await api.put('/admin/config/system', {
        companyName: 'Test Company Updated',
        timezone: 'UTC'
      });
      console.log('✅ System config updated:', updateResponse.data);
    } catch (error) {
      console.log('❌ System config update failed:', error.response?.data || error.message);
    }

  } catch (error) {
    console.error('❌ Test suite failed:', error.message);
  }
}

// Instructions for running the test
console.log(`
📋 INSTRUCTIONS:
1. Make sure your backend server is running on ${API_BASE}
2. Login as SuperAdmin and get your JWT token from browser dev tools
3. Replace 'your-superadmin-jwt-token-here' with your actual token
4. Run: node test-admin-config.js

🔑 To get your JWT token:
1. Login to the frontend as SuperAdmin
2. Open browser dev tools (F12)
3. Go to Application/Storage > Local Storage
4. Look for 'authToken' or check Network tab for Authorization header
`);

// Only run tests if token is provided
if (testConfig.authToken !== 'your-superadmin-jwt-token-here') {
  testAdminConfigEndpoints();
} else {
  console.log('⚠️  Please set your JWT token first!');
}