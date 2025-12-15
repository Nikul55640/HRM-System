import { DataTypes } from 'sequelize';
import sequelize from '../../config/sequelize.js';

const LeaveRequest = sequelize.define('LeaveRequest', {
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
  leaveType: {
    type: DataTypes.ENUM('annual', 'sick', 'maternity', 'paternity', 'emergency', 'unpaid'),
    allowNull: false,
  },
  startDate: {
    type: DataTypes.DATEONLY,
    allowNull: false,
  },
  endDate: {
    type: DataTypes.DATEONLY,
    allowNull: false,
  },
  totalDays: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  reason: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  status: {
    type: DataTypes.ENUM('pending', 'approved', 'rejected', 'cancelled'),
    defaultValue: 'pending',
  },
  approvedBy: {
    type: DataTypes.INTEGER,
    references: {
      model: 'users',
      key: 'id',
    },
  },
  approvedAt: {
    type: DataTypes.DATE,
  },
  rejectionReason: {
    type: DataTypes.TEXT,
  },
  documents: {
    type: DataTypes.JSON,
    defaultValue: [],
  },
  isHalfDay: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  halfDayPeriod: {
    type: DataTypes.ENUM('morning', 'afternoon'),
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
  tableName: 'leave_requests',
  timestamps: true,
  indexes: [
    { fields: ['employeeId'] },
    { fields: ['status'] },
    { fields: ['leaveType'] },
    { fields: ['startDate', 'endDate'] },
  ],
});

export default LeaveRequest;