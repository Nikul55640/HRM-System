/**
 * Leave Balance Rollover Controller
 * Handles manual leave balance rollover operations for admins
 */

import DefaultLeaveBalanceService from '../../services/admin/defaultLeaveBalance.service.js';
import LeaveBalanceRolloverService from '../../services/cron/leaveBalanceRollover.service.js';
import logger from '../../utils/logger.js';
import { ROLES } from '../../config/rolePermissions.js';

/**
 * Wrapper for consistent API responses
 */
const sendResponse = (res, success, message, data = null, statusCode = 200) => {
  return res.status(statusCode).json({
    success,
    message,
    data,
  });
};

const leaveBalanceRolloverController = {
  /**
   * Perform manual year-end rollover
   * @route POST /api/admin/leave-balance-rollover/perform
   * @access Super Admin only
   */
  performRollover: async (req, res) => {
    try {
      // Only Super Admin can perform rollover
      if (req.user.role !== ROLES.SUPER_ADMIN) {
        return sendResponse(res, false, "Unauthorized: Only Super Admin can perform leave balance rollover", null, 403);
      }

      const { year } = req.body;
      const targetYear = year || new Date().getFullYear();

      logger.info(`Manual rollover requested by user ${req.user.id} for year ${targetYear}`);

      const result = await LeaveBalanceRolloverService.manualRollover(targetYear, req.user.id);

      if (result.success) {
        return sendResponse(res, true, result.message, {
          year: targetYear,
          employeesProcessed: result.processedEmployees,
          balancesCreated: result.totalCreated,
          balancesSkipped: result.totalSkipped,
          errors: result.errors || [],
          alreadyPerformed: result.alreadyPerformed || false
        });
      } else {
        return sendResponse(res, false, result.message, null, 400);
      }

    } catch (error) {
      logger.error("Controller: Perform Rollover Error", error);
      return sendResponse(res, false, "Internal server error", null, 500);
    }
  },

  /**
   * Get rollover status for a specific year
   * @route GET /api/admin/leave-balance-rollover/status
   * @access Super Admin and HR Admin
   */
  getRolloverStatus: async (req, res) => {
    try {
      // Only Super Admin and HR Admin can check status
      if (req.user.role !== ROLES.SUPER_ADMIN && req.user.role !== ROLES.HR_ADMIN) {
        return sendResponse(res, false, "Unauthorized: Only Super Admin and HR Admin can check rollover status", null, 403);
      }

      const { year } = req.query;
      const targetYear = year ? parseInt(year) : new Date().getFullYear();

      // Get employees without leave balances for the year
      const employeesWithoutBalances = await DefaultLeaveBalanceService.getEmployeesWithoutLeaveBalances(targetYear);

      // Get cron job status
      const cronStatus = LeaveBalanceRolloverService.getStatus();

      const status = {
        year: targetYear,
        rolloverCompleted: employeesWithoutBalances.length === 0,
        employeesWithoutBalances: employeesWithoutBalances.length,
        employeesNeedingRollover: employeesWithoutBalances.map(emp => ({
          id: emp.id,
          name: `${emp.firstName} ${emp.lastName}`,
          employeeId: emp.employeeId
        })),
        cronJob: cronStatus,
        nextAutomaticRollover: 'January 1st, 00:01 AM UTC'
      };

      return sendResponse(res, true, "Rollover status retrieved successfully", status);

    } catch (error) {
      logger.error("Controller: Get Rollover Status Error", error);
      return sendResponse(res, false, "Internal server error", null, 500);
    }
  },

  /**
   * Assign default balances to specific employees
   * @route POST /api/admin/leave-balance-rollover/assign-employee
   * @access Super Admin and HR Admin
   */
  assignToEmployee: async (req, res) => {
    try {
      // Only Super Admin and HR Admin can assign balances
      if (req.user.role !== ROLES.SUPER_ADMIN && req.user.role !== ROLES.HR_ADMIN) {
        return sendResponse(res, false, "Unauthorized: Only Super Admin and HR Admin can assign leave balances", null, 403);
      }

      const { employeeId, year } = req.body;
      const targetYear = year || new Date().getFullYear();

      if (!employeeId) {
        return sendResponse(res, false, "Employee ID is required", null, 400);
      }

      const result = await DefaultLeaveBalanceService.assignDefaultBalancesToEmployee(
        employeeId,
        targetYear,
        req.user.id
      );

      if (result.success) {
        return sendResponse(res, true, result.message, {
          employeeId: result.employeeId,
          year: result.year,
          balancesCreated: result.created.length,
          balancesSkipped: result.skipped.length,
          createdBalances: result.created.map(balance => ({
            leaveType: balance.leaveType,
            allocated: balance.allocated,
            remaining: balance.remaining
          }))
        });
      } else {
        return sendResponse(res, false, result.message, null, 400);
      }

    } catch (error) {
      logger.error("Controller: Assign to Employee Error", error);
      return sendResponse(res, false, "Internal server error", null, 500);
    }
  },

  /**
   * Get default leave balance configuration
   * @route GET /api/admin/leave-balance-rollover/default-config
   * @access Super Admin and HR Admin
   */
  getDefaultConfig: async (req, res) => {
    try {
      // Only Super Admin and HR Admin can view config
      if (req.user.role !== ROLES.SUPER_ADMIN && req.user.role !== ROLES.HR_ADMIN) {
        return sendResponse(res, false, "Unauthorized: Only Super Admin and HR Admin can view default configuration", null, 403);
      }

      const config = {
        defaultLeaveTypes: DefaultLeaveBalanceService.DEFAULT_LEAVE_TYPES,
        automaticRollover: {
          enabled: true,
          schedule: 'January 1st at 00:01 AM UTC every year',
          description: 'Automatically assigns default leave balances to all employees at the start of each year'
        },
        newEmployeeAssignment: {
          enabled: true,
          description: 'Automatically assigns default leave balances when a new employee is created'
        }
      };

      return sendResponse(res, true, "Default configuration retrieved successfully", config);

    } catch (error) {
      logger.error("Controller: Get Default Config Error", error);
      return sendResponse(res, false, "Internal server error", null, 500);
    }
  }
};

export default leaveBalanceRolloverController;