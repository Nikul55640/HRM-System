// Validation utilities

// Email validation
export const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// Phone validation
export const isValidPhone = (phone) => {
  const phoneRegex = /^\+?[\d\s\-\(\)]{10,}$/;
  return phoneRegex.test(phone);
};

// Password validation
export const isValidPassword = (password) => {
  // At least 8 characters, 1 uppercase, 1 lowercase, 1 number
  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d@$!%*?&]{8,}$/;
  return passwordRegex.test(password);
};

// Required field validation
export const isRequired = (value) => {
  return value !== null && value !== undefined && value.toString().trim() !== '';
};

// Minimum length validation
export const minLength = (value, min) => {
  return value && value.toString().length >= min;
};

// Maximum length validation
export const maxLength = (value, max) => {
  return !value || value.toString().length <= max;
};

// Number validation
export const isNumber = (value) => {
  return !isNaN(value) && !isNaN(parseFloat(value));
};

// Positive number validation
export const isPositiveNumber = (value) => {
  return isNumber(value) && parseFloat(value) > 0;
};

// Date validation
export const isValidDate = (date) => {
  return date instanceof Date && !isNaN(date);
};

// Future date validation
export const isFutureDate = (date) => {
  return new Date(date) > new Date();
};

// Past date validation
export const isPastDate = (date) => {
  return new Date(date) < new Date();
};

// URL validation
export const isValidUrl = (url) => {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
};

// File type validation
export const isValidFileType = (file, allowedTypes) => {
  return allowedTypes.includes(file.type);
};

// File size validation (in bytes)
export const isValidFileSize = (file, maxSize) => {
  return file.size <= maxSize;
};

// Employee ID validation
export const isValidEmployeeId = (id) => {
  const employeeIdRegex = /^EMP\d{4,}$/;
  return employeeIdRegex.test(id);
};

// Validation error messages
export const getValidationMessage = (field, rule, value) => {
  const messages = {
    required: `${field} is required`,
    email: `${field} must be a valid email address`,
    phone: `${field} must be a valid phone number`,
    password: `${field} must be at least 8 characters with uppercase, lowercase, and number`,
    minLength: `${field} must be at least ${value} characters`,
    maxLength: `${field} must not exceed ${value} characters`,
    number: `${field} must be a valid number`,
    positiveNumber: `${field} must be a positive number`,
    date: `${field} must be a valid date`,
    futureDate: `${field} must be a future date`,
    pastDate: `${field} must be a past date`,
    url: `${field} must be a valid URL`,
    fileType: `${field} must be a valid file type`,
    fileSize: `${field} size must not exceed ${value}`,
    employeeId: `${field} must be in format EMP0000`
  };
  
  return messages[rule] || `${field} is invalid`;
};