/**
 * Migration: Add unique index for pending correction status
 * Prevents multiple pending corrections for same employee/date
 */

export const up = async (queryInterface, Sequelize) => {
  try {
    // Add partial unique index for pending correction status
    await queryInterface.addIndex('attendance_records', {
      fields: ['employeeId', 'date'],
      where: { status: 'pending_correction' },
      unique: true,
      name: 'unique_pending_correction_per_employee_date'
    });

    console.log('✅ Added unique index for pending correction status');
  } catch (error) {
    console.error('❌ Error adding unique pending correction index:', error);
    throw error;
  }
};

export const down = async (queryInterface, Sequelize) => {
  try {
    await queryInterface.removeIndex('attendance_records', 'unique_pending_correction_per_employee_date');
    console.log('✅ Removed unique pending correction index');
  } catch (error) {
    console.error('❌ Error removing unique pending correction index:', error);
    throw error;
  }
};