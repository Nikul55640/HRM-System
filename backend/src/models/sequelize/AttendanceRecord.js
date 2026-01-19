import { DataTypes } from 'sequelize';
import sequelize from '../../config/sequelize.js';

const AttendanceRecord = sequelize.define('AttendanceRecord', {
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
  shiftId: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'shifts',
      key: 'id',
    },
  },
  date: {
    type: DataTypes.DATEONLY,
    allowNull: false,
  },
  // Clock In/Out Times
  clockIn: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  clockOut: {
    type: DataTypes.DATE,
    allowNull: true,
  },

  // Break Management
  breakSessions: {
    type: DataTypes.JSON,
    defaultValue: [],
    comment: 'Array of break sessions with breakIn and breakOut times'
  },
  totalBreakMinutes: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },

  // Working Hours Calculation
  totalWorkedMinutes: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },
  workHours: {
    type: DataTypes.DECIMAL(4, 2),
    defaultValue: 0,
  },

  // Late Arrival & Early Exit Tracking
  lateMinutes: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },
  earlyExitMinutes: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },
  isLate: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  isEarlyDeparture: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  // Status
  status: {
    type: DataTypes.ENUM('present', 'absent', 'leave', 'half_day', 'holiday', 'incomplete', 'pending_correction'),
    defaultValue: 'incomplete',
  },
  statusReason: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  // Half Day Details
  halfDayType: {
    type: DataTypes.ENUM('first_half', 'second_half', 'full_day'),
    allowNull: true,
    comment: 'Type of half day: first_half (morning), second_half (afternoon), or full_day'
  },

  // Overtime
  overtimeMinutes: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },
  overtimeHours: {
    type: DataTypes.DECIMAL(4, 2),
    defaultValue: 0,
  },

  // Location & Device Info
  workMode: {
    type: DataTypes.ENUM('office', 'wfh', 'hybrid', 'field'),
    defaultValue: 'office',
    comment: 'Work mode: office, work from home, hybrid, or field work'
  },
  location: {
    type: DataTypes.JSON,
    allowNull: true,
    comment: 'GPS coordinates and address for clock in/out'
  },
  deviceInfo: {
    type: DataTypes.JSON,
    allowNull: true,
    comment: 'Device information for security'
  },

  // Correction & Approval
  correctionRequested: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  correctionReason: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  correctionStatus: {
    type: DataTypes.ENUM('pending', 'approved', 'rejected'),
    allowNull: true,
  },
  correctedBy: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'users',
      key: 'id',
    },
  },
  correctedAt: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  flaggedReason: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  flaggedBy: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'users',
      key: 'id',
    },
  },
  flaggedAt: {
    type: DataTypes.DATE,
    allowNull: true,
  },

  // Remarks
  remarks: {
    type: DataTypes.TEXT,
    allowNull: true,
  },

  // Audit fields
  createdBy: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'users',
      key: 'id',
    },
  },
  updatedBy: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'users',
      key: 'id',
    },
  },
}, {
  tableName: 'attendance_records',
  timestamps: true,
  indexes: [
    {
      fields: ['employeeId', 'date'],
      unique: true,
    },
    {
      fields: ['date'],
    },
    {
      fields: ['status'],
    },
    {
      fields: ['correctionStatus'],
    },
  ],
});

// Instance methods
// 🚫 SMART BUTTON CONTROLS - PREVENT USER ERRORS
AttendanceRecord.prototype.canClockIn = function () {
  // ❌ Cannot clock in if:
  // - On leave or holiday (protected statuses)
  // - Already clocked in
  // - Already marked absent/present for the day (day is closed)
  if (['leave', 'holiday'].includes(this.status)) {
    return { 
      allowed: false, 
      reason: `Cannot clock in - you are on ${this.status} today` 
    };
  }
  
  if (this.clockIn) {
    return { 
      allowed: false, 
      reason: 'Already clocked in today' 
    };
  }

  if (['absent', 'present'].includes(this.status)) {
    return { 
      allowed: false, 
      reason: 'Attendance already finalized for today' 
    };
  }

  // ✅ NEW: Check for pending correction status
  if (this.status === 'pending_correction') {
    return { 
      allowed: false, 
      reason: 'Attendance correction pending - contact HR' 
    };
  }

  return { allowed: true, reason: null };
};

AttendanceRecord.prototype.canClockOut = function () {
  // ❌ Cannot clock out if:
  // - No clock-in recorded
  // - Already clocked out
  // - On leave or holiday (protected statuses)
  // - Already marked absent (day is closed)
  if (!this.clockIn) {
    return { 
      allowed: false, 
      reason: 'Must clock in first' 
    };
  }

  if (this.clockOut) {
    return { 
      allowed: false, 
      reason: 'Already clocked out today' 
    };
  }

  if (['leave', 'holiday'].includes(this.status)) {
    return { 
      allowed: false, 
      reason: `Cannot clock out - you are on ${this.status} today` 
    };
  }

  if (this.status === 'absent') {
    return { 
      allowed: false, 
      reason: 'Attendance marked as absent - contact HR for correction' 
    };
  }

  // ✅ NEW: Check for pending correction status
  if (this.status === 'pending_correction') {
    return { 
      allowed: false, 
      reason: 'Attendance correction pending - contact HR' 
    };
  }

  return { allowed: true, reason: null };
};

AttendanceRecord.prototype.canStartBreak = function () {
  // ❌ Cannot start break if:
  // - Not clocked in or already clocked out
  // - On leave/holiday/absent
  // - Already on break
  if (!this.clockIn || this.clockOut) {
    return { 
      allowed: false, 
      reason: 'Must be clocked in to take break' 
    };
  }

  if (['leave', 'holiday', 'absent'].includes(this.status)) {
    return { 
      allowed: false, 
      reason: `Cannot take break - status is ${this.status}` 
    };
  }

  // Check if already on break
  const breakSessions = this.breakSessions || [];
  const activeBreak = breakSessions.find(session => session.breakIn && !session.breakOut);
  
  if (activeBreak) {
    return { 
      allowed: false, 
      reason: 'Already on break - end current break first' 
    };
  }

  return { allowed: true, reason: null };
};

AttendanceRecord.prototype.canEndBreak = function () {
  // ✅ Can only end break if currently on break
  if (!this.clockIn || this.clockOut) {
    return { 
      allowed: false, 
      reason: 'Must be clocked in to end break' 
    };
  }

  const breakSessions = this.breakSessions || [];
  const activeBreak = breakSessions.find(session => session.breakIn && !session.breakOut);
  
  if (!activeBreak) {
    return { 
      allowed: false, 
      reason: 'Not currently on break' 
    };
  }

  return { allowed: true, reason: null };
};

AttendanceRecord.prototype.getCurrentBreakSession = function () {
  const breakSessions = this.breakSessions || [];
  return breakSessions.find(session => session.breakIn && !session.breakOut);
};

AttendanceRecord.prototype.calculateWorkingHours = function () {
  if (!this.clockIn || !this.clockOut) {
    this.workHours = 0;
    return 0;
  }

  const clockInTime = new Date(this.clockIn);
  const clockOutTime = new Date(this.clockOut);
  const totalMinutes = Math.floor((clockOutTime - clockInTime) / (1000 * 60));

  // Subtract break time
  const workingMinutes = Math.max(0, totalMinutes - this.totalBreakMinutes);

  this.totalWorkedMinutes = workingMinutes;
  this.workHours = Math.round((workingMinutes / 60) * 100) / 100;

  return this.workHours;
};

// 🧠 MASTER RULE ENGINE - SINGLE SOURCE OF TRUTH FOR STATUS
AttendanceRecord.prototype.evaluateStatus = function (shift) {
  // 🔒 PROTECTED STATUSES - Leave and holiday override everything - never change these
  if (['leave', 'holiday'].includes(this.status)) {
    return;
  }

  // 🚫 RULE 1: No clock-in at all = ABSENT
  if (!this.clockIn) {
    this.status = 'absent';
    this.statusReason = 'No clock-in recorded';
    this.halfDayType = null;
    return;
  }

  // ⏳ RULE 2: Clock-in but no clock-out = INCOMPLETE (during day) or ABSENT (after day ends)
  if (this.clockIn && !this.clockOut) {
    // During the day, mark as incomplete
    // After day ends (handled by cron job), this becomes absent or pending_correction
    this.status = 'incomplete';
    this.statusReason = 'Clock-out pending';
    this.halfDayType = null;
    return;
  }

  // ✅ RULE 3: Both clock-in and clock-out exist - calculate hours and determine status
  this.calculateWorkingHours();

  const workedHours = this.workHours || 0;
  const fullDayHours = shift?.fullDayHours || 8;
  const halfDayHours = shift?.halfDayHours || 4;

  // Full day worked
  if (workedHours >= fullDayHours) {
    this.status = 'present';
    this.halfDayType = 'full_day';
    this.statusReason = `Worked ${workedHours.toFixed(2)} hours`;
  } 
  // Half day worked
  else if (workedHours >= halfDayHours) {
    this.status = 'half_day';
    this.halfDayType = this.determineHalfDayType(shift);
    this.statusReason = `Worked ${workedHours.toFixed(2)} hours (half day)`;
  } 
  // 🔑 CRITICAL FIX: Any work done = half_day (never absent if clocked in)
  else {
    this.status = 'half_day';
    this.halfDayType = this.determineHalfDayType(shift);
    this.statusReason = `Worked ${workedHours.toFixed(2)} hours (below minimum)`;
  }
};

// ✅ NEW: Determine half-day type based on timing
AttendanceRecord.prototype.determineHalfDayType = function (shift) {
  if (!this.clockIn || !shift) return 'first_half';

  const clockInTime = new Date(this.clockIn);
  const today = this.date;
  
  // Calculate shift midpoint
  const shiftStartTime = new Date(`${today} ${shift.shiftStartTime}`);
  const shiftEndTime = new Date(`${today} ${shift.shiftEndTime}`);
  const shiftMidpoint = new Date((shiftStartTime.getTime() + shiftEndTime.getTime()) / 2);

  // If clocked in before midpoint, likely worked first half
  // If clocked in after midpoint, likely worked second half
  if (clockInTime <= shiftMidpoint) {
    return 'first_half';
  } else {
    return 'second_half';
  }
};

// Static methods
AttendanceRecord.getMonthlySummary = async function (employeeId, year, month) {
  const startDate = new Date(year, month - 1, 1);
  const endDate = new Date(year, month, 0);

  const records = await this.findAll({
    where: {
      employeeId,
      date: {
        [sequelize.Sequelize.Op.between]: [startDate, endDate],
      },
    },
    raw: true,
  });

  // Calculate incomplete days (records with clockIn but no clockOut)
  const incompleteDays = records.filter(r => r.clockIn && !r.clockOut).length;
  
  // Calculate total break minutes from all records
  const totalBreakMinutes = records.reduce((sum, r) => sum + (r.totalBreakMinutes || 0), 0);
  
  // Calculate total worked minutes from all records (including current session for incomplete days)
  const totalWorkedMinutes = records.reduce((sum, r) => {
    if (r.totalWorkedMinutes && r.totalWorkedMinutes > 0) {
      // Use existing calculated worked minutes for completed days
      return sum + r.totalWorkedMinutes;
    } else if (r.clockIn && !r.clockOut) {
      // For incomplete days, calculate current worked time
      const clockInTime = new Date(r.clockIn);
      const currentTime = new Date();
      const workedMinutes = Math.floor((currentTime - clockInTime) / (1000 * 60));
      const breakMinutes = r.totalBreakMinutes || 0;
      const netWorkedMinutes = Math.max(0, workedMinutes - breakMinutes);
      return sum + netWorkedMinutes;
    }
    return sum;
  }, 0);

  // Calculate total work hours (including current session)
  const totalWorkHours = records.reduce((sum, r) => {
    if (r.workHours && parseFloat(r.workHours) > 0) {
      // Use existing work hours for completed days
      return sum + parseFloat(r.workHours);
    } else if (r.clockIn && !r.clockOut) {
      // For incomplete days, calculate current work hours
      const clockInTime = new Date(r.clockIn);
      const currentTime = new Date();
      const workedMinutes = Math.floor((currentTime - clockInTime) / (1000 * 60));
      const breakMinutes = r.totalBreakMinutes || 0;
      const netWorkedMinutes = Math.max(0, workedMinutes - breakMinutes);
      const workHours = netWorkedMinutes / 60;
      return sum + workHours;
    }
    return sum;
  }, 0);

  return {
    totalDays: records.length,
    presentDays: records.filter(r => r.status === 'present').length,
    leaveDays: records.filter(r => r.status === 'leave').length, // ✅ Renamed from absentDays
    halfDays: records.filter(r => r.status === 'half_day').length,
    holidayDays: records.filter(r => r.status === 'holiday').length,
    totalWorkHours: totalWorkHours,
    totalOvertimeHours: records.reduce((sum, r) => sum + (parseFloat(r.overtimeHours) || 0), 0),
    lateDays: records.filter(r => r.isLate).length,
    earlyDepartures: records.filter(r => r.isEarlyDeparture).length,
    totalLateMinutes: records.reduce((sum, r) => sum + (r.lateMinutes || 0), 0),
    totalEarlyExitMinutes: records.reduce((sum, r) => sum + (r.earlyExitMinutes || 0), 0),
    // Add missing fields for frontend compatibility
    incompleteDays,
    totalBreakMinutes,
    totalWorkedMinutes,
    averageWorkHours: records.length > 0 ? totalWorkHours / records.length : 0
  };
};

// 🔄 AUTO-CORRECTION METHODS
AttendanceRecord.markMissedClockOuts = async function (date) {
  const { Op } = await import('sequelize');
  
  // Mark records with clock-in but no clock-out as pending correction
  const updatedRecords = await AttendanceRecord.update(
    {
      status: 'pending_correction',
      statusReason: 'Missed clock-out - requires correction'
    },
    {
      where: {
        date: date,
        clockIn: { [Op.not]: null },
        clockOut: null,
        status: { [Op.notIn]: ['leave', 'holiday'] }
      },
      returning: true
    }
  );

  console.log(`✅ Marked ${updatedRecords[0]} records as pending correction for missed clock-outs on ${date}`);
  return updatedRecords[0];
};

AttendanceRecord.markAbsentForNoClockIn = async function (date) {
  const { Op } = await import('sequelize');
  
  // Mark records with no clock-in as absent
  const updatedRecords = await AttendanceRecord.update(
    {
      status: 'absent',
      statusReason: 'No attendance recorded'
    },
    {
      where: {
        date: date,
        clockIn: null,
        status: { [Op.notIn]: ['leave', 'holiday'] }
      },
      returning: true
    }
  );

  console.log(`✅ Marked ${updatedRecords[0]} records as absent for no clock-in on ${date}`);
  return updatedRecords[0];
};

// 🧹 DATA CLEANUP METHODS
AttendanceRecord.fixBadData = async function () {
  const { Op } = await import('sequelize');
  
  console.log('🧹 Starting attendance data cleanup...');
  
  // Fix 1: Present without clock-out
  const fixedPresent = await AttendanceRecord.update(
    { 
      status: 'incomplete',
      statusReason: 'Fixed: was present without clock-out'
    },
    {
      where: {
        clockIn: { [Op.not]: null },
        clockOut: null,
        status: 'present'
      }
    }
  );
  
  // Fix 2: Half day but >= full day hours
  const fixedHalfDay = await AttendanceRecord.update(
    { 
      status: 'present',
      halfDayType: 'full_day',
      statusReason: 'Fixed: upgraded from half-day to present'
    },
    {
      where: {
        workHours: { [Op.gte]: 8 },
        status: 'half_day'
      }
    }
  );
  
  // Fix 3: Leave days with clock-in data
  const fixedLeave = await AttendanceRecord.update(
    { 
      clockIn: null,
      clockOut: null,
      workHours: 0,
      totalWorkedMinutes: 0
    },
    {
      where: {
        status: 'leave',
        clockIn: { [Op.not]: null }
      }
    }
  );

  // Fix 4: 🔥 CRITICAL FIX - Absent records with clock-in data
  const fixedAbsent = await AttendanceRecord.update(
    {
      status: 'half_day',
      statusReason: 'Auto-fixed: had clock-in data, cannot be absent'
    },
    {
      where: {
        clockIn: { [Op.not]: null },
        status: 'absent'
      }
    }
  );
  
  console.log(`✅ Data cleanup complete:`);
  console.log(`   - Fixed ${fixedPresent[0]} present records without clock-out`);
  console.log(`   - Fixed ${fixedHalfDay[0]} half-day records with full hours`);
  console.log(`   - Fixed ${fixedLeave[0]} leave records with clock data`);
  console.log(`   - Fixed ${fixedAbsent[0]} absent records with clock-in data`);
  
  return {
    fixedPresent: fixedPresent[0],
    fixedHalfDay: fixedHalfDay[0],
    fixedLeave: fixedLeave[0],
    fixedAbsent: fixedAbsent[0]
  };
};

AttendanceRecord.prototype.toCalendarEvent = function () {
  return {
    title: this.status,
    start: this.date,
    allDay: true,
    color: getColorByStatus(this.status)
  };
};

// Hooks for automatic calculations
AttendanceRecord.beforeSave(async (record) => {
  // 🔐 CRITICAL SAFETY: Prevent absent status when clock-in exists
  if (record.clockIn && record.status === 'absent') {
    throw new Error('Invalid state: cannot mark absent when clock-in exists');
  }

  // Only process if we have shift information
  if (!record.shiftId) return;

  const { Shift } = await import('./index.js');
  const shift = await Shift.findByPk(record.shiftId);
  if (!shift) return;

  // Calculate working hours and other metrics only when both clock-in and clock-out exist
  if (record.clockIn && record.clockOut) {
    record.calculateWorkingHours();

    // Calculate early exit minutes
    const today = record.date;
    const shiftEndTime = new Date(`${today} ${shift.shiftEndTime}`);
    const clockOutTime = new Date(record.clockOut);
    const earlyThresholdMs = (shift.earlyDepartureThresholdMinutes || 0) * 60 * 1000;

    if (clockOutTime < new Date(shiftEndTime.getTime() - earlyThresholdMs)) {
      record.earlyExitMinutes = Math.floor((shiftEndTime - clockOutTime) / (1000 * 60));
      record.isEarlyDeparture = true;
    }

    // Calculate overtime
    if (shift.overtimeEnabled && clockOutTime > shiftEndTime) {
      const overtimeThresholdMs = (shift.overtimeThresholdMinutes || 0) * 60 * 1000;
      if (clockOutTime > new Date(shiftEndTime.getTime() + overtimeThresholdMs)) {
        record.overtimeMinutes = Math.floor((clockOutTime - shiftEndTime) / (1000 * 60));
        record.overtimeHours = Math.round((record.overtimeMinutes / 60) * 100) / 100;
      }
    }
  }

  // 🧠 APPLY MASTER RULE ENGINE - SINGLE SOURCE OF TRUTH
  record.evaluateStatus(shift);
});

export default AttendanceRecord;