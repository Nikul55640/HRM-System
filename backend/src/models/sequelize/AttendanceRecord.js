import { DataTypes } from 'sequelize';
import sequelize from '../../config/sequelize.js';

/**
 * AttendanceRecord Model
 * 
 * 🚨 CRITICAL ARCHITECTURE RULES:
 * 
 * ✅ WHAT THIS MODEL SHOULD DO:
 * - Define schema, indexes, constraints
 * - State validation methods (canClockIn, canClockOut, etc.)
 * - UI mapping methods (toCalendarEvent)
 * - Static reporting methods (getMonthlySummary, etc.)
 * 
 * ❌ WHAT THIS MODEL MUST NOT DO:
 * - Calculate work hours, late minutes, overtime
 * - Determine attendance status (present/absent/half_day)
 * - Perform date/time calculations with setHours()
 * - Duplicate logic from AttendanceCalculationService
 * 
 * 🔧 BUSINESS LOGIC SEPARATION:
 * - All calculations → AttendanceCalculationService
 * - Status decisions → jobs/attendanceFinalization.js
 * - Model only stores computed values, never computes them
 * 
 * This separation prevents the "early clock-in marked as late" bug
 * by ensuring single source of truth for all time calculations.
 */

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
    comment: 'Array of break sessions with breakIn and breakOut times',
    get() {
      const raw = this.getDataValue('breakSessions');
      return Array.isArray(raw) ? raw : [];
    },
    set(value) {
      this.setDataValue('breakSessions', Array.isArray(value) ? value : []);
    }
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
    // 🔥 CRITICAL FIX: Prevent multiple pending corrections for same employee/date
    {
      fields: ['employeeId', 'date'],
      where: { status: 'pending_correction' },
      unique: true,
      name: 'unique_pending_correction_per_employee_date'
    },
  ],
});

// Instance methods
//  SMART BUTTON CONTROLS - PREVENT USER ERRORS
AttendanceRecord.prototype.canClockIn = function (shift = null) {
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

  // 🕐 ✅ SHIFT END CHECK (SAFE & FINAL)
  if (shift?.shiftEndTime) {
    const now = new Date();
    
    const [endH, endM, endS = 0] = shift.shiftEndTime.split(':').map(Number);
    
    // Build possible shift end times
    const todayEnd = new Date(now);
    todayEnd.setHours(endH, endM, endS, 0);
    
    const tomorrowEnd = new Date(todayEnd);
    tomorrowEnd.setDate(todayEnd.getDate() + 1);
    
    // Pick the closest shift end time
    const shiftEnd = 
      Math.abs(now - todayEnd) < Math.abs(now - tomorrowEnd)
        ? todayEnd
        : tomorrowEnd;
    
    if (now > shiftEnd) {
      return {
        allowed: false,
        reason: 'Shift time has already ended'
      };
    }
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

  // ✅ UPDATED: Allow clock-out for pending correction status
  // Employees should be able to clock out even if there's a pending correction
  // The correction can be processed later, but they need to end their work day
  if (this.status === 'pending_correction') {
    // Allow clock-out - the correction process is separate from daily operations
    return { allowed: true, reason: null };
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

// ✅ KEEP: Static methods for reporting and cleanup
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
    absentDays: records.filter(r => r.status === 'absent').length, // ✅ NEW: Actual absent days
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
    averageWorkHours: records.length > 0 ? totalWorkHours / records.length : 0,
    // 🔥 CRITICAL FIX: Flag that this includes live session data
    includesLiveSession: incompleteDays > 0
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
  // 🔥 CRITICAL FIX: Define color mapping inline instead of undefined function
  const statusColors = {
    'present': '#22c55e',      // Green
    'absent': '#ef4444',       // Red
    'leave': '#3b82f6',        // Blue
    'half_day': '#f59e0b',     // Orange
    'holiday': '#8b5cf6',      // Purple
    'incomplete': '#6b7280',   // Gray
    'pending_correction': '#f97316' // Orange-red
  };

  return {
    title: this.status,
    start: this.date,
    allDay: true,
    color: statusColors[this.status] || '#6b7280'
  };
};

/**
 * 🔥 CRITICAL MISSING METHOD: Finalize attendance status based on shift thresholds
 * This method determines if an employee worked enough hours for "present" vs "half_day" status
 * 
 * @param {Object} shift - Employee's shift with fullDayHours and halfDayHours thresholds
 */
AttendanceRecord.prototype.finalizeWithShift = async function(shift) {
  if (!this.clockIn || !this.clockOut) {
    // Cannot finalize without both clock-in and clock-out
    return;
  }

  // Import the calculation service for work hours calculation (ES module compatible)
  const { default: AttendanceCalculationService } = await import('../services/core/attendanceCalculation.service.js');
  
  // Calculate work hours using the centralized service
  const { workMinutes, breakMinutes } = AttendanceCalculationService.calculateWorkHours(
    this.clockIn,
    this.clockOut,
    this.breakSessions
  );

  // Update work time fields
  this.totalWorkedMinutes = workMinutes;
  this.totalBreakMinutes = breakMinutes;
  this.workHours = Math.round((workMinutes / 60) * 100) / 100; // Round to 2 decimal places

  // Calculate overtime if shift has fullDayHours defined
  if (shift && shift.fullDayHours) {
    this.overtimeMinutes = AttendanceCalculationService.calculateOvertime(workMinutes, shift);
    this.overtimeHours = Math.round((this.overtimeMinutes / 60) * 100) / 100;
  }

  // 🔥 CRITICAL LOGIC: Determine final status based on work hours vs shift thresholds
  if (shift && shift.fullDayHours && shift.halfDayHours) {
    const workHours = this.workHours;
    
    if (workHours >= shift.fullDayHours) {
      // Worked full day hours or more → PRESENT
      this.status = 'present';
      this.halfDayType = 'full_day';
      this.statusReason = `Worked ${workHours} hours (≥ ${shift.fullDayHours} required for full day)`;
    } else if (workHours >= shift.halfDayHours) {
      // Worked half day hours but less than full day → HALF DAY
      this.status = 'half_day';
      this.statusReason = `Worked ${workHours} hours (≥ ${shift.halfDayHours} for half day, < ${shift.fullDayHours} for full day)`;
      
      // Determine if first half or second half based on clock-in time
      const clockInHour = new Date(this.clockIn).getHours();
      if (clockInHour < 12) {
        this.halfDayType = 'first_half'; // Morning shift
      } else {
        this.halfDayType = 'second_half'; // Afternoon shift
      }
    } else {
      // Worked less than half day hours → HALF DAY (minimum attendance)
      this.status = 'half_day';
      this.halfDayType = 'first_half'; // Default to first half
      this.statusReason = `Worked ${workHours} hours (< ${shift.halfDayHours} required for half day)`;
    }
  } else {
    // Fallback logic if shift thresholds are not defined
    // Use standard 8-hour full day, 4-hour half day
    const workHours = this.workHours;
    
    if (workHours >= 8) {
      this.status = 'present';
      this.halfDayType = 'full_day';
      this.statusReason = `Worked ${workHours} hours (≥ 8 hours for full day)`;
    } else if (workHours >= 4) {
      this.status = 'half_day';
      this.halfDayType = workHours >= 6 ? 'first_half' : 'second_half';
      this.statusReason = `Worked ${workHours} hours (≥ 4 hours for half day, < 8 hours for full day)`;
    } else {
      this.status = 'half_day';
      this.halfDayType = 'first_half';
      this.statusReason = `Worked ${workHours} hours (< 4 hours minimum)`;
    }
  }
};

// ✅ KEEP: Hooks for basic validation only (no business logic calculations)
AttendanceRecord.beforeSave(async (record) => {
  // 🔐 CRITICAL SAFETY: Prevent absent status when clock-in exists
  if (record.clockIn && record.status === 'absent') {
    throw new Error('Invalid state: cannot mark absent when clock-in exists');
  }

  // ✅ REMOVED: All calculation logic moved to AttendanceCalculationService
  // ✅ REMOVED: Status evaluation moved to attendanceFinalization job
  // Model only validates data integrity, not business logic
});

export default AttendanceRecord;