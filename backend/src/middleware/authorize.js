import { Employee } from '../models/sequelize/index.js';

/**
 * Role-based access control middleware
 * @param {String[]|String} allowedRoles - Roles that are allowed to access the route
 * @returns {Function} Express middleware function
 */
const authorize = (allowedRoles) => (req, res, next) => {
  // Handle both array and spread arguments
  const roles = Array.isArray(allowedRoles) ? allowedRoles : [allowedRoles];
  // Check if user is authenticated
  if (!req.user) {
    return res.status(401).json({
      success: false,
      error: {
        code: 'UNAUTHORIZED',
        message: 'Authentication required.',
        timestamp: new Date().toISOString(),
      },
    });
  }

  // Check if user has required role
  if (!roles.includes(req.user.role)) {
    return res.status(403).json({
      success: false,
      error: {
        code: 'FORBIDDEN',
        message: 'You do not have permission to access this resource.',
        details: {
          requiredRoles: roles,
          userRole: req.user.role,
        },
        timestamp: new Date().toISOString(),
      },
    });
  }

  next();
};

/**
 * Check if user can access a specific department
 * @param {String} departmentId - Department ID to check access for
 * @param {Object} user - User object from request
 * @returns {Boolean} True if user can access the department
 */
const canAccessDepartment = (departmentId, user) => {
  // SuperAdmin can access all departments
  if (user.role === 'SuperAdmin') {
    return true;
  }

  // HR can access all departments (HR Administrator level)
  if (user.role === 'HR') {
    return true;
  }

  // HR_Manager can only access assigned departments
  if (user.role === 'HR_Manager') {
    if (!user.assignedDepartments || user.assignedDepartments.length === 0) {
      return false;
    }
    return user.assignedDepartments.some(
      (dept) => dept.toString() === departmentId.toString(),
    );
  }

  // Employees cannot access department-level resources
  return false;
};

/**
 * Middleware to check department access for HR Managers
 * Validates that HR Manager can only access employees in their assigned departments
 */
const checkDepartmentAccess = async (req, res, next) => {
  try {
    // SuperAdmin and HR have access to all departments
    if (req.user.role === 'SuperAdmin' || req.user.role === 'HR') {
      return next();
    }

    // For HR_Manager, check department access
    if (req.user.role === 'HR_Manager') {
      // Get employee ID from request params or body
      const employeeId = req.params.id || req.params.employeeId || req.body.employeeId;

      if (!employeeId) {
        // If no employee ID, check if department filter is applied
        if (req.query.department) {
          if (!canAccessDepartment(req.query.department, req.user)) {
            return res.status(403).json({
              success: false,
              error: {
                code: 'DEPARTMENT_ACCESS_DENIED',
                message: 'You do not have access to this department.',
                timestamp: new Date().toISOString(),
              },
            });
          }
        }
        return next();
      }

      // Fetch employee to check department
      const employee = await Employee.findByPk(employeeId, {
        attributes: ['jobInfo']
      });

      if (!employee) {
        return res.status(404).json({
          success: false,
          error: {
            code: 'EMPLOYEE_NOT_FOUND',
            message: 'Employee not found.',
            timestamp: new Date().toISOString(),
          },
        });
      }

      // Check if HR Manager can access this employee's department
      if (!canAccessDepartment(employee.jobInfo.department, req.user)) {
        return res.status(403).json({
          success: false,
          error: {
            code: 'DEPARTMENT_ACCESS_DENIED',
            message: 'You do not have access to employees in this department.',
            timestamp: new Date().toISOString(),
          },
        });
      }
    }

    next();
  } catch (error) {
    console.error('Department access check error:', error);
    return res.status(500).json({
      success: false,
      error: {
        code: 'AUTHORIZATION_ERROR',
        message: 'An error occurred while checking department access.',
        timestamp: new Date().toISOString(),
      },
    });
  }
};

/**
 * Middleware to filter query results based on user's department scope
 * Adds department filter to query for HR Managers
 */
const applyDepartmentScope = (req, res, next) => {
  // SuperAdmin and HR can see all employees
  if (req.user.role === 'SuperAdmin' || req.user.role === 'HR') {
    return next();
  }

  // HR_Manager can only see employees in their assigned departments
  if (req.user.role === 'HR_Manager') {
    if (!req.user.assignedDepartments || req.user.assignedDepartments.length === 0) {
      return res.status(403).json({
        success: false,
        error: {
          code: 'NO_DEPARTMENTS_ASSIGNED',
          message: 'You do not have any departments assigned.',
          timestamp: new Date().toISOString(),
        },
      });
    }

    // Add department filter to query
    req.departmentFilter = {
      'jobInfo.department': { $in: req.user.assignedDepartments },
    };
  }

  // Employees can only see their own profile
  if (req.user.role === 'Employee') {
    if (!req.user.employee?.id) {
      return res.status(403).json({
        success: false,
        error: {
          code: 'NO_EMPLOYEE_PROFILE',
          message: 'You do not have an employee profile linked.',
          timestamp: new Date().toISOString(),
        },
      });
    }

    // Add employee filter to query
    req.employeeFilter = {
      _id: req.user.employee?.id,
    };
  }

  next();
};

/**
 * Middleware to check if user can access their own resource or has admin privileges
 * @param {String} paramName - Name of the parameter containing the resource ID (default: 'id')
 */
const checkSelfOrAdmin = (paramName = 'id') => async (req, res, next) => {
  try {
    const resourceId = req.params[paramName];

    // Admin roles can access any resource
    if (['SuperAdmin', 'HR', 'HR_Manager'].includes(req.user.role)) {
      return next();
    }

    // Employees can only access their own resources
    if (req.user.role === 'Employee') {
      // Check if the resource belongs to the user
      if (req.user.employee?.id && req.user.employee?.id.toString() === resourceId) {
        return next();
      }

      return res.status(403).json({
        success: false,
        error: {
          code: 'FORBIDDEN',
          message: 'You can only access your own resources.',
          timestamp: new Date().toISOString(),
        },
      });
    }

    next();
  } catch (error) {
    console.error('Self or admin check error:', error);
    return res.status(500).json({
      success: false,
      error: {
        code: 'AUTHORIZATION_ERROR',
        message: 'An error occurred while checking resource access.',
        timestamp: new Date().toISOString(),
      },
    });
  }
};

export {
  authorize,
  canAccessDepartment,
  checkDepartmentAccess,
  applyDepartmentScope,
  checkSelfOrAdmin,
};
