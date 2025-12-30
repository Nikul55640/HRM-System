/**
 * Leave Request Controller (Admin)
 * Handles leave request management for HR and Super Admin
 */

import leaveRequestService from '../../services/admin/leaveRequest.service.js';
import logger from '../../utils/logger.js';

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

const leaveRequestController = {
  /**
   * Get all leave requests with filtering (Super Admin & HR)
   */
  getLeaveRequests: async (req, res) => {
    try {
      const result = await leaveRequestService.getLeaveRequests(req.query, req.user, req.query);

      if (!result.success) {
        const statusCode = result.message.includes('Unauthorized') ? 403 : 400;
        return sendResponse(res, false, result.message, null, statusCode);
      }

      return sendResponse(res, true, "Leave requests retrieved successfully", result.data.leaveRequests, 200, result.data.pagination);
    } catch (error) {
      logger.error("Controller: Get Leave Requests Error", error);
      return sendResponse(res, false, "Internal server error", null, 500);
    }
  },

  /**
   * Get leave request by ID
   */
  getLeaveRequestById: async (req, res) => {
    try {
      const { id } = req.params;
      const result = await leaveRequestService.getLeaveRequestById(id);

      if (!result.success) {
        const statusCode = result.message.includes('not found') ? 404 : 400;
        return sendResponse(res, false, result.message, null, statusCode);
      }

      return sendResponse(res, true, "Leave request retrieved successfully", result.data);
    } catch (error) {
      logger.error("Controller: Get Leave Request By ID Error", error);
      return sendResponse(res, false, "Internal server error", null, 500);
    }
  },

  /**
   * Approve leave request (HR & Super Admin)
   */
  approveLeaveRequest: async (req, res) => {
    try {
      const { id } = req.params;
      const { comments } = req.body;
      const metadata = {
        ipAddress: req.ip,
        userAgent: req.headers["user-agent"],
      };

      const result = await leaveRequestService.processLeaveRequest(id, 'approve', comments, req.user, metadata);

      if (!result.success) {
        const statusCode = result.message.includes('Unauthorized') ? 403 :
          result.message.includes('not found') ? 404 : 400;
        return sendResponse(res, false, result.message, null, statusCode);
      }

      return sendResponse(res, true, result.message, result.data);
    } catch (error) {
      logger.error("Controller: Approve Leave Request Error", error);
      return sendResponse(res, false, "Internal server error", null, 500);
    }
  },

  /**
   * Reject leave request (HR & Super Admin)
   */
  rejectLeaveRequest: async (req, res) => {
    try {
      const { id } = req.params;
      const { comments } = req.body;
      const metadata = {
        ipAddress: req.ip,
        userAgent: req.headers["user-agent"],
      };

      const result = await leaveRequestService.processLeaveRequest(id, 'reject', comments, req.user, metadata);

      if (!result.success) {
        const statusCode = result.message.includes('Unauthorized') ? 403 :
          result.message.includes('not found') ? 404 : 400;
        return sendResponse(res, false, result.message, null, statusCode);
      }

      return sendResponse(res, true, result.message, result.data);
    } catch (error) {
      logger.error("Controller: Reject Leave Request Error", error);
      return sendResponse(res, false, "Internal server error", null, 500);
    }
  },

  /**
   * Cancel leave request (HR & Super Admin can cancel any, Employee can cancel own)
   */
  cancelLeaveRequest: async (req, res) => {
    try {
      const { id } = req.params;
      const { reason } = req.body;
      const metadata = {
        ipAddress: req.ip,
        userAgent: req.headers["user-agent"],
      };

      const result = await leaveRequestService.cancelLeaveRequest(id, reason, req.user, metadata);

      if (!result.success) {
        const statusCode = result.message.includes('permission') || result.message.includes('only cancel') ? 403 :
          result.message.includes('not found') ? 404 : 400;
        return sendResponse(res, false, result.message, null, statusCode);
      }

      return sendResponse(res, true, result.message);
    } catch (error) {
      logger.error("Controller: Cancel Leave Request Error", error);
      return sendResponse(res, false, "Internal server error", null, 500);
    }
  },

  /**
   * Override leave request decision (Super Admin only)
   */
  overrideLeaveRequest: async (req, res) => {
    try {
      const { id } = req.params;
      const { action, reason } = req.body; // action: 'approve' or 'reject'
      const metadata = {
        ipAddress: req.ip,
        userAgent: req.headers["user-agent"],
      };

      const result = await leaveRequestService.overrideLeaveRequest(id, action, reason, req.user, metadata);

      if (!result.success) {
        const statusCode = result.message.includes('Unauthorized') ? 403 :
          result.message.includes('not found') ? 404 : 400;
        return sendResponse(res, false, result.message, null, statusCode);
      }

      return sendResponse(res, true, result.message, result.data);
    } catch (error) {
      logger.error("Controller: Override Leave Request Error", error);
      return sendResponse(res, false, "Internal server error", null, 500);
    }
  },

  /**
   * Get leave requests for specific employee
   */
  getEmployeeLeaveRequests: async (req, res) => {
    try {
      const { employeeId } = req.params;
      const result = await leaveRequestService.getEmployeeLeaveRequests(employeeId, req.query, req.user, req.query);

      if (!result.success) {
        const statusCode = result.message.includes('access') || result.message.includes('only view your own') ? 403 : 400;
        return sendResponse(res, false, result.message, null, statusCode);
      }

      return sendResponse(res, true, "Employee leave requests retrieved successfully", result.data.leaveRequests, 200, result.data.pagination);
    } catch (error) {
      logger.error("Controller: Get Employee Leave Requests Error", error);
      return sendResponse(res, false, "Internal server error", null, 500);
    }
  },

  /**
   * Get leave request statistics
   */
  getLeaveRequestStats: async (req, res) => {
    try {
      const result = await leaveRequestService.getLeaveRequestStats(req.query, req.user);

      if (!result.success) {
        const statusCode = result.message.includes('Unauthorized') ? 403 : 400;
        return sendResponse(res, false, result.message, null, statusCode);
      }

      return sendResponse(res, true, "Leave request statistics retrieved successfully", result.data);
    } catch (error) {
      logger.error("Controller: Get Leave Request Stats Error", error);
      return sendResponse(res, false, "Internal server error", null, 500);
    }
  },

  /**
   * Get pending leave requests (HR & Super Admin)
   */
  getPendingLeaveRequests: async (req, res) => {
    try {
      const filters = {
        ...req.query,
        status: 'pending'
      };

      const result = await leaveRequestService.getLeaveRequests(filters, req.user, req.query);

      if (!result.success) {
        const statusCode = result.message.includes('Unauthorized') ? 403 : 400;
        return sendResponse(res, false, result.message, null, statusCode);
      }

      return sendResponse(res, true, "Pending leave requests retrieved successfully", result.data.leaveRequests, 200, result.data.pagination);
    } catch (error) {
      logger.error("Controller: Get Pending Leave Requests Error", error);
      return sendResponse(res, false, "Internal server error", null, 500);
    }
  },

  /**
   * Get leave usage report
   */
  getLeaveUsageReport: async (req, res) => {
    try {
      const { year, department, leaveType } = req.query;

      const filters = {
        year: year || new Date().getFullYear(),
        department,
        leaveType,
        status: 'approved' // Only approved leaves for usage report
      };

      const result = await leaveRequestService.getLeaveRequests(filters, req.user, { limit: 100 });

      if (!result.success) {
        const statusCode = result.message.includes('Unauthorized') ? 403 : 400;
        return sendResponse(res, false, result.message, null, statusCode);
      }

      // Calculate usage statistics
      const usageStats = {
        totalApprovedRequests: result.data.leaveRequests.length,
        totalDaysUsed: result.data.leaveRequests.reduce((sum, req) => sum + req.totalDays, 0),
        byLeaveType: {},
        byDepartment: {},
        byMonth: {}
      };

      // Group by leave type
      result.data.leaveRequests.forEach(request => {
        if (!usageStats.byLeaveType[request.leaveType]) {
          usageStats.byLeaveType[request.leaveType] = { requests: 0, days: 0 };
        }
        usageStats.byLeaveType[request.leaveType].requests++;
        usageStats.byLeaveType[request.leaveType].days += request.totalDays;

        // Group by department
        const dept = request.employee.department || 'Unknown';
        if (!usageStats.byDepartment[dept]) {
          usageStats.byDepartment[dept] = { requests: 0, days: 0 };
        }
        usageStats.byDepartment[dept].requests++;
        usageStats.byDepartment[dept].days += request.totalDays;

        // Group by month
        const month = new Date(request.startDate).toISOString().substring(0, 7); // YYYY-MM
        if (!usageStats.byMonth[month]) {
          usageStats.byMonth[month] = { requests: 0, days: 0 };
        }
        usageStats.byMonth[month].requests++;
        usageStats.byMonth[month].days += request.totalDays;
      });

      return sendResponse(res, true, "Leave usage report retrieved successfully", {
        statistics: usageStats,
        details: result.data.leaveRequests
      });
    } catch (error) {
      logger.error("Controller: Get Leave Usage Report Error", error);
      return sendResponse(res, false, "Internal server error", null, 500);
    }
  }
};

export default leaveRequestController;