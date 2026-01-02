/**
 * Migration: Add 'incomplete' status to AttendanceRecord enum
 * This supports the corporate rule for handling missing clock-out scenarios
 */

import { DataTypes } from 'sequelize';

export const up = async (queryInterface, Sequelize) => {
  try {
    // Check if we're using MySQL or PostgreSQL
    const dialect = queryInterface.sequelize.getDialect();
    
    if (dialect === 'mysql') {
      // For MySQL, modify the enum directly
      await queryInterface.sequelize.query(`
        ALTER TABLE AttendanceRecords 
        MODIFY COLUMN status ENUM('present', 'absent', 'leave', 'half_day', 'holiday', 'incomplete', 'pending_correction') 
        DEFAULT 'present';
      `);
    } else if (dialect === 'postgres') {
      // For PostgreSQL, add value to enum type
      await queryInterface.sequelize.query(`
        ALTER TYPE "enum_AttendanceRecords_status" 
        ADD VALUE IF NOT EXISTS 'incomplete';
      `);
    }

    console.log('✅ Added "incomplete" status to AttendanceRecord enum');
  } catch (error) {
    console.error('❌ Error adding incomplete status:', error);
    throw error;
  }
};

export const down = async (queryInterface, Sequelize) => {
  try {
    const dialect = queryInterface.sequelize.getDialect();
    
    if (dialect === 'mysql') {
      // For MySQL, revert the enum
      await queryInterface.sequelize.query(`
        ALTER TABLE AttendanceRecords 
        MODIFY COLUMN status ENUM('present', 'absent', 'leave', 'half_day', 'holiday', 'pending_correction') 
        DEFAULT 'present';
      `);
      console.log('✅ Removed "incomplete" status from AttendanceRecord enum');
    } else {
      // PostgreSQL doesn't support removing enum values easily
      console.log('⚠️ Cannot remove enum value "incomplete" - PostgreSQL limitation');
      console.log('   The value will remain in the enum but can be unused');
    }
  } catch (error) {
    console.error('❌ Error in down migration:', error);
    throw error;
  }
};