/**
 * Leave Balance Service Layer
 * Handles leave balance assignment, adjustment, and management
 */

import { LeaveBalance, Employee, User, AuditLog } from '../../models/index.js';
import { Op } from 'sequelize';
import logger from '../../utils/logger.js';
import { ROLES } from '../../config/rolePermissions.js';

class LeaveBalanceService {
    /**
     * Assign leave balances to employees (HR & Super Admin)
     * @param {Array} assignments - Array of leave balance assignments
     * @param {Object} user - User assigning balances
     * @param {Object} metadata - Request metadata
     * @returns {Promise<Object>} Assignment result
     */
    async assignLeaveBalances(assignments, user, metadata = {}) {
        try {
            // Role-based access control
            if (user.role !== ROLES.SUPER_ADMIN && user.role !== ROLES.HR_ADMIN) {
                throw { message: "Unauthorized: Only Super Admin and HR can assign leave balances", statusCode: 403 };
            }

            const results = [];
            const errors = [];

            for (const assignment of assignments) {
                try {
                    const { employeeId, year, leaveBalances } = assignment;

                    // Check if employee exists and HR has access
                    const employee = await Employee.findByPk(employeeId);
                    if (!employee) {
                        errors.push({ employeeId, error: 'Employee not found' });
                        continue;
                    }

                    // HR can only assign to employees in their departments
                    if (user.role === ROLES.HR_ADMIN) {
                        if (!user.assignedDepartments?.includes(employee.department)) {
                            errors.push({ employeeId, error: 'No permission to assign to this employee' });
                            continue;
                        }
                    }

                    // Assign leave balances
                    const assignedBalances = await LeaveBalance.assignLeaveBalance(
                        employeeId,
                        year || new Date().getFullYear(),
                        leaveBalances,
                        user.id
                    );

                    results.push({
                        employeeId,
                        employee: {
                            id: employee.id,
                            employeeId: employee.employeeId,
                            firstName: employee.firstName,
                            lastName: employee.lastName
                        },
                        balances: assignedBalances
                    });

                    // Log assignment
                    await AuditLog.logAction({
                        userId: user.id,
                        action: 'leave_balance_assign',
                        module: 'leave',
                        targetType: 'LeaveBalance',
                        targetId: employeeId,
                        newValues: { leaveBalances, year },
                        description: `Assigned leave balances to ${employee.firstName} ${employee.lastName}`,
                        ipAddress: metadata.ipAddress,
                        userAgent: metadata.userAgent,
                        severity: 'medium'
                    });

                } catch (error) {
                    logger.error(`Error assigning leave balance for employee ${assignment.employeeId}:`, error);
                    errors.push({ employeeId: assignment.employeeId, error: error.message });
                }
            }

            return {
                success: true,
                data: {
                    successful: results,
                    failed: errors,
                    totalProcessed: assignments.length,
                    successCount: results.length,
                    errorCount: errors.length
                },
                message: `Processed ${assignments.length} assignments. ${results.length} successful, ${errors.length} failed.`
            };
        } catch (error) {
            logger.error('Error in bulk leave balance assignment:', error);
            return {
                success: false,
                message: error.message || 'Failed to assign leave balances',
                error: error.message
            };
        }
    }

    /**
     * Get leave balances for an employee
     * @param {String|Number} employeeId - Employee ID
     * @param {Number} year - Year (optional, defaults to current year)
     * @param {Object} user - User requesting balances
     * @returns {Promise<Object>} Employee's leave balances
     */
    async getEmployeeLeaveBalances(employeeId, year, user) {
        try {
            // Convert both to strings for comparison to avoid type mismatch
            const requestedEmployeeId = employeeId?.toString();
            const userEmployeeId = user.employeeId?.toString();

            // Permission check
            if (user.role === ROLES.EMPLOYEE && userEmployeeId !== requestedEmployeeId) {
                throw { message: "You can only view your own leave balances", statusCode: 403 };
            }

            if (user.role === ROLES.HR_ADMIN) {
                const employee = await Employee.findByPk(employeeId);
                if (!employee || !user.assignedDepartments?.includes(employee.department)) {
                    throw { message: "You don't have access to this employee's data", statusCode: 403 };
                }
            }

            const balances = await LeaveBalance.getEmployeeBalance(
                employeeId,
                year || new Date().getFullYear()
            );

            // Transform the data to match frontend expectations
            const formattedData = {
                leaveTypes: balances.map(balance => ({
                    type: balance.leaveType,
                    allocated: balance.allocated,
                    used: balance.used,
                    pending: balance.pending,
                    remaining: balance.remaining,
                    available: balance.remaining, // available is same as remaining
                    carryForward: balance.carryForward
                }))
            };

            return {
                success: true,
                data: formattedData
            };
        } catch (error) {
            logger.error('Error getting employee leave balances:', error);
            return {
                success: false,
                message: error.message || 'Failed to get leave balances',
                error: error.message
            };
        }
    }

    /**
     * Adjust leave balance manually (HR & Super Admin)
     * @param {String} balanceId - Leave balance ID
     * @param {Object} adjustmentData - Adjustment data
     * @param {Object} user - User making adjustment
     * @param {Object} metadata - Request metadata
     * @returns {Promise<Object>} Adjustment result
     */
    async adjustLeaveBalance(balanceId, adjustmentData, user, metadata = {}) {
        try {
            // Role-based access control
            if (user.role !== ROLES.SUPER_ADMIN && user.role !== ROLES.HR_ADMIN) {
                throw { message: "Unauthorized: Only Super Admin and HR can adjust leave balances", statusCode: 403 };
            }

            const leaveBalance = await LeaveBalance.findByPk(balanceId, {
                include: [
                    {
                        model: Employee,
                        as: 'employee',
                        attributes: ['id', 'employeeId', 'firstName', 'lastName', 'department']
                    }
                ]
            });

            if (!leaveBalance) {
                throw { message: 'Leave balance record not found', statusCode: 404 };
            }

            // HR can only adjust balances for employees in their departments
            if (user.role === ROLES.HR_ADMIN) {
                if (!user.assignedDepartments?.includes(leaveBalance.employee.department)) {
                    throw { message: "You don't have permission to adjust this employee's balance", statusCode: 403 };
                }
            }

            const { adjustmentType, days, reason } = adjustmentData;
            const oldValues = {
                allocated: leaveBalance.allocated,
                used: leaveBalance.used,
                remaining: leaveBalance.remaining
            };

            // Apply adjustment
            if (adjustmentType === 'add_allocated') {
                leaveBalance.allocated += days;
            } else if (adjustmentType === 'subtract_allocated') {
                leaveBalance.allocated = Math.max(0, leaveBalance.allocated - days);
            } else if (adjustmentType === 'add_used') {
                leaveBalance.used += days;
            } else if (adjustmentType === 'subtract_used') {
                leaveBalance.used = Math.max(0, leaveBalance.used - days);
            } else if (adjustmentType === 'set_allocated') {
                leaveBalance.allocated = days;
            } else if (adjustmentType === 'set_used') {
                leaveBalance.used = days;
            }

            // Recalculate remaining
            leaveBalance.remaining = leaveBalance.allocated + leaveBalance.carryForward - leaveBalance.used - leaveBalance.pending;
            leaveBalance.updatedBy = user.id;

            await leaveBalance.save();

            // Log adjustment
            await AuditLog.logAction({
                userId: user.id,
                action: 'leave_balance_adjust',
                module: 'leave',
                targetType: 'LeaveBalance',
                targetId: leaveBalance.id,
                oldValues,
                newValues: {
                    allocated: leaveBalance.allocated,
                    used: leaveBalance.used,
                    remaining: leaveBalance.remaining,
                    adjustmentType,
                    days,
                    reason
                },
                description: `Manually adjusted ${leaveBalance.leaveType} leave balance for ${leaveBalance.employee.firstName} ${leaveBalance.employee.lastName}`,
                ipAddress: metadata.ipAddress,
                userAgent: metadata.userAgent,
                severity: 'high'
            });

            return {
                success: true,
                data: leaveBalance,
                message: 'Leave balance adjusted successfully'
            };
        } catch (error) {
            logger.error('Error adjusting leave balance:', error);
            return {
                success: false,
                message: error.message || 'Failed to adjust leave balance',
                error: error.message
            };
        }
    }

    /**
     * Get leave utilization report (Super Admin & HR)
     * @param {Object} filters - Filter criteria
     * @param {Object} user - User requesting report
     * @returns {Promise<Object>} Leave utilization report
     */
    async getLeaveUtilizationReport(filters = {}, user) {
        try {
            // Role-based access control
            if (user.role !== ROLES.SUPER_ADMIN && user.role !== ROLES.HR_ADMIN) {
                throw { message: "Unauthorized: Only Super Admin and HR can view utilization reports", statusCode: 403 };
            }

            const { year = new Date().getFullYear(), department, leaveType } = filters;

            // Build where clause
            const whereClause = { year };
            if (leaveType) {
                whereClause.leaveType = leaveType;
            }

            // Build employee filter for HR
            let employeeFilter = {};
            if (user.role === ROLES.HR_ADMIN && user.assignedDepartments?.length > 0) {
                employeeFilter.department = { [Op.in]: user.assignedDepartments };
            }

            if (department) {
                employeeFilter.department = department;
            }

            const utilizationData = await LeaveBalance.findAll({
                where: whereClause,
                include: [
                    {
                        model: Employee,
                        as: 'employee',
                        attributes: ['id', 'employeeId', 'firstName', 'lastName', 'department', 'designation'],
                        where: employeeFilter,
                        required: true
                    }
                ],
                order: [['employee', 'department'], ['employee', 'firstName'], ['leaveType']]
            });

            // Calculate summary statistics
            const summary = {
                totalEmployees: new Set(utilizationData.map(record => record.employeeId)).size,
                totalAllocated: utilizationData.reduce((sum, record) => sum + record.allocated, 0),
                totalUsed: utilizationData.reduce((sum, record) => sum + record.used, 0),
                totalRemaining: utilizationData.reduce((sum, record) => sum + record.remaining, 0),
                totalPending: utilizationData.reduce((sum, record) => sum + record.pending, 0),
                utilizationRate: 0
            };

            if (summary.totalAllocated > 0) {
                summary.utilizationRate = ((summary.totalUsed / summary.totalAllocated) * 100).toFixed(2);
            }

            // Group by leave type
            const byLeaveType = {};
            utilizationData.forEach(record => {
                if (!byLeaveType[record.leaveType]) {
                    byLeaveType[record.leaveType] = {
                        allocated: 0,
                        used: 0,
                        remaining: 0,
                        pending: 0,
                        employeeCount: new Set()
                    };
                }
                byLeaveType[record.leaveType].allocated += record.allocated;
                byLeaveType[record.leaveType].used += record.used;
                byLeaveType[record.leaveType].remaining += record.remaining;
                byLeaveType[record.leaveType].pending += record.pending;
                byLeaveType[record.leaveType].employeeCount.add(record.employeeId);
            });

            // Convert Set to count
            Object.keys(byLeaveType).forEach(leaveType => {
                byLeaveType[leaveType].employeeCount = byLeaveType[leaveType].employeeCount.size;
                byLeaveType[leaveType].utilizationRate = byLeaveType[leaveType].allocated > 0
                    ? ((byLeaveType[leaveType].used / byLeaveType[leaveType].allocated) * 100).toFixed(2)
                    : 0;
            });

            return {
                success: true,
                data: {
                    summary,
                    byLeaveType,
                    details: utilizationData,
                    filters: { year, department, leaveType }
                }
            };
        } catch (error) {
            logger.error('Error getting leave utilization report:', error);
            return {
                success: false,
                message: error.message || 'Failed to get utilization report',
                error: error.message
            };
        }
    }

    /**
     * Bulk assign default leave quotas to multiple employees (Super Admin)
     * @param {Array} employeeIds - Array of employee IDs
     * @param {Number} year - Year for assignment
     * @param {Object} user - Super Admin user
     * @param {Object} metadata - Request metadata
     * @returns {Promise<Object>} Bulk assignment result
     */
    async bulkAssignDefaultQuotas(employeeIds, year, user, metadata = {}) {
        try {
            // Only Super Admin can bulk assign
            if (user.role !== ROLES.SUPER_ADMIN) {
                throw { message: "Unauthorized: Only Super Admin can bulk assign leave quotas", statusCode: 403 };
            }

            // Get default quotas from system policy
            const defaultQuotas = [
                { leaveType: 'Casual', allocated: 12, carryForward: 0 },
                { leaveType: 'Sick', allocated: 12, carryForward: 0 },
                { leaveType: 'Paid', allocated: 21, carryForward: 0 }
            ];

            const assignments = employeeIds.map(employeeId => ({
                employeeId,
                year: year || new Date().getFullYear(),
                leaveBalances: defaultQuotas
            }));

            const result = await this.assignLeaveBalances(assignments, user, metadata);

            // Log bulk assignment
            await AuditLog.logAction({
                userId: user.id,
                action: 'leave_balance_bulk_assign',
                module: 'leave',
                targetType: 'LeaveBalance',
                newValues: { employeeIds, year, defaultQuotas },
                description: `Bulk assigned default leave quotas to ${employeeIds.length} employees`,
                ipAddress: metadata.ipAddress,
                userAgent: metadata.userAgent,
                severity: 'high'
            });

            return result;
        } catch (error) {
            logger.error('Error in bulk assign default quotas:', error);
            return {
                success: false,
                message: error.message || 'Failed to bulk assign quotas',
                error: error.message
            };
        }
    }

    /**
     * Get leave balance history for an employee
     * @param {String} employeeId - Employee ID
     * @param {Object} filters - Filter criteria
     * @param {Object} user - User requesting history
     * @returns {Promise<Object>} Leave balance history
     */
    async getLeaveBalanceHistory(employeeId, filters = {}, user) {
        try {
            // Permission check
            if (user.role === ROLES.EMPLOYEE && user.employeeId.toString() !== employeeId) {
                throw { message: "You can only view your own leave balance history", statusCode: 403 };
            }

            if (user.role === ROLES.HR_ADMIN) {
                const employee = await Employee.findByPk(employeeId);
                if (!employee || !user.assignedDepartments?.includes(employee.department)) {
                    throw { message: "You don't have access to this employee's data", statusCode: 403 };
                }
            }

            const { startYear, endYear } = filters;
            const whereClause = { employeeId };

            if (startYear && endYear) {
                whereClause.year = { [Op.between]: [startYear, endYear] };
            } else if (startYear) {
                whereClause.year = { [Op.gte]: startYear };
            } else if (endYear) {
                whereClause.year = { [Op.lte]: endYear };
            }

            const history = await LeaveBalance.findAll({
                where: whereClause,
                include: [
                    {
                        model: User,
                        as: 'creator',
                        attributes: ['id', 'name', 'email'],
                        required: false
                    },
                    {
                        model: User,
                        as: 'updater',
                        attributes: ['id', 'name', 'email'],
                        required: false
                    }
                ],
                order: [['year', 'DESC'], ['leaveType', 'ASC']]
            });

            return {
                success: true,
                data: history
            };
        } catch (error) {
            logger.error('Error getting leave balance history:', error);
            return {
                success: false,
                message: error.message || 'Failed to get balance history',
                error: error.message
            };
        }
    }
}

export default new LeaveBalanceService();