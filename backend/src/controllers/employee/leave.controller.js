/**
 * Employee Leave Controller
 * Handles employee self-service leave operations (Apply, View, Cancel)
 */

import leaveRequestService from '../../services/admin/leaveRequest.service.js';
import leaveBalanceService from '../../services/admin/leaveBalance.service.js';
import notificationService from '../../services/notificationService.js';
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

const employeeLeaveController = {
  /**
   * Apply for leave
   */
  applyForLeave: async (req, res) => {
    try {
      const metadata = {
        ipAddress: req.ip,
        userAgent: req.headers["user-agent"],
      };

      const result = await leaveRequestService.applyForLeave(req.body, req.user, metadata);

      if (!result.success) {
        return sendResponse(res, false, result.message, null, 400);
      }

      // 🔔 Send notification to HR and Admin about new leave application
      try {
        const leaveRequest = result.data;
        const adminRoles = ['HR', 'SuperAdmin', 'HR_ADMIN', 'SUPER_ADMIN', 'HR_MANAGER'];
        await notificationService.sendToRoles(adminRoles, {
          title: 'New Leave Application 📝',
          message: `${req.user.firstName} ${req.user.lastName} has applied for ${leaveRequest.leaveType} leave from ${new Date(leaveRequest.startDate).toLocaleDateString()} to ${new Date(leaveRequest.endDate).toLocaleDateString()}`,
          type: 'info',
          category: 'leave',
          metadata: {
            leaveRequestId: leaveRequest.id,
            employeeId: req.user.employeeId,
            employeeName: `${req.user.firstName} ${req.user.lastName}`,
            leaveType: leaveRequest.leaveType,
            startDate: leaveRequest.startDate,
            endDate: leaveRequest.endDate,
            totalDays: leaveRequest.totalDays,
            reason: leaveRequest.reason
          }
        });

        // Also send confirmation to employee
        await notificationService.sendToUser(req.user.id, {
          title: 'Leave Application Submitted ✅',
          message: `Your ${leaveRequest.leaveType} leave application has been submitted successfully and is pending approval.`,
          type: 'success',
          category: 'leave',
          metadata: {
            leaveRequestId: leaveRequest.id,
            leaveType: leaveRequest.leaveType,
            startDate: leaveRequest.startDate,
            endDate: leaveRequest.endDate,
            totalDays: leaveRequest.totalDays
          }
        });
      } catch (notificationError) {
        logger.error("Failed to send leave application notification:", notificationError);
        // Don't fail the main operation if notification fails
      }

      return sendResponse(res, true, result.message, result.data, 201);
    } catch (error) {
      logger.error("Controller: Apply For Leave Error", error);
      return sendResponse(res, false, "Internal server error", null, 500);
    }
  },

  /**
   * Get my leave requests
   */
  getMyLeaveRequests: async (req, res) => {
    try {
      const result = await leaveRequestService.getEmployeeLeaveRequests(
        req.user.employee?.id,
        req.query,
        req.user,
        req.query
      );

      if (!result.success) {
        return sendResponse(res, false, result.message, null, 400);
      }

      return sendResponse(res, true, "Your leave requests retrieved successfully", result.data.leaveRequests, 200, result.data.pagination);
    } catch (error) {
      logger.error("Controller: Get My Leave Requests Error", error);
      return sendResponse(res, false, "Internal server error", null, 500);
    }
  },

  /**
   * Get my leave balances
   */
  getMyLeaveBalances: async (req, res) => {
    try {
      const { year } = req.query;
      const result = await leaveBalanceService.getEmployeeLeaveBalances(
        req.user.employee?.id,
        year,
        req.user
      );

      if (!result.success) {
        return sendResponse(res, false, result.message, null, 400);
      }

      return sendResponse(res, true, "Your leave balances retrieved successfully", result.data);
    } catch (error) {
      logger.error("Controller: Get My Leave Balances Error", error);
      return sendResponse(res, false, "Internal server error", null, 500);
    }
  },

  /**
   * Cancel my leave request
   */
  cancelMyLeaveRequest: async (req, res) => {
    try {
      const { id } = req.params;
      const { reason } = req.body;
      const metadata = {
        ipAddress: req.ip,
        userAgent: req.headers["user-agent"],
      };

      const result = await leaveRequestService.cancelLeaveRequest(id, reason, req.user, metadata);

      if (!result.success) {
        const statusCode = result.message.includes('only cancel your own') ? 403 :
          result.message.includes('not found') ? 404 : 400;
        return sendResponse(res, false, result.message, null, statusCode);
      }

      return sendResponse(res, true, result.message);
    } catch (error) {
      logger.error("Controller: Cancel My Leave Request Error", error);
      return sendResponse(res, false, "Internal server error", null, 500);
    }
  },

  /**
   * Get leave request status
   */
  getLeaveRequestStatus: async (req, res) => {
    try {
      const { id } = req.params;

      // First check if this request belongs to the current user
      const result = await leaveRequestService.getEmployeeLeaveRequests(
        req.user.employee?.id,
        { requestId: id },
        req.user,
        { limit: 1 }
      );

      if (!result.success) {
        return sendResponse(res, false, result.message, null, 400);
      }

      const request = result.data.leaveRequests.find(req => req.id.toString() === id);

      if (!request) {
        return sendResponse(res, false, "Leave request not found or access denied", null, 404);
      }

      return sendResponse(res, true, "Leave request status retrieved successfully", request);
    } catch (error) {
      logger.error("Controller: Get Leave Request Status Error", error);
      return sendResponse(res, false, "Internal server error", null, 500);
    }
  },

  /**
   * Get leave history
   */
  getMyLeaveHistory: async (req, res) => {
    try {
      const { year } = req.query;
      const filters = year ? { year: parseInt(year) } : {};

      const result = await leaveRequestService.getEmployeeLeaveRequests(
        req.user.employee?.id,
        filters,
        req.user,
        { ...req.query, limit: 100 }
      );

      if (!result.success) {
        return sendResponse(res, false, result.message, null, 400);
      }

      // Group by year and calculate statistics
      const history = {};
      result.data.leaveRequests.forEach(request => {
        const requestYear = new Date(request.startDate).getFullYear();
        if (!history[requestYear]) {
          history[requestYear] = {
            year: requestYear,
            requests: [],
            statistics: {
              total: 0,
              approved: 0,
              rejected: 0,
              pending: 0,
              cancelled: 0,
              totalDays: 0,
              approvedDays: 0
            }
          };
        }

        history[requestYear].requests.push(request);
        history[requestYear].statistics.total++;
        history[requestYear].statistics[request.status]++;
        history[requestYear].statistics.totalDays += request.totalDays;

        if (request.status === 'approved') {
          history[requestYear].statistics.approvedDays += request.totalDays;
        }
      });

      return sendResponse(res, true, "Leave history retrieved successfully", Object.values(history));
    } catch (error) {
      logger.error("Controller: Get My Leave History Error", error);
      return sendResponse(res, false, "Internal server error", null, 500);
    }
  },

  /**
   * Get leave balance updates/history
   */
  getMyLeaveBalanceHistory: async (req, res) => {
    try {
      const result = await leaveBalanceService.getLeaveBalanceHistory(
        req.user.employee?.id,
        req.query,
        req.user
      );

      if (!result.success) {
        return sendResponse(res, false, result.message, null, 400);
      }

      return sendResponse(res, true, "Leave balance history retrieved successfully", result.data);
    } catch (error) {
      logger.error("Controller: Get My Leave Balance History Error", error);
      return sendResponse(res, false, "Internal server error", null, 500);
    }
  },

  /**
   * Check leave eligibility
   */
  checkLeaveEligibility: async (req, res) => {
    try {
      const { leaveType, startDate, endDate, isHalfDay } = req.query;

      if (!leaveType || !startDate || !endDate) {
        return sendResponse(res, false, "Leave type, start date, and end date are required", null, 400);
      }

      // Calculate requested days
      const start = new Date(startDate);
      const end = new Date(endDate);
      const requestedDays = isHalfDay === 'true' ? 0.5 : Math.ceil((end - start) / (1000 * 60 * 60 * 24)) + 1;

      // Get current leave balance
      const balanceResult = await leaveBalanceService.getEmployeeLeaveBalances(
        req.user.employee?.id,
        new Date().getFullYear(),
        req.user
      );

      if (!balanceResult.success) {
        return sendResponse(res, false, balanceResult.message, null, 400);
      }

      const balance = balanceResult.data.find(b => b.leaveType === leaveType);

      if (!balance) {
        return sendResponse(res, false, `No leave balance found for ${leaveType} leave`, null, 400);
      }

      const eligibility = {
        isEligible: balance.remaining >= requestedDays,
        requestedDays,
        availableDays: balance.remaining,
        shortfall: Math.max(0, requestedDays - balance.remaining),
        leaveType,
        balance: {
          allocated: balance.allocated,
          used: balance.used,
          pending: balance.pending,
          remaining: balance.remaining
        }
      };

      return sendResponse(res, true, "Leave eligibility checked successfully", eligibility);
    } catch (error) {
      logger.error("Controller: Check Leave Eligibility Error", error);
      return sendResponse(res, false, "Internal server error", null, 500);
    }
  },

  /**
   * Get pending leave requests (my own)
   */
  getMyPendingLeaveRequests: async (req, res) => {
    try {
      const filters = {
        ...req.query,
        status: 'pending'
      };

      const result = await leaveRequestService.getEmployeeLeaveRequests(
        req.user.employee?.id,
        filters,
        req.user,
        req.query
      );

      if (!result.success) {
        return sendResponse(res, false, result.message, null, 400);
      }

      return sendResponse(res, true, "Your pending leave requests retrieved successfully", result.data.leaveRequests, 200, result.data.pagination);
    } catch (error) {
      logger.error("Controller: Get My Pending Leave Requests Error", error);
      return sendResponse(res, false, "Internal server error", null, 500);
    }
  },

  /**
   * Export leave balance summary
   */
  exportLeaveBalance: async (req, res) => {
    try {
      const { year = new Date().getFullYear() } = req.query;
      
      const result = await leaveBalanceService.getEmployeeLeaveBalances(
        req.user.employee?.id,
        year,
        req.user
      );

      if (!result.success) {
        return sendResponse(res, false, result.message, null, 400);
      }

      // Create CSV content from the formatted data
      const csvHeader = 'Leave Type,Allocated,Used,Pending,Remaining\n';
      const csvRows = result.data.leaveTypes.map(balance => 
        `${balance.type},${balance.allocated},${balance.used},${balance.pending},${balance.remaining}`
      ).join('\n');
      
      const csvContent = csvHeader + csvRows;

      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename="leave-balance-${year}.csv"`);
      
      return res.send(csvContent);
    } catch (error) {
      logger.error("Controller: Export Leave Balance Error", error);
      return sendResponse(res, false, "Internal server error", null, 500);
    }
  }
};

export default employeeLeaveController;