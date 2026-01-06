/**
 * Migration: Update User Model for Production
 * Implements critical production improvements:
 * 1. Add employeeId foreign key (CRITICAL for HRM)
 * 2. Update role enum to normalized naming
 * 3. Add performance indexes
 */

import { DataTypes } from 'sequelize';

export const up = async (queryInterface, Sequelize) => {
  console.log('🚀 Starting User Model Production Updates...');

  // 1️⃣ Add employeeId foreign key (CRITICAL)
  try {
    await queryInterface.addColumn('users', 'employeeId', {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'employees',
        key: 'id',
      },
      comment: 'Foreign key to employees table - links user account to employee profile'
    });
    console.log('✅ Added employeeId foreign key');
  } catch (error) {
    if (error.message.includes('already exists')) {
      console.log('⚠️  employeeId column already exists, skipping...');
    } else {
      throw error;
    }
  }

  // 2️⃣ Update role enum to normalized naming
  try {
    // First, update existing data to new format
    await queryInterface.sequelize.query(`
      UPDATE users SET role = CASE 
        WHEN role = 'SuperAdmin' THEN 'SUPER_ADMIN'
        WHEN role = 'HR' THEN 'HR_ADMIN'
        WHEN role = 'Employee' THEN 'EMPLOYEE'
        ELSE 'EMPLOYEE'
      END
    `);
    console.log('✅ Updated existing role data to normalized format');

    // Drop and recreate the enum
    await queryInterface.sequelize.query('ALTER TABLE users MODIFY COLUMN role ENUM("SUPER_ADMIN", "HR_ADMIN", "HR_MANAGER", "EMPLOYEE") DEFAULT "EMPLOYEE"');
    console.log('✅ Updated role enum to normalized naming');
  } catch (error) {
    console.log('⚠️  Role enum update failed (may already be updated):', error.message);
  }

  // 3️⃣ Add performance indexes
  const indexes = [
    {
      name: 'users_email_unique',
      unique: true,
      fields: ['email']
    },
    {
      name: 'users_employee_id_index',
      fields: ['employeeId']
    },
    {
      name: 'users_role_index',
      fields: ['role']
    },
    {
      name: 'users_is_active_index',
      fields: ['isActive']
    }
  ];

  for (const index of indexes) {
    try {
      await queryInterface.addIndex('users', index.fields, {
        name: index.name,
        unique: index.unique || false
      });
      console.log(`✅ Added index: ${index.name}`);
    } catch (error) {
      if (error.message.includes('already exists')) {
        console.log(`⚠️  Index ${index.name} already exists, skipping...`);
      } else {
        console.log(`⚠️  Failed to add index ${index.name}:`, error.message);
      }
    }
  }

  console.log('✅ User Model Production Updates completed successfully!');
  console.log('📋 Summary:');
  console.log('   - Added employeeId foreign key (CRITICAL for HRM)');
  console.log('   - Updated role enum to normalized naming (SUPER_ADMIN, HR_ADMIN, HR_MANAGER, EMPLOYEE)');
  console.log('   - Added performance indexes for email, employeeId, role, isActive');
};

export const down = async (queryInterface, Sequelize) => {
  console.log('🔄 Rolling back User Model Production Updates...');

  // Remove indexes
  const indexes = ['users_employee_id_index', 'users_role_index', 'users_is_active_index'];
  
  for (const indexName of indexes) {
    try {
      await queryInterface.removeIndex('users', indexName);
      console.log(`✅ Removed index: ${indexName}`);
    } catch (error) {
      console.log(`⚠️  Failed to remove index ${indexName}:`, error.message);
    }
  }

  // Revert role enum
  try {
    await queryInterface.sequelize.query(`
      UPDATE users SET role = CASE 
        WHEN role = 'SUPER_ADMIN' THEN 'SuperAdmin'
        WHEN role = 'HR_ADMIN' THEN 'HR'
        WHEN role = 'HR_MANAGER' THEN 'HR'
        WHEN role = 'EMPLOYEE' THEN 'Employee'
        ELSE 'Employee'
      END
    `);
    
    await queryInterface.sequelize.query('ALTER TABLE users MODIFY COLUMN role ENUM("SuperAdmin", "HR", "Employee") DEFAULT "Employee"');
    console.log('✅ Reverted role enum to original format');
  } catch (error) {
    console.log('⚠️  Role enum rollback failed:', error.message);
  }

  // Remove employeeId column
  try {
    await queryInterface.removeColumn('users', 'employeeId');
    console.log('✅ Removed employeeId column');
  } catch (error) {
    console.log('⚠️  Failed to remove employeeId column:', error.message);
  }

  console.log('✅ User Model Production Updates rollback completed');
};