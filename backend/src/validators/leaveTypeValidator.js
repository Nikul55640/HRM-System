import Joi from 'joi';

const leaveTypeSchema = Joi.object({
  name: Joi.string()
    .min(2)
    .max(100)
    .required()
    .messages({
      'string.empty': 'Leave type name is required',
      'string.min': 'Leave type name must be at least 2 characters long',
      'string.max': 'Leave type name cannot exceed 100 characters'
    }),

  code: Joi.string()
    .min(2)
    .max(20)
    .pattern(/^[A-Z0-9_]+$/)
    .required()
    .messages({
      'string.empty': 'Leave type code is required',
      'string.min': 'Leave type code must be at least 2 characters long',
      'string.max': 'Leave type code cannot exceed 20 characters',
      'string.pattern.base': 'Leave type code must contain only uppercase letters, numbers, and underscores'
    }),

  description: Joi.string()
    .max(500)
    .allow('')
    .optional()
    .messages({
      'string.max': 'Description cannot exceed 500 characters'
    }),

  maxDaysPerYear: Joi.number()
    .integer()
    .min(0)
    .max(365)
    .required()
    .messages({
      'number.base': 'Maximum days per year must be a number',
      'number.integer': 'Maximum days per year must be an integer',
      'number.min': 'Maximum days per year cannot be negative',
      'number.max': 'Maximum days per year cannot exceed 365'
    }),

  maxConsecutiveDays: Joi.number()
    .integer()
    .min(1)
    .max(365)
    .allow(null)
    .optional()
    .messages({
      'number.base': 'Maximum consecutive days must be a number',
      'number.integer': 'Maximum consecutive days must be an integer',
      'number.min': 'Maximum consecutive days must be at least 1',
      'number.max': 'Maximum consecutive days cannot exceed 365'
    }),

  carryForward: Joi.boolean()
    .default(false)
    .messages({
      'boolean.base': 'Carry forward must be true or false'
    }),

  carryForwardLimit: Joi.number()
    .integer()
    .min(0)
    .max(365)
    .allow(null)
    .when('carryForward', {
      is: true,
      then: Joi.required(),
      otherwise: Joi.optional()
    })
    .messages({
      'number.base': 'Carry forward limit must be a number',
      'number.integer': 'Carry forward limit must be an integer',
      'number.min': 'Carry forward limit cannot be negative',
      'number.max': 'Carry forward limit cannot exceed 365',
      'any.required': 'Carry forward limit is required when carry forward is enabled'
    }),

  isPaid: Joi.boolean()
    .default(true)
    .messages({
      'boolean.base': 'Is paid must be true or false'
    }),

  requiresApproval: Joi.boolean()
    .default(true)
    .messages({
      'boolean.base': 'Requires approval must be true or false'
    }),

  advanceNoticeRequired: Joi.number()
    .integer()
    .min(0)
    .max(365)
    .default(1)
    .messages({
      'number.base': 'Advance notice required must be a number',
      'number.integer': 'Advance notice required must be an integer',
      'number.min': 'Advance notice required cannot be negative',
      'number.max': 'Advance notice required cannot exceed 365 days'
    }),

  applicableGender: Joi.string()
    .valid('all', 'male', 'female')
    .default('all')
    .messages({
      'any.only': 'Applicable gender must be one of: all, male, female'
    }),

  minServiceMonths: Joi.number()
    .integer()
    .min(0)
    .max(600)
    .default(0)
    .messages({
      'number.base': 'Minimum service months must be a number',
      'number.integer': 'Minimum service months must be an integer',
      'number.min': 'Minimum service months cannot be negative',
      'number.max': 'Minimum service months cannot exceed 600 (50 years)'
    }),

  isActive: Joi.boolean()
    .default(true)
    .messages({
      'boolean.base': 'Is active must be true or false'
    }),

  color: Joi.string()
    .pattern(/^#[0-9A-Fa-f]{6}$/)
    .default('#3B82F6')
    .messages({
      'string.pattern.base': 'Color must be a valid hex color code (e.g., #3B82F6)'
    })
});

export const validateLeaveType = (req, res, next) => {
  const { error, value } = leaveTypeSchema.validate(req.body, {
    abortEarly: false,
    stripUnknown: true
  });

  if (error) {
    const errors = error.details.map(detail => ({
      field: detail.path.join('.'),
      message: detail.message
    }));

    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors
    });
  }

  req.body = value;
  next();
};