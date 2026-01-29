/**
 * Migration: Fix Attendance Status Taxonomy
 * 
 * 🔥 CRITICAL: Separates LIVE states from FINAL states
 * This prevents the "incomplete during work hours" issue
 */

import { DataTypes } from 'sequelize';

export const up = async (queryInterface, Sequelize) => {
  console.log('🔧 Starting attendance status taxonomy fix...');

  try {
    // Step 1: Add new status enum with proper LIVE/FINAL separation
    await queryInterface.changeColumn('AttendanceRecords', 'status', {
      type: DataTypes.ENUM(
        // 🟢 LIVE STATES (during shift - real-time)
        'in_progress',        // Employee is working
        'on_break',          // Employee is on break
        'completed',         // Employee clocked out (temporary state)
        
        // 🔴 FINAL STATES (after shift end - cron-only)
        'present',           // Full day attendance
        'half_day',          // Partial attendance
        'absent',            // No attendance
        'leave',             // On approved leave
        'holiday',           // Holiday
        'pending_correction' // Needs correction
      ),
      allowNull: false,
      defaultValue: 'in_progress'
    });

    console.log('✅ Updated status enum with LIVE/FINAL separation');

    // Step 2: Migrate existing 'incomplete' records to appropriate LIVE states
    const [incompleteRecords] = await queryInterface.sequelize.query(`
      SELECT id, clockIn, clockOut, date 
      FROM AttendanceRecords 
      WHERE status = 'incomplete'
    `);

    console.log(`📋 Found ${incompleteRecords.length} incomplete records to migrate`);

    for (const record of incompleteRecords) {
      let newStatus = 'in_progress';
      
      if (record.clockIn && record.clockOut) {
        // Has both times - should be completed (pending finalization)
        newStatus = 'completed';
      } else if (record.clockIn && !record.clockOut) {
        // Only clock-in - currently working
        newStatus = 'in_progress';
      } else {
        // No clock-in yet - this shouldn't happen for incomplete records
        console.warn(`⚠️ Record ${record.id} has no clock-in but status was incomplete`);
        continue;
      }

      await queryInterface.sequelize.query(`
        UPDATE AttendanceRecords 
        SET status = :newStatus 
        WHERE id = :recordId
      `, {
        replacements: { newStatus, recordId: record.id }
      });
    }

    console.log('✅ Migrated incomplete records to appropriate LIVE states');

    // Step 3: Add status reason for migrated records
    await queryInterface.sequelize.query(`
      UPDATE AttendanceRecords 
      SET statusReason = 'Migrated from incomplete status - pending finalization'
      WHERE status IN ('completed') AND statusReason IS NULL
    `);

    console.log('✅ Added status reasons for migrated records');

    // Step 4: Create index for efficient status queries
    await queryInterface.addIndex('AttendanceRecords', ['status', 'date'], {
      name: 'idx_attendance_status_date'
    });

    console.log('✅ Added performance index for status queries');

    console.log('🎯 Attendance status taxonomy fix completed successfully!');
    console.log('📊 Summary:');
    console.log(`   - Updated status enum with LIVE/FINAL separation`);
    console.log(`   - Migrated ${incompleteRecords.length} incomplete records`);
    console.log(`   - Added performance index`);

  } catch (error) {
    console.error('❌ Error in attendance status migration:', error);
    throw error;
  }
};

export const down = async (queryInterface, Sequelize) => {
  console.log('🔄 Reverting attendance status taxonomy fix...');

  try {
    // Remove the index
    await queryInterface.removeIndex('AttendanceRecords', 'idx_attendance_status_date');

    // Revert to old status enum
    await queryInterface.changeColumn('AttendanceRecords', 'status', {
      type: DataTypes.ENUM('present', 'absent', 'leave', 'half_day', 'holiday', 'incomplete', 'pending_correction'),
      allowNull: false,
      defaultValue: 'incomplete'
    });

    // Migrate LIVE states back to incomplete
    await queryInterface.sequelize.query(`
      UPDATE AttendanceRecords 
      SET status = 'incomplete' 
      WHERE status IN ('in_progress', 'on_break', 'completed')
    `);

    console.log('✅ Reverted attendance status taxonomy');

  } catch (error) {
    console.error('❌ Error reverting attendance status migration:', error);
    throw error;
  }
};