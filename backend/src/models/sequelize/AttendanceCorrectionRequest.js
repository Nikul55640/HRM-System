import { DataTypes } from 'sequelize';
import sequelize from '../../config/sequelize.js';

const AttendanceCorrectionRequest = sequelize.define(
  'AttendanceCorrectionRequest',
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },

    // Employee (HR profile, not user)
    employeeId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'employees',
        key: 'id',
      },
    },

    attendanceRecordId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'attendance_records',
        key: 'id',
      },
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
    },

    processedAt: {
      type: DataTypes.DATE,
      allowNull: true,
    },

    adminRemarks: {
      type: DataTypes.TEXT,
      allowNull: true,
    },

    originalClockIn: DataTypes.DATE,
    originalClockOut: DataTypes.DATE,
    correctedClockIn: DataTypes.DATE,
    correctedClockOut: DataTypes.DATE,
  },
  {
    tableName: 'attendance_correction_requests',
    timestamps: true,
    indexes: [
      { fields: ['employeeId'] },
      { fields: ['attendanceRecordId'] },
      { fields: ['status'] },
      { fields: ['employeeId', 'date'] },
    ],
  }
);

export default AttendanceCorrectionRequest;