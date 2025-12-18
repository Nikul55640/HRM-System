import { DataTypes } from 'sequelize';
import sequelize from '../../config/sequelize.js';

const LeaveType = sequelize.define('LeaveType', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  name: {
    type: DataTypes.STRING(100),
    allowNull: false,
    unique: true,
  },
  code: {
    type: DataTypes.STRING(20),
    allowNull: false,
    unique: true,
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  maxDaysPerYear: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0,
  },
  maxConsecutiveDays: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  carryForward: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  carryForwardLimit: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  isPaid: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
  },
  requiresApproval: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
  },
  advanceNoticeRequired: {
    type: DataTypes.INTEGER,
    defaultValue: 1,
    comment: 'Days of advance notice required',
  },
  applicableGender: {
    type: DataTypes.ENUM('all', 'male', 'female'),
    defaultValue: 'all',
  },
  minServiceMonths: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    comment: 'Minimum service months required to avail this leave',
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
  },
  color: {
    type: DataTypes.STRING(7),
    defaultValue: '#3B82F6',
    comment: 'Hex color code for calendar display',
  },
  createdBy: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  updatedBy: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
}, {
  tableName: 'leave_types',
  timestamps: true,
  indexes: [
    {
      fields: ['code'],
      unique: true,
    },
    {
      fields: ['name'],
      unique: true,
    },
    {
      fields: ['isActive'],
    },
  ],
});

export default LeaveType;