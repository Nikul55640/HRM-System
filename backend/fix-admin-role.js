import { Sequelize } from 'sequelize';

const sequelize = new Sequelize('hrm2', 'root', '123', {
  host: 'localhost',
  dialect: 'mysql',
  logging: false
});

async function fixAdminRole() {
  try {
    console.log('🔧 Fixing admin role from SuperAdmin to Admin...');
    
    // Check current roles
    const [beforeResults] = await sequelize.query('SELECT DISTINCT role FROM users ORDER BY role');
    console.log('\n📋 Current roles:');
    beforeResults.forEach(row => console.log('  -', row.role));
    
    // Update SuperAdmin to Admin
    const [updateResult] = await sequelize.query(
      "UPDATE users SET role = 'Admin' WHERE role = 'SuperAdmin'"
    );
    
    console.log(`\n✅ Updated ${updateResult.affectedRows} users from SuperAdmin to Admin`);
    
    // Check updated roles
    const [afterResults] = await sequelize.query('SELECT DISTINCT role FROM users ORDER BY role');
    console.log('\n📋 Updated roles:');
    afterResults.forEach(row => console.log('  -', row.role));
    
    // Show updated users
    const [userResults] = await sequelize.query('SELECT id, email, role FROM users WHERE role = "Admin"');
    console.log('\n👥 Admin users:');
    userResults.forEach(user => console.log(`   ${user.email} -> ${user.role}`));
    
    await sequelize.close();
    console.log('\n🎉 Role update completed!');
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

fixAdminRole();