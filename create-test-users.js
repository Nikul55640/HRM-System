#!/usr/bin/env node

/**
 * Quick Test User Creation Script
 * Creates additional test users for attendance system testing
 */

const { execSync } = require('child_process');
const path = require('path');

console.log('🚀 Creating Test Users for Attendance System...\n');

try {
  // Change to backend directory and run the seed script
  const backendPath = path.join(__dirname, 'backend');
  
  console.log('📁 Changing to backend directory...');
  process.chdir(backendPath);
  
  console.log('🌱 Running test employee creation script...');
  execSync('node create-test-employees.js', { stdio: 'inherit' });
  
  console.log('\n✅ Test users created successfully!');
  console.log('\n🧪 Available test accounts:');
  console.log('- john.doe@hrms.com (password: emp123)');
  console.log('- alice.johnson@hrms.com (password: emp123)');
  console.log('- david.wilson@hrms.com (password: emp123)');
  console.log('- emma.davis@hrms.com (password: emp123)');
  console.log('\n🔧 Admin accounts:');
  console.log('- admin@hrms.com (password: admin123)');
  console.log('- hr@hrms.com (password: hr123)');
  
} catch (error) {
  console.error('❌ Error creating test users:', error.message);
  
  if (error.message.includes('ENOENT')) {
    console.log('\n💡 Troubleshooting:');
    console.log('1. Make sure you are in the project root directory');
    console.log('2. Ensure the backend server is not running');
    console.log('3. Check database connection in backend/.env');
  }
  
  process.exit(1);
}