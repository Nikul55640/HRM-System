/**
 * Day utilities for working rules and calendar operations
 */

export const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

/**
 * Format array of day indices to readable day names
 * @param {number[]} daysArray - Array of day indices (0=Sunday, 6=Saturday)
 * @returns {string} Comma-separated day names
 */
export const formatDays = (daysArray) => {
  if (!Array.isArray(daysArray)) return '';
  return daysArray.map(d => dayNames[d] || 'Invalid').join(', ');
};

/**
 * Convert day names back to indices
 * @param {string[]} dayNameArray - Array of day names
 * @returns {number[]} Array of day indices
 */
export const parseDayNames = (dayNameArray) => {
  if (!Array.isArray(dayNameArray)) return [];
  return dayNameArray.map(name => dayNames.indexOf(name)).filter(index => index !== -1);
};

/**
 * Validate working days array
 * @param {number[]} workingDays - Array of day indices
 * @returns {boolean} True if valid
 */
export const validateWorkingDays = (workingDays) => {
  if (!Array.isArray(workingDays)) return false;
  return workingDays.every(day => day >= 0 && day <= 6);
};