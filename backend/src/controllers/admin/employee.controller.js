/**
 * Employee Controller
 * Handles HTTP requests for employee management according to HRM system requirements
 * Updated for restructured Employee model with integrated profile and bank details
 */

import employeeService from '../../services/admin/employee.service.js';
import logger from '../../utils/logger.js';
import { AuditLog } from '../../models/index.js';

/**
 * Wrapper for consistent API responses
 */
const sendResponse = (res, success, message, data = null, statusCode = 200, pagination = null) => {
  const response = {
    success,
    message,
    data,
  };

  if (pagination) {
    response.pagination = pagination;
  }

  return res.status(statusCode).json(response);
};

const employeeController = {
  /**
   * Create new employee (Super Admin & HR only)
   */
  createEmployee: async (req, res) => {
    try {
      const metadata = {
        ipAddress: req.ip,
        userAgent: req.headers["user-agent"],
      };

      const result = await employeeService.createEmployee(req.body, req.user, metadata);

      if (!result.success) {
        return sendResponse(res, false, result.message, null, 400);
      }

      return sendResponse(res, true, result.message, result.data, 201);
    } catch (error) {
      logger.error("Controller: Create Employee Error", error);
      return sendResponse(res, false, "Internal server error", null, 500);
    }
  },

  /**
   * Update employee (Super Admin & HR only)
   */
  updateEmployee: async (req, res) => {
    try {
      const { id } = req.params;
      const metadata = {
        ipAddress: req.ip,
        userAgent: req.headers["user-agent"],
      };

      const result = await employeeService.updateEmployee(id, req.body, req.user, metadata);

      if (!result.success) {
        const statusCode = result.message.includes('not found') ? 404 :
          result.message.includes('Unauthorized') ? 403 : 400;
        return sendResponse(res, false, result.message, null, statusCode);
      }

      return sendResponse(res, true, result.message, result.data);
    } catch (error) {
      logger.error("Controller: Update Employee Error", error);
      return sendResponse(res, false, "Internal server error", null, 500);
    }
  },

  /**
   * Get employee by ID
   */
  getEmployeeById: async (req, res) => {
    try {
      const { id } = req.params;
      const result = await employeeService.getEmployeeById(id, req.user);

      if (!result.success) {
        const statusCode = result.message.includes('not found') ? 404 :
          result.message.includes('Forbidden') || result.message.includes('Unauthorized') ? 403 : 400;
        return sendResponse(res, false, result.message, null, statusCode);
      }

      return sendResponse(res, true, "Employee retrieved successfully", result.data);
    } catch (error) {
      logger.error("Controller: Get Employee Error", error);
      return sendResponse(res, false, "Internal server error", null, 500);
    }
  },

  /**
   * List employees with filtering and pagination
   */
  getEmployees: async (req, res) => {
    try {
      const result = await employeeService.listEmployees(req.query, req.user, req.query);

      if (!result.success) {
        const statusCode = result.message.includes('Unauthorized') || result.message.includes('NO_DEPARTMENTS_ASSIGNED') ? 403 : 400;
        return sendResponse(res, false, result.message, null, statusCode);
      }

      return sendResponse(res, true, "Employees retrieved successfully", result.data.employees, 200, result.data.pagination);
    } catch (error) {
      logger.error("Controller: Get Employees Error", error);
      return sendResponse(res, false, "Internal server error", null, 500);
    }
  },

  /**
   * Activate/Deactivate employee (Super Admin only)
   */
  toggleEmployeeStatus: async (req, res) => {
    try {
      const { id } = req.params;
      const { isActive } = req.body;
      const metadata = {
        ipAddress: req.ip,
        userAgent: req.headers["user-agent"],
      };

      const result = await employeeService.toggleEmployeeStatus(id, isActive, req.user, metadata);

      if (!result.success) {
        const statusCode = result.message.includes('not found') ? 404 :
          result.message.includes('Unauthorized') ? 403 : 400;
        return sendResponse(res, false, result.message, null, statusCode);
      }

      return sendResponse(res, true, result.message, result.data);
    } catch (error) {
      logger.error("Controller: Toggle Employee Status Error", error);
      return sendResponse(res, false, "Internal server error", null, 500);
    }
  },

  /**
   * Assign system role to employee (Super Admin only)
   */
  assignRole: async (req, res) => {
    try {
      const { id } = req.params;
      const { role } = req.body;
      const metadata = {
        ipAddress: req.ip,
        userAgent: req.headers["user-agent"],
      };

      const result = await employeeService.assignRole(id, role, req.user, metadata);

      if (!result.success) {
        const statusCode = result.message.includes('not found') ? 404 :
          result.message.includes('Unauthorized') ? 403 : 400;
        return sendResponse(res, false, result.message, null, statusCode);
      }

      return sendResponse(res, true, result.message, result.data);
    } catch (error) {
      logger.error("Controller: Assign Role Error", error);
      return sendResponse(res, false, "Internal server error", null, 500);
    }
  },

  /**
   * Get current employee profile
   */
  getCurrentEmployee: async (req, res) => {
    try {
      const result = await employeeService.getCurrentEmployee(req.user);

      if (!result.success) {
        const statusCode = result.message.includes('not found') ? 404 : 400;
        return sendResponse(res, false, result.message, null, statusCode);
      }

      return sendResponse(res, true, "Profile retrieved successfully", result.data);
    } catch (error) {
      logger.error("Controller: Get Current Employee Error", error);
      return sendResponse(res, false, "Internal server error", null, 500);
    }
  },

  /**
   * Self-update employee profile (employees can update limited fields)
   */
  selfUpdateEmployee: async (req, res) => {
    try {
      const metadata = {
        ipAddress: req.ip,
        userAgent: req.headers["user-agent"],
      };

      const result = await employeeService.selfUpdateEmployee(req.body, req.user, metadata);

      if (!result.success) {
        const statusCode = result.message.includes('not found') ? 404 : 400;
        return sendResponse(res, false, result.message, null, statusCode);
      }

      return sendResponse(res, true, result.message, result.data);
    } catch (error) {
      logger.error("Controller: Self Update Employee Error", error);
      return sendResponse(res, false, "Internal server error", null, 500);
    }
  },

  /**
   * Get employee directory (public listing)
   */
  getEmployeeDirectory: async (req, res) => {
    try {
      const result = await employeeService.getEmployeeDirectory(req.query, req.user, req.query);

      if (!result.success) {
        const statusCode = result.message.includes('Unauthorized') || result.message.includes('NO_DEPARTMENTS_ASSIGNED') ? 403 : 400;
        return sendResponse(res, false, result.message, null, statusCode);
      }

      return sendResponse(res, true, "Employee directory retrieved successfully", result.data.employees, 200, result.data.pagination);
    } catch (error) {
      logger.error("Controller: Get Employee Directory Error", error);
      return sendResponse(res, false, "Internal server error", null, 500);
    }
  },

  /**
   * Search employees
   */
  searchEmployees: async (req, res) => {
    try {
      const { q: searchTerm } = req.query;

      if (!searchTerm || searchTerm.trim().length < 2) {
        return sendResponse(res, false, "Search term must be at least 2 characters long", null, 400);
      }

      const result = await employeeService.searchEmployees(searchTerm, req.user, req.query);

      if (!result.success) {
        const statusCode = result.message.includes('Unauthorized') || result.message.includes('NO_DEPARTMENTS_ASSIGNED') ? 403 : 400;
        return sendResponse(res, false, result.message, null, statusCode);
      }

      return sendResponse(res, true, "Search completed successfully", result.data.employees, 200, result.data.pagination);
    } catch (error) {
      logger.error("Controller: Search Employees Error", error);
      return sendResponse(res, false, "Internal server error", null, 500);
    }
  },

  /**
   * Update employee bank details (Employee self-service or HR/Super Admin)
   */
  updateBankDetails: async (req, res) => {
    try {
      const { id } = req.params;
      const metadata = {
        ipAddress: req.ip,
        userAgent: req.headers["user-agent"],
      };

      // Employees can only update their own bank details
      if (req.user.role === 'Employee' && req.user.employee?.id.toString() !== id) {
        return sendResponse(res, false, "You can only update your own bank details", null, 403);
      }

      const updateData = {
        bankDetails: {
          ...req.body,
          isVerified: req.user.role !== 'Employee' ? req.body.isVerified : false // Only HR/Admin can mark as verified
        }
      };

      const result = req.user.role === 'Employee'
        ? await employeeService.selfUpdateEmployee(updateData, req.user, metadata)
        : await employeeService.updateEmployee(id, updateData, req.user, metadata);

      if (!result.success) {
        const statusCode = result.message.includes('not found') ? 404 :
          result.message.includes('Unauthorized') ? 403 : 400;
        return sendResponse(res, false, result.message, null, statusCode);
      }

      return sendResponse(res, true, "Bank details updated successfully", result.data);
    } catch (error) {
      logger.error("Controller: Update Bank Details Error", error);
      return sendResponse(res, false, "Internal server error", null, 500);
    }
  },

  /**
   * Update employee profile picture
   */
  updateProfilePicture: async (req, res) => {
    try {
      const { id } = req.params;
      const metadata = {
        ipAddress: req.ip,
        userAgent: req.headers["user-agent"],
      };

      // Employees can only update their own profile picture
      if (req.user.role === 'Employee' && req.user.employee?.id.toString() !== id) {
        return sendResponse(res, false, "You can only update your own profile picture", null, 403);
      }

      if (!req.file) {
        return sendResponse(res, false, "No profile picture uploaded", null, 400);
      }

      const updateData = {
        profilePicture: req.file.path || req.file.filename
      };

      const result = req.user.role === 'Employee'
        ? await employeeService.selfUpdateEmployee(updateData, req.user, metadata)
        : await employeeService.updateEmployee(id, updateData, req.user, metadata);

      if (!result.success) {
        const statusCode = result.message.includes('not found') ? 404 :
          result.message.includes('Unauthorized') ? 403 : 400;
        return sendResponse(res, false, result.message, null, statusCode);
      }

      return sendResponse(res, true, "Profile picture updated successfully", result.data);
    } catch (error) {
      logger.error("Controller: Update Profile Picture Error", error);
      return sendResponse(res, false, "Internal server error", null, 500);
    }
  },

  /**
   * Update emergency contact information
   */
  updateEmergencyContact: async (req, res) => {
    try {
      const { id } = req.params;
      const metadata = {
        ipAddress: req.ip,
        userAgent: req.headers["user-agent"],
      };

      // Employees can only update their own emergency contact
      if (req.user.role === 'Employee' && req.user.employee?.id.toString() !== id) {
        return sendResponse(res, false, "You can only update your own emergency contact", null, 403);
      }

      const updateData = {
        emergencyContact: req.body
      };

      const result = req.user.role === 'Employee'
        ? await employeeService.selfUpdateEmployee(updateData, req.user, metadata)
        : await employeeService.updateEmployee(id, updateData, req.user, metadata);

      if (!result.success) {
        const statusCode = result.message.includes('not found') ? 404 :
          result.message.includes('Unauthorized') ? 403 : 400;
        return sendResponse(res, false, result.message, null, statusCode);
      }

      return sendResponse(res, true, "Emergency contact updated successfully", result.data);
    } catch (error) {
      logger.error("Controller: Update Emergency Contact Error", error);
      return sendResponse(res, false, "Internal server error", null, 500);
    }
  },

  /**
   * Get employee full profile with all details
   */
  getEmployeeFullProfile: async (req, res) => {
    try {
      const { id } = req.params;
      const result = await employeeService.getEmployeeFullProfile(id, req.user);

      if (!result.success) {
        const statusCode = result.message.includes('not found') ? 404 :
          result.message.includes('Forbidden') || result.message.includes('Unauthorized') ? 403 : 400;
        return sendResponse(res, false, result.message, null, statusCode);
      }

      return sendResponse(res, true, "Employee profile retrieved successfully", result.data);
    } catch (error) {
      logger.error("Controller: Get Employee Full Profile Error", error);
      return sendResponse(res, false, "Internal server error", null, 500);
    }
  },

  /**
   * Get employee reporting structure
   */
  getReportingStructure: async (req, res) => {
    try {
      const { id } = req.params;
      const result = await employeeService.getReportingStructure(id, req.user);

      if (!result.success) {
        const statusCode = result.message.includes('not found') ? 404 :
          result.message.includes('Unauthorized') ? 403 : 400;
        return sendResponse(res, false, result.message, null, statusCode);
      }

      return sendResponse(res, true, "Reporting structure retrieved successfully", result.data);
    } catch (error) {
      logger.error("Controller: Get Reporting Structure Error", error);
      return sendResponse(res, false, "Internal server error", null, 500);
    }
  },
  /**
   * Verify employee bank details (HR & Super Admin only)
   */
  verifyBankDetails: async (req, res) => {
    try {
      const { id } = req.params;
      const { isVerified, verificationNotes } = req.body;
      const metadata = {
        ipAddress: req.ip,
        userAgent: req.headers["user-agent"],
      };

      // Only HR and Super Admin can verify bank details
      if (req.user.role === 'Employee') {
        return sendResponse(res, false, "Unauthorized: Only HR and Super Admin can verify bank details", null, 403);
      }

      const employee = await employeeService.getEmployeeById(id, req.user);
      if (!employee.success) {
        return sendResponse(res, false, employee.message, null, 404);
      }

      const updateData = {
        bankDetails: {
          ...employee.data.bankDetails,
          isVerified,
          verificationNotes,
          verifiedBy: req.user.id,
          verifiedAt: new Date()
        }
      };

      const result = await employeeService.updateEmployee(id, updateData, req.user, metadata);

      if (!result.success) {
        return sendResponse(res, false, result.message, null, 400);
      }

      // Log bank details verification
      await AuditLog.logAction({
        userId: req.user.id,
        action: isVerified ? 'employee_bank_verify' : 'employee_bank_reject',
        module: 'employee',
        targetType: 'Employee',
        targetId: id,
        description: `${isVerified ? 'Verified' : 'Rejected'} bank details for employee ${employee.data.employeeId}`,
        ipAddress: req.ip,
        userAgent: req.headers["user-agent"],
        severity: 'medium'
      });

      return sendResponse(res, true, `Bank details ${isVerified ? 'verified' : 'rejected'} successfully`, result.data);
    } catch (error) {
      logger.error("Controller: Verify Bank Details Error", error);
      return sendResponse(res, false, "Internal server error", null, 500);
    }
  }
};

export default employeeController;