/**
 * Audit Log Controller
 * Handles audit log viewing and filtering for Super Admin
 */

import auditService from "../../services/audit/audit.service.js";
import { ROLES } from "../../config/roles.js";
import logger from "../../utils/logger.js";

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

const auditLogController = {
  /**
   * Get audit logs with filtering (Super Admin only)
   */
  getAuditLogs: async (req, res) => {
    try {
      // Only Super Admin can view audit logs (use systemRole for standardized checks)
      const userRole = req.user.systemRole || req.user.role;
      if (userRole !== ROLES.SUPER_ADMIN) {
        return sendResponse(res, false, "Unauthorized: Only Super Admin can view audit logs", null, 403);
      }

      const result = await auditService.getAuditLogs(req.query);

      const pagination = {
        currentPage: parseInt(req.query.page) || 1,
        totalPages: Math.ceil(result.total / (parseInt(req.query.limit) || 50)),
        totalItems: result.total,
        itemsPerPage: parseInt(req.query.limit) || 50
      };

      return sendResponse(res, true, "Audit logs retrieved successfully", {
        logs: result.logs,
        summary: result.summary
      }, 200, pagination);
    } catch (error) {
      logger.error("Controller: Get Audit Logs Error", error);
      return sendResponse(res, false, "Internal server error", null, 500);
    }
  },

  /**
   * Get audit logs for a specific employee (Super Admin only)
   */
  getEmployeeAuditLogs: async (req, res) => {
    try {
      // Only Super Admin can view audit logs (use systemRole for standardized checks)
      const userRole = req.user.systemRole || req.user.role;
      if (userRole !== ROLES.SUPER_ADMIN) {
        return sendResponse(res, false, "Unauthorized: Only Super Admin can view audit logs", null, 403);
      }

      const { employeeId } = req.params;
      
      // Filter audit logs for this specific employee
      const queryParams = {
        ...req.query,
        targetType: 'Employee',
        targetId: employeeId
      };

      const result = await auditService.getAuditLogs(queryParams);

      const pagination = {
        currentPage: parseInt(req.query.page) || 1,
        totalPages: Math.ceil(result.total / (parseInt(req.query.limit) || 50)),
        totalItems: result.total,
        itemsPerPage: parseInt(req.query.limit) || 50
      };

      return sendResponse(res, true, "Employee audit logs retrieved successfully", {
        logs: result.logs,
        summary: result.summary
      }, 200, pagination);
    } catch (error) {
      logger.error("Controller: Get Employee Audit Logs Error", error);
      return sendResponse(res, false, "Internal server error", null, 500);
    }
  },

  /**
   * Get audit log by ID (Super Admin only)
   */
  getAuditLogById: async (req, res) => {
    try {
      // Only Super Admin can view audit logs (use systemRole for standardized checks)
      const userRole = req.user.systemRole || req.user.role;
      if (userRole !== ROLES.SUPER_ADMIN) {
        return sendResponse(res, false, "Unauthorized: Only Super Admin can view audit logs", null, 403);
      }

      const { id } = req.params;
      const log = await auditService.getAuditLogById(id);

      if (!log) {
        return sendResponse(res, false, "Audit log not found", null, 404);
      }

      return sendResponse(res, true, "Audit log retrieved successfully", log);
    } catch (error) {
      logger.error("Controller: Get Audit Log By ID Error", error);
      return sendResponse(res, false, "Internal server error", null, 500);
    }
  },

  /**
   * Cleanup old audit logs (Super Admin only)
   */
  cleanupAuditLogs: async (req, res) => {
    try {
      // Only Super Admin can cleanup audit logs (use systemRole for standardized checks)
      const userRole = req.user.systemRole || req.user.role;
      if (userRole !== ROLES.SUPER_ADMIN) {
        return sendResponse(res, false, "Unauthorized: Only Super Admin can cleanup audit logs", null, 403);
      }

      const { olderThanDays = 90 } = req.body;
      const deletedCount = await auditService.cleanupAuditLogs(parseInt(olderThanDays));

      return sendResponse(res, true, `Successfully cleaned up ${deletedCount} audit logs older than ${olderThanDays} days`, {
        deletedCount,
        olderThanDays: parseInt(olderThanDays)
      });
    } catch (error) {
      logger.error("Controller: Cleanup Audit Logs Error", error);
      return sendResponse(res, false, "Internal server error", null, 500);
    }
  }
};

export default auditLogController;