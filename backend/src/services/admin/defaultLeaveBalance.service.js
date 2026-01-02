/**
 * Default Leave Balance Service
 * Handles automatic assignment of default leave balances for new employees and year changes
 */

import { LeaveBalance, Employee } from '../../models/index.js';
import logger from '../../utils/logger.js';

class DefaultLeaveBalanceService {
  /**
   * Default leave balance configuration
   */
  static DEFAULT_LEAVE_TYPES = [
    { leaveType: 'Casual', allocated: 12, carryForward: 0 },
    { leaveType: 'Sick', allocated: 12, carryForward: 0 },
    { leaveType: 'Paid', allocated: 21, carryForward: 0 }
  ];

  /**
   * Assign default leave balances to a single employee for a specific year
   * @param {number} employeeId - Employee ID
   * @param {number} year - Year for leave balances
   * @param {number} createdBy - User ID who is creating the balances
   * @returns {Promise<Object>} Result with success status and created balances
   */
  static async assignDefaultBalancesToEmployee(employeeId, year = null, createdBy = 1) {
    try {
      const targetYear = year || new Date().getFullYear();
      const createdBalances = [];
      const skippedBalances = [];

      logger.info(`Assigning default leave balances to employee ${employeeId} for year ${targetYear}`);

      for (const leaveTypeData of this.DEFAULT_LEAVE_TYPES) {
        const [balance, created] = await LeaveBalance.findOrCreate({
          where: {
            employeeId,
            year: targetYear,
            leaveType: leaveTypeData.leaveType
          },
          defaults: {
            employeeId,
            year: targetYear,
            leaveType: leaveTypeData.leaveType,
            allocated: leaveTypeData.allocated,
            carryForward: leaveTypeData.carryForward,
            used: 0,
            pending: 0,
            remaining: leaveTypeData.allocated + leaveTypeData.carryForward,
            createdBy
          }
        });

        if (created) {
          createdBalances.push(balance);
          logger.info(`Created ${leaveTypeData.leaveType} leave balance for employee ${employeeId}: ${leaveTypeData.allocated} days`);
        } else {
          skippedBalances.push(balance);
          logger.info(`${leaveTypeData.leaveType} leave balance already exists for employee ${employeeId}`);
        }
      }

      return {
        success: true,
        employeeId,
        year: targetYear,
        created: createdBalances,
        skipped: skippedBalances,
        message: `Assigned ${createdBalances.length} new leave balances, ${skippedBalances.length} already existed`
      };

    } catch (error) {
      logger.error(`Error assigning default leave balances to employee ${employeeId}:`, error);
      return {
        success: false,
        employeeId,
        error: error.message,
        message: 'Failed to assign default leave balances'
      };
    }
  }

  /**
   * Assign default leave balances to all active employees for a specific year
   * @param {number} year - Year for leave balances
   * @param {number} createdBy - User ID who is creating the balances
   * @returns {Promise<Object>} Result with summary of assignments
   */
  static async assignDefaultBalancesToAllEmployees(year = null, createdBy = 1) {
    try {
      const targetYear = year || new Date().getFullYear();
      logger.info(`Starting bulk assignment of default leave balances for year ${targetYear}`);

      // Get all active employees
      const employees = await Employee.findAll({
        where: { status: 'Active' },
        attributes: ['id', 'firstName', 'lastName', 'employeeId']
      });

      logger.info(`Found ${employees.length} active employees`);

      const results = {
        success: true,
        year: targetYear,
        totalEmployees: employees.length,
        processedEmployees: 0,
        totalCreated: 0,
        totalSkipped: 0,
        employeeResults: [],
        errors: []
      };

      for (const employee of employees) {
        const result = await this.assignDefaultBalancesToEmployee(employee.id, targetYear, createdBy);
        
        results.employeeResults.push({
          employeeId: employee.id,
          employeeName: `${employee.firstName} ${employee.lastName}`,
          ...result
        });

        if (result.success) {
          results.processedEmployees++;
          results.totalCreated += result.created.length;
          results.totalSkipped += result.skipped.length;
        } else {
          results.errors.push({
            employeeId: employee.id,
            employeeName: `${employee.firstName} ${employee.lastName}`,
            error: result.error
          });
        }
      }

      logger.info(`Bulk assignment completed: ${results.processedEmployees}/${results.totalEmployees} employees processed, ${results.totalCreated} balances created, ${results.totalSkipped} skipped`);

      return results;

    } catch (error) {
      logger.error('Error in bulk assignment of default leave balances:', error);
      return {
        success: false,
        error: error.message,
        message: 'Failed to assign default leave balances to employees'
      };
    }
  }

  /**
   * Check if an employee has leave balances for a specific year
   * @param {number} employeeId - Employee ID
   * @param {number} year - Year to check
   * @returns {Promise<boolean>} True if employee has leave balances for the year
   */
  static async hasLeaveBalancesForYear(employeeId, year = null) {
    try {
      const targetYear = year || new Date().getFullYear();
      
      const count = await LeaveBalance.count({
        where: {
          employeeId,
          year: targetYear
        }
      });

      return count > 0;
    } catch (error) {
      logger.error(`Error checking leave balances for employee ${employeeId}:`, error);
      return false;
    }
  }

  /**
   * Get employees who don't have leave balances for a specific year
   * @param {number} year - Year to check
   * @returns {Promise<Array>} Array of employee IDs without leave balances
   */
  static async getEmployeesWithoutLeaveBalances(year = null) {
    try {
      const targetYear = year || new Date().getFullYear();

      // Get all active employees
      const allEmployees = await Employee.findAll({
        where: { status: 'Active' },
        attributes: ['id', 'firstName', 'lastName', 'employeeId']
      });

      // Get employees who have leave balances for the year
      const employeesWithBalances = await LeaveBalance.findAll({
        where: { year: targetYear },
        attributes: ['employeeId'],
        group: ['employeeId']
      });

      const employeeIdsWithBalances = employeesWithBalances.map(lb => lb.employeeId);

      // Filter out employees who already have balances
      const employeesWithoutBalances = allEmployees.filter(
        emp => !employeeIdsWithBalances.includes(emp.id)
      );

      return employeesWithoutBalances;

    } catch (error) {
      logger.error('Error getting employees without leave balances:', error);
      return [];
    }
  }

  /**
   * Automatic year-end rollover: Assign default balances for new year
   * This should be called at the beginning of each year
   * @param {number} newYear - The new year to assign balances for
   * @param {number} createdBy - User ID performing the rollover
   * @returns {Promise<Object>} Rollover result
   */
  static async performYearEndRollover(newYear = null, createdBy = 1) {
    try {
      const targetYear = newYear || new Date().getFullYear();
      logger.info(`Starting year-end rollover for year ${targetYear}`);

      // Check if rollover has already been performed for this year
      const existingBalances = await LeaveBalance.count({
        where: { year: targetYear }
      });

      if (existingBalances > 0) {
        logger.info(`Year-end rollover already performed for ${targetYear}. Found ${existingBalances} existing balances.`);
        return {
          success: true,
          alreadyPerformed: true,
          year: targetYear,
          message: `Year-end rollover already completed for ${targetYear}`
        };
      }

      // Perform bulk assignment for all employees
      const result = await this.assignDefaultBalancesToAllEmployees(targetYear, createdBy);

      logger.info(`Year-end rollover completed for ${targetYear}`);

      return {
        ...result,
        rollover: true,
        message: `Year-end rollover completed for ${targetYear}: ${result.totalCreated} balances created for ${result.processedEmployees} employees`
      };

    } catch (error) {
      logger.error(`Error performing year-end rollover for ${newYear}:`, error);
      return {
        success: false,
        error: error.message,
        message: 'Failed to perform year-end rollover'
      };
    }
  }
}

export default DefaultLeaveBalanceService;