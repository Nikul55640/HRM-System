import { body, validationResult } from 'express-validator';

export const validateEmergencyContact = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Name is required')
    .isLength({ min: 2, max: 100 })
    .withMessage('Name must be between 2 and 100 characters'),
  
  body('relationship')
    .notEmpty()
    .withMessage('Relationship is required')
    .isIn(['spouse', 'parent', 'child', 'sibling', 'friend', 'colleague', 'other'])
    .withMessage('Please select a valid relationship'),
  
  body('phone')
    .trim()
    .notEmpty()
    .withMessage('Phone number is required')
    .matches(/^[+]?[\d\s\-\(\)]+$/)
    .withMessage('Please enter a valid phone number')
    .isLength({ min: 10, max: 15 })
    .withMessage('Phone number must be between 10 and 15 digits'),
  
  body('alternatePhone')
    .optional({ nullable: true })
    .trim()
    .custom((value) => {
      if (value && value.length > 0) {
        if (!/^[+]?[\d\s\-\(\)]+$/.test(value)) {
          throw new Error('Please enter a valid alternate phone number');
        }
        if (value.length < 10 || value.length > 15) {
          throw new Error('Alternate phone number must be between 10 and 15 digits');
        }
      }
      return true;
    }),
  
  body('address')
    .optional({ nullable: true })
    .trim()
    .isLength({ max: 500 })
    .withMessage('Address must not exceed 500 characters'),
  
  body('isPrimary')
    .optional()
    .isBoolean()
    .withMessage('isPrimary must be a boolean value'),

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