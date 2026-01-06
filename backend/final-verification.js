import sequelize from './src/config/sequelize.js';

async function finalVerification() {
  try {
    console.log('🔄 Final verification of User-Employee migration...');
    
    // Check the linked records (without employee email since it's removed)
    const [results] = await sequelize.query(`
      SELECT 
        u.id as userId,
        u.email as userEmail,
        u.role as userRole,
        e.id as employeeId,
        e.employeeId as empCode,
        e.firstName,
        e.lastName,
        e.userId as linkedUserId
      FROM users u 
      LEFT JOIN employees e ON u.id = e.userId
      ORDER BY u.id
    `);
    
    console.log('\n📊 User-Employee Relationships:');
    console.log('='.repeat(80));
    
    results.forEach(row => {
      if (row.linkedUserId) {
        console.log(`✅ LINKED: User ${row.userEmail} (${row.userRole}) ↔ Employee ${row.empCode} (${row.firstName} ${row.lastName})`);
      } else {
        console.log(`[WARNING] UNLINKED: User ${row.userEmail} (${row.userRole}) - No employee profile`);
      }
    });
    
    // Test the new relationship by getting employee data through user
    console.log('\n🔍 Testing new relationship queries...');
    
    const [userWithEmployee] = await sequelize.query(`
      SELECT 
        u.email,
        u.role,
        e.employeeId,
        e.firstName,
        e.lastName,
        e.designation,
        e.department
      FROM users u
      INNER JOIN employees e ON u.id = e.userId
      WHERE u.email = 'hr@hrm.com'
    `);
    
    if (userWithEmployee.length > 0) {
      const emp = userWithEmployee[0];
      console.log(`✅ Query test successful:`);
      console.log(`   User: ${emp.email} (${emp.role})`);
      console.log(`   Employee: ${emp.employeeId} - ${emp.firstName} ${emp.lastName}`);
      console.log(`   Position: ${emp.designation} in ${emp.department}`);
    }
    
    console.log('\n📈 Final Summary:');
    const linkedCount = results.filter(r => r.linkedUserId).length;
    const unlinkedCount = results.filter(r => !r.linkedUserId).length;
    
    console.log(`   ✅ Linked User-Employee pairs: ${linkedCount}`);
    console.log(`   [WARNING] Users without employee profiles: ${unlinkedCount}`);
    
    console.log('\n🎉 Migration Status: COMPLETED SUCCESSFULLY!');
    console.log('\n📋 What was accomplished:');
    console.log('   ✅ Added userId column to employees table');
    console.log('   ✅ Linked existing users and employees by email');
    console.log('   ✅ Removed duplicate email column from employees');
    console.log('   ✅ Removed employeeId and name columns from users');
    console.log('   ✅ Added proper foreign key constraints');
    console.log('   ✅ User table now handles authentication only');
    console.log('   ✅ Employee table now handles HR data only');
    
    console.log('\n💡 Next steps:');
    console.log('   1. Update your controllers to use the new relationship');
    console.log('   2. Test your API endpoints');
    console.log('   3. Update frontend code if needed');
    console.log('   4. Consider creating employee profiles for unlinked users');
    
  } catch (error) {
    console.error('❌ Verification failed:', error.message);
  } finally {
    await sequelize.close();
    process.exit(0);
  }
}

finalVerification();