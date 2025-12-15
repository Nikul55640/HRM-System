import Joi from 'joi';

/**
 * Custom validator for integer IDs
 */
const idValidator = Joi.number().integer().positive().messages({
  'number.base': 'ID must be a number',
  'number.integer': 'ID must be an integer',
  'number.positive': 'ID must be positive',
});
const objectIdValidator = Joi.string().hex().length(24).messages({
  'string.base': 'ID must be a string',
  'string.length': 'ID must be a 24-character hexadecimal string',
  'string.hex': 'ID must be a valid hexadecimal string',
});

/**
 * Custom validator for email format
 */

const emailValidator = Joi.string()
  .email({ tlds: { allow: false } })
  .lowercase()
  .trim()
  .messages({
    'string.email': 'Please provide a valid email address',
  });

/**
 * Custom validator for phone number format
 * Accepts various international formats with digits, spaces, hyphens, plus signs, and parentheses
 */
const phoneValidator = Joi.string()
  .pattern(/^[\d\s\-\+\(\)]{7,20}$/)
  .trim()
  .messages({
    'string.pattern.base': 'Please provide a valid phone number (7-20 characters, digits, spaces, hyphens, +, and parentheses allowed)',
  });

/**
 * Custom validator for date of birth
 * Employee must be between 16 and 100 years old
 */
const dateOfBirthValidator = Joi.date()
  .max('now')
  .custom((value, helpers) => {
    const age = (new Date() - new Date(value)) / (1000 * 60 * 60 * 24 * 365.25);
    if (age < 16) {
      return helpers.error('date.minAge');
    }
    if (age > 100) {
      return helpers.error('date.maxAge');
    }
    return value;
  })
  .messages({
    'date.max': 'Date of birth cannot be in the future',
    'date.minAge': 'Employee must be at least 16 years old',
    'date.maxAge': 'Employee age cannot exceed 100 years',
  });

/**
 * Custom validator for hire date
 * Hire date cannot be in the future
 */
const hireDateValidator = Joi.date()
  .max('now')
  .messages({
    'date.max': 'Hire date cannot be in the future',
  });

/**
 * Validation schema for address
 */
const addressSchema = Joi.object({
  street: Joi.string().trim().max(200).allow('')
    .messages({
      'string.max': 'Street address cannot exceed 200 characters',
    }),
  city: Joi.string().trim().max(100).allow('')
    .messages({
      'string.max': 'City cannot exceed 100 characters',
    }),
  state: Joi.string().trim().max(100).allow('')
    .messages({
      'string.max': 'State cannot exceed 100 characters',
    }),
  zipCode: Joi.string().trim().max(20).allow('')
    .messages({
      'string.max': 'Zip code cannot exceed 20 characters',
    }),
  country: Joi.string().trim().max(100).allow('')
    .messages({
      'string.max': 'Country cannot exceed 100 characters',
    }),
}).allow(null);

/**
 * Validation schema for emergency contact
 */
const emergencyContactSchema = Joi.object({
  name: Joi.string().trim().max(100).required()
    .messages({
      'string.max': 'Emergency contact name cannot exceed 100 characters',
      'any.required': 'Emergency contact name is required',
    }),
  relationship: Joi.string().trim().max(50).required()
    .messages({
      'string.max': 'Relationship cannot exceed 50 characters',
      'any.required': 'Relationship is required',
    }),
  phoneNumber: phoneValidator.required().messages({
    'any.required': 'Emergency contact phone number is required',
  }),
  email: emailValidator.allow('').optional(),
});

/**
 * Validation schema for personal information
 */
const personalInfoSchema = Joi.object({
  firstName: Joi.string().trim().max(50).required()
    .messages({
      'string.max': 'First name cannot exceed 50 characters',
      'any.required': 'First name is required',
    }),
  lastName: Joi.string().trim().max(50).required()
    .messages({
      'string.max': 'Last name cannot exceed 50 characters',
      'any.required': 'Last name is required',
    }),
  dateOfBirth: dateOfBirthValidator.optional().allow(null),
  gender: Joi.string()
    .valid('Male', 'Female', 'Other', 'Prefer not to say')
    .optional()
    .allow(null)
    .messages({
      'any.only': 'Gender must be one of: Male, Female, Other, Prefer not to say',
    }),
  maritalStatus: Joi.string()
    .valid('Single', 'Married', 'Divorced', 'Widowed')
    .optional()
    .allow(null)
    .messages({
      'any.only': 'Marital status must be one of: Single, Married, Divorced, Widowed',
    }),
  nationality: Joi.string().trim().max(50).optional()
    .allow('', null)
    .messages({
      'string.max': 'Nationality cannot exceed 50 characters',
    }),
  profilePhoto: Joi.string().trim().uri().optional()
    .allow('', null)
    .messages({
      'string.uri': 'Profile photo must be a valid URL',
    }),
});

/**
 * Validation schema for contact information
 */
const contactInfoSchema = Joi.object({
  email: emailValidator.required().messages({
    'any.required': 'Email is required',
  }),
  personalEmail: emailValidator.optional().allow('', null),
  phoneNumber: phoneValidator.optional().allow('', null),
  alternatePhone: phoneValidator.optional().allow('', null),
  currentAddress: addressSchema.optional(),
  emergencyContacts: Joi.array()
    .items(emergencyContactSchema)
    .max(5)
    .optional()
    .messages({
      'array.max': 'Cannot have more than 5 emergency contacts',
    }),
});

/**
 * Validation schema for job information
 */
const jobInfoSchema = Joi.object({
  jobTitle: Joi.string().trim().max(100).required()
    .messages({
      'string.max': 'Job title cannot exceed 100 characters',
      'any.required': 'Job title is required',
    }),
  department: idValidator.required().messages({
    'any.required': 'Department is required',
  }),
  manager: idValidator.optional().allow(null),
  hireDate: hireDateValidator.required().messages({
    'any.required': 'Hire date is required',
  }),
  employmentType: Joi.string()
    .valid('Full-time', 'Part-time', 'Contract', 'Intern')
    .required()
    .messages({
      'any.only': 'Employment type must be one of: Full-time, Part-time, Contract, Intern',
      'any.required': 'Employment type is required',
    }),
  workLocation: Joi.string().trim().max(200).optional()
    .allow('', null)
    .messages({
      'string.max': 'Work location cannot exceed 200 characters',
    }),
  workSchedule: Joi.string().trim().max(200).optional()
    .allow('', null)
    .messages({
      'string.max': 'Work schedule cannot exceed 200 characters',
    }),
  probationEndDate: Joi.date()
    .greater(Joi.ref('hireDate'))
    .optional()
    .allow(null)
    .messages({
      'date.greater': 'Probation end date must be after hire date',
    }),
});

/**
 * Validation schema for employee creation
 * Requires all mandatory fields as per requirements 1.1, 1.2, 1.3
 */
const createEmployeeSchema = Joi.object({
  personalInfo: personalInfoSchema.required().messages({
    'any.required': 'Personal information is required',
  }),
  contactInfo: contactInfoSchema.required().messages({
    'any.required': 'Contact information is required',
  }),
  jobInfo: jobInfoSchema.required().messages({
    'any.required': 'Job information is required',
  }),
  status: Joi.string()
    .valid('Active', 'Inactive', 'On Leave', 'Terminated')
    .default('Active')
    .messages({
      'any.only': 'Status must be one of: Active, Inactive, On Leave, Terminated',
    }),
  isPrivate: Joi.boolean().default(false),
  customFields: Joi.object().pattern(Joi.string(), Joi.any()).optional(),
});

/**
 * Validation schema for employee update
 * All fields are optional for partial updates as per requirement 2.1
 */
const updateEmployeeSchema = Joi.object({
  personalInfo: Joi.object({
    firstName: Joi.string().trim().max(50).messages({
      'string.max': 'First name cannot exceed 50 characters',
    }),
    lastName: Joi.string().trim().max(50).messages({
      'string.max': 'Last name cannot exceed 50 characters',
    }),
    dateOfBirth: dateOfBirthValidator.allow(null),
    gender: Joi.string()
      .valid('Male', 'Female', 'Other', 'Prefer not to say')
      .allow(null)
      .messages({
        'any.only': 'Gender must be one of: Male, Female, Other, Prefer not to say',
      }),
    maritalStatus: Joi.string()
      .valid('Single', 'Married', 'Divorced', 'Widowed')
      .allow(null)
      .messages({
        'any.only': 'Marital status must be one of: Single, Married, Divorced, Widowed',
      }),
    nationality: Joi.string().trim().max(50).allow('', null)
      .messages({
        'string.max': 'Nationality cannot exceed 50 characters',
      }),
    profilePhoto: Joi.string().trim().uri().allow('', null)
      .messages({
        'string.uri': 'Profile photo must be a valid URL',
      }),
  }).optional(),
  contactInfo: Joi.object({
    email: emailValidator,
    personalEmail: emailValidator.allow('', null),
    phoneNumber: phoneValidator.allow('', null),
    alternatePhone: phoneValidator.allow('', null),
    currentAddress: addressSchema,
    emergencyContacts: Joi.array()
      .items(emergencyContactSchema)
      .max(5)
      .messages({
        'array.max': 'Cannot have more than 5 emergency contacts',
      }),
  }).optional(),
  jobInfo: Joi.object({
    jobTitle: Joi.string().trim().max(100).messages({
      'string.max': 'Job title cannot exceed 100 characters',
    }),
    department: idValidator,
    manager: idValidator.allow(null),
    hireDate: hireDateValidator,
    employmentType: Joi.string()
      .valid('Full-time', 'Part-time', 'Contract', 'Intern')
      .messages({
        'any.only': 'Employment type must be one of: Full-time, Part-time, Contract, Intern',
      }),
    workLocation: Joi.string().trim().max(200).allow('', null)
      .messages({
        'string.max': 'Work location cannot exceed 200 characters',
      }),
    workSchedule: Joi.string().trim().max(200).allow('', null)
      .messages({
        'string.max': 'Work schedule cannot exceed 200 characters',
      }),
    probationEndDate: Joi.date().allow(null).messages({
      'date.base': 'Probation end date must be a valid date',
    }),
  }).optional(),
  status: Joi.string()
    .valid('Active', 'Inactive', 'On Leave', 'Terminated')
    .messages({
      'any.only': 'Status must be one of: Active, Inactive, On Leave, Terminated',
    }),
  isPrivate: Joi.boolean(),
  customFields: Joi.object().pattern(Joi.string(), Joi.any()),
}).min(1).messages({
  'object.min': 'At least one field must be provided for update',
});

/**
 * Validation schema for employee self-update
 * Only allows specific fields that employees can update themselves (requirement 6.4)
 */
const selfUpdateEmployeeSchema = Joi.object({
  contactInfo: Joi.object({
    phoneNumber: phoneValidator.allow('', null),
    alternatePhone: phoneValidator.allow('', null),
    personalEmail: emailValidator.allow('', null),
    currentAddress: addressSchema,
    emergencyContacts: Joi.array()
      .items(emergencyContactSchema)
      .max(5)
      .messages({
        'array.max': 'Cannot have more than 5 emergency contacts',
      }),
  }).min(1).messages({
    'object.min': 'At least one contact field must be provided for update',
  }),
}).min(1).messages({
  'object.min': 'At least one field must be provided for update',
});

/**
 * Validation schema for employee search and filter query parameters
 */
const searchEmployeeSchema = Joi.object({
  search: Joi.string().trim().max(100).optional()
    .messages({
      'string.max': 'Search term cannot exceed 100 characters',
    }),
  department: idValidator.optional(),
  jobTitle: Joi.string().trim().max(100).optional(),
  employmentType: Joi.string()
    .valid('Full-time', 'Part-time', 'Contract', 'Intern')
    .optional(),
  workLocation: Joi.string().trim().max(200).optional(),
  status: Joi.string()
    .valid('Active', 'Inactive', 'On Leave', 'Terminated')
    .optional(),
  page: Joi.number().integer().min(1).default(1)
    .messages({
      'number.min': 'Page must be at least 1',
    }),
  limit: Joi.number().integer().min(1).max(100)
    .default(10)
    .messages({
      'number.min': 'Limit must be at least 1',
      'number.max': 'Limit cannot exceed 100',
    }),
  sortBy: Joi.string()
    .valid('firstName', 'lastName', 'email', 'hireDate', 'createdAt')
    .default('createdAt')
    .optional(),
  sortOrder: Joi.string().valid('asc', 'desc').default('desc').optional(),
});

/**
 * Validation schema for employee search endpoint query parameters
 * Requirements: 8.1, 8.2
 */
const employeeSearchQuerySchema = Joi.object({
  q: Joi.string().trim().min(1).max(100)
    .required()
    .messages({
      'string.empty': 'Search term is required',
      'string.min': 'Search term must be at least 1 character',
      'string.max': 'Search term cannot exceed 100 characters',
      'any.required': 'Search term (q) is required',
    }),
  page: Joi.number().integer().min(1).default(1)
    .messages({
      'number.min': 'Page must be at least 1',
    }),
  limit: Joi.number().integer().min(1).max(100)
    .default(10)
    .messages({
      'number.min': 'Limit must be at least 1',
      'number.max': 'Limit cannot exceed 100',
    }),
  sortBy: Joi.string()
    .valid('personalInfo.firstName', 'personalInfo.lastName', 'contactInfo.email', 'jobInfo.hireDate', 'createdAt')
    .default('personalInfo.lastName')
    .optional(),
  sortOrder: Joi.string().valid('asc', 'desc').default('asc').optional(),
});

/**
 * Validation schema for employee directory endpoint query parameters
 * Requirements: 9.1, 9.2, 9.3, 9.4, 9.5
 */
const employeeDirectoryQuerySchema = Joi.object({
  department: Joi.alternatives()
    .try(
      objectIdValidator,
      Joi.array().items(objectIdValidator),
    )
    .optional(),
  jobTitle: Joi.string().trim().max(100).optional(),
  search: Joi.string().trim().max(100).optional()
    .messages({
      'string.max': 'Search term cannot exceed 100 characters',
    }),
  page: Joi.number().integer().min(1).default(1)
    .messages({
      'number.min': 'Page must be at least 1',
    }),
  limit: Joi.number().integer().min(1).max(100)
    .default(20)
    .messages({
      'number.min': 'Limit must be at least 1',
      'number.max': 'Limit cannot exceed 100',
    }),
  sortBy: Joi.string()
    .valid('personalInfo.firstName', 'personalInfo.lastName', 'jobInfo.jobTitle', 'jobInfo.department')
    .default('personalInfo.lastName')
    .optional(),
  sortOrder: Joi.string().valid('asc', 'desc').default('asc').optional(),
});

/**
 * Validation schema for employee filter endpoint query parameters
 * Requirements: 8.3, 8.4
 */
const employeeFilterQuerySchema = Joi.object({
  department: Joi.alternatives()
    .try(
      objectIdValidator,
      Joi.array().items(objectIdValidator),
    )
    .optional(),
  jobTitle: Joi.alternatives()
    .try(
      Joi.string().trim().max(100),
      Joi.array().items(Joi.string().trim().max(100)),
    )
    .optional(),
  employmentType: Joi.alternatives()
    .try(
      Joi.string().valid('Full-time', 'Part-time', 'Contract', 'Intern'),
      Joi.array().items(Joi.string().valid('Full-time', 'Part-time', 'Contract', 'Intern')),
    )
    .optional(),
  workLocation: Joi.alternatives()
    .try(
      Joi.string().trim().max(200),
      Joi.array().items(Joi.string().trim().max(200)),
    )
    .optional(),
  status: Joi.alternatives()
    .try(
      Joi.string().valid('Active', 'Inactive', 'On Leave', 'Terminated'),
      Joi.array().items(Joi.string().valid('Active', 'Inactive', 'On Leave', 'Terminated')),
    )
    .optional(),
  page: Joi.number().integer().min(1).default(1)
    .messages({
      'number.min': 'Page must be at least 1',
    }),
  limit: Joi.number().integer().min(1).max(100)
    .default(10)
    .messages({
      'number.min': 'Limit must be at least 1',
      'number.max': 'Limit cannot exceed 100',
    }),
  sortBy: Joi.string()
    .valid('personalInfo.firstName', 'personalInfo.lastName', 'jobInfo.jobTitle', 'jobInfo.hireDate', 'createdAt')
    .default('personalInfo.lastName')
    .optional(),
  sortOrder: Joi.string().valid('asc', 'desc').default('asc').optional(),
});

/**
 * Middleware to validate request body against schema
 */
const validate = (schema) => (req, res, next) => {
  const { error, value } = schema.validate(req.body, {
    abortEarly: false,
    stripUnknown: true,
  });

  if (error) {
    return res.status(400).json({
      success: false,
      error: {
        code: 'VALIDATION_ERROR',
        message: 'Validation failed',
        details: error.details.map((detail) => ({
          field: detail.path.join('.'),
          message: detail.message,
        })),
        timestamp: new Date().toISOString(),
      },
    });
  }

  // Replace req.body with validated and sanitized value
  req.body = value;
  next();
};

/**
 * Middleware to validate query parameters against schema
 */
const validateQuery = (schema) => (req, res, next) => {
  const { error, value } = schema.validate(req.query, {
    abortEarly: false,
    stripUnknown: true,
  });

  if (error) {
    return res.status(400).json({
      success: false,
      error: {
        code: 'VALIDATION_ERROR',
        message: 'Validation failed',
        details: error.details.map((detail) => ({
          field: detail.path.join('.'),
          message: detail.message,
        })),
        timestamp: new Date().toISOString(),
      },
    });
  }

  // Replace req.query with validated and sanitized value
  req.query = value;
  next();
};

/**
 * Middleware to validate URL parameters
 */
const validateParams = (schema) => (req, res, next) => {
  const { error, value } = schema.validate(req.params, {
    abortEarly: false,
    stripUnknown: true,
  });

  if (error) {
    return res.status(400).json({
      success: false,
      error: {
        code: 'VALIDATION_ERROR',
        message: 'Validation failed',
        details: error.details.map((detail) => ({
          field: detail.path.join('.'),
          message: detail.message,
        })),
        timestamp: new Date().toISOString(),
      },
    });
  }

  // Replace req.params with validated value
  req.params = value;
  next();
};

/**
 * Schema for validating employee ID parameter
 */
const employeeIdParamSchema = Joi.object({
  id: objectIdValidator.required().messages({
    'any.required': 'Employee ID is required',
  }),
});

export {
  createEmployeeSchema,
  updateEmployeeSchema,
  selfUpdateEmployeeSchema,
  searchEmployeeSchema,
  employeeIdParamSchema,
  validate,
  validateQuery,
  validateParams,
  // Export individual schemas for reuse
  personalInfoSchema,
  contactInfoSchema,
  jobInfoSchema,
  addressSchema,
  emergencyContactSchema,
  // Export custom validators for reuse
  emailValidator,
  phoneValidator,
  objectIdValidator,
  dateOfBirthValidator,
  hireDateValidator,
};
