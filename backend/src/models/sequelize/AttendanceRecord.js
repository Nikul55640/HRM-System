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
      model: 'Employees',
      key: 'id',
    },
  },
  date: {
    type: DataTypes.DATEONLY,
    allowNull: false,
  },
  checkIn: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  checkOut: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  status: {
    type: DataTypes.ENUM('present', 'absent', 'leave', 'half_day', 'holiday'),
    defaultValue: 'present',
  },
  statusReason: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  workHours: {
    type: DataTypes.DECIMAL(4, 2),
    defaultValue: 0,
  },
  workedMinutes: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },
  overtimeHours: {
    type: DataTypes.DECIMAL(4, 2),
    defaultValue: 0,
  },
  overtimeMinutes: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },
  breakTime: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },
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
  location: {
    type: DataTypes.JSON,
    allowNull: true,
  },
  deviceInfo: {
    type: DataTypes.JSON,
    allowNull: true,
  },
  remarks: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  remarksHistory: {
    type: DataTypes.JSON,
    defaultValue: [],
  },
  sessions: {
    type: DataTypes.JSON,
    defaultValue: [],
  },
  shiftStart: {
    type: DataTypes.STRING,
    defaultValue: '09:00',
  },
  shiftEnd: {
    type: DataTypes.STRING,
    defaultValue: '17:00',
  },
  approvalStatus: {
    type: DataTypes.ENUM('auto', 'pending', 'approved', 'rejected'),
    defaultValue: 'auto',
  },
  source: {
    type: DataTypes.ENUM('self', 'admin', 'system', 'manual'),
    defaultValue: 'self',
  },
  createdBy: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'Users',
      key: 'id',
    },
  },
  updatedBy: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'Users',
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
  ],
});

// Instance methods
AttendanceRecord.prototype.toSummary = function() {
  return {
    id: this.id,
    employeeId: this.employeeId,
    date: this.date,
    checkIn: this.checkIn,
    checkOut: this.checkOut,
    status: this.status,
    statusReason: this.statusReason,
    workHours: this.workHours,
    workedMinutes: this.workedMinutes,
    overtimeHours: this.overtimeHours,
    overtimeMinutes: this.overtimeMinutes,
    breakTime: this.breakTime,
    lateMinutes: this.lateMinutes,
    earlyExitMinutes: this.earlyExitMinutes,
    isLate: this.isLate,
    isEarlyDeparture: this.isEarlyDeparture,
    sessions: this.sessions || [],
    approvalStatus: this.approvalStatus,
    source: this.source,
  };
};

// Session management methods
AttendanceRecord.prototype.canClockIn = function() {
  const sessions = this.sessions || [];
  // Can clock in if no active session exists
  return !sessions.some(session => session.status === 'active' || session.status === 'on_break');
};

AttendanceRecord.prototype.canClockOut = function() {
  const sessions = this.sessions || [];
  // Can clock out if there's an active session (not on break)
  return sessions.some(session => session.status === 'active');
};

AttendanceRecord.prototype.canStartBreak = function() {
  const sessions = this.sessions || [];
  // Can start break if there's an active session (not already on break)
  return sessions.some(session => session.status === 'active');
};

AttendanceRecord.prototype.canEndBreak = function() {
  const sessions = this.sessions || [];
  // Can end break if there's a session on break
  return sessions.some(session => session.status === 'on_break');
};

AttendanceRecord.prototype.getActiveSession = function() {
  const sessions = this.sessions || [];
  return sessions.find(session => session.status === 'active' || session.status === 'on_break');
};

// Static methods
AttendanceRecord.getMonthlySummary = async function(employeeId, year, month) {
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

  const summary = {
    totalDays: records.length,
    presentDays: records.filter(r => r.status === 'present').length,
    absentDays: records.filter(r => r.status === 'absent').length,
    halfDays: records.filter(r => r.status === 'half_day').length,
    leaveDays: records.filter(r => r.status === 'leave').length,
    holidayDays: records.filter(r => r.status === 'holiday').length,
    totalWorkHours: records.reduce((sum, r) => sum + (parseFloat(r.workHours) || 0), 0),
    totalOvertimeHours: records.reduce((sum, r) => sum + (parseFloat(r.overtimeHours) || 0), 0),
    totalWorkedMinutes: records.reduce((sum, r) => sum + (r.workedMinutes || 0), 0),
    totalOvertimeMinutes: records.reduce((sum, r) => sum + (r.overtimeMinutes || 0), 0),
    lateDays: records.filter(r => r.isLate).length,
    earlyDepartures: records.filter(r => r.isEarlyDeparture).length,
    totalLateMinutes: records.reduce((sum, r) => sum + (r.lateMinutes || 0), 0),
    totalEarlyExitMinutes: records.reduce((sum, r) => sum + (r.earlyExitMinutes || 0), 0),
  };

  return [summary];
};

// Hooks
AttendanceRecord.beforeSave(async (record) => {
  if (record.checkIn && record.checkOut) {
    const checkInTime = new Date(record.checkIn);
    const checkOutTime = new Date(record.checkOut);
    
    // Calculate worked minutes
    const diffMs = checkOutTime - checkInTime;
    const workedMinutes = Math.floor(diffMs / (1000 * 60));
    record.workedMinutes = Math.max(0, workedMinutes - (record.breakTime || 0));
    
    // Calculate work hours
    record.workHours = Math.round((record.workedMinutes / 60) * 100) / 100;
    
    // Calculate late minutes
    const shiftStartTime = new Date(record.checkIn);
    const [shiftHour, shiftMinute] = (record.shiftStart || '09:00').split(':');
    shiftStartTime.setHours(parseInt(shiftHour), parseInt(shiftMinute), 0, 0);
    
    if (checkInTime > shiftStartTime) {
      record.lateMinutes = Math.floor((checkInTime - shiftStartTime) / (1000 * 60));
      record.isLate = record.lateMinutes > 0;
    }
    
    // Calculate early exit minutes
    const shiftEndTime = new Date(record.checkOut);
    const [endHour, endMinute] = (record.shiftEnd || '17:00').split(':');
    shiftEndTime.setHours(parseInt(endHour), parseInt(endMinute), 0, 0);
    
    if (checkOutTime < shiftEndTime) {
      record.earlyExitMinutes = Math.floor((shiftEndTime - checkOutTime) / (1000 * 60));
      record.isEarlyDeparture = record.earlyExitMinutes > 0;
    }
  }
});

export default AttendanceRecord;