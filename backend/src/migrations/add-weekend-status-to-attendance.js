/**
 * Migration: Add 'weekend' status to AttendanceRecord enum
 * 
 * This migration adds the 'weekend' status to the existing status enum
 * in the attendance_records table to support weekend record creation.
 */

import { connectDB } from '../config/sequelize.js';
import sequelize from '../config/sequelize.js';

async function runMigration() {
  try {
    console.log('=== ADDING WEEKEND STATUS TO ATTENDANCE RECORDS ===\n');
    
    // Connect to database
    await connectDB();
    console.log('✅ Database connected\n');

export const up = async (queryInterface, Sequelize) => {
    console.log('🔄 Adding weekend status to attendance_records enum...');
    
    // MySQL: Modify the enum to include 'weekend'
    await sequelize.query(`
      ALTER TABLE attendance_records 
      MODIFY COLUMN status ENUM(
        'in_progress',
        'on_break', 
        'completed',
        'present',
        'half_day',
        'absent',
        'leave',
        'holiday',
        'weekend',
        'pending_correction'
      ) DEFAULT 'in_progress'
    `);
    
    console.log('✅ Successfully added weekend status to attendance_records enum');
    
  } catch (error) {
    console.error('❌ Error adding weekend status:', error);
    throw error;
  } finally {
    process.exit(0);
  }
}

export const up = async (queryInterface, Sequelize) => {
  try {
    console.log('🔄 Adding weekend status to attendance_records enum...');
    
    // MySQL: Modify the enum to include 'weekend'
    await queryInterface.sequelize.query(`
      ALTER TABLE attendance_records 
      MODIFY COLUMN status ENUM(
        'in_progress',
        'on_break', 
        'completed',
        'present',
        'half_day',
        'absent',
        'leave',
        'holiday',
        'weekend',
        'pending_correction'
      ) DEFAULT 'in_progress'
    `);
    
    console.log('✅ Successfully added weekend status to attendance_records enum');
    
  } catch (error) {
    console.error('❌ Error adding weekend status:', error);
    throw error;
  }
};

export const down = async (queryInterface, Sequelize) => {
  try {
    console.log('🔄 Removing weekend status from attendance_records enum...');
    
    // First, update any existing 'weekend' records to 'holiday'
    await queryInterface.sequelize.query(`
      UPDATE attendance_records 
      SET status = 'holiday' 
      WHERE status = 'weekend'
    `);
    
    // Then remove 'weekend' from the enum
    await queryInterface.sequelize.query(`
      ALTER TABLE attendance_records 
      MODIFY COLUMN status ENUM(
        'in_progress',
        'on_break',
        'completed', 
        'present',
        'half_day',
        'absent',
        'leave',
        'holiday',
        'pending_correction'
      ) DEFAULT 'in_progress'
    `);
    
    console.log('✅ Successfully removed weekend status from attendance_records enum');
    
  } catch (error) {
    console.error('❌ Error removing weekend status:', error);
    throw error;
  }
};

// Run migration if called directly
runMigration();