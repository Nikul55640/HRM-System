import Joi from 'joi';

/**
 * Validation schema for document upload
 */
const uploadDocumentSchema = Joi.object({
  documentType: Joi.string()
    .valid('Resume', 'Contract', 'Certification', 'Identification', 'Performance Review', 'Other')
    .required()
    .messages({
      'any.required': 'Document type is required',
      'any.only': 'Invalid document type. Must be one of: Resume, Contract, Certification, Identification, Performance Review, Other',
    }),
});

/**
 * Validation schema for document query parameters
 */
const getDocumentsSchema = Joi.object({
  page: Joi.number().integer().min(1).default(1)
    .messages({
      'number.base': 'Page must be a number',
      'number.min': 'Page must be at least 1',
    }),
  limit: Joi.number().integer().min(1).max(100)
    .default(10)
    .messages({
      'number.base': 'Limit must be a number',
      'number.min': 'Limit must be at least 1',
      'number.max': 'Limit cannot exceed 100',
    }),
  documentType: Joi.string()
    .valid('Resume', 'Contract', 'Certification', 'Identification', 'Performance Review', 'Other')
    .optional()
    .messages({
      'any.only': 'Invalid document type',
    }),
});

/**
 * Middleware to validate document upload request
 */
const validateUploadDocument = (req, res, next) => {
  const { error, value } = uploadDocumentSchema.validate(req.body, {
    abortEarly: false,
    stripUnknown: true,
  });

  if (error) {
    const errors = error.details.map((detail) => ({
      field: detail.path.join('.'),
      message: detail.message,
    }));

    return res.status(400).json({
      success: false,
      error: {
        code: 'VALIDATION_ERROR',
        message: 'Validation failed',
        details: errors,
      },
    });
  }

  req.body = value;
  next();
};

/**
 * Middleware to validate get documents query parameters
 */
const validateGetDocuments = (req, res, next) => {
  const { error, value } = getDocumentsSchema.validate(req.query, {
    abortEarly: false,
    stripUnknown: true,
  });

  if (error) {
    const errors = error.details.map((detail) => ({
      field: detail.path.join('.'),
      message: detail.message,
    }));

    return res.status(400).json({
      success: false,
      error: {
        code: 'VALIDATION_ERROR',
        message: 'Validation failed',
        details: errors,
      },
    });
  }

  req.query = value;
  next();
};

export {
  uploadDocumentSchema,
  getDocumentsSchema,
  validateUploadDocument,
  validateGetDocuments,
};
