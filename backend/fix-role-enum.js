import sequelize from './src/config/sequelize.js';

async function fixRoleEnum() {
  try {
    console.log('🔧 Fixing role ENUM in database...\n');
    
    // Test database connection
    await sequelize.authenticate();
    console.log('✅ Database connection established successfully.\n');

    console.log('📋 Current ENUM values:');
    const currentEnum = await sequelize.query(
      "SHOW COLUMNS FROM users LIKE 'role'",
      { type: sequelize.QueryTypes.SELECT }
    );
    console.log(`   ${currentEnum[0].Type}\n`);

    // Update the ENUM to include all the new role values
    console.log('🔄 Updating role ENUM to include new values...');
    
    await sequelize.query(`
      ALTER TABLE users 
      MODIFY COLUMN role ENUM(
        'SuperAdmin', 
        'HR Administrator', 
        'HR Manager', 
        'Payroll Officer', 
        'Manager', 
        'Employee'
      ) NOT NULL DEFAULT 'Employee'
    `);
    
    console.log('✅ ENUM updated successfully\n');

    // Verify the new ENUM
    console.log('📋 Updated ENUM values:');
    const updatedEnum = await sequelize.query(
      "SHOW COLUMNS FROM users LIKE 'role'",
      { type: sequelize.QueryTypes.SELECT }
    );
    console.log(`   ${updatedEnum[0].Type}\n`);

    // Now update the HR user to HR Administrator
    console.log('🔄 Updating HR user role to "HR Administrator"...');
    await sequelize.query(
      "UPDATE users SET role = 'HR Administrator' WHERE email = 'hr@hrm.com'"
    );
    console.log('✅ HR user updated successfully\n');

    // Verify all users
    console.log('📋 Final user roles:');
    const users = await sequelize.query(
      'SELECT id, email, role, isActive FROM users ORDER BY id',
      { type: sequelize.QueryTypes.SELECT }
    );
    
    users.forEach(user => {
      const isAdmin = ['SuperAdmin', 'HR Administrator', 'HR Manager'].includes(user.role);
      const status = user.isActive ? '✅' : '❌';
      console.log(`   ${user.id}. ${user.email} - "${user.role}" ${isAdmin ? '👑' : '👤'} ${status}`);
    });

    // Show admin users
    const adminUsers = users.filter(user => 
      ['SuperAdmin', 'HR Administrator', 'HR Manager'].includes(user.role) && user.isActive
    );

    console.log('\n🎯 Users with Admin Access:');
    console.log('=====================================');
    if (adminUsers.length > 0) {
      adminUsers.forEach((user, index) => {
        console.log(`${index + 1}. ${user.email} - ${user.role}`);
      });
      
      console.log('\n✅ SUCCESS! These users can now access:');
      console.log('   - /admin/attendance/corrections');
      console.log('   - Other admin routes');
      
      console.log('\n💡 Next Steps:');
      console.log('1. Log out from the frontend');
      console.log('2. Log back in with admin credentials');
      console.log('3. Navigate to /admin/attendance/corrections');
    } else {
      console.log('❌ No admin users found!');
    }

  } catch (error) {
    console.error('❌ Error fixing role ENUM:', error);
  } finally {
    await sequelize.close();
  }
}

fixRoleEnum();