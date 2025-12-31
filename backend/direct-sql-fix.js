import sequelize from './src/config/sequelize.js';

async function directSQLFix() {
  try {
    console.log('🔧 Direct SQL fix for user roles...\n');
    
    // Test database connection
    await sequelize.authenticate();
    console.log('✅ Database connection established successfully.\n');

    // Check current roles
    console.log('📋 Current user roles:');
    const currentUsers = await sequelize.query(
      'SELECT id, email, role FROM users ORDER BY id',
      { type: sequelize.QueryTypes.SELECT }
    );
    
    currentUsers.forEach(user => {
      console.log(`   ${user.id}. ${user.email} - "${user.role}"`);
    });

    // Update HR user directly with SQL
    console.log('\n🔄 Updating HR user role...');
    const [results] = await sequelize.query(
      "UPDATE users SET role = 'HR Administrator' WHERE email = 'hr@hrm.com'"
    );
    
    console.log(`✅ SQL Update completed. Affected rows: ${results.affectedRows || 'unknown'}`);

    // Verify the update
    console.log('\n📋 Updated user roles:');
    const updatedUsers = await sequelize.query(
      'SELECT id, email, role, isActive FROM users ORDER BY id',
      { type: sequelize.QueryTypes.SELECT }
    );
    
    updatedUsers.forEach(user => {
      const isAdmin = ['SuperAdmin', 'HR Administrator', 'HR Manager'].includes(user.role);
      const status = user.isActive ? '✅' : '❌';
      console.log(`   ${user.id}. ${user.email} - "${user.role}" ${isAdmin ? '👑' : '👤'} ${status}`);
    });

    // Check admin users
    const adminUsers = updatedUsers.filter(user => 
      ['SuperAdmin', 'HR Administrator', 'HR Manager'].includes(user.role) && user.isActive
    );

    console.log('\n🎯 Admin Users (can access attendance corrections):');
    console.log('=====================================');
    if (adminUsers.length > 0) {
      adminUsers.forEach((user, index) => {
        console.log(`${index + 1}. ${user.email} - ${user.role}`);
      });
      
      console.log('\n💡 Instructions:');
      console.log('1. Log out from the frontend');
      console.log('2. Log back in with one of the admin accounts above');
      console.log('3. Try accessing /admin/attendance/corrections');
    } else {
      console.log('❌ No admin users found!');
    }

  } catch (error) {
    console.error('❌ Error with direct SQL fix:', error);
  } finally {
    await sequelize.close();
  }
}

directSQLFix();