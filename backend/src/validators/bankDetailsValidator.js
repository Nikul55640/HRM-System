/**
 * Validate IFSC code format (Indian banking)
 * Format: 4 letters, 0, 6 alphanumeric characters
 * Example: ABCD0123456
 * @param {string} ifsc - IFSC code to validate
 * @returns {boolean} True if valid
 */
const validateIFSC = (ifsc) => {
  if (!ifsc || typeof ifsc !== 'string') {
    return false;
  }

  const ifscRegex = /^[A-Z]{4}0[A-Z0-9]{6}$/;
  return ifscRegex.test(ifsc.toUpperCase());
};

/**
 * Validate account number format
 * Accepts numeric strings of 8-18 digits
 * @param {string} accountNumber - Account number to validate
 * @returns {boolean} True if valid
 */
const validateAccountNumber = (accountNumber) => {
  if (!accountNumber || typeof accountNumber !== 'string') {
    return false;
  }

  // Remove any spaces or hyphens
  const cleaned = accountNumber.replace(/[\s-]/g, '');

  // Check if it's numeric and within valid length
  const accountRegex = /^\d{8,18}$/;
  return accountRegex.test(cleaned);
};

/**
 * Validate bank name
 * @param {string} bankName - Bank name to validate
 * @returns {boolean} True if valid
 */
const validateBankName = (bankName) => {
  if (!bankName || typeof bankName !== 'string') {
    return false;
  }

  const trimmed = bankName.trim();
  return trimmed.length >= 2 && trimmed.length <= 100;
};

/**
 * Validate account holder name
 * @param {string} name - Account holder name to validate
 * @returns {boolean} True if valid
 */
const validateAccountHolderName = (name) => {
  if (!name || typeof name !== 'string') {
    return false;
  }

  const trimmed = name.trim();
  // Should contain only letters, spaces, and common punctuation
  const nameRegex = /^[a-zA-Z\s.''-]+$/;
  return trimmed.length >= 2 && trimmed.length <= 100 && nameRegex.test(trimmed);
};

/**
 * Validate account type
 * @param {string} accountType - Account type to validate
 * @returns {boolean} True if valid
 */
const validateAccountType = (accountType) => {
  const validTypes = ['Savings', 'Current', 'Salary'];
  return validTypes.includes(accountType);
};

/**
 * Validate complete bank details object
 * @param {Object} bankDetails - Bank details object to validate
 * @returns {Object} Validation result with success flag and errors
 */
const validateBankDetails = (bankDetails) => {
  const errors = [];

  if (!bankDetails || typeof bankDetails !== 'object') {
    return {
      success: false,
      errors: ['Bank details object is required'],
    };
  }

  // Validate account number
  if (!validateAccountNumber(bankDetails.accountNumber)) {
    errors.push('Invalid account number. Must be 8-18 digits.');
  }

  // Validate bank name
  if (!validateBankName(bankDetails.bankName)) {
    errors.push('Invalid bank name. Must be 2-100 characters.');
  }

  // Validate IFSC code
  if (!validateIFSC(bankDetails.ifscCode)) {
    errors.push('Invalid IFSC code format. Must follow pattern: ABCD0123456');
  }

  // Validate account holder name
  if (!validateAccountHolderName(bankDetails.accountHolderName)) {
    errors.push('Invalid account holder name. Must be 2-100 characters with only letters, spaces, and basic punctuation.');
  }

  // Validate account type if provided
  if (bankDetails.accountType && !validateAccountType(bankDetails.accountType)) {
    errors.push('Invalid account type. Must be Savings, Current, or Salary.');
  }

  return {
    success: errors.length === 0,
    errors,
  };
};

export {
  validateIFSC,
  validateAccountNumber,
  validateBankName,
  validateAccountHolderName,
  validateAccountType,
  validateBankDetails,
};
