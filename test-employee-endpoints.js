#!/usr/bin/env node

/**
 * Quick test script to check if employee endpoints are accessible
 * Run with: node test-employee-endpoints.js
 */

import fetch from 'node-fetch';

const API_BASE = 'http://localhost:5000/api';

// Test endpoints
const endpoints = [
  '/employee/company/leave-today',
  '/employee/company/wfh-today',
  '/employee/profile',
  '/employee/attendance/summary'
];

async function testEndpoint(endpoint, token = null) {
  try {
    const headers = {
      'Content-Type': 'application/json'
    };
    
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    
    const response = await fetch(`${API_BASE}${endpoint}`, {
      method: 'GET',
      headers
    });
    
    const data = await response.json();
    
    console.log(`\n📍 ${endpoint}`);
    console.log(`   Status: ${response.status} ${response.statusText}`);
    console.log(`   Success: ${data.success || false}`);
    console.log(`   Message: ${data.message || data.error?.message || 'No message'}`);
    
    if (response.status === 401) {
      console.log('   🔐 Authentication required');
    } else if (response.status === 403) {
      console.log('   🚫 Permission denied');
    } else if (response.status === 404) {
      console.log('   ❓ Endpoint not found');
    }
    
  } catch (error) {
    console.log(`\n📍 ${endpoint}`);
    console.log(`   ❌ Error: ${error.message}`);
  }
}

async function main() {
  console.log('🧪 Testing Employee Dashboard Endpoints');
  console.log('==========================================');
  
  console.log('\n🔓 Testing without authentication:');
  for (const endpoint of endpoints) {
    await testEndpoint(endpoint);
  }
  
  console.log('\n\n📝 Summary:');
  console.log('- 401 = Authentication required (expected for employee endpoints)');
  console.log('- 403 = Permission denied (check role permissions)');
  console.log('- 404 = Endpoint not found (route registration issue)');
  console.log('- 500 = Server error (check backend logs)');
  
  console.log('\n💡 Next steps:');
  console.log('1. If you see 404s, check route registration in app.js');
  console.log('2. If you see 401s, that\'s expected - endpoints require authentication');
  console.log('3. Test with valid token using browser dev tools or Postman');
}

main().catch(console.error);