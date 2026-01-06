/**
 * Check Current User Roles in Database
 */

import sequelize from './src/config/sequelize.js';

async function checkUserRoles() {
  try {
    await sequelize.authenticate();
    console.log('✅ Database connected');

    const result = await sequelize.query('SELECT id, email, role FROM users LIMIT 10');
    
    console.log('\n📋 Current users and roles:');
    console.log('================================');
    
    result[0].forEach(user => {
      console.log(`ID: ${user.id}, Email: ${user.email}, Role: '${user.role}'`);
    });
    
    // Check if any users have empty or invalid roles
    const invalidRoles = result[0].filter(user => !user.role || user.role === '');
    
    if (invalidRoles.length > 0) {
      console.log('\n⚠️  Found users with invalid/empty roles:');
      invalidRoles.forEach(user => {
        console.log(`   - ID: ${user.id}, Email: ${user.email}, Role: '${user.role}'`);
      });
      
      console.log('\n🔧 These users need role assignment!');
    }
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await sequelize.close();
    console.log('\n🔒 Database connection closed');
  }
}

checkUserRoles();