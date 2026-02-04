/**
 * Utility to extract user-friendly error messages from API responses
 * Prevents technical error messages like "Request failed with status code 401" from being shown to users
 */

/**
 * Extract a user-friendly error message from an error object
 * @param {Error} error - The error object from API call
 * @param {string} fallbackMessage - Default message if no user-friendly message found
 * @returns {string} User-friendly error message
 */
export const extractErrorMessage = (error, fallbackMessage = 'An error occurred') => {
  // If error.message contains technical terms, don't use it
  if (error.message && !containsTechnicalTerms(error.message)) {
    return error.message;
  }
  
  // Try to get message from response data
  if (error.response?.data?.error?.message) {
    return error.response.data.error.message;
  }
  
  if (error.response?.data?.message) {
    return error.response.data.message;
  }
  
  // Handle specific HTTP status codes with user-friendly messages
  if (error.response?.status) {
    return getStatusCodeMessage(error.response.status, fallbackMessage);
  }
  
  // Handle network errors
  if (error.message?.includes('Network Error') || error.message?.includes('timeout')) {
    return 'Network error. Please check your connection.';
  }
  
  return fallbackMessage;
};

/**
 * Check if error message contains technical terms that shouldn't be shown to users
 * @param {string} message - Error message to check
 * @returns {boolean} True if message contains technical terms
 */
const containsTechnicalTerms = (message) => {
  const technicalTerms = [
    'status code',
    'Request failed',
    'AxiosError',
    'XMLHttpRequest',
    'ECONNABORTED',
    'ENOTFOUND',
    'ECONNREFUSED',
    'ERR_NETWORK',
    'ERR_BAD_RESPONSE'
  ];
  
  return technicalTerms.some(term => 
    message.toLowerCase().includes(term.toLowerCase())
  );
};

/**
 * Get user-friendly message for HTTP status codes
 * @param {number} status - HTTP status code
 * @param {string} fallback - Fallback message
 * @returns {string} User-friendly message
 */
const getStatusCodeMessage = (status, fallback) => {
  switch (status) {
    case 400:
      return 'Invalid request. Please check your input.';
    case 401:
      return 'Authentication failed. Please log in again.';
    case 403:
      return 'You do not have permission to perform this action.';
    case 404:
      return 'The requested resource was not found.';
    case 409:
      return 'This action conflicts with existing data.';
    case 422:
      return 'Please check your input and try again.';
    case 429:
      return 'Too many requests. Please try again later.';
    case 500:
      return 'Server error. Please try again later.';
    case 502:
      return 'Service temporarily unavailable. Please try again.';
    case 503:
      return 'Service temporarily unavailable. Please try again.';
    default:
      return fallback;
  }
};

/**
 * Extract error message specifically for authentication errors
 * @param {Error} error - The error object
 * @returns {string} User-friendly auth error message
 */
export const extractAuthErrorMessage = (error) => {
  // Handle specific auth error codes
  if (error.response?.data?.error?.code) {
    switch (error.response.data.error.code) {
      case 'INVALID_CREDENTIALS':
        return 'Invalid email or password';
      case 'ACCOUNT_DEACTIVATED':
        return 'Your account has been deactivated. Please contact administrator.';
      case 'MISSING_CREDENTIALS':
        return 'Please provide email and password';
      case 'USER_NOT_FOUND':
        return 'Account not found';
      default:
        break;
    }
  }
  
  return extractErrorMessage(error, 'Authentication failed');
};

/**
 * Extract error message for form validation errors
 * @param {Error} error - The error object
 * @returns {string} User-friendly validation error message
 */
export const extractValidationErrorMessage = (error) => {
  // Handle validation errors with details
  if (error.response?.data?.error?.details && Array.isArray(error.response.data.error.details)) {
    const details = error.response.data.error.details;
    if (details.length > 0) {
      return details[0].message || 'Please check your input';
    }
  }
  
  return extractErrorMessage(error, 'Please check your input and try again');
};