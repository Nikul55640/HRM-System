/**
 * Migration: Add unique index for daily attendance
 * Prevents duplicate attendance records for same employee on same date
 */

export const up = async (queryInterface, Sequelize) => {
  try {
    // Add unique index on employeeId + date combination
    await queryInterface.addIndex('attendance_records', {
      fields: ['employeeId', 'date'],
      unique: true,
      name: 'unique_employee_daily_attendance'
    });

    console.log('✅ Added unique index for daily attendance');
  } catch (error) {
    console.error('❌ Error adding unique index:', error);
    throw error;
  }
};

export const down = async (queryInterface, Sequelize) => {
  try {
    // Remove the unique index
    await queryInterface.removeIndex('attendance_records', 'unique_employee_daily_attendance');
    
    console.log('✅ Removed unique index for daily attendance');
  } catch (error) {
    console.error('❌ Error removing unique index:', error);
    throw error;
  }
};