import employeeService from '../services/employeeService.js';
import { sendEmail,
  sendWelcomeEmail,
  sendProfileUpdateEmail,
  sendPasswordResetEmail,
  initializeTransporter } from '../services/emailService.js';
import logger from '../utils/logger.js';

/**
 * Employee Controller
 * Handles HTTP requests for employee management
 */

/**
 * Create a new employee
 * POST /api/employees
 * Access: HR Administrator, HR Manager, SuperAdmin
 */
const createEmployee = async (req, res) => {
  try {
    const employeeData = req.body;
    const { user } = req;

    // Extract request metadata for audit logging
    const metadata = {
      ipAddress: req.ip || req.connection.remoteAddress,
      userAgent: req.get('user-agent'),
    };

    // Create employee using service layer
    const employee = await employeeService.createEmployee(employeeData, user, metadata);

    // Send welcome email notification (requirement 1.4)
    try {
      await sendWelcomeEmail(employee);
    } catch (emailError) {
      // Log email error but don't fail the request
      logger.error('Failed to send welcome email:', emailError);
    }

    // Return success response
    res.status(201).json({
      success: true,
      data: {
        employee,
      },
      message: 'Employee created successfully.',
    });
  } catch (error) {
    logger.error('Create employee error:', error);

    // Handle custom service errors
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

    // Handle validation errors
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

    // Generic server error
    res.status(500).json({
      success: false,
      error: {
        code: 'CREATE_EMPLOYEE_ERROR',
        message: 'An error occurred while creating employee.',
        timestamp: new Date().toISOString(),
      },
    });
  }
};

/**
 * Get all employees with pagination and filtering
 * GET /api/employees
 * Access: All authenticated users (filtered by role)
 */
const getEmployees = async (req, res) => {
  try {
    const { user } = req;

    // Extract filters from query parameters
    const filters = {
      department: req.query.department,
      status: req.query.status,
      employmentType: req.query.employmentType,
      jobTitle: req.query.jobTitle,
      workLocation: req.query.workLocation,
      search: req.query.search,
    };

    // Extract pagination parameters
    const pagination = {
      page: req.query.page,
      limit: req.query.limit,
      sortBy: req.query.sortBy,
      sortOrder: req.query.sortOrder,
    };

    // Get employees from service layer
    const result = await employeeService.listEmployees(filters, user, pagination);

    // Return success response
    res.status(200).json({
      success: true,
      data: {
        employees: result.employees,
        pagination: result.pagination,
      },
    });
  } catch (error) {
    logger.error('Get employees error:', error);

    // Handle custom service errors
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

    // Generic server error
    res.status(500).json({
      success: false,
      error: {
        code: 'GET_EMPLOYEES_ERROR',
        message: 'An error occurred while fetching employees.',
        timestamp: new Date().toISOString(),
      },
    });
  }
};

/**
 * Get employee by ID
 * GET /api/employees/:id
 * Access: All authenticated users (filtered by role)
 */
const getEmployeeById = async (req, res) => {
  try {
    const employeeId = req.params.id;
    const { user } = req;

    // Get employee from service layer
    const employee = await employeeService.getEmployeeById(employeeId, user);

    // Return success response
    res.status(200).json({
      success: true,
      data: {
        employee,
      },
    });
  } catch (error) {
    logger.error('Get employee by ID error:', error);

    // Handle custom service errors
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

    // Generic server error
    res.status(500).json({
      success: false,
      error: {
        code: 'GET_EMPLOYEE_ERROR',
        message: 'An error occurred while fetching employee.',
        timestamp: new Date().toISOString(),
      },
    });
  }
};

/**
 * Update employee
 * PUT /api/employees/:id
 * Access: HR Administrator, HR Manager, SuperAdmin
 */
const updateEmployee = async (req, res) => {
  try {
    const employeeId = req.params.id;
    const updateData = req.body;
    const { user } = req;

    // Extract request metadata for audit logging
    const metadata = {
      ipAddress: req.ip || req.connection.remoteAddress,
      userAgent: req.get('user-agent'),
    };

    // Update employee using service layer
    const employee = await employeeService.updateEmployee(employeeId, updateData, user, metadata);

    // Send profile update notification for critical changes (requirement 2.5)
    const criticalFields = ['jobInfo.jobTitle', 'jobInfo.department', 'jobInfo.manager', 'status'];
    const hasCriticalChanges = Object.keys(updateData).some((key) => {
      if (key === 'jobInfo') {
        return Object.keys(updateData.jobInfo).some((jobKey) => criticalFields.includes(`jobInfo.${jobKey}`));
      }
      return criticalFields.includes(key);
    });

    if (hasCriticalChanges) {
      try {
        await emailService.sendProfileUpdateEmail(employee, updateData);
      } catch (emailError) {
        // Log email error but don't fail the request
        logger.error('Failed to send profile update email:', emailError);
      }
    }

    // Return success response
    res.status(200).json({
      success: true,
      data: {
        employee,
      },
      message: 'Employee updated successfully.',
    });
  } catch (error) {
    logger.error('Update employee error:', error);

    // Handle custom service errors
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

    // Handle validation errors
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

    // Generic server error
    res.status(500).json({
      success: false,
      error: {
        code: 'UPDATE_EMPLOYEE_ERROR',
        message: 'An error occurred while updating employee.',
        timestamp: new Date().toISOString(),
      },
    });
  }
};

/**
 * Delete employee (soft delete)
 * DELETE /api/employees/:id
 * Access: HR Administrator, HR Manager, SuperAdmin
 */
const deleteEmployee = async (req, res) => {
  try {
    const employeeId = req.params.id;
    const { user } = req;

    // Extract request metadata for audit logging
    const metadata = {
      ipAddress: req.ip || req.connection.remoteAddress,
      userAgent: req.get('user-agent'),
    };

    // Soft delete employee using service layer
    const employee = await employeeService.softDeleteEmployee(employeeId, user, metadata);

    // Return success response
    res.status(200).json({
      success: true,
      data: {
        employee,
      },
      message: 'Employee deactivated successfully.',
    });
  } catch (error) {
    logger.error('Delete employee error:', error);

    // Handle custom service errors
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

    // Generic server error
    res.status(500).json({
      success: false,
      error: {
        code: 'DELETE_EMPLOYEE_ERROR',
        message: 'An error occurred while deleting employee.',
        timestamp: new Date().toISOString(),
      },
    });
  }
};

/**
 * Search employees
 * GET /api/employees/search
 * Access: All authenticated users (filtered by role)
 */
const searchEmployees = async (req, res) => {
  try {
    const { user } = req;
    const searchTerm = req.query.q || req.query.search || '';

    // Extract pagination parameters
    const pagination = {
      page: req.query.page,
      limit: req.query.limit,
      sortBy: req.query.sortBy,
      sortOrder: req.query.sortOrder,
    };

    // Search employees using service layer
    const result = await employeeService.searchEmployees(searchTerm, user, pagination);

    // Return success response
    res.status(200).json({
      success: true,
      data: {
        employees: result.employees,
        pagination: result.pagination,
        searchTerm: result.searchTerm,
      },
    });
  } catch (error) {
    logger.error('Search employees error:', error);

    // Handle custom service errors
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

    // Generic server error
    res.status(500).json({
      success: false,
      error: {
        code: 'SEARCH_EMPLOYEES_ERROR',
        message: 'An error occurred while searching employees.',
        timestamp: new Date().toISOString(),
      },
    });
  }
};

/**
 * Get employee directory
 * GET /api/employees/directory
 * Access: All authenticated users (filtered by role)
 */
const getEmployeeDirectory = async (req, res) => {
  try {
    const { user } = req;

    // Extract filters from query parameters
    const filters = {
      department: req.query.department,
      jobTitle: req.query.jobTitle,
      search: req.query.search,
    };

    // Extract pagination parameters
    const pagination = {
      page: req.query.page,
      limit: req.query.limit || 20, // Default to 20 for directory
      sortBy: req.query.sortBy,
      sortOrder: req.query.sortOrder,
    };

    // Get directory from service layer
    const result = await employeeService.getEmployeeDirectory(filters, user, pagination);

    // Return success response
    res.status(200).json({
      success: true,
      data: {
        employees: result.employees,
        pagination: result.pagination,
      },
    });
  } catch (error) {
    logger.error('Get employee directory error:', error);

    // Handle custom service errors
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

    // Generic server error
    res.status(500).json({
      success: false,
      error: {
        code: 'GET_DIRECTORY_ERROR',
        message: 'An error occurred while fetching employee directory.',
        timestamp: new Date().toISOString(),
      },
    });
  }
};

/**
 * Get current employee profile
 * GET /api/employees/me
 * Access: All authenticated users
 */
const getCurrentEmployee = async (req, res) => {
  try {
    const { user } = req;

    // Get current employee from service layer
    const employee = await employeeService.getCurrentEmployee(user);

    // Return success response
    res.status(200).json({
      success: true,
      data: {
        employee,
      },
    });
  } catch (error) {
    logger.error('Get current employee error:', error);

    // Handle custom service errors
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

    // Generic server error
    res.status(500).json({
      success: false,
      error: {
        code: 'GET_CURRENT_EMPLOYEE_ERROR',
        message: 'An error occurred while fetching your profile.',
        timestamp: new Date().toISOString(),
      },
    });
  }
};

/**
 * Self-update employee profile (limited fields)
 * PATCH /api/employees/:id/self-update
 * Access: Employee (own profile only)
 */
const selfUpdateEmployee = async (req, res) => {
  try {
    const employeeId = req.params.id;
    const updateData = req.body;
    const { user } = req;

    // Verify user is updating their own profile
    if (!user.employeeId || user.employeeId.toString() !== employeeId) {
      return res.status(403).json({
        success: false,
        error: {
          code: 'FORBIDDEN',
          message: 'You can only update your own profile.',
          timestamp: new Date().toISOString(),
        },
      });
    }

    // Extract request metadata for audit logging
    const metadata = {
      ipAddress: req.ip || req.connection.remoteAddress,
      userAgent: req.get('user-agent'),
    };

    // Self-update employee using service layer
    const employee = await employeeService.selfUpdateEmployee(updateData, user, metadata);

    // Return success response
    res.status(200).json({
      success: true,
      data: {
        employee,
      },
      message: 'Profile updated successfully.',
    });
  } catch (error) {
    logger.error('Self-update employee error:', error);

    // Handle custom service errors
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

    // Handle validation errors
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

    // Generic server error
    res.status(500).json({
      success: false,
      error: {
        code: 'SELF_UPDATE_ERROR',
        message: 'An error occurred while updating your profile.',
        timestamp: new Date().toISOString(),
      },
    });
  }
};

export default { createEmployee
  , getEmployees
  , getEmployeeById
  , updateEmployee
  , deleteEmployee
  , searchEmployees
  , getEmployeeDirectory
  , getCurrentEmployee
  , selfUpdateEmployee
 };
