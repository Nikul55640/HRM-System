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
    type: DataTypes.ENUM('present', 'absent', 'leave', 'half_day', 'holiday'),
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

  return {
    totalDays: records.length,
    presentDays: records.filter(r => r.status === 'present').length,
    absentDays: records.filter(r => r.status === 'absent').length,
    halfDays: records.filter(r => r.status === 'half_day').length,
    leaveDays: records.filter(r => r.status === 'leave').length,
    holidayDays: records.filter(r => r.status === 'holiday').length,
    totalWorkHours: records.reduce((sum, r) => sum + (parseFloat(r.workHours) || 0), 0),
    totalOvertimeHours: records.reduce((sum, r) => sum + (parseFloat(r.overtimeHours) || 0), 0),
    lateDays: records.filter(r => r.isLate).length,
    earlyDepartures: records.filter(r => r.isEarlyDeparture).length,
    totalLateMinutes: records.reduce((sum, r) => sum + (r.lateMinutes || 0), 0),
    totalEarlyExitMinutes: records.reduce((sum, r) => sum + (r.earlyExitMinutes || 0), 0),
  };
};

// Hooks for automatic calculations
AttendanceRecord.beforeSave(async (record) => {
  if (record.clockIn && record.clockOut) {
    // Calculate working hours
    record.calculateWorkingHours();

    // Get shift information for late/early calculations
    if (record.shiftId) {
      const { Shift } = await import('./index.js');
      const shift = await Shift.findByPk(record.shiftId);

      if (shift) {
        // Calculate late minutes
        const shiftStartTime = new Date(record.clockIn);
        const [shiftHour, shiftMinute] = shift.shiftStartTime.split(':');
        shiftStartTime.setHours(parseInt(shiftHour), parseInt(shiftMinute), 0, 0);

        const clockInTime = new Date(record.clockIn);
        const gracePeriodMs = (shift.gracePeriodMinutes || 0) * 60 * 1000;

        if (clockInTime > new Date(shiftStartTime.getTime() + gracePeriodMs)) {
          record.lateMinutes = Math.floor((clockInTime - shiftStartTime) / (1000 * 60));
          record.isLate = true;
        }

        // Calculate early exit minutes
        const shiftEndTime = new Date(record.clockOut);
        const [endHour, endMinute] = shift.shiftEndTime.split(':');
        shiftEndTime.setHours(parseInt(endHour), parseInt(endMinute), 0, 0);

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