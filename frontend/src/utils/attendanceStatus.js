/**
 * Attendance Status Utility
 * Centralized status handling for shift-aware attendance system
 * 
 * IMPORTANT: Frontend should NEVER assume fixed times (like 6 PM)
 * Backend finalizes attendance based on each employee's shift end time
 */

/**
 * Get status display configuration
 * @param {string} status - Attendance status from backend
 * @returns {Object} Display configuration with label, color, and badge style
 */
export const getStatusConfig = (status) => {
  const statusMap = {
    present: {
      label: 'Present',
      color: 'green',
      bgClass: 'bg-green-100',
      textClass: 'text-green-700',
      borderClass: 'border-green-200',
      description: 'Full day completed'
    },
    half_day: {
      label: 'Half Day',
      color: 'yellow',
      bgClass: 'bg-yellow-100',
      textClass: 'text-yellow-700',
      borderClass: 'border-yellow-200',
      description: 'Half shift completed'
    },
    leave: {
      label: 'Leave',
      color: 'red',
      bgClass: 'bg-red-100',
      textClass: 'text-red-700',
      borderClass: 'border-red-200',
      description: 'Marked as leave'
    },
    incomplete: {
      label: 'Pending',
      color: 'gray',
      bgClass: 'bg-gray-100',
      textClass: 'text-gray-600',
      borderClass: 'border-gray-200',
      description: 'Shift not finished / awaiting finalization'
    },
    holiday: {
      label: 'Holiday',
      color: 'blue',
      bgClass: 'bg-blue-100',
      textClass: 'text-blue-700',
      borderClass: 'border-blue-200',
      description: 'Public holiday'
    },
    pending_correction: {
      label: 'Pending Correction',
      color: 'orange',
      bgClass: 'bg-orange-100',
      textClass: 'text-orange-700',
      borderClass: 'border-orange-200',
      description: 'Correction request pending'
    },
    not_started: {
      label: 'Not Started',
      color: 'gray',
      bgClass: 'bg-gray-50',
      textClass: 'text-gray-500',
      borderClass: 'border-gray-100',
      description: 'No attendance record yet'
    }
  };

  return statusMap[status] || statusMap.incomplete;
};

/**
 * Check if status is finalized (not pending)
 * @param {string} status - Attendance status
 * @returns {boolean} True if finalized
 */
export const isFinalized = (status) => {
  return status !== 'incomplete' && status !== 'not_started';
};

/**
 * Check if status allows clock-in
 * @param {string} status - Attendance status
 * @param {boolean} hasClockIn - Whether employee has clocked in
 * @returns {boolean} True if clock-in is allowed
 */
export const canClockIn = (status, hasClockIn) => {
  if (hasClockIn) return false;
  return status === 'not_started' || status === 'incomplete';
};

/**
 * Check if status allows clock-out
 * @param {string} status - Attendance status
 * @param {boolean} hasClockIn - Whether employee has clocked in
 * @param {boolean} hasClockOut - Whether employee has clocked out
 * @returns {boolean} True if clock-out is allowed
 */
export const canClockOut = (status, hasClockIn, hasClockOut) => {
  if (!hasClockIn || hasClockOut) return false;
  return status === 'incomplete';
};

/**
 * Get status message for employee
 * @param {Object} statusData - Status data from backend
 * @returns {string} Human-readable status message
 */
export const getStatusMessage = (statusData) => {
  const { status, statusReason, finalized, shiftFinished } = statusData;

  if (finalized) {
    return statusReason || getStatusConfig(status).description;
  }

  if (!shiftFinished) {
    return 'Your shift is still in progress. Attendance will be finalized after shift ends.';
  }

  return 'Attendance finalization in progress...';
};

/**
 * Get dashboard count label (replaces "absent" with "leave")
 * @param {string} key - Count key
 * @returns {string} Display label
 */
export const getCountLabel = (key) => {
  const labels = {
    present: 'Present',
    halfDay: 'Half Day',
    leave: 'Leave', // ✅ No more "absent"
    incomplete: 'Pending',
    holiday: 'Holiday',
    total: 'Total Days'
  };

  return labels[key] || key;
};

/**
 * Filter attendance records by status
 * @param {Array} records - Attendance records
 * @param {string} status - Status to filter by
 * @returns {Array} Filtered records
 */
export const filterByStatus = (records, status) => {
  if (!Array.isArray(records)) return [];
  return records.filter(r => r.status === status);
};

/**
 * Get summary counts from records
 * @param {Array} records - Attendance records
 * @returns {Object} Summary counts
 */
export const getSummaryCounts = (records) => {
  if (!Array.isArray(records)) {
    return {
      total: 0,
      present: 0,
      halfDay: 0,
      leave: 0,
      incomplete: 0,
      holiday: 0
    };
  }

  return {
    total: records.length,
    present: filterByStatus(records, 'present').length,
    halfDay: filterByStatus(records, 'half_day').length,
    leave: filterByStatus(records, 'leave').length,
    incomplete: filterByStatus(records, 'incomplete').length,
    holiday: filterByStatus(records, 'holiday').length
  };
};

/**
 * Check if employee should see correction request option
 * @param {string} status - Attendance status
 * @returns {boolean} True if correction is applicable
 */
export const canRequestCorrection = (status) => {
  // Can request correction for leave or finalized records
  return ['leave', 'half_day', 'present'].includes(status);
};

export default {
  getStatusConfig,
  isFinalized,
  canClockIn,
  canClockOut,
  getStatusMessage,
  getCountLabel,
  filterByStatus,
  getSummaryCounts,
  canRequestCorrection
};
