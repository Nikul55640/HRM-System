/**
 * Error Handler Utilities
 * Transforms backend error codes to user-friendly messages
 */

const errorMessages = {
  // Authentication errors
  INVALID_CREDENTIALS: 'Invalid email or password. Please try again.',
  TOKEN_EXPIRED: 'Your session has expired. Please log in again.',
  UNAUTHORIZED: 'You are not authorized to perform this action.',
  FORBIDDEN: 'Access denied. You do not have permission to access this resource.',
  
  // Validation errors
  VALIDATION_ERROR: 'Please check your input and try again.',
  INVALID_EMAIL: 'Please enter a valid email address.',
  INVALID_PHONE: 'Please enter a valid phone number.',
  REQUIRED_FIELD: 'Please fill in all required fields.',
  
  // Employee errors
  EMPLOYEE_NOT_FOUND: 'Employee not found.',
  DUPLICATE_EMAIL: 'An employee with this email already exists.',
  DUPLICATE_EMPLOYEE_ID: 'This employee ID is already in use.',
  NO_EMPLOYEE_PROFILE: 'No employee profile is linked to your account.',
  
  // Document errors
  DOCUMENT_NOT_FOUND: 'Document not found.',
  FILE_TOO_LARGE: 'File size exceeds the maximum limit of 10MB.',
  INVALID_FILE_TYPE: 'Invalid file type. Only PDF, DOC, DOCX, JPG, and PNG files are allowed.',
  MALWARE_DETECTED: 'The uploaded file failed security scan and cannot be processed.',
  
  // User errors
  USER_NOT_FOUND: 'User not found.',
  DUPLICATE_USER: 'A user with this email already exists.',
  CANNOT_DELETE_LAST_ADMIN: 'Cannot delete the last SuperAdmin user.',
  
  // Department errors
  DEPARTMENT_NOT_FOUND: 'Department not found.',
  DUPLICATE_DEPARTMENT: 'A department with this name already exists.',
  DEPARTMENT_HAS_EMPLOYEES: 'Cannot delete department with active employees.',
  
  // Network errors
  NETWORK_ERROR: 'Network error. Please check your internet connection and try again.',
  TIMEOUT_ERROR: 'Request timed out. Please try again.',
  SERVER_ERROR: 'An unexpected server error occurred. Please try again later.',
  
  // Generic errors
  UNKNOWN_ERROR: 'An unexpected error occurred. Please try again.',
  NOT_FOUND: 'The requested resource was not found.',
};

/**
 * Transform error object to user-friendly message
 * @param {Object} error - Error object from API
 * @returns {String} User-friendly error message
 */
export const getErrorMessage = (error) => {
  // Handle network errors
  if (!error.response && error.message === 'Network error. Please check your connection.') {
    return errorMessages.NETWORK_ERROR;
  }

  // Handle timeout errors
  if (error.code === 'ECONNABORTED' || error.message?.includes('timeout')) {
    return errorMessages.TIMEOUT_ERROR;
  }

  // Handle API error responses
  if (error.code) {
    return errorMessages[error.code] || error.message || errorMessages.UNKNOWN_ERROR;
  }

  // Handle HTTP status codes
  if (error.status) {
    switch (error.status) {
      case 400:
        return errorMessages.VALIDATION_ERROR;
      case 401:
        return errorMessages.UNAUTHORIZED;
      case 403:
        return errorMessages.FORBIDDEN;
      case 404:
        return errorMessages.NOT_FOUND;
      case 409:
        return error.message || 'A conflict occurred. Please check your input.';
      case 500:
      case 502:
      case 503:
      case 504:
        return errorMessages.SERVER_ERROR;
      default:
        return error.message || errorMessages.UNKNOWN_ERROR;
    }
  }

  // Fallback to error message or generic error
  return error.message || errorMessages.UNKNOWN_ERROR;
};

/**
 * Extract validation errors from error response
 * @param {Object} error - Error object from API
 * @returns {Object} Object with field names as keys and error messages as values
 */
export const getValidationErrors = (error) => {
  if (error.details && typeof error.details === 'object') {
    const validationErrors = {};
    
    // Handle Joi validation errors format
    if (Array.isArray(error.details)) {
      error.details.forEach((detail) => {
        const field = detail.path?.join('.') || detail.context?.key;
        if (field) {
          validationErrors[field] = detail.message;
        }
      });
    } else {
      // Handle other validation error formats
      Object.keys(error.details).forEach((key) => {
        validationErrors[key] = error.details[key];
      });
    }
    
    return validationErrors;
  }
  
  return {};
};

/**
 * Check if error is a network error
 * @param {Object} error - Error object
 * @returns {Boolean}
 */
export const isNetworkError = (error) => {
  return !error.response || error.code === 'NETWORK_ERROR';
};

/**
 * Check if error is an authentication error
 * @param {Object} error - Error object
 * @returns {Boolean}
 */
export const isAuthError = (error) => {
  return error.status === 401 || error.code === 'TOKEN_EXPIRED' || error.code === 'UNAUTHORIZED';
};

/**
 * Check if error is a validation error
 * @param {Object} error - Error object
 * @returns {Boolean}
 */
export const isValidationError = (error) => {
  return error.status === 400 || error.code === 'VALIDATION_ERROR';
};

/**
 * Log error to console (can be extended to send to monitoring service)
 * @param {Object} error - Error object
 * @param {String} context - Context where error occurred
 */
export const logError = (error, context = '') => {
  if (process.env.NODE_ENV === 'development') {
    console.error(`[Error${context ? ` - ${context}` : ''}]:`, error);
  }
  
  // TODO: Send to monitoring service (e.g., Sentry, LogRocket)
  // if (process.env.NODE_ENV === 'production') {
  //   sendToMonitoringService(error, context);
  // }
};

export default {
  getErrorMessage,
  getValidationErrors,
  isNetworkError,
  isAuthError,
  isValidationError,
  logError,
};
