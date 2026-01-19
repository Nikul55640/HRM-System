/**
 * Migration: Add work mode support to attendance records
 * Adds workMode field to track office/WFH/field work
 */

import { DataTypes } from 'sequelize';

export const up = async (queryInterface, Sequelize) => {
  console.log('🔄 Adding work mode support to attendance records...');

  try {
    // Check if workMode column already exists
    const tableDescription = await queryInterface.describeTable('attendance_records');
    
    if (!tableDescription.workMode) {
      // Add workMode column
      await queryInterface.addColumn('attendance_records', 'workMode', {
        type: DataTypes.ENUM('office', 'wfh', 'hybrid', 'field'),
        defaultValue: 'office',
        allowNull: false,
        comment: 'Work mode: office, work from home, hybrid, or field work'
      });

      console.log('✅ Added workMode column to attendance_records');

      // Update existing records to have 'office' as default
      await queryInterface.sequelize.query(`
        UPDATE attendance_records 
        SET workMode = 'office' 
        WHERE workMode IS NULL
      `);

      console.log('✅ Updated existing records with default work mode');
    } else {
      console.log('✅ workMode column already exists, skipping...');
    }

  } catch (error) {
    console.error('❌ Migration failed:', error);
    throw error;
  }
};

export const down = async (queryInterface, Sequelize) => {
  console.log('🔄 Removing work mode support from attendance records...');

  try {
    // Check if workMode column exists before removing
    const tableDescription = await queryInterface.describeTable('attendance_records');
    
    if (tableDescription.workMode) {
      // Remove workMode column
      await queryInterface.removeColumn('attendance_records', 'workMode');
      console.log('✅ Removed workMode column from attendance_records');
    } else {
      console.log('✅ workMode column does not exist, skipping...');
    }

  } catch (error) {
    console.error('❌ Rollback failed:', error);
    throw error;
  }
};