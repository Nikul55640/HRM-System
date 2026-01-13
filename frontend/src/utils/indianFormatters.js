/**
 * Indian Formatting Utilities
 * Provides Indian-specific formatting for numbers, currency, and time
 */

/**
 * Format time duration from minutes to Indian format (hours and minutes)
 * @param {number} minutes - Total minutes
 * @returns {string} Formatted time string (e.g., "1hr 12 minutes", "45 minutes")
 */
export const formatIndianTime = (minutes) => {
  if (!minutes || minutes === 0) return '0 minutes';
  
  const totalMinutes = Number(minutes) || 0;
  const hours = Math.floor(totalMinutes / 60);
  const remainingMinutes = totalMinutes % 60;
  
  if (hours > 0) {
    if (remainingMinutes > 0) {
      return `${hours}hr ${remainingMinutes} minute${remainingMinutes !== 1 ? 's' : ''}`;
    }
    return `${hours}hr`;
  }
  
  return `${remainingMinutes} minute${remainingMinutes !== 1 ? 's' : ''}`;
};

/**
 * Format numbers in Indian numbering system (lakhs, crores)
 * @param {number} number - Number to format
 * @param {object} options - Formatting options
 * @returns {string} Formatted number string
 */
export const formatIndianNumber = (number, options = {}) => {
  if (!number && number !== 0) return 'N/A';
  
  const {
    minimumFractionDigits = 0,
    maximumFractionDigits = 2,
    showFullNumber = false
  } = options;
  
  const num = Number(number);
  
  if (showFullNumber || num < 1000) {
    return new Intl.NumberFormat('en-IN', {
      minimumFractionDigits,
      maximumFractionDigits
    }).format(num);
  }
  
  // Indian numbering system
  if (num >= 10000000) { // 1 crore
    const crores = num / 10000000;
    return `${crores.toFixed(crores >= 100 ? 0 : 1)} crore${crores !== 1 ? 's' : ''}`;
  } else if (num >= 100000) { // 1 lakh
    const lakhs = num / 100000;
    return `${lakhs.toFixed(lakhs >= 100 ? 0 : 1)} lakh${lakhs !== 1 ? 's' : ''}`;
  } else if (num >= 1000) { // 1 thousand
    const thousands = num / 1000;
    return `${thousands.toFixed(thousands >= 100 ? 0 : 1)}K`;
  }
  
  return new Intl.NumberFormat('en-IN', {
    minimumFractionDigits,
    maximumFractionDigits
  }).format(num);
};

/**
 * Format currency in Indian Rupees
 * @param {number} amount - Amount to format
 * @param {object} options - Formatting options
 * @returns {string} Formatted currency string
 */
export const formatIndianCurrency = (amount, options = {}) => {
  if (!amount && amount !== 0) return '₹0';
  
  const {
    showSymbol = true,
    showFullAmount = false,
    minimumFractionDigits = 0,
    maximumFractionDigits = 2
  } = options;
  
  const num = Number(amount);
  const symbol = showSymbol ? '₹' : '';
  
  if (showFullAmount || num < 1000) {
    return `${symbol}${new Intl.NumberFormat('en-IN', {
      minimumFractionDigits,
      maximumFractionDigits
    }).format(num)}`;
  }
  
  // Indian currency formatting with crores and lakhs
  if (num >= 10000000) { // 1 crore
    const crores = num / 10000000;
    return `${symbol}${crores.toFixed(crores >= 100 ? 0 : 1)} crore${crores !== 1 ? 's' : ''}`;
  } else if (num >= 100000) { // 1 lakh
    const lakhs = num / 100000;
    return `${symbol}${lakhs.toFixed(lakhs >= 100 ? 0 : 1)} lakh${lakhs !== 1 ? 's' : ''}`;
  } else if (num >= 1000) { // 1 thousand
    const thousands = num / 1000;
    return `${symbol}${thousands.toFixed(thousands >= 100 ? 0 : 1)}K`;
  }
  
  return `${symbol}${new Intl.NumberFormat('en-IN', {
    minimumFractionDigits,
    maximumFractionDigits
  }).format(num)}`;
};

/**
 * Format time in Indian 12-hour format
 * @param {string|Date} timeString - Time string or Date object
 * @returns {string} Formatted time string
 */
export const formatIndianTimeString = (timeString) => {
  if (!timeString) return '--:--';
  
  try {
    return new Date(timeString).toLocaleTimeString('en-IN', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  } catch (error) {
    return '--:--';
  }
};

/**
 * Format date in Indian format
 * @param {string|Date} dateString - Date string or Date object
 * @returns {string} Formatted date string
 */
export const formatIndianDate = (dateString) => {
  if (!dateString) return '--';
  
  try {
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  } catch (error) {
    return '--';
  }
};

/**
 * Format date and time in Indian format
 * @param {string|Date} dateTimeString - DateTime string or Date object
 * @returns {string} Formatted date and time string
 */
export const formatIndianDateTime = (dateTimeString) => {
  if (!dateTimeString) return '--';
  
  try {
    return new Date(dateTimeString).toLocaleString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  } catch (error) {
    return '--';
  }
};

/**
 * Format work hours with overtime indication
 * @param {number} totalMinutes - Total worked minutes
 * @param {number} standardMinutes - Standard work minutes (default 480 = 8 hours)
 * @returns {object} Formatted work time with overtime info
 */
export const formatWorkHours = (totalMinutes, standardMinutes = 480) => {
  const total = Number(totalMinutes) || 0;
  const standard = Number(standardMinutes) || 480;
  
  const totalFormatted = formatIndianTime(total);
  const isOvertime = total > standard;
  const overtimeMinutes = isOvertime ? total - standard : 0;
  const overtimeFormatted = overtimeMinutes > 0 ? formatIndianTime(overtimeMinutes) : null;
  
  return {
    total: totalFormatted,
    isOvertime,
    overtime: overtimeFormatted,
    standard: formatIndianTime(standard)
  };
};

/**
 * Format percentage in Indian format
 * @param {number} value - Percentage value
 * @param {number} decimals - Number of decimal places
 * @returns {string} Formatted percentage string
 */
export const formatIndianPercentage = (value, decimals = 1) => {
  if (!value && value !== 0) return '0%';
  
  const num = Number(value);
  return `${num.toFixed(decimals)}%`;
};

/**
 * Format file size in Indian format
 * @param {number} bytes - File size in bytes
 * @returns {string} Formatted file size string
 */
export const formatIndianFileSize = (bytes) => {
  if (!bytes || bytes === 0) return '0 B';
  
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  const size = bytes / Math.pow(1024, i);
  
  return `${size.toFixed(i === 0 ? 0 : 1)} ${sizes[i]}`;
};

// Export all formatters as a single object for easy importing
export const IndianFormatters = {
  time: formatIndianTime,
  number: formatIndianNumber,
  currency: formatIndianCurrency,
  timeString: formatIndianTimeString,
  date: formatIndianDate,
  dateTime: formatIndianDateTime,
  workHours: formatWorkHours,
  percentage: formatIndianPercentage,
  fileSize: formatIndianFileSize
};

export default IndianFormatters;