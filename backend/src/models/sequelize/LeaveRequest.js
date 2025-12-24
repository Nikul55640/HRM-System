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
    type: DataTypes.ENUM('Casual', 'Sick', 'Paid'),
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
  isHalfDay: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  halfDayPeriod: {
    type: DataTypes.ENUM('morning', 'afternoon'),
  },
  // Leave cancellation fields
  cancelledAt: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  cancellationReason: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  canCancel: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
    comment: 'Whether this leave can be cancelled by employee'
  },

  // Audit fields
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

// Instance methods
LeaveRequest.prototype.canBeCancelled = function () {
  return this.status === 'pending' || (this.status === 'approved' && this.canCancel);
};

LeaveRequest.prototype.cancel = function (reason, userId) {
  if (!this.canBeCancelled()) {
    throw new Error('This leave request cannot be cancelled');
  }

  this.status = 'cancelled';
  this.cancelledAt = new Date();
  this.cancellationReason = reason;
  this.updatedBy = userId;

  return this.save();
};

// Static methods
LeaveRequest.getLeaveHistory = async function (employeeId, year = null) {
  const whereClause = { employeeId };

  if (year) {
    const startDate = new Date(year, 0, 1);
    const endDate = new Date(year, 11, 31);
    whereClause.startDate = {
      [sequelize.Sequelize.Op.between]: [startDate, endDate],
    };
  }

  return await this.findAll({
    where: whereClause,
    order: [['startDate', 'DESC']],
  });
};

export default LeaveRequest;