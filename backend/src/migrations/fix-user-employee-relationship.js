import { DataTypes } from 'sequelize';

export const up = async (queryInterface, Sequelize) => {
  const transaction = await queryInterface.sequelize.transaction();
  
  try {
    console.log('🔄 Starting User-Employee relationship fix...');

    // Step 1: Add userId column to employees table
    console.log('📝 Adding userId column to employees table...');
    await queryInterface.addColumn('employees', 'userId', {
      type: DataTypes.INTEGER,
      allowNull: true, // Temporarily nullable during migration
      references: {
        model: 'users',
        key: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL',
    }, { transaction });

    // Step 2: Create unique index on userId (after data migration)
    console.log('📝 Creating unique index on userId...');
    await queryInterface.addIndex('employees', ['userId'], {
      unique: true,
      name: 'employees_userId_unique',
      transaction
    });

    // Step 3: Remove email column from employees (since it's now in users)
    console.log('📝 Removing email column from employees...');
    await queryInterface.removeColumn('employees', 'email', { transaction });

    // Step 4: Remove employeeId column from users
    console.log('📝 Removing employeeId column from users...');
    await queryInterface.removeColumn('users', 'employeeId', { transaction });

    // Step 5: Remove name column from users (names are now in employees)
    console.log('📝 Removing name column from users...');
    await queryInterface.removeColumn('users', 'name', { transaction });

    // Step 6: Remove old email index from employees
    console.log('📝 Removing old email index from employees...');
    try {
      await queryInterface.removeIndex('employees', 'employees_email_unique', { transaction });
    } catch (error) {
      console.log('ℹ️ Email index already removed or doesn\'t exist');
    }

    await transaction.commit();
    console.log('✅ User-Employee relationship fix completed successfully!');
    
  } catch (error) {
    await transaction.rollback();
    console.error('❌ Migration failed:', error);
    throw error;
  }
};

export const down = async (queryInterface, Sequelize) => {
  const transaction = await queryInterface.sequelize.transaction();
  
  try {
    console.log('🔄 Reverting User-Employee relationship fix...');

    // Revert Step 5: Add name column back to users
    await queryInterface.addColumn('users', 'name', {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: 'Unknown User',
    }, { transaction });

    // Revert Step 4: Add employeeId column back to users
    await queryInterface.addColumn('users', 'employeeId', {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'employees',
        key: 'id',
      },
    }, { transaction });

    // Revert Step 3: Add email column back to employees
    await queryInterface.addColumn('employees', 'email', {
      type: DataTypes.STRING,
      unique: true,
      allowNull: false,
      defaultValue: 'unknown@company.com',
    }, { transaction });

    // Revert Step 2: Remove unique index on userId
    await queryInterface.removeIndex('employees', 'employees_userId_unique', { transaction });

    // Revert Step 1: Remove userId column from employees
    await queryInterface.removeColumn('employees', 'userId', { transaction });

    await transaction.commit();
    console.log('✅ Migration reverted successfully!');
    
  } catch (error) {
    await transaction.rollback();
    console.error('❌ Rollback failed:', error);
    throw error;
  }
};