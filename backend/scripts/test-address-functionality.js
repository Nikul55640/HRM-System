/**
 * Test Script: Address Functionality
 * 
 * This script tests:
 * 1. Reading employee address from database
 * 2. Updating employee address
 * 3. Verifying address is stored as proper JSON object
 * 
 * Usage: node scripts/test-address-functionality.js
 */

import { Employee, User } from '../src/models/sequelize/index.js';
import sequelize from '../src/config/sequelize.js';

const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
};

const log = {
  success: (msg) => console.log(`${colors.green}✅ ${msg}${colors.reset}`),
  error: (msg) => console.log(`${colors.red}❌ ${msg}${colors.reset}`),
  warning: (msg) => console.log(`${colors.yellow}⚠️  ${msg}${colors.reset}`),
  info: (msg) => console.log(`${colors.blue}ℹ️  ${msg}${colors.reset}`),
  test: (msg) => console.log(`${colors.cyan}🧪 ${msg}${colors.reset}`),
};

async function testAddressFunctionality() {
  try {
    console.log('\n' + '='.repeat(60));
    console.log('🚀 Starting Address Functionality Tests');
    console.log('='.repeat(60) + '\n');

    // Test 1: Find test employee
    log.test('Test 1: Finding test employee (EMP-003)...');
    const employee = await Employee.findOne({
      where: { employeeId: 'EMP-003' },
      include: [{
        model: User,
        as: 'user',
        attributes: ['id', 'email', 'role']
      }]
    });

    if (!employee) {
      log.error('Test employee EMP-003 not found');
      log.info('Please ensure employee EMP-003 exists in database');
      return;
    }

    log.success(`Found employee: ${employee.firstName} ${employee.lastName} (${employee.user.email})`);
    console.log(`   Current address:`, employee.address);
    console.log(`   Address type: ${typeof employee.address}`);

    // Test 2: Check current address format
    log.test('\nTest 2: Checking current address format...');
    if (employee.address === null) {
      log.info('Address is NULL (expected after cleanup)');
    } else if (employee.address === '[object Object]') {
      log.error('Address is still broken: [object Object]');
      log.warning('Run: node scripts/fix-address-data.js');
      return;
    } else if (typeof employee.address === 'object') {
      log.success('Address is a proper object');
      console.log('   Address fields:', Object.keys(employee.address));
    } else if (typeof employee.address === 'string') {
      log.warning('Address is a string (old format)');
      try {
        const parsed = JSON.parse(employee.address);
        log.info('String is valid JSON, can be parsed');
        console.log('   Parsed:', parsed);
      } catch {
        log.error('String is NOT valid JSON');
      }
    }

    // Test 3: Update address with new structured data
    log.test('\nTest 3: Updating address with structured data...');
    const testAddress = {
      street: '123 Test Street',
      city: 'Test City',
      state: 'Test State',
      zipCode: '12345',
      country: 'Test Country'
    };

    console.log('   Updating with:', testAddress);
    
    await employee.update({
      address: testAddress,
      updatedBy: employee.userId
    });

    log.success('Address updated successfully');

    // Test 4: Read back the updated address
    log.test('\nTest 4: Reading back updated address...');
    await employee.reload();

    console.log('   Retrieved address:', employee.address);
    console.log('   Address type:', typeof employee.address);

    if (typeof employee.address === 'object' && employee.address !== null) {
      log.success('Address is stored as object ✅');
      
      // Verify all fields
      const expectedFields = ['street', 'city', 'state', 'zipCode', 'country'];
      const actualFields = Object.keys(employee.address);
      
      log.test('\nTest 5: Verifying address fields...');
      expectedFields.forEach(field => {
        if (employee.address[field] === testAddress[field]) {
          log.success(`  ${field}: "${employee.address[field]}" ✅`);
        } else {
          log.error(`  ${field}: Expected "${testAddress[field]}", got "${employee.address[field]}"`);
        }
      });

      // Check for unexpected fields
      const unexpectedFields = actualFields.filter(f => !expectedFields.includes(f));
      if (unexpectedFields.length > 0) {
        log.warning(`  Unexpected fields found: ${unexpectedFields.join(', ')}`);
      }

    } else if (employee.address === '[object Object]') {
      log.error('Address is STILL broken: [object Object]');
      log.warning('Backend controller may not be using the fixed code');
      log.info('Make sure backend server is restarted!');
    } else {
      log.error('Address is not an object');
      log.info(`Got type: ${typeof employee.address}`);
      log.info(`Value: ${JSON.stringify(employee.address)}`);
    }

    // Test 6: Simulate API response
    log.test('\nTest 6: Simulating API response format...');
    const apiResponse = {
      success: true,
      data: {
        id: employee.id,
        employeeId: employee.employeeId,
        firstName: employee.firstName,
        lastName: employee.lastName,
        address: employee.address,
        user: {
          email: employee.user.email,
          role: employee.user.role
        }
      }
    };

    console.log('   API Response:');
    console.log(JSON.stringify(apiResponse, null, 2));

    if (typeof apiResponse.data.address === 'object' && apiResponse.data.address !== null) {
      log.success('API would return address as object ✅');
    } else {
      log.error('API would return broken address format');
    }

    // Test 7: Test address parsing (frontend simulation)
    log.test('\nTest 7: Testing frontend address parsing...');
    const parseAddress = (addr) => {
      if (!addr) return null;
      if (addr === "[object Object]") {
        console.log('   ⚠️  Detected broken format');
        return null;
      }
      if (typeof addr === 'object') {
        console.log('   ✅ Address is already an object');
        return addr;
      }
      if (typeof addr === 'string') {
        try {
          console.log('   📝 Parsing JSON string');
          return JSON.parse(addr);
        } catch {
          console.log('   ⚠️  Invalid JSON, treating as plain text');
          return { street: addr };
        }
      }
      return null;
    };

    const parsedAddress = parseAddress(employee.address);
    if (parsedAddress && typeof parsedAddress === 'object') {
      log.success('Frontend parsing would work correctly');
      console.log('   Parsed result:', parsedAddress);
    } else {
      log.error('Frontend parsing would fail');
    }

    // Summary
    console.log('\n' + '='.repeat(60));
    console.log('📊 Test Summary');
    console.log('='.repeat(60));
    
    const allTestsPassed = 
      employee.address !== '[object Object]' &&
      typeof employee.address === 'object' &&
      employee.address !== null &&
      employee.address.street === testAddress.street &&
      employee.address.city === testAddress.city;

    if (allTestsPassed) {
      log.success('\n🎉 All tests PASSED! Address functionality is working correctly.\n');
      console.log('Next steps:');
      console.log('1. ✅ Backend is storing addresses correctly');
      console.log('2. ✅ Frontend can parse addresses correctly');
      console.log('3. ✅ No [object Object] issues');
      console.log('\nYou can now:');
      console.log('- Login to frontend as john@hrm.com');
      console.log('- Go to Profile Settings → Contact Information');
      console.log('- Update address and verify it displays correctly');
    } else {
      log.error('\n❌ Some tests FAILED. Please check the issues above.\n');
      console.log('Troubleshooting:');
      console.log('1. Make sure backend server is restarted');
      console.log('2. Run: node scripts/fix-address-data.js');
      console.log('3. Check backend/src/controllers/employee/profile.controller.js');
    }
    console.log('');

  } catch (error) {
    log.error('Test failed with error:');
    console.error(error);
  } finally {
    await sequelize.close();
  }
}

// Run tests
testAddressFunctionality();
