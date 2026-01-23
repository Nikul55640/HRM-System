import { Sequelize } from 'sequelize';

const sequelize = new Sequelize('hrm2', 'root', '123', {
  host: 'localhost',
  dialect: 'mysql',
  logging: false
});

async function checkAllRoles() {
  try {
    console.log('🔍 Checking all roles and users in database...');
    
    // Get all distinct roles
    const [roleResults] = await sequelize.query('SELECT DISTINCT role FROM users ORDER BY role');
    console.log('\n📋 All roles in database:');
    roleResults.forEach(row => console.log('  -', row.role));
    
    // Get count of users per role
    const [countResults] = await sequelize.query(`
      SELECT role, COUNT(*) as count 
      FROM users 
      GROUP BY role 
      ORDER BY role
    `);
    console.log('\n📊 User count per role:');
    countResults.forEach(row => console.log(`   ${row.role}: ${row.count} users`));
    
    // Check if there are any 'Admin' users (not SuperAdmin)
    const [adminResults] = await sequelize.query("SELECT * FROM users WHERE role = 'Admin'");
    console.log(`\n🔍 Users with role 'Admin': ${adminResults.length}`);
    
    // Show all users with their roles
    const [allUsers] = await sequelize.query('SELECT id, email, role FROM users ORDER BY role, email');
    console.log('\n👥 All users:');
    allUsers.forEach(user => console.log(`   ${user.email} -> ${user.role}`));
    
    await sequelize.close();
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

checkAllRoles();