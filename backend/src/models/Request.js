import mongoose from 'mongoose';

const requestSchema = new mongoose.Schema({
  employeeId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Employee',
    required: true,
    index: true,
  },
  requestType: {
    type: String,
    required: true,
    enum: ['reimbursement', 'advance', 'transfer', 'shift_change'],
    index: true,
  },
  status: {
    type: String,
    required: true,
    enum: ['pending', 'approved', 'rejected', 'cancelled'],
    default: 'pending',
    index: true,
  },

  // Reimbursement specific fields
  reimbursement: {
    expenseType: {
      type: String,
      enum: ['travel', 'meals', 'accommodation', 'supplies', 'training', 'other'],
    },
    amount: {
      type: Number,
      min: 0,
    },
    description: String,
    receipts: [{
      fileName: String,
      fileUrl: String,
      uploadedAt: {
        type: Date,
        default: Date.now,
      },
    }],
    expenseDate: Date,
  },

  // Advance specific fields
  advance: {
    amount: {
      type: Number,
      min: 0,
    },
    reason: String,
    repaymentMonths: {
      type: Number,
      min: 1,
      max: 12,
    },
    monthlyDeduction: Number,
    outstandingBalance: {
      type: Number,
      default: 0,
    },
    eligibilityChecked: {
      type: Boolean,
      default: false,
    },
    maxEligibleAmount: Number,
  },

  // Transfer specific fields
  transfer: {
    currentDepartment: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Department',
    },
    requestedDepartment: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Department',
    },
    currentLocation: String,
    requestedLocation: String,
    reason: String,
    preferredDate: Date,
  },

  // Shift change specific fields
  shiftChange: {
    currentShift: String,
    requestedShift: String,
    reason: String,
    effectiveDate: Date,
  },

  // Workflow and approval fields
  submittedAt: {
    type: Date,
    default: Date.now,
    index: true,
  },
  approvalWorkflow: [{
    approver: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    role: {
      type: String,
      enum: ['manager', 'hr', 'finance', 'admin'],
      required: true,
    },
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected'],
      default: 'pending',
    },
    comments: String,
    actionDate: Date,
  }],
  finalApprover: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  finalApprovalDate: Date,
  rejectionReason: String,

  // Cancellation fields
  cancelledAt: Date,
  cancelledBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  cancellationReason: String,

  // Metadata
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  updatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true },
});

// Indexes for better query performance
requestSchema.index({ employeeId: 1, status: 1 });
requestSchema.index({ requestType: 1, status: 1 });
requestSchema.index({ submittedAt: -1 });
requestSchema.index({ 'approvalWorkflow.approver': 1, 'approvalWorkflow.status': 1 });
requestSchema.index({ 'approvalWorkflow.role': 1, 'approvalWorkflow.status': 1 });

// Virtual for current approval step
requestSchema.virtual('currentApprovalStep').get(function () {
  if (this.status !== 'pending') return null;
  return this.approvalWorkflow.find((step) => step.status === 'pending');
});

// Virtual for next approver
requestSchema.virtual('nextApprover').get(function () {
  const currentStep = this.currentApprovalStep;
  return currentStep ? currentStep.approver : null;
});

// Virtual for progress percentage
requestSchema.virtual('progressPercentage').get(function () {
  if (this.status === 'approved') return 100;
  if (this.status === 'rejected' || this.status === 'cancelled') return 0;

  const totalSteps = this.approvalWorkflow.length;
  const completedSteps = this.approvalWorkflow.filter((step) => step.status === 'approved').length;

  return totalSteps > 0 ? Math.round((completedSteps / totalSteps) * 100) : 0;
});

// Instance method to get summary
requestSchema.methods.toSummary = function () {
  const summary = {
    _id: this._id,
    requestType: this.requestType,
    status: this.status,
    submittedAt: this.submittedAt,
    progressPercentage: this.progressPercentage,
    currentApprovalStep: this.currentApprovalStep,
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

// Static method to get requests by employee
requestSchema.statics.findByEmployee = function (employeeId, options = {}) {
  const query = { employeeId };

  if (options.status) query.status = options.status;
  if (options.requestType) query.requestType = options.requestType;

  return this.find(query).sort({ submittedAt: -1 });
};

// Static method to get pending approvals for a user
requestSchema.statics.findPendingApprovals = function (userId, role) {
  return this.find({
    status: 'pending',
    $or: [
      { 'approvalWorkflow.approver': userId, 'approvalWorkflow.status': 'pending' },
      { 'approvalWorkflow.role': role, 'approvalWorkflow.status': 'pending' },
    ],
  }).populate('employeeId', 'employeeId personalInfo.firstName personalInfo.lastName');
};

// Pre-save middleware to calculate monthly deduction for advances
requestSchema.pre('save', function (next) {
  if (this.requestType === 'advance' && this.advance && this.advance.amount && this.advance.repaymentMonths) {
    this.advance.monthlyDeduction = Math.round(this.advance.amount / this.advance.repaymentMonths * 100) / 100;
    this.advance.outstandingBalance = this.advance.amount;
  }
  next();
});

// Pre-save middleware to set createdBy and updatedBy
requestSchema.pre('save', function (next) {
  if (this.isNew && !this.createdBy) {
    // This would be set by the controller
  }
  this.updatedBy = this.createdBy; // This would be updated by the controller
  next();
});

export default mongoose.model('Request', requestSchema);
