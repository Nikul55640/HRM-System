/**
 * Test Leave Balance Addition Functionality
 * Tests the backend API for adding leave balances to existing employees
 */

import axios from 'axios';

const BASE_URL = 'http://localhost:3000/api';

// Test configuration
const TEST_CONFIG = {
  adminCredentials: {
    email: 'admin@hrm.com',
    password: 'admin123'
  },
  testEmployee: {
    id: '2', // John's employee ID
    name: 'John Doe'
  }
};

let authToken = '';

/**
 * Login and get authentication token
 */
async function login() {
  try {
    console.log('🔐 Logging in as admin...');
    const response = await axios.post(`${BASE_URL}/auth/login`, TEST_CONFIG.adminCredentials);
    
    if (response.data.success && response.data.data.token) {
      authToken = response.data.data.token;
      console.log('✅ Login successful');
      return true;
    } else {
      console.error('❌ Login failed:', response.data.message);
      return false;
    }
  } catch (error) {
    console.error('❌ Login error:', error.response?.data?.message || error.message);
    return false;
  }
}

/**
 * Get current leave balances for test employee
 */
async function getCurrentBalances() {
  try {
    console.log(`\n📊 Getting current leave balances for employee ${TEST_CONFIG.testEmployee.id}...`);
    
    const response = await axios.get(
      `${BASE_URL}/admin/leave-balances/employee/${TEST_CONFIG.testEmployee.id}`,
      {
        headers: { Authorization: `Bearer ${authToken}` }
      }
    );
    
    if (response.data.success) {
      console.log('✅ Current balances retrieved:');
      console.log(JSON.stringify(response.data.data, null, 2));
      return response.data.data;
    } else {
      console.log('ℹ️ No existing balances found');
      return null;
    }
  } catch (error) {
    console.log('ℹ️ No existing balances or error:', error.response?.data?.message || error.message);
    return null;
  }
}

/**
 * Get all employees leave balances
 */
async function getAllEmployeesBalances() {
  try {
    console.log('\n📋 Getting all employees leave balances...');
    
    const response = await axios.get(
      `${BASE_URL}/admin/leave-balances/all-employees`,
      {
        headers: { Authorization: `Bearer ${authToken}` }
      }
    );
    
    if (response.data.success) {
      console.log('✅ All employees balances retrieved');
      console.log('📊 Summary:', response.data.data.summary);
      
      // Find our test employee
      const testEmployee = response.data.data.employees.find(
        emp => emp.employee.id == TEST_CONFIG.testEmployee.id
      );
      
      if (testEmployee) {
        console.log(`\n👤 ${TEST_CONFIG.testEmployee.name} current balances:`);
        console.log(JSON.stringify(testEmployee.balances, null, 2));
        return testEmployee.balances;
      } else {
        console.log(`ℹ️ Employee ${TEST_CONFIG.testEmployee.id} not found in results`);
        return {};
      }
    } else {
      console.error('❌ Failed to get all employees balances:', response.data.message);
      return null;
    }
  } catch (error) {
    console.error('❌ Error getting all employees balances:', error.response?.data?.message || error.message);
    return null;
  }
}

/**
 * Test adding leave balance to existing employee
 */
async function testAddLeaveBalance() {
  try {
    console.log('\n➕ Testing leave balance addition...');
    
    const additionData = {
      year: new Date().getFullYear(),
      leaveBalances: [
        {
          leaveType: 'casual',
          allocated: 5 // Adding 5 days
        }
      ],
      isAddition: true,
      reason: 'Test addition - adding 5 casual leave days'
    };
    
    console.log('📤 Sending addition request:', JSON.stringify(additionData, null, 2));
    
    const response = await axios.post(
      `${BASE_URL}/admin/leave-balances/employee/${TEST_CONFIG.testEmployee.id}/assign`,
      additionData,
      {
        headers: { Authorization: `Bearer ${authToken}` }
      }
    );
    
    if (response.data.success) {
      console.log('✅ Leave balance addition successful!');
      console.log('📊 Result:', JSON.stringify(response.data.data, null, 2));
      return true;
    } else {
      console.error('❌ Leave balance addition failed:', response.data.message);
      return false;
    }
  } catch (error) {
    console.error('❌ Error adding leave balance:', error.response?.data?.message || error.message);
    return false;
  }
}

/**
 * Test assigning new leave type
 */
async function testAssignNewLeaveType() {
  try {
    console.log('\n🆕 Testing new leave type assignment...');
    
    const assignmentData = {
      year: new Date().getFullYear(),
      leaveBalances: [
        {
          leaveType: 'emergency',
          allocated: 3 // Assigning 3 emergency leave days
        }
      ],
      isAddition: false, // This is a new assignment
      reason: 'Test assignment - new emergency leave type'
    };
    
    console.log('📤 Sending assignment request:', JSON.stringify(assignmentData, null, 2));
    
    const response = await axios.post(
      `${BASE_URL}/admin/leave-balances/employee/${TEST_CONFIG.testEmployee.id}/assign`,
      assignmentData,
      {
        headers: { Authorization: `Bearer ${authToken}` }
      }
    );
    
    if (response.data.success) {
      console.log('✅ New leave type assignment successful!');
      console.log('📊 Result:', JSON.stringify(response.data.data, null, 2));
      return true;
    } else {
      console.error('❌ New leave type assignment failed:', response.data.message);
      return false;
    }
  } catch (error) {
    console.error('❌ Error assigning new leave type:', error.response?.data?.message || error.message);
    return false;
  }
}

/**
 * Main test function
 */
async function runTests() {
  console.log('🧪 Starting Leave Balance Addition Tests\n');
  console.log('=' .repeat(50));
  
  // Step 1: Login
  const loginSuccess = await login();
  if (!loginSuccess) {
    console.log('\n❌ Tests aborted - login failed');
    return;
  }
  
  // Step 2: Get initial state
  console.log('\n📋 INITIAL STATE');
  console.log('-'.repeat(30));
  const initialBalances = await getAllEmployeesBalances();
  
  // Step 3: Test adding to existing balance
  console.log('\n🧪 TEST 1: ADD TO EXISTING BALANCE');
  console.log('-'.repeat(40));
  const additionSuccess = await testAddLeaveBalance();
  
  if (additionSuccess) {
    // Check updated balances
    console.log('\n📋 AFTER ADDITION');
    console.log('-'.repeat(20));
    await getAllEmployeesBalances();
  }
  
  // Step 4: Test assigning new leave type
  console.log('\n🧪 TEST 2: ASSIGN NEW LEAVE TYPE');
  console.log('-'.repeat(40));
  const assignmentSuccess = await testAssignNewLeaveType();
  
  if (assignmentSuccess) {
    // Check final balances
    console.log('\n📋 FINAL STATE');
    console.log('-'.repeat(15));
    await getAllEmployeesBalances();
  }
  
  // Summary
  console.log('\n' + '='.repeat(50));
  console.log('🏁 TEST SUMMARY');
  console.log('='.repeat(50));
  console.log(`✅ Login: ${loginSuccess ? 'PASSED' : 'FAILED'}`);
  console.log(`✅ Addition Test: ${additionSuccess ? 'PASSED' : 'FAILED'}`);
  console.log(`✅ Assignment Test: ${assignmentSuccess ? 'PASSED' : 'FAILED'}`);
  
  if (loginSuccess && additionSuccess && assignmentSuccess) {
    console.log('\n🎉 All tests PASSED! Leave balance functionality is working correctly.');
  } else {
    console.log('\n⚠️ Some tests FAILED. Please check the implementation.');
  }
}

// Run the tests
runTests().catch(error => {
  console.error('💥 Unexpected error:', error);
});