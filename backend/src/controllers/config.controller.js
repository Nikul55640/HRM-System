import departmentService from '../services/admin/department.service.js';
import configService from '../services/config.service.js';
import logger from '../utils/logger.js';

/**
 * Get all departments
 */
const getDepartments = async (req, res) => {
  try {
    const {
      page, limit, sortBy, sortOrder, includeInactive, parentDepartment, search,
    } = req.query;

    const options = {
      page: parseInt(page) || 1,
      limit: parseInt(limit) || 50,
      sortBy: sortBy || 'name',
      sortOrder: sortOrder || 'asc',
      includeInactive: includeInactive === 'true',
      parentDepartment,
      search,
    };

    const result = await departmentService.getDepartments({}, options);

    res.status(200).json({
      success: true,
      data: result,
      message: 'Departments retrieved successfully.',
    });
  } catch (error) {
    logger.error('Get departments error:', error);

    if (error.code && error.statusCode) {
      return res.status(error.statusCode).json({
        success: false,
        error: {
          code: error.code,
          message: error.message,
          timestamp: new Date().toISOString(),
        },
      });
    }

    res.status(500).json({
      success: false,
      error: {
        code: 'GET_DEPARTMENTS_ERROR',
        message: 'An error occurred while retrieving departments.',
        timestamp: new Date().toISOString(),
      },
    });
  }
};

/**
 * Get department by ID
 */
const getDepartmentById = async (req, res) => {
  try {
    const { id } = req.params;
    const { includeChildren } = req.query;

    const department = await departmentService.getDepartmentById(id, includeChildren === 'true');

    res.status(200).json({
      success: true,
      data: { department },
      message: 'Department retrieved successfully.',
    });
  } catch (error) {
    logger.error('Get department by ID error:', error);

    if (error.code && error.statusCode) {
      return res.status(error.statusCode).json({
        success: false,
        error: {
          code: error.code,
          message: error.message,
          timestamp: new Date().toISOString(),
        },
      });
    }

    res.status(500).json({
      success: false,
      error: {
        code: 'GET_DEPARTMENT_ERROR',
        message: 'An error occurred while retrieving the department.',
        timestamp: new Date().toISOString(),
      },
    });
  }
};

/**
 * Get department hierarchy
 */
const getDepartmentHierarchy = async (req, res) => {
  try {
    const { rootId } = req.query;
    const hierarchy = await departmentService.getDepartmentHierarchy(rootId || null);

    res.status(200).json({
      success: true,
      data: { hierarchy },
      message: 'Department hierarchy retrieved successfully.',
    });
  } catch (error) {
    logger.error('Get department hierarchy error:', error);

    if (error.code && error.statusCode) {
      return res.status(error.statusCode).json({
        success: false,
        error: {
          code: error.code,
          message: error.message,
          timestamp: new Date().toISOString(),
        },
      });
    }

    res.status(500).json({
      success: false,
      error: {
        code: 'GET_HIERARCHY_ERROR',
        message: 'An error occurred while retrieving department hierarchy.',
        timestamp: new Date().toISOString(),
      },
    });
  }
};

/**
 * Create department
 */
const createDepartment = async (req, res) => {
  try {
    const departmentData = req.body;
    const { user } = req;

    const metadata = {
      ipAddress: req.ip || req.connection.remoteAddress,
      userAgent: req.get('user-agent'),
    };

    const department = await departmentService.createDepartment(departmentData, user, metadata);

    res.status(201).json({
      success: true,
      data: { department },
      message: 'Department created successfully.',
    });
  } catch (error) {
    logger.error('Create department error:', error);

    if (error.code && error.statusCode) {
      return res.status(error.statusCode).json({
        success: false,
        error: {
          code: error.code,
          message: error.message,
          timestamp: new Date().toISOString(),
        },
      });
    }

    if (error.name === 'ValidationError') {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Validation failed.',
          details: Object.values(error.errors).map((err) => ({
            field: err.path,
            message: err.message,
          })),
          timestamp: new Date().toISOString(),
        },
      });
    }

    res.status(500).json({
      success: false,
      error: {
        code: 'CREATE_DEPARTMENT_ERROR',
        message: 'An error occurred while creating the department.',
        timestamp: new Date().toISOString(),
      },
    });
  }
};

/**
 * Update department
 */
const updateDepartment = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;
    const { user } = req;

    const metadata = {
      ipAddress: req.ip || req.connection.remoteAddress,
      userAgent: req.get('user-agent'),
    };

    const department = await departmentService.updateDepartment(id, updateData, user, metadata);

    res.status(200).json({
      success: true,
      data: { department },
      message: 'Department updated successfully.',
    });
  } catch (error) {
    logger.error('Update department error:', error);

    if (error.code && error.statusCode) {
      return res.status(error.statusCode).json({
        success: false,
        error: {
          code: error.code,
          message: error.message,
          timestamp: new Date().toISOString(),
        },
      });
    }

    if (error.name === 'ValidationError') {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Validation failed.',
          details: Object.values(error.errors).map((err) => ({
            field: err.path,
            message: err.message,
          })),
          timestamp: new Date().toISOString(),
        },
      });
    }

    res.status(500).json({
      success: false,
      error: {
        code: 'UPDATE_DEPARTMENT_ERROR',
        message: 'An error occurred while updating the department.',
        timestamp: new Date().toISOString(),
      },
    });
  }
};

/**
 * Delete department
 */
const deleteDepartment = async (req, res) => {
  try {
    const { id } = req.params;
    const { user } = req;

    const metadata = {
      ipAddress: req.ip || req.connection.remoteAddress,
      userAgent: req.get('user-agent'),
    };

    const department = await departmentService.deleteDepartment(id, user, metadata);

    res.status(200).json({
      success: true,
      data: { department },
      message: 'Department deleted successfully.',
    });
  } catch (error) {
    logger.error('Delete department error:', error);

    if (error.code && error.statusCode) {
      return res.status(error.statusCode).json({
        success: false,
        error: {
          code: error.code,
          message: error.message,
          timestamp: new Date().toISOString(),
        },
      });
    }

    res.status(500).json({
      success: false,
      error: {
        code: 'DELETE_DEPARTMENT_ERROR',
        message: 'An error occurred while deleting the department.',
        timestamp: new Date().toISOString(),
      },
    });
  }
};

/**
 * Get custom fields
 */
const getCustomFields = async (req, res) => {
  try {
    const employeeFields = await configService.getCustomEmployeeFields();
    const documentCategories = await configService.getCustomDocumentCategories();

    res.status(200).json({
      success: true,
      data: {
        employeeFields,
        documentCategories,
      },
      message: 'Custom fields retrieved successfully.',
    });
  } catch (error) {
    logger.error('Get custom fields error:', error);

    if (error.code && error.statusCode) {
      return res.status(error.statusCode).json({
        success: false,
        error: {
          code: error.code,
          message: error.message,
          timestamp: new Date().toISOString(),
        },
      });
    }

    res.status(500).json({
      success: false,
      error: {
        code: 'GET_CUSTOM_FIELDS_ERROR',
        message: 'An error occurred while retrieving custom fields.',
        timestamp: new Date().toISOString(),
      },
    });
  }
};

/**
 * Set custom employee fields
 */
const setCustomEmployeeFields = async (req, res) => {
  try {
    const { fields } = req.body;
    const { user } = req;

    const metadata = {
      ipAddress: req.ip || req.connection.remoteAddress,
      userAgent: req.get('user-agent'),
    };

    const config = await configService.setCustomEmployeeFields(fields, user, metadata);

    res.status(200).json({
      success: true,
      data: { config },
      message: 'Custom employee fields updated successfully.',
    });
  } catch (error) {
    logger.error('Set custom employee fields error:', error);

    if (error.code && error.statusCode) {
      return res.status(error.statusCode).json({
        success: false,
        error: {
          code: error.code,
          message: error.message,
          timestamp: new Date().toISOString(),
        },
      });
    }

    res.status(500).json({
      success: false,
      error: {
        code: 'SET_CUSTOM_FIELDS_ERROR',
        message: 'An error occurred while setting custom employee fields.',
        timestamp: new Date().toISOString(),
      },
    });
  }
};

/**
 * Set custom document categories
 */
const setCustomDocumentCategories = async (req, res) => {
  try {
    const { categories } = req.body;
    const { user } = req;

    const metadata = {
      ipAddress: req.ip || req.connection.remoteAddress,
      userAgent: req.get('user-agent'),
    };

    const config = await configService.setCustomDocumentCategories(categories, user, metadata);

    res.status(200).json({
      success: true,
      data: { config },
      message: 'Custom document categories updated successfully.',
    });
  } catch (error) {
    logger.error('Set custom document categories error:', error);

    if (error.code && error.statusCode) {
      return res.status(error.statusCode).json({
        success: false,
        error: {
          code: error.code,
          message: error.message,
          timestamp: new Date().toISOString(),
        },
      });
    }

    res.status(500).json({
      success: false,
      error: {
        code: 'SET_DOCUMENT_CATEGORIES_ERROR',
        message: 'An error occurred while setting custom document categories.',
        timestamp: new Date().toISOString(),
      },
    });
  }
};

/**
 * Get all configurations
 */
const getAllConfigs = async (req, res) => {
  try {
    const { category } = req.query;

    const configs = await configService.getAllConfigs({ category });

    res.status(200).json({
      success: true,
      data: { configs },
      message: 'Configurations retrieved successfully.',
    });
  } catch (error) {
    logger.error('Get all configs error:', error);

    if (error.code && error.statusCode) {
      return res.status(error.statusCode).json({
        success: false,
        error: {
          code: error.code,
          message: error.message,
          timestamp: new Date().toISOString(),
        },
      });
    }

    res.status(500).json({
      success: false,
      error: {
        code: 'GET_CONFIGS_ERROR',
        message: 'An error occurred while retrieving configurations.',
        timestamp: new Date().toISOString(),
      },
    });
  }
};

/**
 * Set system config
 */
const setSystemConfig = async (req, res) => {
  try {
    const { key, value, description } = req.body;
    const { user } = req;

    if (!key || value === undefined) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'MISSING_PARAMETERS',
          message: 'Key and value are required.',
          timestamp: new Date().toISOString(),
        },
      });
    }

    const metadata = {
      ipAddress: req.ip || req.connection.remoteAddress,
      userAgent: req.get('user-agent'),
    };

    const config = await configService.setConfig(key, value, user, metadata, description);

    res.status(200).json({
      success: true,
      data: { config },
      message: 'Configuration updated successfully.',
    });
  } catch (error) {
    logger.error('Set system config error:', error);

    if (error.code && error.statusCode) {
      return res.status(error.statusCode).json({
        success: false,
        error: {
          code: error.code,
          message: error.message,
          timestamp: new Date().toISOString(),
        },
      });
    }

    res.status(500).json({
      success: false,
      error: {
        code: 'SET_CONFIG_ERROR',
        message: 'An error occurred while setting configuration.',
        timestamp: new Date().toISOString(),
      },
    });
  }
};

/**
 * ⭐ FINAL EXPORT (your preferred format)
 */
export default {
  getDepartments,
  getDepartmentById,
  getDepartmentHierarchy,
  createDepartment,
  updateDepartment,
  deleteDepartment,
  getCustomFields,
  setCustomEmployeeFields,
  setCustomDocumentCategories,
  getAllConfigs,
  setSystemConfig,
};
