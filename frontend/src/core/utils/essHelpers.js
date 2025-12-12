/**
 * Employee Self-Service Helper Functions
 * Utility functions for ESS features
 */

/**
 * Mask bank account number
 * Shows only last 4 digits
 * @param {string} accountNumber - Full account number
 * @returns {string} Masked account number
 */
export const maskAccountNumber = (accountNumber) => {
  if (!accountNumber || accountNumber.length < 4) {
    return '****';
  }
  const lastFour = accountNumber.slice(-4);
  return `****${lastFour}`;
};

/**
 * Validate file type for document upload
 * @param {File} file - File to validate
 * @param {string[]} allowedTypes - Allowed file extensions
 * @returns {boolean} True if valid
 */
export const validateFileType = (file, allowedTypes = ['pdf', 'jpg', 'jpeg', 'png']) => {
  if (!file || !file.name) return false;
  const extension = file.name.split('.').pop().toLowerCase();
  return allowedTypes.includes(extension);
};

/**
 * Validate file size
 * @param {File} file - File to validate
 * @param {number} maxSizeMB - Maximum size in MB
 * @returns {boolean} True if valid
 */
export const validateFileSize = (file, maxSizeMB = 5) => {
  if (!file) return false;
  const maxSizeBytes = maxSizeMB * 1024 * 1024;
  return file.size <= maxSizeBytes;
};

/**
 * Calculate leave balance
 * @param {number} allocated - Allocated leave days
 * @param {number} used - Used leave days
 * @param {number} pending - Pending leave days
 * @returns {number} Available leave days
 */
export const calculateLeaveBalance = (allocated, used, pending) => {
  return allocated - (used + pending);
};

/**
 * Calculate work hours from check-in and check-out times
 * @param {Date|string} checkIn - Check-in time
 * @param {Date|string} checkOut - Check-out time
 * @returns {number} Work hours
 */
export const calculateWorkHours = (checkIn, checkOut) => {
  if (!checkIn || !checkOut) return 0;
  
  const checkInTime = new Date(checkIn);
  const checkOutTime = new Date(checkOut);
  
  const diffMs = checkOutTime - checkInTime;
  const diffHours = diffMs / (1000 * 60 * 60);
  
  return Math.max(0, Math.round(diffHours * 100) / 100);
};

/**
 * Format currency
 * @param {number} amount - Amount to format
 * @param {string} currency - Currency code
 * @returns {string} Formatted currency string
 */
export const formatCurrency = (amount, currency = 'USD') => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
  }).format(amount);
};

/**
 * Format date
 * @param {Date|string} date - Date to format
 * @param {string} format - Format type ('short', 'long', 'medium')
 * @returns {string} Formatted date string
 */
export const formatDate = (date, format = 'medium') => {
  if (!date) return '';
  
  const dateObj = new Date(date);
  
  const options = {
    short: { year: 'numeric', month: '2-digit', day: '2-digit' },
    medium: { year: 'numeric', month: 'short', day: 'numeric' },
    long: { year: 'numeric', month: 'long', day: 'numeric', weekday: 'long' },
  };
  
  return new Intl.DateTimeFormat('en-US', options[format] || options.medium).format(dateObj);
};

/**
 * Get status badge color
 * @param {string} status - Status value
 * @returns {string} Tailwind color class
 */
export const getStatusBadgeColor = (status) => {
  const colors = {
    pending: 'bg-yellow-100 text-yellow-800',
    approved: 'bg-green-100 text-green-800',
    rejected: 'bg-red-100 text-red-800',
    cancelled: 'bg-gray-100 text-gray-800',
    draft: 'bg-blue-100 text-blue-800',
    published: 'bg-green-100 text-green-800',
    verified: 'bg-green-100 text-green-800',
    present: 'bg-green-100 text-green-800',
    absent: 'bg-red-100 text-red-800',
    half_day: 'bg-yellow-100 text-yellow-800',
    leave: 'bg-blue-100 text-blue-800',
    holiday: 'bg-purple-100 text-purple-800',
  };
  
  return colors[status?.toLowerCase()] || 'bg-gray-100 text-gray-800';
};

/**
 * Get status badge variant for shadcn/ui Badge component
 * @param {string} status - Status value
 * @returns {string} Badge variant
 */
export const getStatusBadgeVariant = (status) => {
  const variants = {
    pending: 'secondary',
    approved: 'default',
    rejected: 'destructive',
    cancelled: 'outline',
    draft: 'secondary',
    published: 'default',
    verified: 'default',
  };
  
  return variants[status?.toLowerCase()] || 'secondary';
};

/**
 * Download blob as file
 * @param {Blob} blob - Blob data
 * @param {string} filename - File name
 */
export const downloadBlob = (blob, filename) => {
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.URL.revokeObjectURL(url);
};

/**
 * Validate email format
 * @param {string} email - Email to validate
 * @returns {boolean} True if valid
 */
export const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Validate phone number format
 * @param {string} phone - Phone number to validate
 * @returns {boolean} True if valid
 */
export const validatePhone = (phone) => {
  const phoneRegex = /^[\d\s\-\+\(\)]+$/;
  return phoneRegex.test(phone) && phone.replace(/\D/g, '').length >= 10;
};

/**
 * Validate IFSC code format (Indian banking)
 * @param {string} ifsc - IFSC code to validate
 * @returns {boolean} True if valid
 */
export const validateIFSC = (ifsc) => {
  const ifscRegex = /^[A-Z]{4}0[A-Z0-9]{6}$/;
  return ifscRegex.test(ifsc);
};

/**
 * Calculate repayment schedule
 * @param {number} amount - Loan amount
 * @param {number} months - Number of months
 * @returns {number} Monthly deduction
 */
export const calculateMonthlyDeduction = (amount, months) => {
  if (!amount || !months || months <= 0) return 0;
  return Math.round((amount / months) * 100) / 100;
};

/**
 * Get month name from number
 * @param {number} month - Month number (1-12)
 * @returns {string} Month name
 */
export const getMonthName = (month) => {
  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];
  return months[month - 1] || '';
};

/**
 * Get current financial year
 * @returns {string} Financial year (e.g., "2024-2025")
 */
export const getCurrentFinancialYear = () => {
  const today = new Date();
  const currentYear = today.getFullYear();
  const currentMonth = today.getMonth() + 1;
  
  // Financial year starts in April
  if (currentMonth >= 4) {
    return `${currentYear}-${currentYear + 1}`;
  }
  return `${currentYear - 1}-${currentYear}`;
};

/**
 * Check if date is late (after 9:30 AM)
 * @param {Date|string} checkInTime - Check-in time
 * @returns {boolean} True if late
 */
export const isLateArrival = (checkInTime) => {
  if (!checkInTime) return false;
  
  const time = new Date(checkInTime);
  const hours = time.getHours();
  const minutes = time.getMinutes();
  
  // Late if after 9:30 AM
  return hours > 9 || (hours === 9 && minutes > 30);
};

/**
 * Check if date is early departure (before 6:00 PM)
 * @param {Date|string} checkOutTime - Check-out time
 * @returns {boolean} True if early departure
 */
export const isEarlyDeparture = (checkOutTime) => {
  if (!checkOutTime) return false;
  
  const time = new Date(checkOutTime);
  const hours = time.getHours();
  
  // Early if before 6:00 PM
  return hours < 18;
};

/**
 * Group items by key
 * @param {Array} items - Items to group
 * @param {string} key - Key to group by
 * @returns {Object} Grouped items
 */
export const groupBy = (items, key) => {
  return items.reduce((result, item) => {
    const groupKey = item[key];
    if (!result[groupKey]) {
      result[groupKey] = [];
    }
    result[groupKey].push(item);
    return result;
  }, {});
};
