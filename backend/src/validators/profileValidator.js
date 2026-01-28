import { body, validationResult } from 'express-validator';

export const validateProfileUpdate = [
  // Personal Info validation
  body('personalInfo.firstName')
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('First name must be between 2 and 50 characters'),
  
  body('personalInfo.lastName')
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Last name must be between 2 and 50 characters'),
  
  body('personalInfo.gender')
    .optional()
    .isIn(['male', 'female', 'other'])
    .withMessage('Gender must be male, female, or other'),
  
  body('personalInfo.dateOfBirth')
    .optional()
    .isISO8601()
    .withMessage('Date of birth must be a valid date')
    .custom((value) => {
      const birthDate = new Date(value);
      const today = new Date();
      const age = today.getFullYear() - birthDate.getFullYear();
      const monthDiff = today.getMonth() - birthDate.getMonth();
      
      if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
        if (age - 1 < 16) {
          throw new Error('Must be at least 16 years old');
        }
      } else if (age < 16) {
        throw new Error('Must be at least 16 years old');
      }
      
      if (birthDate > today) {
        throw new Error('Date of birth cannot be in the future');
      }
      
      return true;
    }),
  
  body('personalInfo.maritalStatus')
    .optional()
    .isIn(['single', 'married', 'divorced', 'widowed'])
    .withMessage('Marital status must be single, married, divorced, or widowed'),
  
  body('personalInfo.about')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('About section must not exceed 500 characters'),

  // Contact Info validation
  body('contactInfo.phone')
    .optional()
    .trim()
    .matches(/^[+]?[\d\s\-()]+$/)
    .withMessage('Please enter a valid phone number')
    .isLength({ min: 10, max: 15 })
    .withMessage('Phone number must be between 10 and 15 digits'),
  
  body('contactInfo.country')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('Country name must not exceed 100 characters'),
  
  body('contactInfo.address')
    .optional()
    .custom((value) => {
      // Allow address to be an object or string
      if (typeof value === 'object' && value !== null) {
        // Validate address object structure
        const allowedFields = ['street', 'city', 'state', 'zipCode', 'country'];
        const fields = Object.keys(value);
        
        // Check if all fields are allowed
        for (const field of fields) {
          if (!allowedFields.includes(field)) {
            throw new Error(`Invalid address field: ${field}`);
          }
        }
        
        // Validate each field length if present
        if (value.street && value.street.length > 200) {
          throw new Error('Street address must not exceed 200 characters');
        }
        if (value.city && value.city.length > 100) {
          throw new Error('City must not exceed 100 characters');
        }
        if (value.state && value.state.length > 100) {
          throw new Error('State must not exceed 100 characters');
        }
        if (value.zipCode && value.zipCode.length > 20) {
          throw new Error('ZIP code must not exceed 20 characters');
        }
        if (value.country && value.country.length > 100) {
          throw new Error('Country must not exceed 100 characters');
        }
        
        return true;
      } else if (typeof value === 'string') {
        // Allow legacy string format
        if (value.length > 500) {
          throw new Error('Address must not exceed 500 characters');
        }
        return true;
      }
      
      throw new Error('Address must be an object or string');
    }),

  // Validation result handler
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array(),
      });
    }
    next();
  },
];

export const validatePasswordChange = [
  body('currentPassword')
    .notEmpty()
    .withMessage('Current password is required'),
  
  body('newPassword')
    .isLength({ min: 8 })
    .withMessage('New password must be at least 8 characters long')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
    .withMessage('New password must contain at least one uppercase letter, one lowercase letter, one number, and one special character'),
  
  body('confirmPassword')
    .custom((value, { req }) => {
      if (value !== req.body.newPassword) {
        throw new Error('Password confirmation does not match new password');
      }
      return true;
    }),

  // Validation result handler
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array(),
      });
    }
    next();
  },
];