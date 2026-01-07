/**
 * Test script to verify bank verification endpoint is working
 */

import fetch from 'node-fetch';

const BASE_URL = 'http://localhost:5000';
const TEST_TOKEN = process.env.TEST_TOKEN || 'your-admin-token-here';

async function testBankVerificationEndpoint() {
  try {
    console.log('🧪 Testing Bank Verification Endpoint...\n');
    
    if (!TEST_TOKEN || TEST_TOKEN === 'your-admin-token-here') {
      console.log('❌ Please set TEST_TOKEN environment variable with a valid admin JWT token');
      console.log('   You can get a token by logging into the frontend as an admin and checking localStorage');
      process.exit(1);
    }

    // 1. Test GET pending verifications
    console.log('1️⃣ Testing GET /api/admin/bank-verification/pending-verifications');
    
    try {
      const response = await fetch(`${BASE_URL}/api/admin/bank-verification/pending-verifications`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${TEST_TOKEN}`,
          'Content-Type': 'application/json'
        }
      });

      console.log(`   Status: ${response.status}`);
      
      if (response.ok) {
        const data = await response.json();
        console.log(`   ✅ Success: Found ${data.data?.length || 0} pending verifications`);
        
        if (data.data && data.data.length > 0) {
          const sample = data.data[0];
          console.log(`   📋 Sample data:`, {
            employeeId: sample.employeeId,
            employeeName: sample.employeeName,
            accountNumber: sample.accountNumber,
            bankName: sample.bankName
          });
          
          // 2. Test PUT verification endpoint
          console.log('\n2️⃣ Testing PUT /api/admin/bank-verification/verify/:employeeId');
          
          const verifyResponse = await fetch(`${BASE_URL}/api/admin/bank-verification/verify/${sample.employeeId}`, {
            method: 'PUT',
            headers: {
              'Authorization': `Bearer ${TEST_TOKEN}`,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              isVerified: true,
              rejectionReason: null
            })
          });

          console.log(`   Status: ${verifyResponse.status}`);
          
          if (verifyResponse.ok) {
            const verifyData = await verifyResponse.json();
            console.log(`   ✅ Verification successful:`, verifyData.message);
          } else {
            const errorData = await verifyResponse.json();
            console.log(`   ❌ Verification failed:`, errorData.message);
          }
        } else {
          console.log('   ℹ️  No pending verifications to test with');
        }
      } else {
        const errorData = await response.json();
        console.log(`   ❌ Failed: ${errorData.message}`);
      }
    } catch (error) {
      console.log(`   ❌ Request failed: ${error.message}`);
    }

    // 3. Test authentication
    console.log('\n3️⃣ Testing authentication');
    
    try {
      const noAuthResponse = await fetch(`${BASE_URL}/api/admin/bank-verification/pending-verifications`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      console.log(`   No auth status: ${noAuthResponse.status}`);
      
      if (noAuthResponse.status === 401) {
        console.log('   ✅ Authentication properly required');
      } else {
        console.log('   ⚠️  Authentication might not be working correctly');
      }
    } catch (error) {
      console.log(`   ❌ Auth test failed: ${error.message}`);
    }

    // 4. Test invalid employee ID
    console.log('\n4️⃣ Testing invalid employee ID');
    
    try {
      const invalidResponse = await fetch(`${BASE_URL}/api/admin/bank-verification/verify/99999`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${TEST_TOKEN}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          isVerified: true,
          rejectionReason: null
        })
      });

      console.log(`   Status: ${invalidResponse.status}`);
      
      if (invalidResponse.status === 404) {
        const errorData = await invalidResponse.json();
        console.log(`   ✅ Properly returns 404: ${errorData.message}`);
      } else {
        console.log('   ⚠️  Should return 404 for invalid employee ID');
      }
    } catch (error) {
      console.log(`   ❌ Invalid ID test failed: ${error.message}`);
    }

    console.log('\n🎉 Bank verification endpoint test completed!');

  } catch (error) {
    console.error('❌ Test suite failed:', error);
  } finally {
    process.exit(0);
  }
}

testBankVerificationEndpoint();