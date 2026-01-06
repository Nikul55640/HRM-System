 /**
 * Migration: Add halfDayType column to attendance_records table
 * This enables automatic detection of first half vs second half attendance
 */

import { DataTypes } from 'sequelize';

export const up = async (queryInterface, Sequelize) => {
  await queryInterface.addColumn('attendance_records', 'halfDayType', {
    type: DataTypes.ENUM('first_half', 'second_half', 'full_day'),
    allowNull: true,
    comment: 'Type of half day: first_half (morning), second_half (afternoon), or full_day',
    after: 'statusReason'
  });

  console.log('✅ Added halfDayType column to attendance_records table');
};

export const down = async (queryInterface, Sequelize) => {
  await queryInterface.removeColumn('attendance_records', 'halfDayType');
  
  console.log('✅ Removed halfDayType column from attendance_records table');
};