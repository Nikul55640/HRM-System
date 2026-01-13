/**
 * Attendance Calculations Utility
 * Centralized business logic for attendance-related calculations
 * Keeps UI components clean and calculations consistent
 */

/**
 * Safe time parsing that works across browsers and timezones
 * @param {string} timeString - Time in HH:MM format
 * @param {Date} baseDate - Base date to use (defaults to today)
 * @returns {Date} Parsed date object
 */
export const parseTime = (timeString, baseDate = new Date()) => {
  if (!timeString) return null;
  
  try {
    const [hours, minutes] = timeString.split(':').map(Number);
    const date = new Date(baseDate);
    date.setHours(hours, minutes, 0, 0);
    return date;
  } catch (error) {
    console.warn('Failed to parse time:', timeString, error);
    return null;
  }
};

/**
 * Calculate if an employee is currently in overtime
 * @param {Object} employee - Employee data with shift information
 * @param {Date} currentTime - Current time (defaults to now)
 * @returns {boolean} True if in overtime
 */
export const isInOvertime = (employee, currentTime = new Date()) => {
  if (!employee.shift?.shiftEndTime) return false;
  
  const today = new Date(currentTime);
  today.setHours(0, 0, 0, 0);
  
  const shiftEndTime = parseTime(employee.shift.shiftEndTime, today);
  if (!shiftEndTime) return false;
  
  return currentTime > shiftEndTime;
};

/**
 * Calculate overtime minutes for an employee
 * @param {Object} employee - Employee data with shift information
 * @param {Date} currentTime - Current time (defaults to now)
 * @returns {number} Overtime minutes (0 if not in overtime)
 */
export const getOvertimeMinutes = (employee, currentTime = new Date()) => {
  if (!isInOvertime(employee, currentTime)) return 0;
  
  const today = new Date(currentTime);
  today.setHours(0, 0, 0, 0);
  
  const shiftEndTime = parseTime(employee.shift.shiftEndTime, today);
  if (!shiftEndTime) return 0;
  
  return Math.floor((currentTime - shiftEndTime) / (1000 * 60));
};

/**
 * Calculate if an employee is late based on shift start time
 * @param {Object} employee - Employee data with shift and clock-in information
 * @returns {Object} { isLate: boolean, lateMinutes: number }
 */
export const calculateLateStatus = (employee) => {
  if (!employee.shift?.shiftStartTime || !employee.currentSession?.checkInTime) {
    return { isLate: false, lateMinutes: 0 };
  }
  
  const checkInTime = new Date(employee.currentSession.checkInTime);
  const today = new Date(checkInTime);
  today.setHours(0, 0, 0, 0);
  
  const shiftStartTime = parseTime(employee.shift.shiftStartTime, today);
  if (!shiftStartTime) return { isLate: false, lateMinutes: 0 };
  
  if (checkInTime > shiftStartTime) {
    const lateMinutes = Math.floor((checkInTime - shiftStartTime) / (1000 * 60));
    return { isLate: true, lateMinutes };
  }
  
  return { isLate: false, lateMinutes: 0 };
};

/**
 * Calculate expected work hours for a shift
 * @param {Object} shift - Shift data with start and end times
 * @returns {number} Expected work hours
 */
export const getExpectedWorkHours = (shift) => {
  if (!shift?.shiftStartTime || !shift?.shiftEndTime) return 8; // Default 8 hours
  
  const baseDate = new Date();
  baseDate.setHours(0, 0, 0, 0);
  
  const startTime = parseTime(shift.shiftStartTime, baseDate);
  const endTime = parseTime(shift.shiftEndTime, baseDate);
  
  if (!startTime || !endTime) return 8;
  
  // Handle overnight shifts
  if (endTime < startTime) {
    endTime.setDate(endTime.getDate() + 1);
  }
  
  return (endTime - startTime) / (1000 * 60 * 60);
};

/**
 * Compute summary statistics from live attendance data
 * @param {Array} liveData - Array of employee attendance data
 * @param {Date} currentTime - Current time for calculations
 * @returns {Object} Summary statistics
 */
export const computeSummaryFromLiveData = (liveData, currentTime = new Date()) => {
  if (!Array.isArray(liveData)) return {
    totalActive: 0,
    working: 0,
    onBreak: 0,
    late: 0,
    overtime: 0,
    incomplete: 0
  };
  
  return {
    totalActive: liveData.length,
    working: liveData.filter(e => e.currentSession?.status === 'active').length,
    onBreak: liveData.filter(e => e.currentSession?.status === 'on_break').length,
    late: liveData.filter(e => e.isLate || e.currentSession?.isLate).length,
    overtime: liveData.filter(e => isInOvertime(e, currentTime)).length,
    incomplete: liveData.filter(e => e.status === 'incomplete').length
  };
};

/**
 * Format duration in minutes to human-readable format
 * @param {number} minutes - Duration in minutes
 * @returns {string} Formatted duration (e.g., "2h 30m", "45m")
 */
export const formatDuration = (minutes) => {
  if (!minutes || minutes < 0) return '0m';
  
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  
  if (hours === 0) return `${remainingMinutes}m`;
  if (remainingMinutes === 0) return `${hours}h`;
  return `${hours}h ${remainingMinutes}m`;
};

/**
 * Format time to display format
 * @param {string|Date} dateTime - Date/time to format
 * @returns {string} Formatted time (e.g., "09:30 AM")
 */
export const formatTime = (dateTime) => {
  if (!dateTime) return '--';
  
  try {
    const date = new Date(dateTime);
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  } catch (error) {
    console.warn('Failed to format time:', dateTime, error);
    return '--';
  }
};

/**
 * Check if employee has good performance indicators
 * @param {Object} employee - Employee data
 * @returns {Object} Performance indicators
 */
export const getPerformanceIndicators = (employee) => {
  const indicators = {
    onTime: !employee.isLate && !employee.currentSession?.isLate,
    productive: employee.currentSession?.status !== 'on_break',
    consistent: true, // Could be enhanced with historical data
    overtime: isInOvertime(employee)
  };
  
  return indicators;
};

/**
 * Get location display information
 * @param {string} location - Location code
 * @returns {Object} Location display info with icon and label
 */
export const getLocationInfo = (location) => {
  const locationMap = {
    office: { label: 'Office', icon: 'Building2', color: 'blue' },
    wfh: { label: 'Work From Home', icon: 'Home', color: 'green' },
    client_site: { label: 'Client Site', icon: 'Users', color: 'purple' },
    remote: { label: 'Remote', icon: 'MapPin', color: 'orange' }
  };
  
  return locationMap[location] || { 
    label: location || 'Unknown', 
    icon: 'MapPin', 
    color: 'gray' 
  };
};