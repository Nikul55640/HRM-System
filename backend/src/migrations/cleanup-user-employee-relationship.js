/**
 * Migration: Clean Up User-Employee Relationship
 * Removes the duplicate employeeId column from users table
 * Keeps only the clean Employee.userId -> User.id relationship
 */

export const up = async (queryInterface, Sequelize) => {
  console.log('🧹 Cleaning up User-Employee relationship...');

  try {
    // Remove the employeeId column from users table
    await queryInterface.removeColumn('users', 'employeeId');
    console.log('✅ Removed employeeId column from users table');
    
    // Remove the employeeId index
    try {
      await queryInterface.removeIndex('users', 'users_employee_id_index');
      console.log('✅ Removed employeeId index');
    } catch (error) {
      console.log('⚠️  employeeId index not found or already removed');
    }
    
  } catch (error) {
    if (error.message.includes('doesn\'t exist')) {
      console.log('⚠️  employeeId column already removed');
    } else {
      throw error;
    }
  }

  console.log('✅ User-Employee relationship cleanup completed!');
  console.log('📋 Architecture is now clean:');
  console.log('   - Employee.userId → User.id (ONLY relationship)');
  console.log('   - User.hasOne(Employee, { foreignKey: "userId" })');
  console.log('   - Employee.belongsTo(User, { foreignKey: "userId" })');
};

export const down = async (queryInterface, Sequelize) => {
  console.log('🔄 Rolling back User-Employee relationship cleanup...');

  // Add back the employeeId column
  await queryInterface.addColumn('users', 'employeeId', {
    type: Sequelize.INTEGER,
    allowNull: true,
    references: {
      model: 'employees',
      key: 'id',
    },
    comment: 'Foreign key to employees table - links user account to employee profile'
  });

  // Add back the index
  await queryInterface.addIndex('users', ['employeeId'], {
    name: 'users_employee_id_index'
  });

  console.log('✅ User-Employee relationship cleanup rollback completed');
};