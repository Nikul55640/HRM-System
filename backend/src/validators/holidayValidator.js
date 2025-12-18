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

  date: Joi.date()
    .iso()
    .required()
    .messages({
      'date.base': 'Date must be a valid date',
      'any.required': 'Date is required'
    }),

  type: Joi.string()
    .valid('national', 'religious', 'company', 'regional', 'optional')
    .default('company')
    .messages({
      'any.only': 'Type must be one of: national, religious, company, regional, optional'
    }),

  isRecurring: Joi.boolean()
    .default(false)
    .messages({
      'boolean.base': 'Is recurring must be true or false'
    }),

  recurrenceRule: Joi.object()
    .when('isRecurring', {
      is: true,
      then: Joi.object({
        frequency: Joi.string().valid('yearly', 'monthly').required(),
        interval: Joi.number().integer().min(1).default(1),
        byMonth: Joi.number().integer().min(1).max(12).when('frequency', {
          is: 'yearly',
          then: Joi.optional(),
          otherwise: Joi.forbidden()
        }),
        byMonthDay: Joi.number().integer().min(1).max(31).when('frequency', {
          is: 'yearly',
          then: Joi.optional(),
          otherwise: Joi.forbidden()
        })
      }),
      otherwise: Joi.optional()
    })
    .messages({
      'object.base': 'Recurrence rule must be a valid object'
    }),

  applicableTo: Joi.string()
    .valid('all', 'specific_departments', 'specific_employees')
    .default('all')
    .messages({
      'any.only': 'Applicable to must be one of: all, specific_departments, specific_employees'
    }),

  departments: Joi.array()
    .items(Joi.number().integer())
    .when('applicableTo', {
      is: 'specific_departments',
      then: Joi.required(),
      otherwise: Joi.optional()
    })
    .messages({
      'array.base': 'Departments must be an array of department IDs',
      'any.required': 'Departments are required when applicable to specific departments'
    }),

  employees: Joi.array()
    .items(Joi.number().integer())
    .when('applicableTo', {
      is: 'specific_employees',
      then: Joi.required(),
      otherwise: Joi.optional()
    })
    .messages({
      'array.base': 'Employees must be an array of employee IDs',
      'any.required': 'Employees are required when applicable to specific employees'
    }),

  isOptional: Joi.boolean()
    .default(false)
    .messages({
      'boolean.base': 'Is optional must be true or false'
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
    .default('#FF5722')
    .messages({
      'string.pattern.base': 'Color must be a valid hex color code (e.g., #FF5722)'
    }),

  location: Joi.string()
    .max(255)
    .allow('')
    .optional()
    .messages({
      'string.max': 'Location cannot exceed 255 characters'
    }),

  workingHours: Joi.object({
    startTime: Joi.string().pattern(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/),
    endTime: Joi.string().pattern(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/),
    isHalfDay: Joi.boolean().default(false)
  })
    .optional()
    .messages({
      'object.base': 'Working hours must be a valid object'
    }),

  compensationRule: Joi.string()
    .valid('none', 'overtime_pay', 'comp_off', 'double_pay')
    .default('none')
    .messages({
      'any.only': 'Compensation rule must be one of: none, overtime_pay, comp_off, double_pay'
    })
});

export const validateHoliday = (req, res, next) => {
  const { error, value } = holidaySchema.validate(req.body, {
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