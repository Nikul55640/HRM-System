/**
 * Migration: Add originalBreakMinutes column to attendance_correction_requests table
 * 
 * This migration adds the missing originalBreakMinutes field to properly track
 * the original break time values in correction requests.
 */

export const up = async (queryInterface, Sequelize) => {
  try {
    // Check if column already exists
    const tableDescription = await queryInterface.describeTable('attendance_correction_requests');
    
    if (!tableDescription.originalBreakMinutes) {
      await queryInterface.addColumn('attendance_correction_requests', 'originalBreakMinutes', {
        type: Sequelize.INTEGER,
        allowNull: true,
        defaultValue: 0,
        comment: 'Original break minutes from the attendance record'
      });
      
      console.log('✅ Added originalBreakMinutes column to attendance_correction_requests');
    } else {
      console.log('⚠️  originalBreakMinutes column already exists in attendance_correction_requests');
    }
  } catch (error) {
    console.error('❌ Error adding originalBreakMinutes column:', error);
    throw error;
  }
};

export const down = async (queryInterface, Sequelize) => {
  try {
    await queryInterface.removeColumn('attendance_correction_requests', 'originalBreakMinutes');
    console.log('✅ Removed originalBreakMinutes column from attendance_correction_requests');
  } catch (error) {
    console.error('❌ Error removing originalBreakMinutes column:', error);
    throw error;
  }
};