/**
 * Leave Request Service Layer
 * Handles all business logic for leave request management
 */

import { LeaveRequest, LeaveBalance, Employee, User, AuditLog } from '../../models/sequelize/index.js';
import { Op } from 'sequelize';
import logger from '../../utils/logger.js';

class LeaveRequestService {
    /**
     * Get all leave requests with filtering and pagination
     */
    async getLeaveRequests(filters = {}, pagination = {}) {
        try {
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

            // Apply filters
            if (status) whereClause.status = status;
            if (employeeId) whereClause.employeeId = employeeId;
            if (leaveType) whereClause.leaveType = leaveType;

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

            const { count, rows } = await LeaveRequest.findAndCountAll({
                where: whereClause,
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
            logger.error('Error fetching leave requests:', error);
            return {
                success: false,
                message: 'Failed to fetch leave requests',
                error: error.message
            };
        }
    }

    /**
     * Get leave request by ID
     */
    async getLeaveRequestById(id) {
        try {
            const leaveRequest = await LeaveRequest.findByPk(id, {
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

            if (!leaveRequest) {
                return {
                    success: false,
                    message: 'Leave request not found'
                };
            }

            return {
                success: true,
                data: leaveRequest
            };
        } catch (error) {
            logger.error('Error fetching leave request:', error);
            return {
                success: false,
                message: 'Failed to fetch leave request',
                error: error.message
            };
        }
    }

    /**
     * Create new leave request
     */
    async createLeaveRequest(leaveRequestData, userId, metadata = {}) {
        try {
            const {
                employeeId,
                leaveType,
                startDate,
                endDate,
                reason,
                isHalfDay,
                halfDayPeriod,
                emergencyContact
            } = leaveRequestData;

            // Calculate total days
            const start = new Date(startDate);
            const end = new Date(endDate);
            const totalDays = isHalfDay ? 0.5 : Math.ceil((end - start) / (1000 * 60 * 60 * 24)) + 1;

            // Check if employee has sufficient leave balance
            const leaveBalance = await LeaveBalance.findOne({
                where: {
                    employeeId,
                    leaveType
                }
            });

            if (!leaveBalance || leaveBalance.availableDays < totalDays) {
                return {
                    success: false,
                    message: 'Insufficient leave balance for this request'
                };
            }

            // Check for overlapping leave requests
            const overlappingRequest = await LeaveRequest.findOne({
                where: {
                    employeeId,
                    status: { [Op.in]: ['Pending', 'Approved'] },
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
                return {
                    success: false,
                    message: 'You already have a leave request for overlapping dates'
                };
            }

            const leaveRequest = await LeaveRequest.create({
                employeeId,
                leaveType,
                startDate,
                endDate,
                totalDays,
                reason,
                isHalfDay,
                halfDayPeriod,
                emergencyContact,
                status: 'Pending',
                appliedBy: userId
            });

            // Log creation in audit log
            await AuditLog.logAction({
                userId,
                action: 'leave_request_create',
                module: 'leave',
                targetType: 'LeaveRequest',
                targetId: leaveRequest.id,
                newValues: leaveRequestData,
                description: `Created leave request for ${totalDays} days`,
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
                message: 'Leave request created successfully',
                data: createdRequest
            };
        } catch (error) {
            logger.error('Error creating leave request:', error);
            return {
                success: false,
                message: 'Failed to create leave request',
                error: error.message
            };
        }
    }

    /**
     * Update leave request status (approve/reject)
     */
    async updateLeaveRequestStatus(id, status, approverId, comments = '', metadata = {}) {
        try {
            const leaveRequest = await LeaveRequest.findByPk(id, {
                include: [
                    {
                        model: Employee,
                        as: 'employee',
                        attributes: ['id', 'employeeId', 'firstName', 'lastName']
                    }
                ]
            });

            if (!leaveRequest) {
                return {
                    success: false,
                    message: 'Leave request not found'
                };
            }

            if (leaveRequest.status !== 'Pending') {
                return {
                    success: false,
                    message: 'Leave request has already been processed'
                };
            }

            const oldStatus = leaveRequest.status;

            // Update leave request
            await leaveRequest.update({
                status,
                approvedBy: status === 'Approved' ? approverId : null,
                rejectedBy: status === 'Rejected' ? approverId : null,
                approverComments: comments,
                processedAt: new Date()
            });

            // If approved, deduct from leave balance
            if (status === 'Approved') {
                const leaveBalance = await LeaveBalance.findOne({
                    where: {
                        employeeId: leaveRequest.employeeId,
                        leaveType: leaveRequest.leaveType
                    }
                });

                if (leaveBalance) {
                    await leaveBalance.update({
                        usedDays: leaveBalance.usedDays + leaveRequest.totalDays,
                        availableDays: leaveBalance.availableDays - leaveRequest.totalDays
                    });
                }
            }

            // Log status update in audit log
            await AuditLog.logAction({
                userId: approverId,
                action: 'leave_request_status_update',
                module: 'leave',
                targetType: 'LeaveRequest',
                targetId: leaveRequest.id,
                oldValues: { status: oldStatus },
                newValues: { status, comments },
                description: `${status} leave request for ${leaveRequest.employee.firstName} ${leaveRequest.employee.lastName}`,
                ipAddress: metadata.ipAddress,
                userAgent: metadata.userAgent,
                severity: 'high'
            });

            const updatedRequest = await LeaveRequest.findByPk(id, {
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
                message: `Leave request ${status.toLowerCase()} successfully`,
                data: updatedRequest
            };
        } catch (error) {
            logger.error('Error updating leave request status:', error);
            return {
                success: false,
                message: 'Failed to update leave request status',
                error: error.message
            };
        }
    }

    /**
     * Cancel leave request
     */
    async cancelLeaveRequest(id, userId, reason = '', metadata = {}) {
        try {
            const leaveRequest = await LeaveRequest.findByPk(id, {
                include: [
                    {
                        model: Employee,
                        as: 'employee',
                        attributes: ['id', 'employeeId', 'firstName', 'lastName']
                    }
                ]
            });

            if (!leaveRequest) {
                return {
                    success: false,
                    message: 'Leave request not found'
                };
            }

            if (leaveRequest.status === 'Cancelled') {
                return {
                    success: false,
                    message: 'Leave request is already cancelled'
                };
            }

            const oldStatus = leaveRequest.status;

            // If the request was approved, restore leave balance
            if (leaveRequest.status === 'Approved') {
                const leaveBalance = await LeaveBalance.findOne({
                    where: {
                        employeeId: leaveRequest.employeeId,
                        leaveType: leaveRequest.leaveType
                    }
                });

                if (leaveBalance) {
                    await leaveBalance.update({
                        usedDays: leaveBalance.usedDays - leaveRequest.totalDays,
                        availableDays: leaveBalance.availableDays + leaveRequest.totalDays
                    });
                }
            }

            // Update leave request
            await leaveRequest.update({
                status: 'Cancelled',
                cancelledBy: userId,
                cancelReason: reason,
                cancelledAt: new Date()
            });

            // Log cancellation in audit log
            await AuditLog.logAction({
                userId,
                action: 'leave_request_cancel',
                module: 'leave',
                targetType: 'LeaveRequest',
                targetId: leaveRequest.id,
                oldValues: { status: oldStatus },
                newValues: { status: 'Cancelled', reason },
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
                message: 'Failed to cancel leave request',
                error: error.message
            };
        }
    }

    /**
     * Get leave requests for a specific employee
     */
    async getEmployeeLeaveRequests(employeeId, filters = {}, pagination = {}) {
        try {
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
                message: 'Failed to fetch employee leave requests',
                error: error.message
            };
        }
    }

    /**
     * Get leave request statistics
     */
    async getLeaveRequestStats(filters = {}) {
        try {
            const { year = new Date().getFullYear(), employeeId } = filters;

            const whereClause = {
                startDate: {
                    [Op.between]: [`${year}-01-01`, `${year}-12-31`]
                }
            };

            if (employeeId) {
                whereClause.employeeId = employeeId;
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
                LeaveRequest.count({ where: whereClause }),
                LeaveRequest.count({ where: { ...whereClause, status: 'Pending' } }),
                LeaveRequest.count({ where: { ...whereClause, status: 'Approved' } }),
                LeaveRequest.count({ where: { ...whereClause, status: 'Rejected' } }),
                LeaveRequest.count({ where: { ...whereClause, status: 'Cancelled' } }),
                LeaveRequest.sum('totalDays', { where: whereClause }),
                LeaveRequest.sum('totalDays', { where: { ...whereClause, status: 'Approved' } })
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
                    totalDaysApproved: totalDaysApproved || 0
                }
            };
        } catch (error) {
            logger.error('Error fetching leave request stats:', error);
            return {
                success: false,
                message: 'Failed to fetch leave request statistics',
                error: error.message
            };
        }
    }
}

export default new LeaveRequestService();