/**
 * Shift Service Layer
 * Handles all business logic for shift management
 */

import { Shift, EmployeeShift, Employee, User, AuditLog } from '../../models/sequelize/index.js';
import { Op } from 'sequelize';

class ShiftService {
    /**
     * Get all shifts with filtering and pagination
     */
    async getShifts(filters = {}, pagination = {}) {
        try {
            const {
                page = 1,
                limit = 20,
                search,
                isActive,
                sortBy = 'createdAt',
                sortOrder = 'DESC'
            } = { ...filters, ...pagination };

            const offset = (page - 1) * limit;
            const whereClause = {};

            // Apply filters
            if (isActive !== undefined) {
                whereClause.isActive = isActive === 'true';
            }

            if (search) {
                whereClause[Op.or] = [
                    { shiftName: { [Op.iLike]: `%${search}%` } },
                    { shiftCode: { [Op.iLike]: `%${search}%` } },
                    { description: { [Op.iLike]: `%${search}%` } }
                ];
            }

            const shifts = await Shift.findAndCountAll({
                where: whereClause,
                include: [
                    {
                        model: User,
                        as: 'creator',
                        attributes: ['id', 'email']
                    },
                    {
                        model: EmployeeShift,
                        as: 'employeeAssignments',
                        where: { isActive: true },
                        required: false,
                        include: [
                            {
                                model: Employee,
                                as: 'employee',
                                attributes: ['id', 'employeeId', 'firstName', 'lastName']
                            }
                        ]
                    }
                ],
                order: [[sortBy, sortOrder]],
                limit: parseInt(limit),
                offset,
                distinct: true
            });

            // Add employee count to each shift
            const shiftsWithCounts = shifts.rows.map(shift => {
                const shiftData = shift.toJSON();
                shiftData.employeeCount = shift.employeeAssignments ? shift.employeeAssignments.length : 0;
                return shiftData;
            });

            return {
                success: true,
                data: shiftsWithCounts,
                pagination: {
                    total: shifts.count,
                    page: parseInt(page),
                    limit: parseInt(limit),
                    totalPages: Math.ceil(shifts.count / limit)
                }
            };
        } catch (error) {
            return {
                success: false,
                message: 'Failed to fetch shifts',
                error: error.message
            };
        }
    }

    /**
     * Get single shift by ID
     */
    async getShiftById(id) {
        try {
            const shift = await Shift.findByPk(id, {
                include: [
                    {
                        model: User,
                        as: 'creator',
                        attributes: ['id', 'email']
                    },
                    {
                        model: User,
                        as: 'updater',
                        attributes: ['id', 'email']
                    },
                    {
                        model: EmployeeShift,
                        as: 'employeeAssignments',
                        where: { isActive: true },
                        required: false,
                        include: [
                            {
                                model: Employee,
                                as: 'employee',
                                attributes: ['id', 'employeeId', 'firstName', 'lastName']
                            }
                        ]
                    }
                ]
            });

            if (!shift) {
                return {
                    success: false,
                    message: 'Shift not found'
                };
            }

            return {
                success: true,
                data: shift
            };
        } catch (error) {
            return {
                success: false,
                message: 'Failed to fetch shift',
                error: error.message
            };
        }
    }

    /**
     * Create new shift
     */
    async createShift(shiftData, userId, metadata = {}) {
        try {
            const shift = await Shift.create({
                ...shiftData,
                createdBy: userId
            });

            // Log creation in audit log
            await AuditLog.logAction({
                userId,
                action: 'shift_create',
                module: 'shift',
                targetType: 'Shift',
                targetId: shift.id,
                newValues: shiftData,
                description: `Created new shift: ${shift.shiftName} (${shift.shiftCode})`,
                ipAddress: metadata.ipAddress,
                userAgent: metadata.userAgent,
                severity: 'medium'
            });

            const createdShift = await Shift.findByPk(shift.id, {
                include: [
                    {
                        model: User,
                        as: 'creator',
                        attributes: ['id', 'email']
                    }
                ]
            });

            return {
                success: true,
                message: 'Shift created successfully',
                data: createdShift
            };
        } catch (error) {
            if (error.name === 'SequelizeUniqueConstraintError') {
                return {
                    success: false,
                    message: 'Shift name or code already exists'
                };
            }

            return {
                success: false,
                message: 'Failed to create shift',
                error: error.message
            };
        }
    }

    /**
     * Update shift
     */
    async updateShift(id, shiftData, userId, metadata = {}) {
        try {
            const shift = await Shift.findByPk(id);

            if (!shift) {
                return {
                    success: false,
                    message: 'Shift not found'
                };
            }

            const oldValues = {
                shiftName: shift.shiftName,
                shiftCode: shift.shiftCode,
                startTime: shift.startTime,
                endTime: shift.endTime
            };

            await shift.update({
                ...shiftData,
                updatedBy: userId
            });

            // Log update in audit log
            await AuditLog.logAction({
                userId,
                action: 'shift_update',
                module: 'shift',
                targetType: 'Shift',
                targetId: shift.id,
                oldValues,
                newValues: shiftData,
                description: `Updated shift: ${shift.shiftName}`,
                ipAddress: metadata.ipAddress,
                userAgent: metadata.userAgent,
                severity: 'medium'
            });

            const updatedShift = await Shift.findByPk(id, {
                include: [
                    {
                        model: User,
                        as: 'creator',
                        attributes: ['id', 'email']
                    },
                    {
                        model: User,
                        as: 'updater',
                        attributes: ['id', 'email']
                    }
                ]
            });

            return {
                success: true,
                message: 'Shift updated successfully',
                data: updatedShift
            };
        } catch (error) {
            if (error.name === 'SequelizeUniqueConstraintError') {
                return {
                    success: false,
                    message: 'Shift name or code already exists'
                };
            }

            return {
                success: false,
                message: 'Failed to update shift',
                error: error.message
            };
        }
    }

    /**
     * Delete shift (soft delete)
     */
    async deleteShift(id, userId, metadata = {}) {
        try {
            const shift = await Shift.findByPk(id);

            if (!shift) {
                return {
                    success: false,
                    message: 'Shift not found'
                };
            }

            // Check if shift has active employee assignments
            const activeAssignments = await EmployeeShift.count({
                where: {
                    shiftId: id,
                    isActive: true
                }
            });

            if (activeAssignments > 0) {
                return {
                    success: false,
                    message: `Cannot delete shift. ${activeAssignments} employees are currently assigned to this shift.`
                };
            }

            await shift.update({ isActive: false });

            // Log deletion in audit log
            await AuditLog.logAction({
                userId,
                action: 'shift_delete',
                module: 'shift',
                targetType: 'Shift',
                targetId: shift.id,
                description: `Deleted shift: ${shift.shiftName}`,
                ipAddress: metadata.ipAddress,
                userAgent: metadata.userAgent,
                severity: 'high'
            });

            return {
                success: true,
                message: 'Shift deleted successfully'
            };
        } catch (error) {
            return {
                success: false,
                message: 'Failed to delete shift',
                error: error.message
            };
        }
    }

    /**
     * Set default shift
     */
    async setDefaultShift(id, userId, metadata = {}) {
        try {
            const shift = await Shift.findByPk(id);

            if (!shift) {
                return {
                    success: false,
                    message: 'Shift not found'
                };
            }

            // Remove default from all other shifts
            await Shift.update(
                { isDefault: false },
                { where: { isDefault: true } }
            );

            // Set this shift as default
            await shift.update({ isDefault: true });

            // Log action in audit log
            await AuditLog.logAction({
                userId,
                action: 'shift_set_default',
                module: 'shift',
                targetType: 'Shift',
                targetId: shift.id,
                description: `Set default shift: ${shift.shiftName}`,
                ipAddress: metadata.ipAddress,
                userAgent: metadata.userAgent,
                severity: 'medium'
            });

            return {
                success: true,
                message: 'Default shift updated successfully'
            };
        } catch (error) {
            return {
                success: false,
                message: 'Failed to set default shift',
                error: error.message
            };
        }
    }

    /**
     * Get shift statistics
     */
    async getShiftStats() {
        try {
            const [
                totalShifts,
                activeShifts,
                defaultShift,
                totalAssignments,
                shiftDistribution
            ] = await Promise.all([
                Shift.count(),
                Shift.count({ where: { isActive: true } }),
                Shift.findOne({ where: { isDefault: true } }),
                EmployeeShift.count({ where: { isActive: true } }),
                Shift.findAll({
                    attributes: [
                        'id',
                        'shiftName',
                        'shiftCode',
                        [Shift.sequelize.fn('COUNT', Shift.sequelize.col('employeeAssignments.id')), 'employeeCount']
                    ],
                    include: [
                        {
                            model: EmployeeShift,
                            as: 'employeeAssignments',
                            where: { isActive: true },
                            required: false,
                            attributes: []
                        }
                    ],
                    where: { isActive: true },
                    group: ['Shift.id'],
                    raw: true
                })
            ]);

            return {
                success: true,
                data: {
                    totalShifts,
                    activeShifts,
                    defaultShift: defaultShift ? {
                        id: defaultShift.id,
                        name: defaultShift.shiftName,
                        code: defaultShift.shiftCode
                    } : null,
                    totalAssignments,
                    shiftDistribution
                }
            };
        } catch (error) {
            return {
                success: false,
                message: 'Failed to fetch shift statistics',
                error: error.message
            };
        }
    }

    /**
     * Assign employees to shift
     */
    async assignEmployeesToShift(shiftId, employeeIds, userId, metadata = {}) {
        try {
            const shift = await Shift.findByPk(shiftId);

            if (!shift) {
                return {
                    success: false,
                    message: 'Shift not found'
                };
            }

            const assignments = [];
            for (const employeeId of employeeIds) {
                const [assignment, created] = await EmployeeShift.findOrCreate({
                    where: {
                        employeeId,
                        shiftId,
                        isActive: true
                    },
                    defaults: {
                        employeeId,
                        shiftId,
                        assignedBy: userId,
                        isActive: true
                    }
                });

                if (created) {
                    assignments.push(assignment);
                }
            }

            // Log assignment in audit log
            await AuditLog.logAction({
                userId,
                action: 'shift_assign_employees',
                module: 'shift',
                targetType: 'Shift',
                targetId: shiftId,
                description: `Assigned ${assignments.length} employees to shift: ${shift.shiftName}`,
                ipAddress: metadata.ipAddress,
                userAgent: metadata.userAgent,
                severity: 'medium'
            });

            return {
                success: true,
                message: `${assignments.length} employees assigned to shift successfully`,
                data: assignments
            };
        } catch (error) {
            return {
                success: false,
                message: 'Failed to assign employees to shift',
                error: error.message
            };
        }
    }

    /**
     * Remove employees from shift
     */
    async removeEmployeesFromShift(shiftId, employeeIds, userId, metadata = {}) {
        try {
            const shift = await Shift.findByPk(shiftId);

            if (!shift) {
                return {
                    success: false,
                    message: 'Shift not found'
                };
            }

            const removedCount = await EmployeeShift.update(
                { isActive: false },
                {
                    where: {
                        shiftId,
                        employeeId: { [Op.in]: employeeIds },
                        isActive: true
                    }
                }
            );

            // Log removal in audit log
            await AuditLog.logAction({
                userId,
                action: 'shift_remove_employees',
                module: 'shift',
                targetType: 'Shift',
                targetId: shiftId,
                description: `Removed ${removedCount[0]} employees from shift: ${shift.shiftName}`,
                ipAddress: metadata.ipAddress,
                userAgent: metadata.userAgent,
                severity: 'medium'
            });

            return {
                success: true,
                message: `${removedCount[0]} employees removed from shift successfully`
            };
        } catch (error) {
            return {
                success: false,
                message: 'Failed to remove employees from shift',
                error: error.message
            };
        }
    }
}

export default new ShiftService();