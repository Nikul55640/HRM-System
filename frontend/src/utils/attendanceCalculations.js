/**
 * Attendance Calculations & Display Utilities
 * Handles all attendance-related calculations and formatting for the frontend
 * 
 * CRITICAL: These functions work with the two-phase attendance system:
 * - LIVE states: in_progress, on_break, completed
 * - FINAL states: present, half_day, absent, pending_correction
 */

/**
 * Format duration in minutes to human-readable format
 * @param {number} minutes - Duration in minutes
 * @returns {string} Formatted duration (e.g., "2h 30m")
 */
export const formatDuration = (minutes) => {
  if (!minutes || minutes < 0) return '0m';
  
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  
  if (hours === 0) return `${mins}m`;
  if (mins === 0) return `${hours}h`;
  return `${hours}h ${mins}m`;
};

/**
 * Format time for display
 * @param {Date|string} time - Time to format
 * @returns {string} Formatted time (e.g., "10:30 AM")
 */
export const formatTime = (time) => {
  if (!time) return '--:--';
  
  try {
    const date = typeof time === 'string' ? new Date(time) : time;
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  } catch (error) {
    return '--:--';
  }
};

/**
 * Check if employee is currently in overtime
 * @param {Object} employee - Employee object with shift and attendance info
 * @param {Date} now - Current time (default: now)
 * @returns {boolean} True if in overtime
 */
export const isInOvertime = (employee, now = new Date()) => {
  if (!employee?.shift?.shiftEndTime) return false;
  
  try {
    const [hours, minutes, seconds] = employee.shift.shiftEndTime.split(':').map(Number);
    const shiftEnd = new Date(now);
    shiftEnd.setHours(hours, minutes, seconds || 0, 0);
    
    return now > shiftEnd;
  } catch (error) {
    console.error('Error checking overtime:', error);
    return false;
  }
};

/**
 * Calculate overtime minutes
 * @param {number|Object} totalMinutesOrEmployee - Total worked minutes OR employee object
 * @param {number|Date} shiftMinutesOrCurrentTime - Shift duration in minutes OR current time
 * @returns {number} Overtime minutes
 */
export const getOvertimeMinutes = (totalMinutesOrEmployee, shiftMinutesOrCurrentTime = 480) => {
  // If first parameter is an object (employee), calculate overtime based on current time
  if (typeof totalMinutesOrEmployee === 'object' && totalMinutesOrEmployee !== null) {
    const employee = totalMinutesOrEmployee;
    const currentTime = shiftMinutesOrCurrentTime instanceof Date ? shiftMinutesOrCurrentTime : new Date();
    
    // Check if employee has attendance record and shift info
    if (!employee?.attendance?.clockIn || !employee?.shift?.shiftEndTime) {
      return 0;
    }
    
    try {
      const clockIn = new Date(employee.attendance.clockIn);
      const [hours, minutes, seconds] = employee.shift.shiftEndTime.split(':').map(Number);
      const shiftEnd = new Date(currentTime);
      shiftEnd.setHours(hours, minutes, seconds || 0, 0);
      
      // If current time is past shift end, calculate overtime
      if (currentTime > shiftEnd) {
        return Math.floor((currentTime - shiftEnd) / (1000 * 60));
      }
      
      return 0;
    } catch (error) {
      console.error('Error calculating overtime for employee:', error);
      return 0;
    }
  }
  
  // Original function: calculate overtime from total minutes
  const totalMinutes = totalMinutesOrEmployee;
  const shiftMinutes = shiftMinutesOrCurrentTime;
  
  if (!totalMinutes || totalMinutes <= shiftMinutes) return 0;
  return totalMinutes - shiftMinutes;
};

/**
 * Get location information from attendance record
 * @param {Object} attendance - Attendance record
 * @returns {string} Location display text
 */
export const getLocationInfo = (attendance) => {
  if (!attendance) return 'Unknown';
  
  if (attendance.workLocation) {
    return attendance.workLocation;
  }
  
  if (attendance.deviceInfo?.location) {
    return attendance.deviceInfo.location;
  }
  
  return 'Not recorded';
};

/**
 * Get performance indicators from attendance
 * @param {Object} attendance - Attendance record
 * @returns {Object} Performance metrics
 */
export const getPerformanceIndicators = (attendance) => {
  if (!attendance) {
    return {
      isLate: false,
      isEarlyDeparture: false,
      hasBreak: false,
      breakDuration: 0
    };
  }
  
  return {
    isLate: attendance.isLate || false,
    isEarlyDeparture: attendance.isEarlyDeparture || false,
    hasBreak: (attendance.totalBreakMinutes || 0) > 0,
    breakDuration: attendance.totalBreakMinutes || 0,
    lateMinutes: attendance.lateMinutes || 0,
    overtimeMinutes: attendance.overtimeMinutes || 0
  };
};

/**
 * Compute attendance summary from live data
 * @param {Array} records - Attendance records
 * @returns {Object} Summary statistics
 */
export const computeSummaryFromLiveData = (records) => {
  if (!Array.isArray(records) || records.length === 0) {
    return {
      totalDays: 0,
      present: 0,
      halfDay: 0,
      absent: 0,
      leave: 0,
      holiday: 0,
      pending: 0,
      totalHours: 0,
      totalMinutes: 0,
      averageHours: 0
    };
  }
  
  let totalMinutes = 0;
  const counts = {
    present: 0,
    half_day: 0,
    absent: 0,
    leave: 0,
    holiday: 0,
    incomplete: 0
  };
  
  records.forEach(record => {
    if (record.status && counts.hasOwnProperty(record.status)) {
      counts[record.status]++;
    }
    
    if (record.totalWorkedMinutes) {
      totalMinutes += record.totalWorkedMinutes;
    }
  });
  
  const totalHours = Math.floor(totalMinutes / 60);
  const averageHours = records.length > 0 ? (totalMinutes / 60 / records.length).toFixed(2) : 0;
  
  return {
    totalDays: records.length,
    present: counts.present,
    halfDay: counts.half_day,
    absent: counts.absent,
    leave: counts.leave,
    holiday: counts.holiday,
    pending: counts.incomplete,
    totalHours,
    totalMinutes,
    averageHours: parseFloat(averageHours)
  };
};

/**
 * Get display status for UI (handles both LIVE and FINAL states)
 * @param {Object} attendance - Attendance record
 * @param {Object} employee - Employee object with shift info
 * @param {Date} now - Current time (default: now)
 * @returns {string} Display status
 */
export const getDisplayStatus = (attendance, employee, now = new Date()) => {
  if (!attendance) return 'not_started';
  
  const status = attendance.status;
  
  // If already final state, show it
  const finalStates = ['present', 'half_day', 'absent', 'leave', 'holiday', 'pending_correction'];
  if (finalStates.includes(status)) {
    return status;
  }
  
  // Handle LIVE states
  if (status === 'in_progress') {
    return 'working';
  }
  
  if (status === 'on_break') {
    return 'on_break';
  }
  
  if (status === 'completed') {
    return 'completed';
  }
  
  // Legacy support for old "incomplete" status
  if (status === 'incomplete') {
    if (hasShiftEnded(employee, now)) {
      return !attendance.clockOut ? 'missing_clockout' : 'pending_finalization';
    }
    return 'working';
  }
  
  return status;
};

/**
 * Check if shift has ended for an employee
 * @param {Object} employee - Employee object with shift info
 * @param {Date} now - Current time (default: now)
 * @returns {boolean} True if shift has ended
 */
export const hasShiftEnded = (employee, now = new Date()) => {
  if (!employee?.shift?.shiftEndTime) return false;
  
  try {
    const [hours, minutes, seconds] = employee.shift.shiftEndTime.split(':').map(Number);
    const shiftEnd = new Date(now);
    shiftEnd.setHours(hours, minutes, seconds || 0, 0);
    
    // Add 30-minute grace period
    shiftEnd.setMinutes(shiftEnd.getMinutes() + 30);
    
    return now >= shiftEnd;
  } catch (error) {
    console.error('Error checking shift end:', error);
    return false;
  }
};

/**
 * Get status badge color
 * @param {string} status - Attendance status
 * @returns {string} Tailwind color class
 */
export const getStatusColor = (status) => {
  const colorMap = {
    present: 'bg-green-100 text-green-800',
    half_day: 'bg-yellow-100 text-yellow-800',
    absent: 'bg-red-100 text-red-800',
    leave: 'bg-blue-100 text-blue-800',
    holiday: 'bg-purple-100 text-purple-800',
    pending_correction: 'bg-orange-100 text-orange-800',
    working: 'bg-green-100 text-green-800',
    on_break: 'bg-orange-100 text-orange-800',
    completed: 'bg-blue-100 text-blue-800',
    missing_clockout: 'bg-red-100 text-red-800',
    pending_finalization: 'bg-gray-100 text-gray-800',
    not_started: 'bg-gray-50 text-gray-600'
  };
  
  return colorMap[status] || 'bg-gray-100 text-gray-800';
};

/**
 * Format attendance record for display
 * @param {Object} record - Attendance record
 * @returns {Object} Formatted record
 */
export const formatAttendanceRecord = (record) => {
  if (!record) return null;
  
  return {
    ...record,
    clockInFormatted: formatTime(record.clockIn),
    clockOutFormatted: formatTime(record.clockOut),
    workHoursFormatted: formatDuration(record.totalWorkedMinutes),
    breakTimeFormatted: formatDuration(record.totalBreakMinutes),
    lateTimeFormatted: formatDuration(record.lateMinutes),
    overtimeFormatted: formatDuration(record.overtimeMinutes),
    displayStatus: getDisplayStatus(record),
    statusColor: getStatusColor(record.status)
  };
};

/**
 * Calculate attendance percentage
 * @param {number} presentDays - Number of present days
 * @param {number} totalDays - Total working days
 * @returns {number} Attendance percentage
 */
export const calculateAttendancePercentage = (presentDays, totalDays) => {
  if (totalDays === 0) return 0;
  return Math.round((presentDays / totalDays) * 100);
};

/**
 * Check if attendance is valid for payroll
 * @param {Object} attendance - Attendance record
 * @returns {boolean} True if valid for payroll
 */
export const isValidForPayroll = (attendance) => {
  if (!attendance) return false;
  
  const validStatuses = ['present', 'half_day', 'leave', 'holiday'];
  return validStatuses.includes(attendance.status);
};

export default {
  formatDuration,
  formatTime,
  getOvertimeMinutes,
  isInOvertime,
  getLocationInfo,
  getPerformanceIndicators,
  computeSummaryFromLiveData,
  getDisplayStatus,
  hasShiftEnded,
  getStatusColor,
  formatAttendanceRecord,
  calculateAttendancePercentage,
  isValidForPayroll
};
