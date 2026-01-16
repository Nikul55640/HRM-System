/**
 * Holiday Service Layer
 * Handles all business logic for holiday management
 */

import { Holiday, User, AuditLog } from '../../models/index.js';
import { Op } from 'sequelize';
import { getLocalDateString } from '../../utils/dateUtils.js';

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
                        attributes: ['id', 'email']
                    },
                    {
                        model: User,
                        as: 'updater',
                        attributes: ['id', 'email']
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
                        attributes: ['id', 'email']
                    },
                    {
                        model: User,
                        as: 'updater',
                        attributes: ['id', 'email']
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
                recurringDate,
                category,
                appliesEveryYear,
                isPaid,
                color,
                isActive
            } = holidayData;

            // Validation: Check that either date or recurringDate is provided based on type
            if (type === 'ONE_TIME' && !date) {
                return {
                    success: false,
                    message: 'One-time holidays must have a date'
                };
            }

            if (type === 'RECURRING' && !recurringDate) {
                return {
                    success: false,
                    message: 'Recurring holidays must have a recurring date in MM-DD format'
                };
            }

            // Check if holiday with same name exists for the same period
            let existingHoliday;
            if (type === 'ONE_TIME') {
                existingHoliday = await Holiday.findOne({
                    where: {
                        name: name,
                        date: date,
                        type: 'ONE_TIME'
                    }
                });
            } else {
                existingHoliday = await Holiday.findOne({
                    where: {
                        name: name,
                        recurringDate: recurringDate,
                        type: 'RECURRING'
                    }
                });
            }

            if (existingHoliday) {
                return {
                    success: false,
                    message: 'Holiday with this name and date already exists'
                };
            }

            const holiday = await Holiday.create({
                name,
                description,
                date: type === 'ONE_TIME' ? date : null,
                recurringDate: type === 'RECURRING' ? recurringDate : null,
                type,
                category,
                appliesEveryYear: type === 'RECURRING' ? true : (appliesEveryYear || false),
                isPaid: isPaid !== undefined ? isPaid : true,
                color: color || '#dc2626',
                isActive: isActive !== undefined ? isActive : true,
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
                        attributes: ['id', 'email']
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

            const {
                name,
                description,
                date,
                type,
                recurringDate,
                category,
                appliesEveryYear,
                isPaid,
                color,
                isActive
            } = holidayData;

            // Validation: Check that either date or recurringDate is provided based on type
            if (type === 'ONE_TIME' && !date) {
                return {
                    success: false,
                    message: 'One-time holidays must have a date'
                };
            }

            if (type === 'RECURRING' && !recurringDate) {
                return {
                    success: false,
                    message: 'Recurring holidays must have a recurring date in MM-DD format'
                };
            }

            // Check if another holiday with same name exists for the same period
            let existingHoliday;
            if (type === 'ONE_TIME') {
                existingHoliday = await Holiday.findOne({
                    where: {
                        id: { [Op.ne]: id },
                        name: name,
                        date: date,
                        type: 'ONE_TIME'
                    }
                });
            } else {
                existingHoliday = await Holiday.findOne({
                    where: {
                        id: { [Op.ne]: id },
                        name: name,
                        recurringDate: recurringDate,
                        type: 'RECURRING'
                    }
                });
            }

            if (existingHoliday) {
                return {
                    success: false,
                    message: 'Another holiday with this name and date already exists'
                };
            }

            const oldValues = {
                name: holiday.name,
                date: holiday.date,
                recurringDate: holiday.recurringDate,
                type: holiday.type,
                category: holiday.category,
                isActive: holiday.isActive
            };

            await holiday.update({
                name,
                description,
                date: type === 'ONE_TIME' ? date : null,
                recurringDate: type === 'RECURRING' ? recurringDate : null,
                type,
                category,
                appliesEveryYear: type === 'RECURRING' ? true : (appliesEveryYear || false),
                isPaid: isPaid !== undefined ? isPaid : holiday.isPaid,
                color: color || holiday.color,
                isActive: isActive !== undefined ? isActive : holiday.isActive,
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
            // ✅ FIX: Use local timezone, not UTC
            const today = getLocalDateString();

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

    /**
     * Get holidays for date range (used by AttendancePolicyService)
     * Single source of truth for holiday business logic
     */
    async getHolidaysForDateRange(startDate, endDate, options = {}) {
        try {
            const { includeInactive = false, hrApprovalStatus = 'approved' } = options;
            
            const whereClause = {
                [Op.or]: [
                    {
                        type: 'ONE_TIME',
                        date: {
                            [Op.between]: [startDate, endDate]
                        }
                    },
                    {
                        type: 'RECURRING',
                        appliesEveryYear: true
                    }
                ]
            };

            if (!includeInactive) {
                whereClause.isActive = true;
            }

            if (hrApprovalStatus) {
                whereClause.hrApprovalStatus = hrApprovalStatus;
            }

            const holidays = await Holiday.findAll({
                where: whereClause,
                order: [['date', 'ASC']]
            });

            // Generate recurring holidays for the date range
            const generatedHolidays = [];
            const startYear = startDate.getFullYear();
            const endYear = endDate.getFullYear();

            for (const holiday of holidays) {
                if (holiday.type === 'ONE_TIME') {
                    generatedHolidays.push(holiday);
                } else if (holiday.type === 'RECURRING') {
                    for (let year = startYear; year <= endYear; year++) {
                        const [month, day] = holiday.recurringDate.split('-');
                        const holidayDate = new Date(year, parseInt(month) - 1, parseInt(day));
                        
                        if (holidayDate >= startDate && holidayDate <= endDate) {
                            generatedHolidays.push({
                                ...holiday.toJSON(),
                                // ✅ FIX: Use local timezone, not UTC
                                date: getLocalDateString(holidayDate),
                                id: `${holiday.id}_${year}`,
                                isGenerated: true
                            });
                        }
                    }
                }
            }

            return {
                success: true,
                data: generatedHolidays.sort((a, b) => new Date(a.date) - new Date(b.date))
            };
        } catch (error) {
            return {
                success: false,
                message: 'Failed to get holidays for date range',
                error: error.message
            };
        }
    }

    /**
     * Check if a specific date is a holiday
     * Used by AttendancePolicyService for day status evaluation
     */
    async isHoliday(date) {
        try {
            const checkDate = new Date(date);
            const startOfDay = new Date(checkDate.setHours(0, 0, 0, 0));
            const endOfDay = new Date(checkDate.setHours(23, 59, 59, 999));
            
            const result = await this.getHolidaysForDateRange(startOfDay, endOfDay);
            
            if (!result.success) {
                return result;
            }

            const holiday = result.data.length > 0 ? result.data[0] : null;
            
            return {
                success: true,
                data: {
                    isHoliday: !!holiday,
                    holiday: holiday
                }
            };
        } catch (error) {
            return {
                success: false,
                message: 'Failed to check if date is holiday',
                error: error.message
            };
        }
    }

    /**
     * Approve holiday (HR workflow)
     */
    async approveHoliday(id, userId, metadata = {}) {
        try {
            const holiday = await Holiday.findByPk(id);

            if (!holiday) {
                return {
                    success: false,
                    message: 'Holiday not found'
                };
            }

            const oldStatus = holiday.hrApprovalStatus;
            await holiday.update({
                hrApprovalStatus: 'approved',
                visibleToEmployees: true,
                updatedBy: userId
            });

            // Log approval in audit log
            await AuditLog.logAction({
                userId,
                action: 'holiday_approve',
                module: 'holiday',
                targetType: 'Holiday',
                targetId: holiday.id,
                oldValues: { hrApprovalStatus: oldStatus },
                newValues: { hrApprovalStatus: 'approved', visibleToEmployees: true },
                description: `Approved holiday: ${holiday.name}`,
                ipAddress: metadata.ipAddress,
                userAgent: metadata.userAgent,
                severity: 'medium'
            });

            return {
                success: true,
                message: 'Holiday approved successfully',
                data: holiday
            };
        } catch (error) {
            return {
                success: false,
                message: 'Failed to approve holiday',
                error: error.message
            };
        }
    }

    /**
     * Reject holiday (HR workflow)
     */
    async rejectHoliday(id, userId, metadata = {}) {
        try {
            const holiday = await Holiday.findByPk(id);

            if (!holiday) {
                return {
                    success: false,
                    message: 'Holiday not found'
                };
            }

            const oldStatus = holiday.hrApprovalStatus;
            await holiday.update({
                hrApprovalStatus: 'rejected',
                visibleToEmployees: false,
                updatedBy: userId
            });

            // Log rejection in audit log
            await AuditLog.logAction({
                userId,
                action: 'holiday_reject',
                module: 'holiday',
                targetType: 'Holiday',
                targetId: holiday.id,
                oldValues: { hrApprovalStatus: oldStatus },
                newValues: { hrApprovalStatus: 'rejected', visibleToEmployees: false },
                description: `Rejected holiday: ${holiday.name}`,
                ipAddress: metadata.ipAddress,
                userAgent: metadata.userAgent,
                severity: 'medium'
            });

            return {
                success: true,
                message: 'Holiday rejected successfully',
                data: holiday
            };
        } catch (error) {
            return {
                success: false,
                message: 'Failed to reject holiday',
                error: error.message
            };
        }
    }

    /**
     * Import holidays from Google Calendar (for future Google integration)
     */
    async importFromGoogle(googleHolidays, userId, metadata = {}) {
        try {
            const importedHolidays = [];
            
            for (const googleHoliday of googleHolidays) {
                // Check if holiday already exists
                const existingHoliday = await Holiday.findOne({
                    where: {
                        name: googleHoliday.name,
                        date: googleHoliday.date
                    }
                });

                if (!existingHoliday) {
                    const holiday = await Holiday.create({
                        name: googleHoliday.name,
                        description: googleHoliday.description || `Imported from Google Calendar`,
                        date: googleHoliday.date,
                        type: 'ONE_TIME',
                        category: googleHoliday.category || 'public',
                        hrApprovalStatus: 'pending', // Requires HR approval
                        visibleToEmployees: false, // Hidden until approved
                        includeInPayroll: true,
                        locationScope: googleHoliday.locationScope || 'GLOBAL',
                        createdBy: userId
                    });

                    importedHolidays.push(holiday);
                }
            }

            // Log import in audit log
            await AuditLog.logAction({
                userId,
                action: 'holiday_import_google',
                module: 'holiday',
                description: `Imported ${importedHolidays.length} holidays from Google Calendar`,
                ipAddress: metadata.ipAddress,
                userAgent: metadata.userAgent,
                severity: 'medium'
            });

            return {
                success: true,
                message: `Successfully imported ${importedHolidays.length} holidays from Google Calendar`,
                data: {
                    imported: importedHolidays.length,
                    holidays: importedHolidays
                }
            };
        } catch (error) {
            return {
                success: false,
                message: 'Failed to import holidays from Google Calendar',
                error: error.message
            };
        }
    }
}

export default new HolidayService();