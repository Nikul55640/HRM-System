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
    type: DataTypes.ENUM('Casual', 'Sick', 'Paid'),
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
  tableName: 'leave_balances',
  timestamps: true,
  indexes: [
    { fields: ['employeeId', 'year', 'leaveType'], unique: true },
    { fields: ['employeeId'] },
    { fields: ['year'] },
  ],
});

// Instance methods
LeaveBalance.prototype.updateBalance = function () {
  this.remaining = this.allocated + this.carryForward - this.used - this.pending;
  return this.save();
};

// Static methods
LeaveBalance.getEmployeeBalance = async function (employeeId, year = new Date().getFullYear()) {
  return await this.findAll({
    where: {
      employeeId,
      year,
    },
  });
};

LeaveBalance.assignLeaveBalance = async function (employeeId, year, leaveBalances, assignedBy) {
  const results = [];

  for (const { leaveType, allocated, carryForward = 0 } of leaveBalances) {
    const [balance, created] = await this.findOrCreate({
      where: {
        employeeId,
        year,
        leaveType,
      },
      defaults: {
        employeeId,
        year,
        leaveType,
        allocated,
        carryForward,
        used: 0,
        pending: 0,
        remaining: allocated + carryForward,
        createdBy: assignedBy,
      },
    });

    if (!created) {
      const oldAllocated = balance.allocated;
      const oldCarryForward = balance.carryForward;

      balance.allocated = allocated;
      balance.carryForward = carryForward;
      balance.remaining = allocated + carryForward - balance.used - balance.pending;
      balance.updatedBy = assignedBy;

      await balance.save();

      // Log the balance assignment/update
      const { AuditLog } = await import('./index.js');
      await AuditLog.logAction({
        userId: assignedBy,
        action: 'leave_balance_assign',
        module: 'leave',
        targetType: 'LeaveBalance',
        targetId: balance.id,
        oldValues: { allocated: oldAllocated, carryForward: oldCarryForward },
        newValues: { allocated, carryForward },
        description: `${created ? 'Assigned' : 'Updated'} ${leaveType} leave balance for employee ${employeeId}`,
        severity: 'medium'
      });
    }

    results.push(balance);
  }

  return results;
};

LeaveBalance.adjustBalanceForLeave = async function (employeeId, leaveType, days, operation = 'use', adjustedBy = null) {
  const year = new Date().getFullYear();

  const balance = await this.findOne({
    where: {
      employeeId,
      year,
      leaveType,
    },
  });

  if (!balance) {
    throw new Error(`No leave balance found for ${leaveType} leave`);
  }

  const oldValues = {
    used: balance.used,
    pending: balance.pending,
    remaining: balance.remaining
  };

  if (operation === 'use') {
    balance.used += days;
    balance.pending = Math.max(0, balance.pending - days);
  } else if (operation === 'pending') {
    balance.pending += days;
  } else if (operation === 'cancel') {
    balance.used = Math.max(0, balance.used - days);
    balance.pending = Math.max(0, balance.pending - days);
  } else if (operation === 'adjust') {
    // Manual adjustment by HR
    balance.used = Math.max(0, balance.used + days);
  }

  balance.remaining = balance.allocated + balance.carryForward - balance.used - balance.pending;

  if (adjustedBy) {
    balance.updatedBy = adjustedBy;
  }

  const savedBalance = await balance.save();

  // Log the balance adjustment
  if (adjustedBy && operation === 'adjust') {
    const { AuditLog } = await import('./index.js');
    await AuditLog.logAction({
      userId: adjustedBy,
      action: 'leave_balance_adjust',
      module: 'leave',
      targetType: 'LeaveBalance',
      targetId: balance.id,
      oldValues,
      newValues: {
        used: balance.used,
        pending: balance.pending,
        remaining: balance.remaining
      },
      description: `Manually adjusted ${leaveType} leave balance for employee ${employeeId}`,
      severity: 'medium'
    });
  }

  return savedBalance;
};

LeaveBalance.getLeaveUtilizationReport = async function (year = new Date().getFullYear()) {
  return await this.findAll({
    where: { year },
    include: [
      {
        model: sequelize.models.Employee,
        as: 'employee',
        attributes: ['id', 'firstName', 'lastName', 'employeeId', 'department']
      }
    ],
    order: [['employeeId', 'ASC'], ['leaveType', 'ASC']]
  });
};

export default LeaveBalance;