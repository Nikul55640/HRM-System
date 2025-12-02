import Config from '../models/Config.js';
import AuditLog from '../models/AuditLog.js';
import logger from '../utils/logger.js';

/**
 * Get config by key
 */
const getConfig = async (key) => {
  try {
    const config = await Config.getByKey(key);

    if (!config) {
      throw {
        code: 'CONFIG_NOT_FOUND',
        message: `Configuration key '${key}' not found.`,
        statusCode: 404,
      };
    }

    logger.info(`Retrieved config: ${key}`);
    return config;
  } catch (error) {
    logger.error('Error getting config:', error);
    throw error;
  }
};

/**
 * Get all configs
 */
const getAllConfigs = async (filters = {}) => {
  try {
    const { category } = filters;

    const configs = category
      ? await Config.getByCategory(category)
      : await Config.find().sort({ category: 1, key: 1 });

    logger.info(`Retrieved ${configs.length} configurations`);
    return configs;
  } catch (error) {
    logger.error('Error getting all configs:', error);
    throw error;
  }
};

/**
 * Create or update config
 */
const setConfig = async (key, value, user, metadata = {}, description = null) => {
  try {
    const existing = await Config.getByKey(key);
    const oldValue = existing ? existing.value : null;

    const config = await Config.setConfig(key, value, user.id, description);

    await AuditLog.create({
      action: existing ? 'UPDATE' : 'CREATE',
      entityType: 'Config',
      entityId: config._id,
      userId: user.id,
      userRole: user.role,
      changes: [
        {
          field: key,
          oldValue,
          newValue: value,
        },
      ],
      ipAddress: metadata.ipAddress,
      userAgent: metadata.userAgent,
    });

    logger.info(`Config ${existing ? 'updated' : 'created'}: ${key}`);
    return config;
  } catch (error) {
    logger.error('Error setting config:', error);
    throw error;
  }
};

/**
 * Delete config
 */
const deleteConfig = async (key, user, metadata = {}) => {
  try {
    const config = await Config.getByKey(key);

    if (!config) {
      throw {
        code: 'CONFIG_NOT_FOUND',
        message: `Configuration key '${key}' not found.`,
        statusCode: 404,
      };
    }

    const protectedKeys = [
      'custom_employee_fields',
      'custom_document_categories',
      'employee_id_prefix',
    ];

    if (protectedKeys.includes(key)) {
      throw {
        code: 'CONFIG_PROTECTED',
        message: `Configuration '${key}' cannot be deleted.`,
        statusCode: 403,
      };
    }

    await Config.deleteConfig(key);

    await AuditLog.create({
      action: 'DELETE',
      entityType: 'Config',
      entityId: config._id,
      userId: user.id,
      userRole: user.role,
      changes: [
        {
          field: key,
          oldValue: config.value,
          newValue: null,
        },
      ],
      ipAddress: metadata.ipAddress,
      userAgent: metadata.userAgent,
    });

    logger.info(`Config deleted: ${key}`);
    return config;
  } catch (error) {
    logger.error('Error deleting config:', error);
    throw error;
  }
};

/**
 * Custom Employee Fields
 */
const getCustomEmployeeFields = async () => {
  try {
    const config = await Config.getByKey('custom_employee_fields');
    return config ? config.value : [];
  } catch (error) {
    logger.error('Error getting custom employee fields:', error);
    return [];
  }
};

const setCustomEmployeeFields = async (fields, user, metadata = {}) => {
  try {
    if (!Array.isArray(fields)) {
      throw {
        code: 'INVALID_FIELD_DEFINITION',
        message: 'Custom fields must be an array.',
        statusCode: 400,
      };
    }

    fields.forEach((field, index) => {
      if (!field.name || !field.type) {
        throw {
          code: 'INVALID_FIELD_DEFINITION',
          message: `Field at index ${index} must include name and type.`,
          statusCode: 400,
        };
      }

      const validTypes = ['text', 'number', 'date', 'boolean', 'select', 'textarea'];

      if (!validTypes.includes(field.type)) {
        throw {
          code: 'INVALID_FIELD_TYPE',
          message: `Invalid type '${field.type}'. Allowed: ${validTypes.join(', ')}`,
          statusCode: 400,
        };
      }

      if (field.type === 'select' && (!field.options || !Array.isArray(field.options))) {
        throw {
          code: 'INVALID_FIELD_OPTIONS',
          message: `Select field '${field.name}' must have options array.`,
          statusCode: 400,
        };
      }
    });

    const config = await setConfig(
      'custom_employee_fields',
      fields,
      user,
      metadata,
      'Custom employee profile fields'
    );

    logger.info(`Custom employee fields updated (${fields.length})`);
    return config;
  } catch (error) {
    logger.error('Error setting custom fields:', error);
    throw error;
  }
};

/**
 * Document Categories
 */
const getCustomDocumentCategories = async () => {
  try {
    const config = await Config.getByKey('custom_document_categories');

    return config
      ? config.value
      : ['Resume', 'Contract', 'Certification', 'Identification', 'Performance Review', 'Other'];
  } catch (error) {
    logger.error('Error getting document categories:', error);

    return ['Resume', 'Contract', 'Certification', 'Identification', 'Performance Review', 'Other'];
  }
};

const setCustomDocumentCategories = async (categories, user, metadata = {}) => {
  try {
    if (!Array.isArray(categories)) {
      throw {
        code: 'INVALID_CATEGORIES',
        message: 'Document categories must be an array.',
        statusCode: 400,
      };
    }

    if (categories.length === 0) {
      throw {
        code: 'EMPTY_CATEGORIES',
        message: 'At least one category is required.',
        statusCode: 400,
      };
    }

    categories.forEach((cat, index) => {
      if (!cat || typeof cat !== 'string' || !cat.trim()) {
        throw {
          code: 'INVALID_CATEGORY',
          message: `Category at index ${index} must be a non-empty string.`,
          statusCode: 400,
        };
      }
    });

    const unique = [...new Set(categories.map((c) => c.trim()))];

    const config = await setConfig(
      'custom_document_categories',
      unique,
      user,
      metadata,
      'Document category definitions'
    );

    logger.info(`Updated document categories (${unique.length})`);
    return config;
  } catch (error) {
    logger.error('Error setting document categories:', error);
    throw error;
  }
};

/**
 * Get multiple configs
 */
const getMultipleConfigs = async (keys) => {
  try {
    const configs = await Config.getMultiple(keys);
    logger.info(`Retrieved ${Object.keys(configs).length} configs`);
    return configs;
  } catch (error) {
    logger.error('Error getting multiple configs:', error);
    throw error;
  }
};

/**
 * Initialize system defaults
 */
const initializeDefaults = async () => {
  try {
    await Config.initializeDefaults();
    logger.info('Default configurations initialized');
  } catch (error) {
    logger.error('Error initializing defaults:', error);
    throw error;
  }
};

/**
 * FINAL EXPORT (your preferred style)
 */
export default {
  getConfig,
  getAllConfigs,
  setConfig,
  deleteConfig,
  getCustomEmployeeFields,
  setCustomEmployeeFields,
  getCustomDocumentCategories,
  setCustomDocumentCategories,
  getMultipleConfigs,
  initializeDefaults,
};
