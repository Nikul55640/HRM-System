/**
 * Date Utility Functions
 * 
 * ⚠️ CRITICAL: Always use these functions for date handling in attendance system
 * to avoid timezone bugs that can cause records to be logged on wrong dates.
 */

/**
 * Get today's date in YYYY-MM-DD format using LOCAL timezone
 * 
 * ✅ SAFE: Uses local timezone, not UTC
 * ❌ DON'T USE: new Date().toISOString().split('T')[0] - uses UTC!
 * 
 * @returns {string} Date in YYYY-MM-DD format (e.g., "2026-01-16")
 * 
 * @example
 * const today = getLocalDateString();
 * // Returns: "2026-01-16" (in your local timezone)
 */
export const getLocalDateString = (date = new Date()) => {
  const d = new Date(date);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

/**
 * Alternative using toLocaleDateString (also safe)
 * 
 * @param {Date} date - Date object to convert
 * @returns {string} Date in YYYY-MM-DD format
 */
export const getLocalDateStringAlt = (date = new Date()) => {
  return new Date(date).toLocaleDateString('en-CA'); // en-CA gives YYYY-MM-DD format
};

/**
 * Get date string from a Date object, handling timezone correctly
 * 
 * @param {Date|string} date - Date to convert
 * @returns {string} Date in YYYY-MM-DD format
 */
export const toDateString = (date) => {
  if (!date) return null;
  if (typeof date === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(date)) {
    return date; // Already in correct format
  }
  return getLocalDateString(new Date(date));
};

/**
 * Get start of day in local timezone
 * 
 * @param {Date|string} date - Date to get start of day for
 * @returns {Date} Date object set to 00:00:00 local time
 */
export const getStartOfDay = (date = new Date()) => {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
};

/**
 * Get end of day in local timezone
 * 
 * @param {Date|string} date - Date to get end of day for
 * @returns {Date} Date object set to 23:59:59 local time
 */
export const getEndOfDay = (date = new Date()) => {
  const d = new Date(date);
  d.setHours(23, 59, 59, 999);
  return d;
};

/**
 * Check if two dates are the same day (ignoring time)
 * 
 * @param {Date|string} date1 - First date
 * @param {Date|string} date2 - Second date
 * @returns {boolean} True if same day
 */
export const isSameDay = (date1, date2) => {
  return getLocalDateString(date1) === getLocalDateString(date2);
};

/**
 * Add days to a date
 * 
 * @param {Date|string} date - Starting date
 * @param {number} days - Number of days to add (can be negative)
 * @returns {Date} New date object
 */
export const addDays = (date, days) => {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
};

/**
 * Get date range as array of date strings
 * 
 * @param {Date|string} startDate - Start date
 * @param {Date|string} endDate - End date
 * @returns {string[]} Array of date strings in YYYY-MM-DD format
 */
export const getDateRange = (startDate, endDate) => {
  const dates = [];
  let currentDate = new Date(startDate);
  const end = new Date(endDate);
  
  while (currentDate <= end) {
    dates.push(getLocalDateString(currentDate));
    currentDate = addDays(currentDate, 1);
  }
  
  return dates;
};

/**
 * Format date for display
 * 
 * @param {Date|string} date - Date to format
 * @param {string} locale - Locale for formatting (default: 'en-IN')
 * @returns {string} Formatted date string
 */
export const formatDateForDisplay = (date, locale = 'en-IN') => {
  if (!date) return '';
  return new Date(date).toLocaleDateString(locale, {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
};

/**
 * Parse date string safely
 * 
 * @param {string} dateString - Date string in YYYY-MM-DD format
 * @returns {Date} Date object at start of day in local timezone
 */
export const parseDateString = (dateString) => {
  if (!dateString) return null;
  const [year, month, day] = dateString.split('-').map(Number);
  return new Date(year, month - 1, day);
};

/**
 * Get current timestamp for database
 * 
 * @returns {Date} Current date/time
 */
export const now = () => new Date();

/**
 * ⚠️ TIMEZONE BUG EXAMPLE (for documentation)
 * 
 * DON'T DO THIS:
 * ```javascript
 * // ❌ WRONG - Uses UTC timezone
 * const today = new Date().toISOString().split('T')[0];
 * 
 * // Problem: If local time is 2026-01-16 00:30 IST
 * // UTC time is 2026-01-15 19:00
 * // Result: "2026-01-15" ❌ WRONG DAY!
 * ```
 * 
 * DO THIS INSTEAD:
 * ```javascript
 * // ✅ CORRECT - Uses local timezone
 * const today = getLocalDateString();
 * // Result: "2026-01-16" ✅ CORRECT!
 * ```
 */

export default {
  getLocalDateString,
  getLocalDateStringAlt,
  toDateString,
  getStartOfDay,
  getEndOfDay,
  isSameDay,
  addDays,
  getDateRange,
  formatDateForDisplay,
  parseDateString,
  now
};
