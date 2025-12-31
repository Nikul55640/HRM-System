'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Add flaggedReason field
    await queryInterface.addColumn('attendance_records', 'flaggedReason', {
      type: Sequelize.TEXT,
      allowNull: true,
    });

    // Add flaggedBy field
    await queryInterface.addColumn('attendance_records', 'flaggedBy', {
      type: Sequelize.INTEGER,
      allowNull: true,
      references: {
        model: 'users',
        key: 'id',
      },
    });

    // Add flaggedAt field
    await queryInterface.addColumn('attendance_records', 'flaggedAt', {
      type: Sequelize.DATE,
      allowNull: true,
    });

    // Update status enum to include pending_correction
    await queryInterface.changeColumn('attendance_records', 'status', {
      type: Sequelize.ENUM('present', 'absent', 'leave', 'half_day', 'holiday', 'pending_correction'),
      defaultValue: 'present',
    });
  },

  down: async (queryInterface, Sequelize) => {
    // Remove added columns
    await queryInterface.removeColumn('attendance_records', 'flaggedReason');
    await queryInterface.removeColumn('attendance_records', 'flaggedBy');
    await queryInterface.removeColumn('attendance_records', 'flaggedAt');

    // Revert status enum
    await queryInterface.changeColumn('attendance_records', 'status', {
      type: Sequelize.ENUM('present', 'absent', 'leave', 'half_day', 'holiday'),
      defaultValue: 'present',
    });
  }
};