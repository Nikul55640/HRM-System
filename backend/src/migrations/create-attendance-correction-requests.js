import { DataTypes } from 'sequelize';

export default {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('attendance_correction_requests', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    employeeId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'employees',
        key: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE',
    },
    attendanceRecordId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'attendance_records',
        key: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL',
    },
    date: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },
    requestedClockIn: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    requestedClockOut: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    requestedBreakMinutes: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    reason: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    issueType: {
      type: DataTypes.ENUM(
        'missed_punch',
        'incorrect_time',
        'system_error',
        'other'
      ),
      defaultValue: 'missed_punch',
    },
    status: {
      type: DataTypes.ENUM(
        'pending',
        'approved',
        'rejected',
        'corrected',
        'cancelled'
      ),
      defaultValue: 'pending',
    },
    processedBy: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'users',
        key: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL',
    },
    processedAt: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    adminRemarks: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    originalClockIn: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    originalClockOut: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    correctedClockIn: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    correctedClockOut: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    createdAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
    updatedAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
  });

    // Add indexes
    await queryInterface.addIndex('attendance_correction_requests', ['employeeId']);
    await queryInterface.addIndex('attendance_correction_requests', ['attendanceRecordId']);
    await queryInterface.addIndex('attendance_correction_requests', ['status']);
    await queryInterface.addIndex('attendance_correction_requests', ['employeeId', 'date']);
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('attendance_correction_requests');
  }
};