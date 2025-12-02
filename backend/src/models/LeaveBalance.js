import mongoose from 'mongoose';

const { Schema } = mongoose;

const leaveTypeSchema = new Schema(
  {
    type: {
      type: String,
      required: true,
      enum: ['annual', 'sick', 'personal', 'maternity', 'paternity', 'unpaid'],
    },
    allocated: { type: Number, required: true, min: 0 },
    used: { type: Number, default: 0, min: 0 },
    pending: { type: Number, default: 0, min: 0 },
    available: { type: Number, default: 0, min: 0 },
  },
  { _id: false },
);

const leaveHistorySchema = new Schema(
  {
    leaveRequestId: {
      type: Schema.Types.ObjectId,
      ref: 'LeaveRequest',
    },
    type: { type: String, required: true },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    days: { type: Number, required: true, min: 0 },
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected', 'cancelled'],
      default: 'pending',
    },
    appliedAt: { type: Date, default: Date.now },
  },
  { _id: true },
);

const leaveBalanceSchema = new Schema(
  {
    employeeId: {
      type: Schema.Types.ObjectId,
      ref: 'Employee',
      required: true,
      unique: true,
    },
    year: {
      type: Number,
      required: true,
      min: 2000,
      max: 2100,
    },
    leaveTypes: [leaveTypeSchema],
    history: [leaveHistorySchema],
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);

// Indexes
leaveBalanceSchema.index({ employeeId: 1, year: 1 }, { unique: true });
leaveBalanceSchema.index({ year: 1 });

// Pre-save hook to calculate available leaves
leaveBalanceSchema.pre('save', function (next) {
  this.leaveTypes.forEach((leaveType) => {
    leaveType.available = leaveType.allocated - (leaveType.used + leaveType.pending);
  });
  next();
});

// Instance method to get leave balance by type
leaveBalanceSchema.methods.getBalanceByType = function (type) {
  return this.leaveTypes.find((lt) => lt.type === type);
};

// Instance method to update leave usage
leaveBalanceSchema.methods.updateLeaveUsage = function (type, days, status = 'pending') {
  const leaveType = this.leaveTypes.find((lt) => lt.type === type);
  if (leaveType) {
    if (status === 'pending') {
      leaveType.pending += days;
    } else if (status === 'approved') {
      leaveType.used += days;
      leaveType.pending = Math.max(0, leaveType.pending - days);
    }
    leaveType.available = leaveType.allocated - (leaveType.used + leaveType.pending);
  }
  return this;
};

// Static method to find by employee and year
leaveBalanceSchema.statics.findByEmployeeAndYear = function (employeeId, year) {
  return this.findOne({ employeeId, year });
};

const LeaveBalance = mongoose.model('LeaveBalance', leaveBalanceSchema);

export default LeaveBalance;
