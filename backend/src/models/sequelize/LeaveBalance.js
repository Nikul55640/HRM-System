import { DataTypes } from 'sequelize';
import sequelize from '../../config/sequelize.js';

const LeaveBalance = sequelize.define('LeaveBalance', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  employeeId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'employees',
      key: 'id',
    },
  },
  year: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  leaveType: {
    type: DataTypes.ENUM('annual', 'sick', 'maternity', 'paternity', 'emergency', 'unpaid'),
    allowNull: false,
  },
  allocated: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },
  used: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },
  pending: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },
  remaining: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },
  carryForward: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },
  createdBy: {
    type: DataTypes.INTEGER,
    references: {
      model: 'users',
      key: 'id',
    },
  },
  updatedBy: {
    type: DataTypes.INTEGER,
    references: {
      model: 'users',
      key: 'id',
    },
  },
}, {
  tableName: 'leave_balances',
  timestamps: true,
  indexes: [
    { fields: ['employeeId', 'year', 'leaveType'], unique: true },
    { fields: ['employeeId'] },
    { fields: ['year'] },
  ],
});

export default LeaveBalance;