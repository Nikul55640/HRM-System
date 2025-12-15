import { DataTypes } from 'sequelize';
import sequelize from '../../config/sequelize.js';

const Request = sequelize.define('Request', {
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
  requestType: {
    type: DataTypes.ENUM('reimbursement', 'advance', 'transfer', 'shift_change'),
    allowNull: false,
  },
  status: {
    type: DataTypes.ENUM('pending', 'approved', 'rejected', 'cancelled'),
    defaultValue: 'pending',
  },
  // Reimbursement specific fields
  reimbursement: {
    type: DataTypes.JSON,
    defaultValue: null,
  },
  // Advance specific fields
  advance: {
    type: DataTypes.JSON,
    defaultValue: null,
  },
  // Transfer specific fields
  transfer: {
    type: DataTypes.JSON,
    defaultValue: null,
  },
  // Shift change specific fields
  shiftChange: {
    type: DataTypes.JSON,
    defaultValue: null,
  },
  // Workflow and approval fields
  submittedAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
  },
  approvalWorkflow: {
    type: DataTypes.JSON,
    defaultValue: [],
  },
  finalApprover: {
    type: DataTypes.INTEGER,
    references: {
      model: 'users',
      key: 'id',
    },
  },
  finalApprovalDate: {
    type: DataTypes.DATE,
  },
  rejectionReason: {
    type: DataTypes.TEXT,
  },
  // Cancellation fields
  cancelledAt: {
    type: DataTypes.DATE,
  },
  cancelledBy: {
    type: DataTypes.INTEGER,
    references: {
      model: 'users',
      key: 'id',
    },
  },
  cancellationReason: {
    type: DataTypes.TEXT,
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
  tableName: 'requests',
  timestamps: true,
  indexes: [
    { fields: ['employeeId', 'status'] },
    { fields: ['requestType', 'status'] },
    { fields: ['submittedAt'] },
  ],
});

// Instance methods
Request.prototype.getCurrentApprovalStep = function() {
  if (this.status !== 'pending') return null;
  return this.approvalWorkflow.find(step => step.status === 'pending');
};

Request.prototype.getNextApprover = function() {
  const currentStep = this.getCurrentApprovalStep();
  return currentStep ? currentStep.approver : null;
};

Request.prototype.getProgressPercentage = function() {
  if (this.status === 'approved') return 100;
  if (this.status === 'rejected' || this.status === 'cancelled') return 0;

  const totalSteps = this.approvalWorkflow.length;
  const completedSteps = this.approvalWorkflow.filter(step => step.status === 'approved').length;

  return totalSteps > 0 ? Math.round((completedSteps / totalSteps) * 100) : 0;
};

Request.prototype.toSummary = function() {
  const summary = {
    id: this.id,
    requestType: this.requestType,
    status: this.status,
    submittedAt: this.submittedAt,
    progressPercentage: this.getProgressPercentage(),
    currentApprovalStep: this.getCurrentApprovalStep(),
  };

  // Add type-specific summary data
  switch (this.requestType) {
    case 'reimbursement':
      if (this.reimbursement) {
        summary.amount = this.reimbursement.amount;
        summary.expenseType = this.reimbursement.expenseType;
        summary.description = this.reimbursement.description;
      }
      break;
    case 'advance':
      if (this.advance) {
        summary.amount = this.advance.amount;
        summary.reason = this.advance.reason;
        summary.repaymentMonths = this.advance.repaymentMonths;
      }
      break;
    case 'transfer':
      if (this.transfer) {
        summary.requestedLocation = this.transfer.requestedLocation;
        summary.reason = this.transfer.reason;
        summary.preferredDate = this.transfer.preferredDate;
      }
      break;
    case 'shift_change':
      if (this.shiftChange) {
        summary.requestedShift = this.shiftChange.requestedShift;
        summary.reason = this.shiftChange.reason;
        summary.effectiveDate = this.shiftChange.effectiveDate;
      }
      break;
  }

  return summary;
};

// Static methods
Request.findByEmployee = function(employeeId, options = {}) {
  const where = { employeeId };

  if (options.status) where.status = options.status;
  if (options.requestType) where.requestType = options.requestType;

  return this.findAll({
    where,
    order: [['submittedAt', 'DESC']],
  });
};

Request.findPendingApprovals = function(userId, role) {
  return this.findAll({
    where: {
      status: 'pending',
      [sequelize.Sequelize.Op.or]: [
        sequelize.literal(`JSON_EXTRACT(approvalWorkflow, '$[*].approver') LIKE '%${userId}%'`),
        sequelize.literal(`JSON_EXTRACT(approvalWorkflow, '$[*].role') LIKE '%${role}%'`),
      ],
    },
    include: [
      {
        model: sequelize.models.Employee,
        as: 'employee',
        attributes: ['id', 'employeeId', 'personalInfo'],
      },
    ],
  });
};

export default Request;