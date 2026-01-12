import Joi from 'joi';

const holidaySchema = Joi.object({
  name: Joi.string()
    .min(2)
    .max(255)
    .required()
    .messages({
      'string.empty': 'Holiday name is required',
      'string.min': 'Holiday name must be at least 2 characters long',
      'string.max': 'Holiday name cannot exceed 255 characters'
    }),

  description: Joi.string()
    .max(1000)
    .allow('')
    .optional()
    .messages({
      'string.max': 'Description cannot exceed 1000 characters'
    }),

  // For one-time holidays
  date: Joi.date()
    .iso()
    .when('type', {
      is: 'ONE_TIME',
      then: Joi.required(),
      otherwise: Joi.allow(null)
    })
    .messages({
      'date.base': 'Date must be a valid date',
      'any.required': 'Date is required for one-time holidays'
    }),

  // For recurring holidays
  recurringDate: Joi.string()
    .pattern(/^(0[1-9]|1[0-2])-(0[1-9]|[12][0-9]|3[01])$/)
    .when('type', {
      is: 'RECURRING',
      then: Joi.required(),
      otherwise: Joi.allow(null)
    })
    .messages({
      'string.pattern.base': 'Recurring date must be in MM-DD format (e.g., 12-25)',
      'any.required': 'Recurring date is required for recurring holidays'
    }),

  type: Joi.string()
    .valid('ONE_TIME', 'RECURRING')
    .default('ONE_TIME')
    .messages({
      'any.only': 'Type must be either ONE_TIME or RECURRING'
    }),

  category: Joi.string()
    .valid('public', 'optional', 'national', 'religious', 'company')
    .default('public')
    .messages({
      'any.only': 'Category must be one of: public, optional, national, religious, company'
    }),

  appliesEveryYear: Joi.boolean()
    .default(false)
    .messages({
      'boolean.base': 'Applies every year must be true or false'
    }),

  isPaid: Joi.boolean()
    .default(true)
    .messages({
      'boolean.base': 'Is paid must be true or false'
    }),

  isActive: Joi.boolean()
    .default(true)
    .messages({
      'boolean.base': 'Is active must be true or false'
    }),

  color: Joi.string()
    .pattern(/^#[0-9A-Fa-f]{6}$/)
    .default('#dc2626')
    .messages({
      'string.pattern.base': 'Color must be a valid hex color code (e.g., #dc2626)'
    })
});

export const validateHoliday = (req, res, next) => {
  console.log('🔍 Validating holiday data:', JSON.stringify(req.body, null, 2));
  
  const { error, value } = holidaySchema.validate(req.body, {
    abortEarly: false,
    stripUnknown: true
  });

  if (error) {
    console.log('❌ Validation errors:', error.details);
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

  console.log('✅ Validation passed, cleaned data:', JSON.stringify(value, null, 2));
  req.body = value;
  next();
};