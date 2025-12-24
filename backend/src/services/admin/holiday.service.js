/**
 * Holiday Service Layer
 * Handles all business logic for holiday management
 */

import { Holiday, User, AuditLog } from '../../models/sequelize/index.js';
import { Op } from 'sequelize';

class HolidayService {
    /**
     * Get all holidays with filtering and pagination
     */
    async getHolidays(filters = {}, pagination = {}) {
        try {
            const { page = 1, limit = 10, search, type, year, isActive } = { ...filters, ...pagination };
            const offset = (page - 1) * limit;

            const whereClause = {};

            if (search) {
                whereClause[Op.or] = [
                    { name: { [Op.like]: `%${search}%` } },
                    { description: { [Op.like]: `%${search}%` } },
                    { location: { [Op.like]: `%${search}%` } }
                ];
            }

            if (type) {
                whereClause.type = type;
            }

            if (year) {
                whereClause.date = {
                    [Op.between]: [`${year}-01-01`, `${year}-12-31`]
                };
            }

            if (isActive !== undefined) {
                whereClause.isActive = isActive === 'true';
            }

            const { count, rows } = await Holiday.findAndCountAll({
                where: whereClause,
                include: [
                    {
                        model: User,
                        as: 'creator',
                        attributes: ['id', 'name', 'email']
                    },
                    {
                        model: User,
                        as: 'updater',
                        attributes: ['id', 'name', 'email']
                    }
                ],
                limit: parseInt(limit),
                offset: parseInt(offset),
                order: [['date', 'ASC']]
            });

            return {
                success: true,
                data: {
                    holidays: rows,
                    pagination: {
                        total: count,
                        page: parseInt(page),
                        limit: parseInt(limit),
                        totalPages: Math.ceil(count / limit)
                    }
                }
            };
        } catch (error) {
            return {
                success: false,
                message: 'Failed to fetch holidays',
                error: error.message
            };
        }
    }

    /**
     * Get holiday by ID
     */
    async getHolidayById(id) {
        try {
            const holiday = await Holiday.findByPk(id, {
                include: [
                    {
                        model: User,
                        as: 'creator',
                        attributes: ['id', 'name', 'email']
                    },
                    {
                        model: User,
                        as: 'updater',
                        attributes: ['id', 'name', 'email']
                    }
                ]
            });

            if (!holiday) {
                return {
                    success: false,
                    message: 'Holiday not found'
                };
            }

            return {
                success: true,
                data: holiday
            };
        } catch (error) {
            return {
                success: false,
                message: 'Failed to fetch holiday',
                error: error.message
            };
        }
    }

    /**
     * Create new holiday
     */
    async createHoliday(holidayData, userId, metadata = {}) {
        try {
            const {
                name,
                description,
                date,
                type,
                isRecurring,
                recurrenceRule,
                applicableTo,
                departments,
                employees,
                isOptional,
                isPaid,
                color,
                location,
                workingHours,
                compensationRule
            } = holidayData;

            // Check if holiday with same name and date exists
            const existingHoliday = await Holiday.findOne({
                where: {
                    name: name,
                    date: date
                }
            });

            if (existingHoliday) {
                return {
                    success: false,
                    message: 'Holiday with this name and date already exists'
                };
            }

            const holiday = await Holiday.create({
                name,
                description,
                date,
                type,
                isRecurring,
                recurrenceRule,
                applicableTo,
                departments,
                employees,
                isOptional,
                isPaid,
                color,
                location,
                workingHours,
                compensationRule,
                createdBy: userId
            });

            // Log creation in audit log
            await AuditLog.logAction({
                userId,
                action: 'holiday_create',
                module: 'holiday',
                targetType: 'Holiday',
                targetId: holiday.id,
                newValues: holidayData,
                description: `Created new holiday: ${holiday.name}`,
                ipAddress: metadata.ipAddress,
                userAgent: metadata.userAgent,
                severity: 'medium'
            });

            const createdHoliday = await Holiday.findByPk(holiday.id, {
                include: [
                    {
                        model: User,
                        as: 'creator',
                        attributes: ['id', 'name', 'email']
                    }
                ]
            });

            return {
                success: true,
                message: 'Holiday created successfully',
                data: createdHoliday
            };
        } catch (error) {
            return {
                success: false,
                message: 'Failed to create holiday',
                error: error.message
            };
        }
    }

    /**
     * Update holiday
     */
    async updateHoliday(id, holidayData, userId, metadata = {}) {
        try {
            const holiday = await Holiday.findByPk(id);

            if (!holiday) {
                return {
                    success: false,
                    message: 'Holiday not found'
                };
            }

            // Check if another holiday with same name and date exists
            const existingHoliday = await Holiday.findOne({
                where: {
                    id: { [Op.ne]: id },
                    name: holidayData.name,
                    date: holidayData.date
                }
            });

            if (existingHoliday) {
                return {
                    success: false,
                    message: 'Another holiday with this name and date already exists'
                };
            }

            const oldValues = {
                name: holiday.name,
                date: holiday.date,
                type: holiday.type,
                isActive: holiday.isActive
            };

            await holiday.update({
                ...holidayData,
                updatedBy: userId
            });

            // Log update in audit log
            await AuditLog.logAction({
                userId,
                action: 'holiday_update',
                module: 'holiday',
                targetType: 'Holiday',
                targetId: holiday.id,
                oldValues,
                newValues: holidayData,
                description: `Updated holiday: ${holiday.name}`,
                ipAddress: metadata.ipAddress,
                userAgent: metadata.userAgent,
                severity: 'medium'
            });

            const updatedHoliday = await Holiday.findByPk(id, {
                include: [
                    {
                        model: User,
                        as: 'creator',
                        attributes: ['id', 'name', 'email']
                    },
                    {
                        model: User,
                        as: 'updater',
                        attributes: ['id', 'name', 'email']
                    }
                ]
            });

            return {
                success: true,
                message: 'Holiday updated successfully',
                data: updatedHoliday
            };
        } catch (error) {
            return {
                success: false,
                message: 'Failed to update holiday',
                error: error.message
            };
        }
    }

    /**
     * Delete holiday
     */
    async deleteHoliday(id, userId, metadata = {}) {
        try {
            const holiday = await Holiday.findByPk(id);

            if (!holiday) {
                return {
                    success: false,
                    message: 'Holiday not found'
                };
            }

            await holiday.destroy();

            // Log deletion in audit log
            await AuditLog.logAction({
                userId,
                action: 'holiday_delete',
                module: 'holiday',
                targetType: 'Holiday',
                targetId: holiday.id,
                description: `Deleted holiday: ${holiday.name}`,
                ipAddress: metadata.ipAddress,
                userAgent: metadata.userAgent,
                severity: 'high'
            });

            return {
                success: true,
                message: 'Holiday deleted successfully'
            };
        } catch (error) {
            return {
                success: false,
                message: 'Failed to delete holiday',
                error: error.message
            };
        }
    }

    /**
     * Toggle holiday status
     */
    async toggleHolidayStatus(id, userId, metadata = {}) {
        try {
            const holiday = await Holiday.findByPk(id);

            if (!holiday) {
                return {
                    success: false,
                    message: 'Holiday not found'
                };
            }

            const oldStatus = holiday.isActive;
            await holiday.update({
                isActive: !holiday.isActive,
                updatedBy: userId
            });

            // Log status change in audit log
            await AuditLog.logAction({
                userId,
                action: 'holiday_status_toggle',
                module: 'holiday',
                targetType: 'Holiday',
                targetId: holiday.id,
                oldValues: { isActive: oldStatus },
                newValues: { isActive: holiday.isActive },
                description: `${holiday.isActive ? 'Activated' : 'Deactivated'} holiday: ${holiday.name}`,
                ipAddress: metadata.ipAddress,
                userAgent: metadata.userAgent,
                severity: 'medium'
            });

            return {
                success: true,
                message: `Holiday ${holiday.isActive ? 'activated' : 'deactivated'} successfully`,
                data: { isActive: holiday.isActive }
            };
        } catch (error) {
            return {
                success: false,
                message: 'Failed to toggle holiday status',
                error: error.message
            };
        }
    }

    /**
     * Get holidays for calendar
     */
    async getHolidaysForCalendar(filters = {}) {
        try {
            const { startDate, endDate, type } = filters;

            const whereClause = {
                isActive: true
            };

            if (startDate && endDate) {
                whereClause.date = {
                    [Op.between]: [startDate, endDate]
                };
            }

            if (type) {
                whereClause.type = type;
            }

            const holidays = await Holiday.findAll({
                where: whereClause,
                attributes: ['id', 'name', 'date', 'type', 'color', 'isOptional', 'isPaid'],
                order: [['date', 'ASC']]
            });

            return {
                success: true,
                data: holidays
            };
        } catch (error) {
            return {
                success: false,
                message: 'Failed to fetch holidays for calendar',
                error: error.message
            };
        }
    }

    /**
     * Get upcoming holidays
     */
    async getUpcomingHolidays(limit = 5) {
        try {
            const today = new Date().toISOString().split('T')[0];

            const holidays = await Holiday.findAll({
                where: {
                    date: { [Op.gte]: today },
                    isActive: true
                },
                attributes: ['id', 'name', 'date', 'type', 'color'],
                limit: parseInt(limit),
                order: [['date', 'ASC']]
            });

            return {
                success: true,
                data: holidays
            };
        } catch (error) {
            return {
                success: false,
                message: 'Failed to fetch upcoming holidays',
                error: error.message
            };
        }
    }

    /**
     * Check if date is holiday
     */
    async checkHoliday(date) {
        try {
            const holiday = await Holiday.findOne({
                where: {
                    date: date,
                    isActive: true
                },
                attributes: ['id', 'name', 'type', 'isOptional', 'isPaid', 'compensationRule']
            });

            return {
                success: true,
                data: {
                    isHoliday: !!holiday,
                    holiday: holiday || null
                }
            };
        } catch (error) {
            return {
                success: false,
                message: 'Failed to check holiday',
                error: error.message
            };
        }
    }
}

export default new HolidayService();