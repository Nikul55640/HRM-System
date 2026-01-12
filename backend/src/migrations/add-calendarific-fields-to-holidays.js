/**
 * Migration: Add Calendarific-related fields to holidays table
 * Adds fields to store Calendarific API data and metadata
 */

import { DataTypes } from 'sequelize';

export const up = async (queryInterface) => {
  try {
    console.log('🔄 Adding Calendarific fields to holidays table...');

    // Add calendarific_data column to store original API response
    await queryInterface.addColumn('holidays', 'calendarific_data', {
      type: DataTypes.JSON,
      allowNull: true,
      comment: 'Original Calendarific API data for reference'
    });

    // Add calendarific_uuid for tracking
    await queryInterface.addColumn('holidays', 'calendarific_uuid', {
      type: DataTypes.STRING(100),
      allowNull: true,
      comment: 'Calendarific holiday UUID for tracking updates'
    });

    // Add sync metadata
    await queryInterface.addColumn('holidays', 'synced_from_calendarific', {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
      comment: 'Whether this holiday was synced from Calendarific API'
    });

    await queryInterface.addColumn('holidays', 'last_synced_at', {
      type: DataTypes.DATE,
      allowNull: true,
      comment: 'Last time this holiday was synced from Calendarific'
    });

    // Add index for Calendarific UUID
    await queryInterface.addIndex('holidays', ['calendarific_uuid'], {
      name: 'idx_holidays_calendarific_uuid'
    });

    // Add index for synced holidays
    await queryInterface.addIndex('holidays', ['synced_from_calendarific'], {
      name: 'idx_holidays_synced_from_calendarific'
    });

    console.log('✅ Successfully added Calendarific fields to holidays table');

  } catch (error) {
    console.error('❌ Error adding Calendarific fields:', error);
    throw error;
  }
};

export const down = async (queryInterface) => {
  try {
    console.log('🔄 Removing Calendarific fields from holidays table...');

    // Remove indexes first
    await queryInterface.removeIndex('holidays', 'idx_holidays_calendarific_uuid');
    await queryInterface.removeIndex('holidays', 'idx_holidays_synced_from_calendarific');

    // Remove columns
    await queryInterface.removeColumn('holidays', 'calendarific_data');
    await queryInterface.removeColumn('holidays', 'calendarific_uuid');
    await queryInterface.removeColumn('holidays', 'synced_from_calendarific');
    await queryInterface.removeColumn('holidays', 'last_synced_at');

    console.log('✅ Successfully removed Calendarific fields from holidays table');

  } catch (error) {
    console.error('❌ Error removing Calendarific fields:', error);
    throw error;
  }
};