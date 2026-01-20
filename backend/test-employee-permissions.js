/**
 * Test Employee Permissions
 * This script will test the actual API calls to see what's happening
 */

import fetch from 'node-fetch';

const API_BASE = 'http://localhost:5000/api';

// Test credentials (from seed data)
const TEST_CREDENTIALS = {
  email: 'john@hrm.com', // Employee from seed data
  password: 'john123' // Password from seed data
};

async function testEmployeePermissions() {
  console.log('🔧 [TEST] Testing Employee Permissions...\n');
  
  try {
    // Step 1: Login
    console.log('1️⃣ Logging in...');
    const loginResponse = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(TEST_CREDENTIALS)
    });
    
    const loginData = await loginResponse.json();
    
    console.log('Raw login response:', JSON.stringify(loginData, null, 2));
    
    if (!loginData.success) {
      console.error('❌ Login failed:', loginData.message);
      return;
    }
    
    console.log('✅ Login successful');
    console.log('   User role:', loginData.data.user.role);
    console.log('   Token exists:', !!loginData.data.accessToken);
    
    const token = loginData.data.accessToken; // ✅ FIX: Use accessToken instead of token
    const headers = {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    };
    
    // Step 2: Test debug endpoint
    console.log('\n2️⃣ Testing debug endpoint...');
    try {
      const debugResponse = await fetch(`${API_BASE}/debug/user-permissions`, {
        headers
      });
      
      const debugData = await debugResponse.json();
      console.log('Debug status:', debugResponse.status);
      console.log('Debug response:', JSON.stringify(debugData, null, 2));
    } catch (debugError) {
      console.log('Debug endpoint error:', debugError.message);
    }
    
    // Step 3: Test company status endpoints
    console.log('\n3️⃣ Testing company status endpoints...');
    
    const endpoints = [
      '/employee/company/leave-today',
      '/employee/company/wfh-today',
      '/employee/company/status-today'
    ];
    
    for (const endpoint of endpoints) {
      console.log(`\n   Testing: ${endpoint}`);
      try {
        const response = await fetch(`${API_BASE}${endpoint}`, { headers });
        const data = await response.json();
        
        console.log(`   Status: ${response.status}`);
        console.log(`   Success: ${data.success}`);
        
        if (!data.success) {
          console.log(`   Error: ${data.error?.message || data.message}`);
          console.log(`   Details:`, data.error?.details);
        } else {
          console.log(`   Data count: ${data.data?.length || 0}`);
        }
      } catch (error) {
        console.error(`   Request failed:`, error.message);
      }
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

// Run the test
testEmployeePermissions();