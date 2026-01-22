/**
 * Test Holiday Validation Fix
 * Tests the improved validation for recurring holidays
 */

import axios from 'axios';

const BASE_URL = 'http://localhost:3000/api';

async function testHolidayValidation() {
  try {
    console.log('🧪 Testing Holiday Validation Fix\n');
    
    // Login as admin
    console.log('1. Logging in as admin...');
    const loginResponse = await axios.post(`${BASE_URL}/auth/login`, {
      email: 'admin@hrm.com',
      password: 'admin123'
    });
    
    if (!loginResponse.data.success) {
      console.log('❌ Login failed');
      return;
    }
    
    const token = loginResponse.data.data.token;
    console.log('✅ Login successful');
    
    // Test cases for validation
    const testCases = [
      {
        name: 'Test 1: RECURRING holiday with empty recurringDate',
        payload: {
          name: 'Test Recurring Holiday',
          type: 'RECURRING',
          category: 'public',
          description: 'Test holiday',
          isPaid: true,
          color: '#dc2626',
          appliesEveryYear: true,
          isActive: true,
          recurringDate: '', // Empty string - should fail
          date: null
        },
        shouldFail: true,
        expectedError: 'Recurring holidays must have a recurring date in MM-DD format'
      },
      {
        name: 'Test 2: RECURRING holiday with null recurringDate',
        payload: {
          name: 'Test Recurring Holiday 2',
          type: 'RECURRING',
          category: 'public',
          description: 'Test holiday',
          isPaid: true,
          color: '#dc2626',
          appliesEveryYear: true,
          isActive: true,
          recurringDate: null, // Null - should fail
          date: null
        },
        shouldFail: true,
        expectedError: 'Recurring holidays must have a recurring date in MM-DD format'
      },
      {
        name: 'Test 3: RECURRING holiday with invalid format',
        payload: {
          name: 'Test Recurring Holiday 3',
          type: 'RECURRING',
          category: 'public',
          description: 'Test holiday',
          isPaid: true,
          color: '#dc2626',
          appliesEveryYear: true,
          isActive: true,
          recurringDate: '1-1', // Invalid format - should fail
          date: null
        },
        shouldFail: true,
        expectedError: 'Recurring date must be in MM-DD format'
      },
      {
        name: 'Test 4: RECURRING holiday with valid format',
        payload: {
          name: 'Test Recurring Holiday 4',
          type: 'RECURRING',
          category: 'public',
          description: 'Test holiday',
          isPaid: true,
          color: '#dc2626',
          appliesEveryYear: true,
          isActive: true,
          recurringDate: '01-01', // Valid format - should pass
          date: null
        },
        shouldFail: false
      },
      {
        name: 'Test 5: ONE_TIME holiday with valid date',
        payload: {
          name: 'Test One-Time Holiday',
          type: 'ONE_TIME',
          category: 'public',
          description: 'Test holiday',
          isPaid: true,
          color: '#dc2626',
          appliesEveryYear: false,
          isActive: true,
          recurringDate: null,
          date: '2026-12-31' // Valid date - should pass
        },
        shouldFail: false
      }
    ];
    
    console.log('\n🔬 Running validation tests...\n');
    
    for (const testCase of testCases) {
      console.log(`📋 ${testCase.name}`);
      console.log(`   Payload: ${JSON.stringify(testCase.payload, null, 2)}`);
      
      try {
        const response = await axios.post(`${BASE_URL}/admin/holidays`, testCase.payload, {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        if (testCase.shouldFail) {
          console.log(`   ❌ FAIL: Expected validation error but request succeeded`);
          console.log(`   Response: ${JSON.stringify(response.data, null, 2)}`);
        } else {
          console.log(`   ✅ PASS: Request succeeded as expected`);
          // Clean up - delete the created holiday
          if (response.data.data?.id) {
            await axios.delete(`${BASE_URL}/admin/holidays/${response.data.data.id}`, {
              headers: { Authorization: `Bearer ${token}` }
            });
            console.log(`   🧹 Cleaned up test holiday ID ${response.data.data.id}`);
          }
        }
      } catch (error) {
        if (testCase.shouldFail) {
          const errorMessage = error.response?.data?.message || error.message;
          if (errorMessage.includes(testCase.expectedError)) {
            console.log(`   ✅ PASS: Got expected validation error`);
            console.log(`   Error: ${errorMessage}`);
          } else {
            console.log(`   ❌ FAIL: Got unexpected error`);
            console.log(`   Expected: ${testCase.expectedError}`);
            console.log(`   Got: ${errorMessage}`);
          }
        } else {
          console.log(`   ❌ FAIL: Unexpected error for valid payload`);
          console.log(`   Error: ${error.response?.data?.message || error.message}`);
        }
      }
      
      console.log(''); // Empty line for readability
    }
    
    console.log('🏁 Validation tests completed!');
    
  } catch (error) {
    console.error('💥 Test error:', error.message);
  }
}

testHolidayValidation();