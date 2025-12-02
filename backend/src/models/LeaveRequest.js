import mongoose from 'mongoose';

const leaveRequestSchema = new mongoose.Schema({
  employeeId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Employee',
    required: true,
    index: true,
  },
  type: {
    type: String,
    required: true,
    enum: ['annual', 'sick', 'personal', 'maternity', 'paternity', 'emergency'],
  },
  startDate: {
    type: Date,
    required: true,
  },
  endDate: {
    type: Date,
    required: true,
  },
  days: {
    type: Number,
    required: true,
    min: 0.5,
  },
  reason: {
    type: String,
    required: true,
    maxlength: 500,
  },
  isHalfDay: {
    type: Boolean,
    default: false,
  },
  halfDayPeriod: {
    type: String,
    enum: ['morning', 'afternoon'],
    required() {
      return this.isHalfDay;
    },
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected', 'cancelled'],
    default: 'pending',
    index: true,
  },
  appliedAt: {
    type: Date,
    default: Date.now,
  },
  reviewedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  reviewedAt: {
    type: Date,
  },
  rejectionReason: {
    type: String,
    maxlength: 500,
  },
  cancelledAt: {
    type: Date,
  },
  attachments: [{
    fileName: String,
    fileUrl: String,
    uploadedAt: {
      type: Date,
      default: Date.now,
    },
  }],
}, {
  timestamps: true,
});

// Indexes for better query performance
leaveRequestSchema.index({ employeeId: 1, status: 1 });
leaveRequestSchema.index({ startDate: 1, endDate: 1 });
leaveRequestSchema.index({ appliedAt: -1 });

// Virtual for duration in a readable format
leaveRequestSchema.virtual('duration').get(function () {
  if (this.isHalfDay) {
    return `${this.days} day (${this.halfDayPeriod})`;
  }
  return `${this.days} day${this.days !== 1 ? 's' : ''}`;
});

// Method to check if request can be cancelled
leaveRequestSchema.methods.canBeCancelled = function () {
  return this.status === 'pending' && new Date() < this.startDate;
};

// Method to check if request can be modified
leaveRequestSchema.methods.canBeModified = function () {
  return this.status === 'pending' && new Date() < this.startDate;
};

// Static method to find requests by employee and year
leaveRequestSchema.statics.findByEmployeeAndYear = function (employeeId, year) {
  const startOfYear = new Date(year, 0, 1);
  const endOfYear = new Date(year, 11, 31, 23, 59, 59);

  return this.find({
    employeeId,
    startDate: { $gte: startOfYear, $lte: endOfYear },
  }).sort({ appliedAt: -1 });
};

// Static method to find overlapping requests
leaveRequestSchema.statics.findOverlapping = function (employeeId, startDate, endDate, excludeId = null) {
  const query = {
    employeeId,
    status: { $in: ['pending', 'approved'] },
    $or: [
      { startDate: { $lte: endDate }, endDate: { $gte: startDate } },
    ],
  };

  if (excludeId) {
    query._id = { $ne: excludeId };
  }

  return this.find(query);
};

// Pre-save middleware to validate dates and check for overlaps
leaveRequestSchema.pre('save', async function (next) {
  if (this.isNew || this.isModified('startDate') || this.isModified('endDate')) {
    // Check for overlapping requests
    const overlapping = await this.constructor.findOverlapping(
      this.employeeId,
      this.startDate,
      this.endDate,
      this._id,
    );

    if (overlapping.length > 0) {
      const error = new Error('Leave request overlaps with existing request');
      error.code = 'OVERLAPPING_LEAVE';
      return next(error);
    }
  }

  next();
});

export default mongoose.model('LeaveRequest', leaveRequestSchema);
