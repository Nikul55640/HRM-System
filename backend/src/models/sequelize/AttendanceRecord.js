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
    defaultValue: 'present',
  },
  statusReason: {
    type: DataTypes.STRING,
    allowNull: true,
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
AttendanceRecord.prototype.canClockIn = function () {
  return !this.clockIn;
};

AttendanceRecord.prototype.canClockOut = function () {
  return this.clockIn && !this.clockOut;
};

AttendanceRecord.prototype.canStartBreak = function () {
  if (!this.clockIn || this.clockOut) return false;
  const breakSessions = this.breakSessions || [];
  // Can start break if no active break session
  return !breakSessions.some(session => session.breakIn && !session.breakOut);
};

AttendanceRecord.prototype.canEndBreak = function () {
  const breakSessions = this.breakSessions || [];
  // Can end break if there's an active break session
  return breakSessions.some(session => session.breakIn && !session.breakOut);
};

AttendanceRecord.prototype.getCurrentBreakSession = function () {
  const breakSessions = this.breakSessions || [];
  return breakSessions.find(session => session.breakIn && !session.breakOut);
};

AttendanceRecord.prototype.calculateWorkingHours = function () {
  if (!this.clockIn || !this.clockOut) return 0;

  const clockInTime = new Date(this.clockIn);
  const clockOutTime = new Date(this.clockOut);
  const totalMinutes = Math.floor((clockOutTime - clockInTime) / (1000 * 60));

  // Subtract break time
  const workingMinutes = Math.max(0, totalMinutes - this.totalBreakMinutes);

  this.totalWorkedMinutes = workingMinutes;
  this.workHours = Math.round((workingMinutes / 60) * 100) / 100;

  return this.workHours;
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
    absentDays: records.filter(r => r.status === 'absent').length,
    halfDays: records.filter(r => r.status === 'half_day').length,
    leaveDays: records.filter(r => r.status === 'leave').length,
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

// Hooks for automatic calculations
// ❌ REMOVE DUPLICATE LATE CALCULATION FROM beforeSave HOOK
// Late should ONLY be calculated at clock-in, not when saving complete records
AttendanceRecord.beforeSave(async (record) => {
  if (record.clockIn && record.clockOut) {
    // Calculate working hours
    record.calculateWorkingHours();

    // Get shift information for early exit and overtime calculations ONLY
    if (record.shiftId) {
      const { Shift } = await import('./index.js');
      const shift = await Shift.findByPk(record.shiftId);

      if (shift) {
        // ❌ REMOVED: Late calculation (now done at clock-in only)
        // Late minutes and isLate are set at clock-in and should not be recalculated

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
    }
  }
});

export default AttendanceRecord;