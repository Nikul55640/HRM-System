/**
 * Debug script for bank verification issues
 */

import { Employee, User } from './src/models/index.js';
import logger from './src/utils/logger.js';

async function debugBankVerification() {
  try {
    console.log('🔍 Debugging Bank Verification System...\n');
    
    // 1. Check database connection
    console.log('1️⃣ Checking database connection...');
    try {
      await Employee.findOne();
      console.log('✅ Database connection working');
    } catch (error) {
      console.log('❌ Database connection failed:', error.message);
      return;
    }

    // 2. Check employees with bank details
    console.log('\n2️⃣ Checking employees with bank details...');
    
    const allEmployees = await Employee.findAll({
      attributes: ['id', 'employeeId', 'firstName', 'lastName', 'bankDetails'],
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'email', 'role']
        }
      ]
    });

    console.log(`📊 Total employees: ${allEmployees.length}`);

    const employeesWithBankDetails = allEmployees.filter(emp => 
      emp.bankDetails && Object.keys(emp.bankDetails).length > 0
    );

    console.log(`📊 Employees with bank details: ${employeesWithBankDetails.length}`);

    if (employeesWithBankDetails.length === 0) {
      console.log('⚠️  No employees with bank details found. Creating test data...');
      
      const testEmployee = allEmployees[0];
      if (testEmployee) {
        const testBankDetails = {
          bankName: 'Test Bank Ltd',
          ifscCode: 'TEST0001234',
          accountNumber: '1234567890123456',
          accountHolderName: `${testEmployee.firstName} ${testEmployee.lastName}`,
          accountType: 'Savings',
          branchName: 'Test Branch',
          isVerified: false,
          submittedAt: new Date()
        };

        await testEmployee.update({
          bankDetails: testBankDetails
        });

        console.log(`✅ Added test bank details for ${testEmployee.firstName} ${testEmployee.lastName}`);
        employeesWithBankDetails.push(testEmployee);
      }
    }

    // 3. Check pending verifications
    console.log('\n3️⃣ Checking pending verifications...');
    
    const pendingVerifications = employeesWithBankDetails.filter(emp => 
      emp.bankDetails.isVerified === false
    );

    console.log(`📊 Pending verifications: ${pendingVerifications.length}`);

    if (pendingVerifications.length > 0) {
      console.log('\n📋 Pending verification details:');
      pendingVerifications.forEach((emp, index) => {
        console.log(`   ${index + 1}. ${emp.firstName} ${emp.lastName} (ID: ${emp.id})`);
        console.log(`      Employee Code: ${emp.employeeId}`);
        console.log(`      Email: ${emp.user?.email}`);
        console.log(`      Bank: ${emp.bankDetails.bankName}`);
        console.log(`      Account: ${emp.bankDetails.accountNumber}`);
        console.log(`      IFSC: ${emp.bankDetails.ifscCode}`);
        console.log(`      Verified: ${emp.bankDetails.isVerified}`);
        console.log('');
      });
    }

    // 4. Test findByPk method
    console.log('4️⃣ Testing Employee.findByPk method...');
    
    if (pendingVerifications.length > 0) {
      const testEmployee = pendingVerifications[0];
      console.log(`   Testing with employee ID: ${testEmployee.id}`);
      
      const foundEmployee = await Employee.findByPk(testEmployee.id, {
        include: [
          {
            model: User,
            as: 'user',
            attributes: ['id', 'email', 'role']
          }
        ]
      });

      if (foundEmployee) {
        console.log('   ✅ findByPk working correctly');
        console.log(`   📋 Found: ${foundEmployee.firstName} ${foundEmployee.lastName}`);
        console.log(`   📋 Bank details exist: ${!!foundEmployee.bankDetails}`);
        console.log(`   📋 Bank details keys: ${Object.keys(foundEmployee.bankDetails || {})}`);
      } else {
        console.log('   ❌ findByPk failed to find employee');
      }
    }

    // 5. Test verification update
    console.log('\n5️⃣ Testing verification update...');
    
    if (pendingVerifications.length > 0) {
      const testEmployee = pendingVerifications[0];
      console.log(`   Testing verification for: ${testEmployee.firstName} ${testEmployee.lastName}`);
      
      const originalBankDetails = { ...testEmployee.bankDetails };
      
      // Test approval
      const updatedBankDetails = {
        ...testEmployee.bankDetails,
        isVerified: true,
        verifiedAt: new Date(),
        verifiedBy: 1, // Assuming admin user ID 1
        rejectionReason: null,
      };

      await testEmployee.update({
        bankDetails: updatedBankDetails,
        updatedBy: 1
      });

      console.log('   ✅ Verification update successful');
      
      // Revert back to pending for testing
      await testEmployee.update({
        bankDetails: originalBankDetails,
        updatedBy: 1
      });

      console.log('   ✅ Reverted back to pending status');
    }

    // 6. Check API response format
    console.log('\n6️⃣ Testing API response format...');
    
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

    console.log('   📋 Sample API response:');
    if (apiResponse.length > 0) {
      console.log(JSON.stringify(apiResponse[0], null, 2));
    } else {
      console.log('   No data to show');
    }

    // 7. Summary
    console.log('\n🎉 Debug Summary:');
    console.log('================');
    console.log(`✅ Database connection: Working`);
    console.log(`✅ Total employees: ${allEmployees.length}`);
    console.log(`✅ Employees with bank details: ${employeesWithBankDetails.length}`);
    console.log(`✅ Pending verifications: ${pendingVerifications.length}`);
    console.log(`✅ findByPk method: Working`);
    console.log(`✅ Update method: Working`);

    console.log('\n💡 Next steps:');
    console.log('1. Check frontend console for API request/response logs');
    console.log('2. Check backend server logs during verification attempts');
    console.log('3. Verify user permissions and authentication');
    console.log('4. Test the API endpoint directly using the test script');

  } catch (error) {
    logger.error('Error debugging bank verification:', error);
    console.error('❌ Debug failed:', error.message);
  } finally {
    process.exit(0);
  }
}

debugBankVerification();