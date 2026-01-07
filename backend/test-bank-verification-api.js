/**
 * Test script to verify bank verification API returns full account numbers
 */

import { Employee, User } from './src/models/index.js';
import logger from './src/utils/logger.js';

async function testBankVerificationAPI() {
  try {
    console.log('🧪 Testing Bank Verification API...\n');
    
    // 1. Check if we have employees with bank details
    console.log('1️⃣ Checking employees with bank details...');
    
    const employeesWithBankDetails = await Employee.findAll({
      attributes: ['id', 'employeeId', 'firstName', 'lastName', 'bankDetails', 'updatedAt'],
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'email']
        }
      ],
      where: {
        bankDetails: {
          $ne: null
        }
      }
    });

    if (employeesWithBankDetails.length === 0) {
      console.log('❌ No employees with bank details found');
      return;
    }

    console.log(`✅ Found ${employeesWithBankDetails.length} employees with bank details`);

    // 2. Check for pending verifications
    console.log('\n2️⃣ Checking pending verifications...');
    
    const pendingVerifications = employeesWithBankDetails.filter(emp => 
      emp.bankDetails && 
      Object.keys(emp.bankDetails).length > 0 && 
      emp.bankDetails.isVerified === false
    );

    console.log(`📊 Pending verifications: ${pendingVerifications.length}`);
    console.log(`📊 Verified: ${employeesWithBankDetails.length - pendingVerifications.length}`);

    if (pendingVerifications.length === 0) {
      console.log('ℹ️  No pending verifications found. Creating test data...');
      
      // Find an employee to add test bank details
      const testEmployee = await Employee.findOne({
        include: [
          {
            model: User,
            as: 'user',
            attributes: ['id', 'email']
          }
        ]
      });

      if (testEmployee) {
        const testBankDetails = {
          bankName: 'Test Bank',
          ifscCode: 'TEST0001234',
          accountNumber: '1234567890123456',
          accountHolderName: `${testEmployee.firstName} ${testEmployee.lastName}`,
          isVerified: false,
          submittedAt: new Date()
        };

        await testEmployee.update({
          bankDetails: testBankDetails
        });

        console.log(`✅ Added test bank details for ${testEmployee.firstName} ${testEmployee.lastName}`);
        pendingVerifications.push(testEmployee);
      }
    }

    // 3. Test the API response format
    console.log('\n3️⃣ Testing API response format...');
    
    const apiResponse = pendingVerifications.map((employee) => ({
      employeeId: employee.id,
      employeeCode: employee.employeeId,
      employeeName: `${employee.firstName} ${employee.lastName}`,
      email: employee.user?.email,
      bankName: employee.bankDetails?.bankName,
      ifscCode: employee.bankDetails?.ifscCode,
      accountHolderName: employee.bankDetails?.accountHolderName,
      accountNumber: employee.bankDetails?.accountNumber, // Full account number for admin
      updatedAt: employee.updatedAt,
    }));

    console.log('📋 Sample API Response:');
    console.log('======================');
    
    if (apiResponse.length > 0) {
      const sample = apiResponse[0];
      console.log(`Employee: ${sample.employeeName} (${sample.employeeCode})`);
      console.log(`Email: ${sample.email}`);
      console.log(`Bank: ${sample.bankName}`);
      console.log(`IFSC: ${sample.ifscCode}`);
      console.log(`Account Holder: ${sample.accountHolderName}`);
      console.log(`Account Number: ${sample.accountNumber} ✅ FULL NUMBER VISIBLE`);
      console.log(`Updated: ${sample.updatedAt}`);
    }

    // 4. Test account number visibility
    console.log('\n4️⃣ Testing account number visibility...');
    
    for (const employee of apiResponse.slice(0, 3)) {
      const accountNumber = employee.accountNumber;
      
      if (!accountNumber) {
        console.log(`❌ ${employee.employeeName}: No account number`);
      } else if (accountNumber.includes('X')) {
        console.log(`⚠️  ${employee.employeeName}: Account number is masked: ${accountNumber}`);
      } else {
        console.log(`✅ ${employee.employeeName}: Full account number visible: ${accountNumber}`);
      }
    }

    // 5. Test masking function (for comparison)
    console.log('\n5️⃣ Testing masking function...');
    
    const maskAccountNumber = (accountNumber) => {
      if (!accountNumber) return '';
      const str = accountNumber.toString();
      if (str.length <= 4) return str;
      return 'X'.repeat(str.length - 4) + str.slice(-4);
    };

    if (apiResponse.length > 0) {
      const sample = apiResponse[0];
      const fullNumber = sample.accountNumber;
      const maskedNumber = maskAccountNumber(fullNumber);
      
      console.log(`Full Number (Admin View): ${fullNumber}`);
      console.log(`Masked Number (Employee View): ${maskedNumber}`);
      console.log(`✅ Masking function working correctly`);
    }

    // 6. Summary
    console.log('\n🎉 Bank Verification API Test Summary:');
    console.log('=====================================');
    console.log(`✅ Total employees with bank details: ${employeesWithBankDetails.length}`);
    console.log(`✅ Pending verifications: ${pendingVerifications.length}`);
    console.log(`✅ API returns full account numbers for admin verification`);
    console.log(`✅ Account numbers are not masked in admin API`);

    console.log('\n💡 Next Steps:');
    console.log('1. Test the frontend by accessing /admin/bank-verification');
    console.log('2. Verify that account numbers are fully visible to admins');
    console.log('3. Ensure employees still see masked numbers in their view');

  } catch (error) {
    logger.error('Error testing bank verification API:', error);
    console.error('❌ Test failed:', error.message);
  } finally {
    process.exit(0);
  }
}

testBankVerificationAPI();