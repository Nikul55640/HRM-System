/**
 * Leave Balance Controller (Admin)
 * Handles leave balance assignment and management for HR and Super Admin
 * Updated for restructured LeaveBalance model with enhanced audit logging
 */

import leaveBalanceService from '../../services/admin/leaveBalance.service.js';
import logger from '../../utils/logger.js';
import { AuditLog, Employee, LeaveBalance, User } from '../../models/sequelize/index.js';
import { Op } from 'sequelize';
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

const leaveBalanceController = {
  /**
   * Assign leave balances to employees (HR & Super Admin)
   */
  assignLeaveBalances: async (req, res) => {
    try {
      const metadata = {
        ipAddress: req.ip,
        userAgent: req.headers["user-agent"],
      };

      const result = await leaveBalanceService.assignLeaveBalances(req.body.assignments, req.user, metadata);

      if (!result.success) {
        const statusCode = result.message.includes('Unauthorized') ? 403 : 400;
        return sendResponse(res, false, result.message, null, statusCode);
      }

      return sendResponse(res, true, result.message, result.data);
    } catch (error) {
      logger.error("Controller: Assign Leave Balances Error", error);
      return sendResponse(res, false, "Internal server error", null, 500);
    }
  },

  /**
   * Get employee leave balances
   */
  getEmployeeLeaveBalances: async (req, res) => {
    try {
      const { employeeId } = req.params;
      const { year } = req.query;

      const result = await leaveBalanceService.getEmployeeLeaveBalances(employeeId, year, req.user);

      if (!result.success) {
        const statusCode = result.message.includes('access') || result.message.includes('only view your own') ? 403 : 400;
        return sendResponse(res, false, result.message, null, statusCode);
      }

      return sendResponse(res, true, "Employee leave balances retrieved successfully", result.data);
    } catch (error) {
      logger.error("Controller: Get Employee Leave Balances Error", error);
      return sendResponse(res, false, "Internal server error", null, 500);
    }
  },

  /**
   * Adjust leave balance manually (HR & Super Admin)
   */
  adjustLeaveBalance: async (req, res) => {
    try {
      const { id } = req.params;
      const metadata = {
        ipAddress: req.ip,
        userAgent: req.headers["user-agent"],
      };

      const result = await leaveBalanceService.adjustLeaveBalance(id, req.body, req.user, metadata);

      if (!result.success) {
        const statusCode = result.message.includes('Unauthorized') ? 403 :
          result.message.includes('not found') ? 404 : 400;
        return sendResponse(res, false, result.message, null, statusCode);
      }

      return sendResponse(res, true, result.message, result.data);
    } catch (error) {
      logger.error("Controller: Adjust Leave Balance Error", error);
      return sendResponse(res, false, "Internal server error", null, 500);
    }
  },

  /**
   * Get leave utilization report (Super Admin & HR)
   */
  getLeaveUtilizationReport: async (req, res) => {
    try {
      const result = await leaveBalanceService.getLeaveUtilizationReport(req.query, req.user);

      if (!result.success) {
        const statusCode = result.message.includes('Unauthorized') ? 403 : 400;
        return sendResponse(res, false, result.message, null, statusCode);
      }

      return sendResponse(res, true, "Leave utilization report retrieved successfully", result.data);
    } catch (error) {
      logger.error("Controller: Get Leave Utilization Report Error", error);
      return sendResponse(res, false, "Internal server error", null, 500);
    }
  },

  /**
   * Bulk assign default leave quotas (Super Admin only)
   */
  bulkAssignDefaultQuotas: async (req, res) => {
    try {
      const { employeeIds, year } = req.body;
      const metadata = {
        ipAddress: req.ip,
        userAgent: req.headers["user-agent"],
      };

      if (!employeeIds || !Array.isArray(employeeIds) || employeeIds.length === 0) {
        return sendResponse(res, false, "Employee IDs array is required", null, 400);
      }

      const result = await leaveBalanceService.bulkAssignDefaultQuotas(employeeIds, year, req.user, metadata);

      if (!result.success) {
        const statusCode = result.message.includes('Unauthorized') ? 403 : 400;
        return sendResponse(res, false, result.message, null, statusCode);
      }

      return sendResponse(res, true, result.message, result.data);
    } catch (error) {
      logger.error("Controller: Bulk Assign Default Quotas Error", error);
      return sendResponse(res, false, "Internal server error", null, 500);
    }
  },

  /**
   * Get leave balance history for an employee
   */
  getLeaveBalanceHistory: async (req, res) => {
    try {
      const { employeeId } = req.params;
      const result = await leaveBalanceService.getLeaveBalanceHistory(employeeId, req.query, req.user);

      if (!result.success) {
        const statusCode = result.message.includes('access') || result.message.includes('only view your own') ? 403 : 400;
        return sendResponse(res, false, result.message, null, statusCode);
      }

      return sendResponse(res, true, "Leave balance history retrieved successfully", result.data);
    } catch (error) {
      logger.error("Controller: Get Leave Balance History Error", error);
      return sendResponse(res, false, "Internal server error", null, 500);
    }
  },

  /**
   * Assign leave quota to single employee (HR & Super Admin)
   */
  assignSingleEmployeeQuota: async (req, res) => {
    try {
      const { employeeId } = req.params;
      const { year, leaveBalances } = req.body;
      const metadata = {
        ipAddress: req.ip,
        userAgent: req.headers["user-agent"],
      };

      if (!leaveBalances || !Array.isArray(leaveBalances) || leaveBalances.length === 0) {
        return sendResponse(res, false, "Leave balances array is required", null, 400);
      }

      const assignments = [{
        employeeId,
        year: year || new Date().getFullYear(),
        leaveBalances
      }];

      const result = await leaveBalanceService.assignLeaveBalances(assignments, req.user, metadata);

      if (!result.success) {
        const statusCode = result.message.includes('Unauthorized') ? 403 : 400;
        return sendResponse(res, false, result.message, null, statusCode);
      }

      return sendResponse(res, true, result.message, result.data);
    } catch (error) {
      logger.error("Controller: Assign Single Employee Quota Error", error);
      return sendResponse(res, false, "Internal server error", null, 500);
    }
  },

    /**
     * Get all employees with their leave balances (HR & Super Admin)
     */
    getAllEmployeesLeaveBalances: async (req, res) => {
        try {
            const { year = new Date().getFullYear(), department } = req.query;

            const filters = { year };
            if (department) {
                filters.department = department;
            }

            // First, get all employees (excluding SuperAdmin users)
            let employeeFilter = {};
            if (req.user.role === ROLES.HR_ADMIN && req.user.assignedDepartments?.length > 0) {
                employeeFilter.department = { [Op.in]: req.user.assignedDepartments };
            }

            if (department) {
                employeeFilter.department = department;
            }

            // Get all employees first, excluding those who are SuperAdmin users
            const allEmployees = await Employee.findAll({
                where: employeeFilter,
                attributes: ['id', 'employeeId', 'firstName', 'lastName', 'department', 'designation'],
                include: [
                    {
                        model: User,
                        as: 'user',
                        attributes: ['id', 'role'],
                        where: {
                            role: { [Op.ne]: 'SuperAdmin' } // Exclude SuperAdmin users
                        },
                        required: false // Use LEFT JOIN so employees without users are still included
                    }
                ],
                order: [['department'], ['firstName']]
            });

            // Filter out employees who have SuperAdmin users
            const filteredEmployees = allEmployees.filter(employee => {
                return !employee.user || employee.user.role !== 'SuperAdmin';
            });

            // Get leave balances for these employees
            const leaveBalances = await LeaveBalance.findAll({
                where: {
                    year: filters.year,
                    employeeId: { [Op.in]: filteredEmployees.map(emp => emp.id) }
                },
                include: [
                    {
                        model: Employee,
                        as: 'employee',
                        attributes: ['id', 'employeeId', 'firstName', 'lastName', 'department', 'designation']
                    }
                ],
                order: [['employee', 'department'], ['employee', 'firstName'], ['leaveType']]
            });

            // Format the data for easier consumption
            const employeeBalances = {};
            
            // Initialize all employees with empty balances
            filteredEmployees.forEach(employee => {
                employeeBalances[employee.id] = {
                    employee: {
                        id: employee.id,
                        employeeId: employee.employeeId,
                        firstName: employee.firstName,
                        lastName: employee.lastName,
                        department: employee.department,
                        designation: employee.designation
                    },
                    balances: {}
                };
            });

            // Fill in the leave balances
            leaveBalances.forEach(balance => {
                const empId = balance.employee.id;
                if (employeeBalances[empId]) {
                    employeeBalances[empId].balances[balance.leaveType.toLowerCase()] = {
                        allocated: balance.allocated,
                        used: balance.used,
                        pending: balance.pending,
                        remaining: balance.remaining,
                        carryForward: balance.carryForward
                    };
                }
            });

            // Calculate summary statistics
            const summary = {
                totalEmployees: filteredEmployees.length,
                totalAllocated: leaveBalances.reduce((sum, record) => sum + record.allocated, 0),
                totalUsed: leaveBalances.reduce((sum, record) => sum + record.used, 0),
                totalRemaining: leaveBalances.reduce((sum, record) => sum + record.remaining, 0),
                totalPending: leaveBalances.reduce((sum, record) => sum + record.pending, 0),
                utilizationRate: 0
            };

            if (summary.totalAllocated > 0) {
                summary.utilizationRate = ((summary.totalUsed / summary.totalAllocated) * 100).toFixed(2);
            }

            return sendResponse(res, true, "All employees leave balances retrieved successfully", {
                summary: summary,
                employees: Object.values(employeeBalances)
            });
        } catch (error) {
            logger.error("Controller: Get All Employees Leave Balances Error", error);
            return sendResponse(res, false, "Internal server error", null, 500);
        }
    }
};

export default leaveBalanceController;