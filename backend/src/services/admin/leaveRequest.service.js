/**
 * Leave Request Service Layer
 * Handles all business logic for leave request management with assignment, approval & cancellation
 */

import { LeaveRequest, LeaveBalance, Employee, User, AuditLog } from '../../models/sequelize/index.js';
import { Op } from 'sequelize';
import logger from '../../utils/logger.js';
import { ROLES } from '../../config/rolePermissions.js';

class LeaveRequestService {
    /**
     * Apply for leave (Employee)
     * @param {Object} leaveRequestData - Leave request data
     * @param {Object} user - User applying for leave
     * @param {Object} metadata - Request metadata
     * @returns {Promise<Object>} Leave request result
     */
    async applyForLeave(leaveRequestData, user, metadata = {}) {
        try {
            if (!user.employeeId) {
                throw { message: "No employee profile linked to this user", statusCode: 404 };
            }

            const {
                leaveType,
                startDate,
                endDate,
                reason,
                isHalfDay = false,
                halfDayPeriod = null
            } = leaveRequestData;

            // Calculate total days
            const start = new Date(startDate);
            const end = new Date(endDate);
            const totalDays = isHalfDay ? 0.5 : Math.ceil((end - start) / (1000 * 60 * 60 * 24)) + 1;

            // Check if employee has sufficient leave balance
            const currentYear = new Date().getFullYear();
            const leaveBalance = await LeaveBalance.findOne({
                where: {
                    employeeId: user.employeeId,
                    leaveType,
                    year: currentYear
                }
            });

            if (!leaveBalance) {
                throw { message: `No leave balance found for ${leaveType} leave`, statusCode: 400 };
            }

            if (leaveBalance.remaining < totalDays) {
                throw {
                    message: `Insufficient leave balance. Available: ${leaveBalance.remaining} days, Requested: ${totalDays} days`,
                    statusCode: 400
                };
            }

            // Check for overlapping leave requests
            const overlappingRequest = await LeaveRequest.findOne({
                where: {
                    employeeId: user.employeeId,
                    status: { [Op.in]: ['pending', 'approved'] },
                    [Op.or]: [
                        {
                            startDate: {
                                [Op.between]: [startDate, endDate]
                            }
                        },
                        {
                            endDate: {
                                [Op.between]: [startDate, endDate]
                            }
                        },
                        {
                            [Op.and]: [
                                { startDate: { [Op.lte]: startDate } },
                                { endDate: { [Op.gte]: endDate } }
                            ]
                        }
                    ]
                }
            });

            if (overlappingRequest) {
                throw { message: 'You already have a leave request for overlapping dates', statusCode: 400 };
            }

            // Create leave request
            const leaveRequest = await LeaveRequest.create({
                employeeId: user.employeeId,
                leaveType,
                startDate,
                endDate,
                totalDays,
                reason,
                isHalfDay,
                halfDayPeriod,
                status: 'pending',
                createdBy: user.id
            });

            // Update leave balance - mark as pending
            await LeaveBalance.adjustBalanceForLeave(
                user.employeeId,
                leaveType,
                totalDays,
                'pending'
            );

            // Log leave application
            await AuditLog.logAction({
                userId: user.id,
                action: 'leave_apply',
                module: 'leave',
                targetType: 'LeaveRequest',
                targetId: leaveRequest.id,
                newValues: leaveRequestData,
                description: `Applied for ${totalDays} days of ${leaveType} leave`,
                ipAddress: metadata.ipAddress,
                userAgent: metadata.userAgent,
                severity: 'medium'
            });

            const createdRequest = await LeaveRequest.findByPk(leaveRequest.id, {
                include: [
                    {
                        model: Employee,
                        as: 'employee',
                        attributes: ['id', 'employeeId', 'firstName', 'lastName', 'email']
                    }
                ]
            });

            return {
                success: true,
                message: 'Leave request submitted successfully',
                data: createdRequest
            };
        } catch (error) {
            logger.error('Error applying for leave:', error);
            return {
                success: false,
                message: error.message || 'Failed to apply for leave',
                error: error.message
            };
        }
    }

    /**
     * Get all leave requests with filtering and pagination (Super Admin & HR)
     */
    async getLeaveRequests(filters = {}, user, pagination = {}) {
        try {
            logger.info(`[LeaveRequest.getLeaveRequests] User: ${user.role}, Filters:`, filters);
            
            // Role-based access control
            if (user.role !== ROLES.SUPER_ADMIN && user.role !== ROLES.HR_ADMIN) {
                logger.warn(`[LeaveRequest.getLeaveRequests] Unauthorized access attempt by ${user.role}`);
                throw { message: "Unauthorized: Only Super Admin and HR can view all leave requests", statusCode: 403 };
            }

            const {
                page = 1,
                limit = 20,
                status,
                employeeId,
                leaveType,
                dateFrom,
                dateTo,
                sortBy = 'createdAt',
                sortOrder = 'DESC'
            } = { ...filters, ...pagination };

            const offset = (page - 1) * limit;
            const whereClause = {};

            // Apply filters - only add to whereClause if not 'all'
            if (status && status !== 'all') whereClause.status = status;
            if (employeeId && employeeId !== 'all') whereClause.employeeId = employeeId;
            if (leaveType && leaveType !== 'all') whereClause.leaveType = leaveType;

            if (dateFrom && dateTo) {
                whereClause[Op.or] = [
                    {
                        startDate: {
                            [Op.between]: [dateFrom, dateTo]
                        }
                    },
                    {
                        endDate: {
                            [Op.between]: [dateFrom, dateTo]
                        }
                    },
                    {
                        [Op.and]: [
                            { startDate: { [Op.lte]: dateFrom } },
                            { endDate: { [Op.gte]: dateTo } }
                        ]
                    }
                ];
            }

            // HR can only see requests from employees in their assigned departments
            let employeeFilter = {};
            if (user.role === ROLES.HR_ADMIN && user.assignedDepartments?.length > 0) {
                employeeFilter.department = { [Op.in]: user.assignedDepartments };
                logger.info(`[LeaveRequest.getLeaveRequests] HR filter by departments:`, user.assignedDepartments);
            }

            logger.info(`[LeaveRequest.getLeaveRequests] Query whereClause:`, whereClause);
            logger.info(`[LeaveRequest.getLeaveRequests] Employee filter:`, employeeFilter);

            const { count, rows } = await LeaveRequest.findAndCountAll({
                where: whereClause,
                include: [
                    {
                        model: Employee,
                        as: 'employee',
                        attributes: ['id', 'employeeId', 'firstName', 'lastName', 'email', 'department'],
                        where: employeeFilter,
                        required: Object.keys(employeeFilter).length > 0 // Only require if filtering
                    },
                    {
                        model: User,
                        as: 'approver',
                        attributes: ['id', 'name', 'email'],
                        required: false
                    }
                ],
                limit: parseInt(limit),
                offset: parseInt(offset),
                order: [[sortBy, sortOrder]]
            });

            logger.info(`[LeaveRequest.getLeaveRequests] Found ${count} leave requests`);

            return {
                success: true,
                data: {
                    leaveRequests: rows,
                    pagination: {
                        total: count,
                        page: parseInt(page),
                        limit: parseInt(limit),
                        totalPages: Math.ceil(count / limit)
                    }
                }
            };
        } catch (error) {
            logger.error('Error fetching leave requests:', error);
            return {
                success: false,
                message: error.message || 'Failed to fetch leave requests',
                error: error.message
            };
        }
    }

    /**
     * Approve or reject leave request (HR & Super Admin)
     * @param {String} requestId - Leave request ID
     * @param {String} action - 'approve' or 'reject'
     * @param {String} comments - Approval/rejection comments
     * @param {Object} user - User processing the request
     * @param {Object} metadata - Request metadata
     * @returns {Promise<Object>} Processing result
     */
    async processLeaveRequest(requestId, action, comments = '', user, metadata = {}) {
        try {
            // Role-based access control
            if (user.role !== ROLES.SUPER_ADMIN && user.role !== ROLES.HR_ADMIN) {
                throw { message: "Unauthorized: Only Super Admin and HR can process leave requests", statusCode: 403 };
            }

            const leaveRequest = await LeaveRequest.findByPk(requestId, {
                include: [
                    {
                        model: Employee,
                        as: 'employee',
                        attributes: ['id', 'employeeId', 'firstName', 'lastName', 'department']
                    }
                ]
            });

            if (!leaveRequest) {
                throw { message: 'Leave request not found', statusCode: 404 };
            }

            if (leaveRequest.status !== 'pending') {
                throw { message: 'Leave request has already been processed', statusCode: 400 };
            }

            // HR can only process requests from employees in their assigned departments
            if (user.role === ROLES.HR_ADMIN) {
                if (!user.assignedDepartments?.includes(leaveRequest.employee.department)) {
                    throw { message: "You don't have permission to process this request", statusCode: 403 };
                }
            }

            const oldStatus = leaveRequest.status;

            // Update leave request
            const updateData = {
                status: action === 'approve' ? 'approved' : 'rejected',
                rejectionReason: action === 'reject' ? comments : null,
                updatedBy: user.id
            };

            if (action === 'approve') {
                updateData.approvedBy = user.id;
                updateData.approvedAt = new Date();
            }

            await leaveRequest.update(updateData);

            // Update leave balance
            if (action === 'approve') {
                // Convert pending to used
                await LeaveBalance.adjustBalanceForLeave(
                    leaveRequest.employeeId,
                    leaveRequest.leaveType,
                    leaveRequest.totalDays,
                    'use'
                );
            } else if (action === 'reject') {
                // Remove from pending, restore to available
                await LeaveBalance.adjustBalanceForLeave(
                    leaveRequest.employeeId,
                    leaveRequest.leaveType,
                    leaveRequest.totalDays,
                    'cancel'
                );
            }

            // Log the action
            await AuditLog.logAction({
                userId: user.id,
                action: action === 'approve' ? 'leave_approve' : 'leave_reject',
                module: 'leave',
                targetType: 'LeaveRequest',
                targetId: leaveRequest.id,
                oldValues: { status: oldStatus },
                newValues: { status: action, comments },
                description: `${action === 'approve' ? 'Approved' : 'Rejected'} leave request for ${leaveRequest.employee.firstName} ${leaveRequest.employee.lastName}`,
                ipAddress: metadata.ipAddress,
                userAgent: metadata.userAgent,
                severity: 'high'
            });

            const updatedRequest = await LeaveRequest.findByPk(requestId, {
                include: [
                    {
                        model: Employee,
                        as: 'employee',
                        attributes: ['id', 'employeeId', 'firstName', 'lastName', 'email']
                    },
                    {
                        model: User,
                        as: 'approver',
                        attributes: ['id', 'name', 'email'],
                        required: false
                    }
                ]
            });

            return {
                success: true,
                message: `Leave request ${action}d successfully`,
                data: updatedRequest
            };
        } catch (error) {
            logger.error('Error processing leave request:', error);
            return {
                success: false,
                message: error.message || 'Failed to process leave request',
                error: error.message
            };
        }
    }

    /**
     * Cancel leave request (Employee or HR/Super Admin)
     * @param {String} requestId - Leave request ID
     * @param {String} reason - Cancellation reason
     * @param {Object} user - User cancelling the request
     * @param {Object} metadata - Request metadata
     * @returns {Promise<Object>} Cancellation result
     */
    async cancelLeaveRequest(requestId, reason = '', user, metadata = {}) {
        try {
            const leaveRequest = await LeaveRequest.findByPk(requestId, {
                include: [
                    {
                        model: Employee,
                        as: 'employee',
                        attributes: ['id', 'employeeId', 'firstName', 'lastName', 'department']
                    }
                ]
            });

            if (!leaveRequest) {
                throw { message: 'Leave request not found', statusCode: 404 };
            }

            // Check permissions
            if (user.role === ROLES.EMPLOYEE) {
                // Employees can only cancel their own requests
                if (leaveRequest.employeeId !== user.employeeId) {
                    throw { message: "You can only cancel your own leave requests", statusCode: 403 };
                }
                // Check if request can be cancelled
                if (!leaveRequest.canBeCancelled()) {
                    throw { message: "This leave request cannot be cancelled", statusCode: 400 };
                }
            } else if (user.role === ROLES.HR_ADMIN) {
                // HR can cancel requests from employees in their assigned departments
                if (!user.assignedDepartments?.includes(leaveRequest.employee.department)) {
                    throw { message: "You don't have permission to cancel this request", statusCode: 403 };
                }
            }
            // Super Admin can cancel any request

            if (leaveRequest.status === 'cancelled') {
                throw { message: 'Leave request is already cancelled', statusCode: 400 };
            }

            const oldStatus = leaveRequest.status;

            // Cancel the request
            await leaveRequest.update({
                status: 'cancelled',
                cancelledAt: new Date(),
                cancellationReason: reason,
                updatedBy: user.id
            });

            // Restore leave balance
            if (oldStatus === 'approved') {
                // Restore used days back to available
                await LeaveBalance.adjustBalanceForLeave(
                    leaveRequest.employeeId,
                    leaveRequest.leaveType,
                    leaveRequest.totalDays,
                    'cancel'
                );
            } else if (oldStatus === 'pending') {
                // Remove from pending
                await LeaveBalance.adjustBalanceForLeave(
                    leaveRequest.employeeId,
                    leaveRequest.leaveType,
                    leaveRequest.totalDays,
                    'cancel'
                );
            }

            // Log cancellation
            await AuditLog.logAction({
                userId: user.id,
                action: 'leave_cancel',
                module: 'leave',
                targetType: 'LeaveRequest',
                targetId: leaveRequest.id,
                oldValues: { status: oldStatus },
                newValues: { status: 'cancelled', reason },
                description: `Cancelled leave request for ${leaveRequest.employee.firstName} ${leaveRequest.employee.lastName}`,
                ipAddress: metadata.ipAddress,
                userAgent: metadata.userAgent,
                severity: 'medium'
            });

            return {
                success: true,
                message: 'Leave request cancelled successfully'
            };
        } catch (error) {
            logger.error('Error cancelling leave request:', error);
            return {
                success: false,
                message: error.message || 'Failed to cancel leave request',
                error: error.message
            };
        }
    }

    /**
     * Get leave requests for a specific employee
     * @param {String} employeeId - Employee ID
     * @param {Object} filters - Filter criteria
     * @param {Object} user - User requesting data
     * @param {Object} pagination - Pagination options
     * @returns {Promise<Object>} Employee's leave requests
     */
    async getEmployeeLeaveRequests(employeeId, filters = {}, user, pagination = {}) {
        try {
            // Convert both to strings for comparison to avoid type mismatch
            const requestedEmployeeId = employeeId?.toString();
            const userEmployeeId = user.employeeId?.toString();

            // Permission check
            if (user.role === ROLES.EMPLOYEE && userEmployeeId !== requestedEmployeeId) {
                throw { message: "You can only view your own leave requests", statusCode: 403 };
            }

            if (user.role === ROLES.HR_ADMIN) {
                const employee = await Employee.findByPk(employeeId);
                if (!employee || !user.assignedDepartments?.includes(employee.department)) {
                    throw { message: "You don't have access to this employee's data", statusCode: 403 };
                }
            }

            const {
                page = 1,
                limit = 10,
                status,
                leaveType,
                year,
                sortBy = 'createdAt',
                sortOrder = 'DESC'
            } = { ...filters, ...pagination };

            const offset = (page - 1) * limit;
            const whereClause = { employeeId };

            if (status) whereClause.status = status;
            if (leaveType) whereClause.leaveType = leaveType;

            if (year) {
                whereClause.startDate = {
                    [Op.between]: [`${year}-01-01`, `${year}-12-31`]
                };
            }

            const { count, rows } = await LeaveRequest.findAndCountAll({
                where: whereClause,
                include: [
                    {
                        model: User,
                        as: 'approver',
                        attributes: ['id', 'name', 'email'],
                        required: false
                    }
                ],
                limit: parseInt(limit),
                offset: parseInt(offset),
                order: [[sortBy, sortOrder]]
            });

            return {
                success: true,
                data: {
                    leaveRequests: rows,
                    pagination: {
                        total: count,
                        page: parseInt(page),
                        limit: parseInt(limit),
                        totalPages: Math.ceil(count / limit)
                    }
                }
            };
        } catch (error) {
            logger.error('Error fetching employee leave requests:', error);
            return {
                success: false,
                message: error.message || 'Failed to fetch employee leave requests',
                error: error.message
            };
        }
    }

    /**
     * Get leave request statistics
     * @param {Object} filters - Filter criteria
     * @param {Object} user - User requesting stats
     * @returns {Promise<Object>} Leave request statistics
     */
    async getLeaveRequestStats(filters = {}, user) {
        try {
            // Role-based access control
            if (user.role !== ROLES.SUPER_ADMIN && user.role !== ROLES.HR_ADMIN) {
                throw { message: "Unauthorized: Only Super Admin and HR can view statistics", statusCode: 403 };
            }

            const { year = new Date().getFullYear(), employeeId } = filters;

            const whereClause = {
                startDate: {
                    [Op.between]: [`${year}-01-01`, `${year}-12-31`]
                }
            };

            if (employeeId) {
                whereClause.employeeId = employeeId;
            }

            // HR can only see stats for employees in their assigned departments
            let employeeFilter = {};
            if (user.role === ROLES.HR_ADMIN && user.assignedDepartments?.length > 0) {
                employeeFilter.department = { [Op.in]: user.assignedDepartments };
            }

            const [
                totalRequests,
                pendingRequests,
                approvedRequests,
                rejectedRequests,
                cancelledRequests,
                totalDaysRequested,
                totalDaysApproved
            ] = await Promise.all([
                LeaveRequest.count({
                    where: whereClause,
                    include: employeeId ? [] : [{ model: Employee, as: 'employee', where: employeeFilter, required: true }]
                }),
                LeaveRequest.count({
                    where: { ...whereClause, status: 'pending' },
                    include: employeeId ? [] : [{ model: Employee, as: 'employee', where: employeeFilter, required: true }]
                }),
                LeaveRequest.count({
                    where: { ...whereClause, status: 'approved' },
                    include: employeeId ? [] : [{ model: Employee, as: 'employee', where: employeeFilter, required: true }]
                }),
                LeaveRequest.count({
                    where: { ...whereClause, status: 'rejected' },
                    include: employeeId ? [] : [{ model: Employee, as: 'employee', where: employeeFilter, required: true }]
                }),
                LeaveRequest.count({
                    where: { ...whereClause, status: 'cancelled' },
                    include: employeeId ? [] : [{ model: Employee, as: 'employee', where: employeeFilter, required: true }]
                }),
                LeaveRequest.sum('totalDays', {
                    where: whereClause,
                    include: employeeId ? [] : [{ model: Employee, as: 'employee', where: employeeFilter, required: true }]
                }),
                LeaveRequest.sum('totalDays', {
                    where: { ...whereClause, status: 'approved' },
                    include: employeeId ? [] : [{ model: Employee, as: 'employee', where: employeeFilter, required: true }]
                })
            ]);

            return {
                success: true,
                data: {
                    totalRequests,
                    pendingRequests,
                    approvedRequests,
                    rejectedRequests,
                    cancelledRequests,
                    totalDaysRequested: totalDaysRequested || 0,
                    totalDaysApproved: totalDaysApproved || 0,
                    approvalRate: totalRequests > 0 ? ((approvedRequests / totalRequests) * 100).toFixed(2) : 0
                }
            };
        } catch (error) {
            logger.error('Error fetching leave request stats:', error);
            return {
                success: false,
                message: error.message || 'Failed to fetch leave request statistics',
                error: error.message
            };
        }
    }

    /**
     * Override leave approval/rejection (Super Admin only)
     * @param {String} requestId - Leave request ID
     * @param {String} action - 'approve' or 'reject'
     * @param {String} reason - Override reason
     * @param {Object} user - Super Admin user
     * @param {Object} metadata - Request metadata
     * @returns {Promise<Object>} Override result
     */
    async overrideLeaveRequest(requestId, action, reason, user, metadata = {}) {
        try {
            // Only Super Admin can override
            if (user.role !== ROLES.SUPER_ADMIN) {
                throw { message: "Unauthorized: Only Super Admin can override leave decisions", statusCode: 403 };
            }

            const leaveRequest = await LeaveRequest.findByPk(requestId, {
                include: [
                    {
                        model: Employee,
                        as: 'employee',
                        attributes: ['id', 'employeeId', 'firstName', 'lastName']
                    }
                ]
            });

            if (!leaveRequest) {
                throw { message: 'Leave request not found', statusCode: 404 };
            }

            const oldStatus = leaveRequest.status;

            // Update leave request
            await leaveRequest.update({
                status: action === 'approve' ? 'approved' : 'rejected',
                approvedBy: action === 'approve' ? user.id : leaveRequest.approvedBy,
                approvedAt: action === 'approve' ? new Date() : leaveRequest.approvedAt,
                rejectionReason: action === 'reject' ? reason : null,
                updatedBy: user.id
            });

            // Adjust leave balance based on the override
            const newStatus = action === 'approve' ? 'approved' : 'rejected';
            if (oldStatus !== newStatus) {
                if (newStatus === 'approved' && oldStatus === 'rejected') {
                    // Convert to used
                    await LeaveBalance.adjustBalanceForLeave(
                        leaveRequest.employeeId,
                        leaveRequest.leaveType,
                        leaveRequest.totalDays,
                        'use'
                    );
                } else if (newStatus === 'rejected' && oldStatus === 'approved') {
                    // Restore balance
                    await LeaveBalance.adjustBalanceForLeave(
                        leaveRequest.employeeId,
                        leaveRequest.leaveType,
                        leaveRequest.totalDays,
                        'cancel'
                    );
                }
            }

            // Log override action
            await AuditLog.logAction({
                userId: user.id,
                action: 'leave_override',
                module: 'leave',
                targetType: 'LeaveRequest',
                targetId: leaveRequest.id,
                oldValues: { status: oldStatus },
                newValues: { status: action, reason },
                description: `Overrode leave request decision from ${oldStatus} to ${action}`,
                ipAddress: metadata.ipAddress,
                userAgent: metadata.userAgent,
                severity: 'critical'
            });

            return {
                success: true,
                message: `Leave request ${action} override completed successfully`,
                data: leaveRequest
            };
        } catch (error) {
            logger.error('Error overriding leave request:', error);
            return {
                success: false,
                message: error.message || 'Failed to override leave request',
                error: error.message
            };
        }
    }
}

export default new LeaveRequestService();