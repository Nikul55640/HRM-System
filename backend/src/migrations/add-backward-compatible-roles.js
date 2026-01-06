/**
 * Migration: Add Backward Compatible Roles
 * Updates the role enum to support both old and new role formats
 */

export const up = async (queryInterface, Sequelize) => {
  console.log('🔄 Adding backward compatible roles...');

  try {
    // Update the role enum to include both old and new formats
    await queryInterface.sequelize.query(`
      ALTER TABLE users 
      MODIFY COLUMN role ENUM(
        'SuperAdmin', 'HR', 'Employee', 
        'SUPER_ADMIN', 'HR_ADMIN', 'HR_MANAGER', 'EMPLOYEE'
      ) DEFAULT 'Employee'
    `);
    
    console.log('✅ Updated role enum to support both old and new formats');
    
  } catch (error) {
    console.error('❌ Failed to update role enum:', error.message);
    throw error;
  }

  console.log('✅ Backward compatible roles migration completed!');
  console.log('📋 Supported roles:');
  console.log('   Old format: SuperAdmin, HR, Employee');
  console.log('   New format: SUPER_ADMIN, HR_ADMIN, HR_MANAGER, EMPLOYEE');
};

export const down = async (queryInterface, Sequelize) => {
  console.log('🔄 Rolling back backward compatible roles...');

  // First migrate any new format roles to old format
  await queryInterface.sequelize.query(`
    UPDATE users SET role = CASE 
      WHEN role = 'SUPER_ADMIN' THEN 'SuperAdmin'
      WHEN role = 'HR_ADMIN' THEN 'HR'
      WHEN role = 'HR_MANAGER' THEN 'HR'
      WHEN role = 'EMPLOYEE' THEN 'Employee'
      ELSE role
    END
  `);

  // Revert to old enum
  await queryInterface.sequelize.query(`
    ALTER TABLE users 
    MODIFY COLUMN role ENUM('SuperAdmin', 'HR', 'Employee') DEFAULT 'Employee'
  `);

  console.log('✅ Reverted to old role format');
};