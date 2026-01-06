/**
 * Revert Users to Old Role Format for Compatibility
 */

import sequelize from './src/config/sequelize.js';

async function revertRoles() {
  try {
    console.log('🔄 Reverting users to old role format...');
    
    await sequelize.authenticate();
    console.log('✅ Database connected');

    // Revert any new format roles to old format
    await sequelize.query(`
      UPDATE users SET role = CASE 
        WHEN role = 'SUPER_ADMIN' THEN 'SuperAdmin'
        WHEN role = 'HR_ADMIN' THEN 'HR'
        WHEN role = 'HR_MANAGER' THEN 'HR'
        WHEN role = 'EMPLOYEE' THEN 'Employee'
        ELSE role
      END
    `);
    
    console.log('✅ Reverted users to old role format for compatibility');
    
    // Check current roles
    const result = await sequelize.query('SELECT id, email, role FROM users');
    
    console.log('\n📋 Current user roles:');
    result[0].forEach(user => {
      console.log(`  ${user.email}: ${user.role}`);
    });
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await sequelize.close();
    console.log('\n🔒 Database connection closed');
  }
}

revertRoles();