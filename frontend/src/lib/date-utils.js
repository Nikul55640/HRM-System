import { format, parseISO, isValid } from 'date-fns';

/**
 * Format a date to YYYY-MM-DD string format
 * @param {Date|string} date - Date object or ISO string
 * @returns {string} Formatted date string (YYYY-MM-DD)
 */
export const formatDate = (date) => {
  if (!date) return '';
  
  try {
    // If it's already a string in the correct format, return it
    if (typeof date === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(date)) {
      return date;
    }
    
    // If it's a Date object, format it
    if (date instanceof Date && isValid(date)) {
      return format(date, 'yyyy-MM-dd');
    }
    
    // If it's an ISO string, parse and format it
    if (typeof date === 'string') {
      const parsedDate = parseISO(date);
      if (isValid(parsedDate)) {
        return format(parsedDate, 'yyyy-MM-dd');
      }
    }
    
    return '';
  } catch (error) {
    console.error('Error formatting date:', error);
    return '';
  }
};

/**
 * Format a date to display format (e.g., "Jan 15, 2024")
 * @param {Date|string} date - Date object or ISO string
 * @returns {string} Formatted date string for display
 */
export const formatDisplayDate = (date) => {
  if (!date) return '';
  
  try {
    let dateObj = date;
    
    if (typeof date === 'string') {
      dateObj = parseISO(date);
    }
    
    if (dateObj instanceof Date && isValid(dateObj)) {
      return format(dateObj, 'MMM dd, yyyy');
    }
    
    return '';
  } catch (error) {
    console.error('Error formatting display date:', error);
    return '';
  }
};

/**
 * Format a date and time to display format
 * @param {Date|string} date - Date object or ISO string
 * @returns {string} Formatted date and time string
 */
export const formatDateTime = (date) => {
  if (!date) return '';
  
  try {
    let dateObj = date;
    
    if (typeof date === 'string') {
      dateObj = parseISO(date);
    }
    
    if (dateObj instanceof Date && isValid(dateObj)) {
      return format(dateObj, 'MMM dd, yyyy HH:mm');
    }
    
    return '';
  } catch (error) {
    console.error('Error formatting date time:', error);
    return '';
  }
};

/**
 * Format time to HH:mm format
 * @param {Date|string} time - Date object or time string
 * @returns {string} Formatted time string (HH:mm)
 */
export const formatTime = (time) => {
  if (!time) return '';
  
  try {
    let timeObj = time;
    
    if (typeof time === 'string') {
      // If it's already in HH:mm format, return it
      if (/^\d{2}:\d{2}$/.test(time)) {
        return time;
      }
      // If it's an ISO string, parse it
      timeObj = parseISO(time);
    }
    
    if (timeObj instanceof Date && isValid(timeObj)) {
      return format(timeObj, 'HH:mm');
    }
    
    return '';
  } catch (error) {
    console.error('Error formatting time:', error);
    return '';
  }
};

/**
 * Get current date in YYYY-MM-DD format
 * @returns {string} Current date string
 */
export const getCurrentDate = () => {
  return format(new Date(), 'yyyy-MM-dd');
};

/**
 * Get current time in HH:mm format
 * @returns {string} Current time string
 */
export const getCurrentTime = () => {
  return format(new Date(), 'HH:mm');
};

/**
 * Check if a date is today
 * @param {Date|string} date - Date to check
 * @returns {boolean} True if date is today
 */
export const isToday = (date) => {
  if (!date) return false;
  
  try {
    let dateObj = date;
    
    if (typeof date === 'string') {
      dateObj = parseISO(date);
    }
    
    if (dateObj instanceof Date && isValid(dateObj)) {
      const today = new Date();
      return format(dateObj, 'yyyy-MM-dd') === format(today, 'yyyy-MM-dd');
    }
    
    return false;
  } catch (error) {
    console.error('Error checking if date is today:', error);
    return false;
  }
};