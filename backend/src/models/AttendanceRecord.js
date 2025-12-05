import mongoose from 'mongoose';

// Break sub-schema
const breakSchema = new mongoose.Schema(
  {
    breakId: {
      type: String,
      required: true,
      default: () => new mongoose.Types.ObjectId().toString(),
    },
    startTime: {
      type: Date,
      required: true,
    },
    endTime: {
      type: Date,
      default: null,
    },
    durationMinutes: {
      type: Number,
      default: 0,
      min: 0,
    },
  },
  { _id: false }
);

// Session sub-schema
const sessionSchema = new mongoose.Schema(
  {
    sessionId: {
      type: String,
      required: true,
      default: () => new mongoose.Types.ObjectId().toString(),
    },
    checkIn: {
      type: Date,
      required: true,
    },
    checkOut: {
      type: Date,
      default: null,
    },
    workLocation: {
      type: String,
      enum: ['office', 'wfh', 'client_site'],
      required: true,
    },
    locationDetails: {
      type: String,
      maxlength: 200,
    },
    ipAddressCheckIn: {
      type: String, // Encrypted
      required: true,
    },
    ipAddressCheckOut: {
      type: String, // Encrypted
    },
    breaks: [breakSchema],
    totalBreakMinutes: {
      type: Number,
      default: 0,
      min: 0,
    },
    workedMinutes: {
      type: Number,
      default: 0,
      min: 0,
    },
    status: {
      type: String,
      enum: ['active', 'on_break', 'completed'],
      default: 'active',
    },
  },
  { _id: false }
);

const attendanceRecordSchema = new mongoose.Schema(
  {
    employeeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Employee',
      required: true,
      index: true,
    },

    date: {
      type: Date,
      required: true,
      index: true,
    },

    // New: Multiple sessions support
    sessions: [sessionSchema],

    // Backward compatibility: keep existing checkIn/checkOut
    // These will reference the first/last session
    checkIn: {
      type: Date,
      default: null,
    },

    checkOut: {
      type: Date,
      default: null,
    },

    // Worked time (core)
    workedMinutes: {
      type: Number,
      default: 0,
      min: 0,
    },

    workHours: {
      // derived from workedMinutes / 60 in pre-save
      type: Number,
      default: 0,
      min: 0,
      max: 24,
    },

    status: {
      type: String,
      enum: ['present', 'absent', 'half_day', 'leave', 'holiday'],
      default: 'absent',
      index: true,
    },

    statusReason: {
      type: String,
      maxlength: 500,
    },

    isLate: {
      type: Boolean,
      default: false,
    },

    isEarlyDeparture: {
      type: Boolean,
      default: false,
    },

    // Detailed minutes
    lateMinutes: {
      type: Number,
      default: 0,
      min: 0,
    },

    earlyExitMinutes: {
      type: Number,
      default: 0,
      min: 0,
    },

    overtimeMinutes: {
      type: Number,
      default: 0,
      min: 0,
    },

    // For backward compatibility – derived from overtimeMinutes
    overtimeHours: {
      type: Number,
      default: 0,
      min: 0,
    },

    remarks: {
      type: String,
      maxlength: 500,
    },

    // Remarks history for manual changes
    remarksHistory: [
      {
        note: {
          type: String,
          maxlength: 500,
        },
        addedBy: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User',
        },
        addedAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],

    location: {
      checkIn: {
        lat: Number,
        lng: Number,
      },
      checkOut: {
        lat: Number,
        lng: Number,
      },
    },

    // Break time tracking (in minutes)
    breakTime: {
      type: Number,
      default: 0,
      min: 0,
    },

    // Shift information (per record, as you chose)
    shiftStart: {
      type: String, // Format: "09:00"
      default: '09:00',
    },
    shiftEnd: {
      type: String, // Format: "17:00"
      default: '17:00',
    },

    // Approval workflow for manual entries
    approvalStatus: {
      type: String,
      enum: ['auto', 'pending', 'approved', 'rejected'],
      default: 'auto',
    },
    approvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    approvedAt: {
      type: Date,
    },

    // Who created / last updated this record
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },

    // Where this attendance came from
    source: {
      type: String,
      enum: ['self', 'manual', 'system'],
      default: 'self',
      index: true,
    },

    // Device / request info
    deviceInfo: {
      deviceType: String, // "web", "mobile", etc.
      userAgent: String,
      ipAddress: String,
    },
  },
  {
    timestamps: true,
  }
);

// Compound indexes for efficient queries
attendanceRecordSchema.index({ employeeId: 1, date: 1 }, { unique: true });
attendanceRecordSchema.index({ employeeId: 1, date: -1 });
attendanceRecordSchema.index({ date: 1, status: 1 });
attendanceRecordSchema.index({ employeeId: 1, status: 1 });
attendanceRecordSchema.index({ approvalStatus: 1 });
attendanceRecordSchema.index({ 'sessions.status': 1 });
attendanceRecordSchema.index({ 'sessions.workLocation': 1 });

// Virtual for formatted date
attendanceRecordSchema.virtual('formattedDate').get(function () {
  return this.date ? this.date.toISOString().split('T')[0] : null;
});

// Virtual for total hours including breaks (hours)
attendanceRecordSchema.virtual('totalHours').get(function () {
  const breakHours = (this.breakTime || 0) / 60;
  return (this.workHours || 0) + breakHours;
});

// Pre-save middleware to calculate work hours / minutes
attendanceRecordSchema.pre('save', function (next) {
  // Handle sessions-based records
  if (this.sessions && this.sessions.length > 0) {
    // Update backward compatibility fields from sessions
    const firstSession = this.sessions[0];
    const lastSession = this.sessions[this.sessions.length - 1];
    
    this.checkIn = firstSession.checkIn;
    this.checkOut = lastSession.checkOut || null;
    
    // Calculate total worked minutes across all sessions
    let totalWorkedMinutes = 0;
    let totalBreakMinutes = 0;
    
    this.sessions.forEach((session) => {
      if (session.checkIn && session.checkOut) {
        const diffMs = session.checkOut.getTime() - session.checkIn.getTime();
        const sessionMinutes = diffMs / (1000 * 60);
        const breakMinutes = session.totalBreakMinutes || 0;
        
        session.workedMinutes = Math.max(0, Math.round(sessionMinutes - breakMinutes));
        totalWorkedMinutes += session.workedMinutes;
        totalBreakMinutes += breakMinutes;
      }
    });
    
    this.workedMinutes = totalWorkedMinutes;
    this.workHours = Math.round((totalWorkedMinutes / 60) * 100) / 100;
    this.breakTime = totalBreakMinutes;
    
    // Determine status based on total work hours
    if (this.workHours >= 8) {
      this.status = 'present';
    } else if (this.workHours >= 4) {
      this.status = 'half_day';
    }
    
    // Calculate late/early/overtime based on first/last session
    if (firstSession.checkIn) {
      const shiftStartTime = new Date(this.date);
      const [startHour, startMinute] = (this.shiftStart || '09:00').split(':');
      shiftStartTime.setHours(parseInt(startHour, 10), parseInt(startMinute, 10), 0, 0);
      
      const checkInTime = new Date(firstSession.checkIn);
      if (checkInTime > shiftStartTime) {
        const lateMs = checkInTime.getTime() - shiftStartTime.getTime();
        this.lateMinutes = Math.round(lateMs / (1000 * 60));
        this.isLate = this.lateMinutes > 0;
      } else {
        this.lateMinutes = 0;
        this.isLate = false;
      }
    }
    
    if (lastSession.checkOut) {
      const shiftEndTime = new Date(this.date);
      const [endHour, endMinute] = (this.shiftEnd || '17:00').split(':');
      shiftEndTime.setHours(parseInt(endHour, 10), parseInt(endMinute, 10), 0, 0);
      
      const checkOutTime = new Date(lastSession.checkOut);
      if (checkOutTime < shiftEndTime) {
        const earlyMs = shiftEndTime.getTime() - checkOutTime.getTime();
        this.earlyExitMinutes = Math.round(earlyMs / (1000 * 60));
        this.isEarlyDeparture = this.earlyExitMinutes > 0;
        this.overtimeMinutes = 0;
        this.overtimeHours = 0;
      } else if (checkOutTime > shiftEndTime) {
        const otMs = checkOutTime.getTime() - shiftEndTime.getTime();
        this.overtimeMinutes = Math.round(otMs / (1000 * 60));
        this.overtimeHours = Math.round((this.overtimeMinutes / 60) * 100) / 100;
        this.earlyExitMinutes = 0;
        this.isEarlyDeparture = false;
      } else {
        this.earlyExitMinutes = 0;
        this.isEarlyDeparture = false;
        this.overtimeMinutes = 0;
        this.overtimeHours = 0;
      }
    }
    
    return next();
  }
  
  // Legacy: Handle old single checkIn/checkOut records
  // reset computed fields
  this.workedMinutes = this.workedMinutes || 0;
  this.workHours = this.workHours || 0;
  this.lateMinutes = this.lateMinutes || 0;
  this.earlyExitMinutes = this.earlyExitMinutes || 0;
  this.overtimeMinutes = this.overtimeMinutes || 0;
  this.overtimeHours = this.overtimeHours || 0;

  if (this.checkIn && this.checkOut) {
    const checkInTime = new Date(this.checkIn);
    const checkOutTime = new Date(this.checkOut);

    if (checkOutTime > checkInTime) {
      const diffMs = checkOutTime.getTime() - checkInTime.getTime();
      const baseMinutes = diffMs / (1000 * 60);

      const effectiveMinutes = Math.max(
        0,
        baseMinutes - (this.breakTime || 0)
      );

      this.workedMinutes = Math.round(effectiveMinutes);
      this.workHours =
        Math.round((this.workedMinutes / 60) * 100) / 100; // 2 decimals

      // Determine if present or half day based on worked hours
      if (this.workHours >= 8) {
        this.status = 'present';
      } else if (this.workHours >= 4 && this.status === 'absent') {
        this.status = 'half_day';
      }

      // Shift start time
      const shiftStartTime = new Date(this.date);
      const [startHour, startMinute] = (this.shiftStart || '09:00').split(':');
      shiftStartTime.setHours(
        parseInt(startHour, 10),
        parseInt(startMinute, 10),
        0,
        0
      );

      // Late arrival
      if (checkInTime > shiftStartTime) {
        const lateMs = checkInTime.getTime() - shiftStartTime.getTime();
        this.lateMinutes = Math.round(lateMs / (1000 * 60));
        this.isLate = this.lateMinutes > 0;
      } else {
        this.lateMinutes = 0;
        this.isLate = false;
      }

      // Shift end time
      const shiftEndTime = new Date(this.date);
      const [endHour, endMinute] = (this.shiftEnd || '17:00').split(':');
      shiftEndTime.setHours(
        parseInt(endHour, 10),
        parseInt(endMinute, 10),
        0,
        0
      );

      // Early departure / overtime
      if (checkOutTime < shiftEndTime) {
        const earlyMs = shiftEndTime.getTime() - checkOutTime.getTime();
        this.earlyExitMinutes = Math.round(earlyMs / (1000 * 60));
        this.isEarlyDeparture = this.earlyExitMinutes > 0;
        this.overtimeMinutes = 0;
        this.overtimeHours = 0;
      } else if (checkOutTime > shiftEndTime) {
        const otMs = checkOutTime.getTime() - shiftEndTime.getTime();
        this.overtimeMinutes = Math.round(otMs / (1000 * 60));
        this.overtimeHours =
          Math.round((this.overtimeMinutes / 60) * 100) / 100;
        this.earlyExitMinutes = 0;
        this.isEarlyDeparture = false;
      } else {
        this.earlyExitMinutes = 0;
        this.isEarlyDeparture = false;
        this.overtimeMinutes = 0;
        this.overtimeHours = 0;
      }
    }
  }

  next();
});

// Static method to find records by employee and date range
attendanceRecordSchema.statics.findByEmployeeAndDateRange = function (
  employeeId,
  startDate,
  endDate
) {
  return this.find({
    employeeId,
    date: {
      $gte: startDate,
      $lte: endDate,
    },
  }).sort({ date: -1 });
};

// Static method to get monthly summary
attendanceRecordSchema.statics.getMonthlySummary = function (
  employeeId,
  year,
  month
) {
  const startDate = new Date(year, month - 1, 1);
  const endDate = new Date(year, month, 0);

  return this.aggregate([
    {
      $match: {
        employeeId: new mongoose.Types.ObjectId(employeeId),
        date: { $gte: startDate, $lte: endDate },
      },
    },
    {
      $group: {
        _id: null,
        totalDays: { $sum: 1 },
        presentDays: {
          $sum: { $cond: [{ $eq: ['$status', 'present'] }, 1, 0] },
        },
        absentDays: {
          $sum: { $cond: [{ $eq: ['$status', 'absent'] }, 1, 0] },
        },
        halfDays: {
          $sum: { $cond: [{ $eq: ['$status', 'half_day'] }, 1, 0] },
        },
        leaveDays: {
          $sum: { $cond: [{ $eq: ['$status', 'leave'] }, 1, 0] },
        },
        holidayDays: {
          $sum: { $cond: [{ $eq: ['$status', 'holiday'] }, 1, 0] },
        },
        totalWorkHours: { $sum: '$workHours' },
        totalOvertimeHours: { $sum: '$overtimeHours' },
        totalWorkedMinutes: { $sum: '$workedMinutes' },
        totalOvertimeMinutes: { $sum: '$overtimeMinutes' },
        lateDays: {
          $sum: { $cond: ['$isLate', 1, 0] },
        },
        earlyDepartures: {
          $sum: { $cond: ['$isEarlyDeparture', 1, 0] },
        },
        totalLateMinutes: { $sum: '$lateMinutes' },
        totalEarlyExitMinutes: { $sum: '$earlyExitMinutes' },
      },
    },
  ]);
};

// Instance method to format for API response
attendanceRecordSchema.methods.toSummary = function () {
  return {
    _id: this._id,
    date: this.formattedDate,
    checkIn: this.checkIn,
    checkOut: this.checkOut,
    workHours: this.workHours,
    workedMinutes: this.workedMinutes,
    status: this.status,
    statusReason: this.statusReason,
    isLate: this.isLate,
    lateMinutes: this.lateMinutes,
    isEarlyDeparture: this.isEarlyDeparture,
    earlyExitMinutes: this.earlyExitMinutes,
    overtimeMinutes: this.overtimeMinutes,
    overtimeHours: this.overtimeHours,
    remarks: this.remarks,
    approvalStatus: this.approvalStatus,
    sessions: this.sessions || [],
  };
};

// Instance method to get active session
attendanceRecordSchema.methods.getActiveSession = function () {
  if (!this.sessions || this.sessions.length === 0) return null;
  return this.sessions.find((s) => s.status === 'active' || s.status === 'on_break');
};

// Instance method to check if employee can clock in
attendanceRecordSchema.methods.canClockIn = function () {
  const activeSession = this.getActiveSession();
  return !activeSession; // Can clock in if no active session
};

// Instance method to check if employee can clock out
attendanceRecordSchema.methods.canClockOut = function () {
  const activeSession = this.getActiveSession();
  return activeSession && activeSession.status === 'active';
};

// Instance method to check if employee can start break
attendanceRecordSchema.methods.canStartBreak = function () {
  const activeSession = this.getActiveSession();
  return activeSession && activeSession.status === 'active';
};

// Instance method to check if employee can end break
attendanceRecordSchema.methods.canEndBreak = function () {
  const activeSession = this.getActiveSession();
  return activeSession && activeSession.status === 'on_break';
};

// Static method to find active sessions (for live attendance)
attendanceRecordSchema.statics.findActiveSessions = function (date = new Date()) {
  const dateOnly = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  
  return this.find({
    date: dateOnly,
    'sessions.status': { $in: ['active', 'on_break'] },
  })
    .populate('employeeId', 'firstName lastName email department')
    .lean();
};

export default mongoose.model('AttendanceRecord', attendanceRecordSchema);
