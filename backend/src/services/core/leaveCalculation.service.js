/**
 * Leave Calculation Service
 * Centralized business logic for leave calculations and validations
 * Eliminates duplication across leave services and controllers
 */

import { LeaveRequest, LeaveBalance, Holiday } from '../../models/index.js';
import { Op } from 'sequelize';
import DateCalculationService from './dateCalculation.service.js';
import logger from '../../utils/logger.js';

class LeaveCalculationService {
    /**
     * Calculate leave duration in days
     * @param {Date|string} startDate - Leave start date
     * @param {Date|string} endDate - Leave end date
     * @param {boolean} isHalfDay - Is this a half day leave
     * @param {boolean} excludeWeekends - Whether to exclude weekends from calculation
     * @param {boolean} excludeHolidays - Whether to exclude holidays from calculation
     * @returns {Promise<Object>} Leave duration calculation result
     */
    static async calculateLeaveDuration(startDate, endDate, isHalfDay = false, excludeWeekends = false, excludeHolidays = false) {
        try {
            const start = new Date(startDate);
            const end = new Date(endDate);

            // Validate dates
            if (start > end) {
                throw new Error('Start date cannot be after end date');
            }

            // Handle half day
            if (isHalfDay) {
                return {
                    totalDays: 0.5,
                    workingDays: 0.5,
                    weekendDays: 0,
                    holidayDays: 0,
                    calculationMethod: 'half_day'
                };
            }

            // Basic calculation (inclusive of both start and end dates)
            const timeDiff = end.getTime() - start.getTime();
            const totalDays = Math.floor(timeDiff / (1000 * 60 * 60 * 24)) + 1;

            if (!excludeWeekends && !excludeHolidays) {
                return {
                    totalDays,
                    workingDays: totalDays,
                    weekendDays: 0,
                    holidayDays: 0,
                    calculationMethod: 'calendar_days'
                };
            }

            // Advanced calculation excluding weekends/holidays
            let workingDays = 0;
            let weekendDays = 0;
            let holidayDays = 0;

            const currentDate = new Date(start);
            while (currentDate <= end) {
                const dateStr = currentDate.toISOString().split('T')[0];
                
                // Check if weekend
                const dayOfWeek = currentDate.getDay();
                const isWeekend = excludeWeekends && (dayOfWeek === 0 || dayOfWeek === 6);
                
                // Check if holiday
                let isHoliday = false;
                if (excludeHolidays) {
                    const holiday = await Holiday.findOne({
                        where: {
                            [Op.or]: [
                                { date: dateStr, type: 'ONE_TIME' },
                                { recurringDate: dateStr.slice(5), type: 'RECURRING' }
                            ],
                            isActive: true
                        }
                    });
                    isHoliday = !!holiday;
                }

                // Categorize the day
                if (isWeekend) {
                    weekendDays++;
                } else if (isHoliday) {
                    holidayDays++;
                } else {
                    workingDays++;
                }

                currentDate.setDate(currentDate.getDate() + 1);
            }

            return {
                totalDays,
                workingDays,
                weekendDays,
                holidayDays,
                calculationMethod: 'business_days'
            };

        } catch (error) {
            logger.error('Error calculating leave duration:', error);
            throw error;
        }
    }

    /**
     * Check for overlapping leave requests
     * @param {number} employeeId - Employee ID
     * @param {Date|string} startDate - New leave start date
     * @param {Date|string} endDate - New leave end date
     * @param {number} excludeRequestId - Optional request ID to exclude from check
     * @returns {Promise<Object>} Overlap check result
     */
    static async checkLeaveOverlap(employeeId, startDate, endDate, excludeRequestId = null) {
        try {
            const whereClause = {
                employeeId,
                status: { [Op.in]: ['pending', 'approved'] },
                [Op.or]: [
                    // New leave starts during existing leave
                    {
                        startDate: { [Op.lte]: startDate },
                        endDate: { [Op.gte]: startDate }
                    },
                    // New leave ends during existing leave
                    {
                        startDate: { [Op.lte]: endDate },
                        endDate: { [Op.gte]: endDate }
                    },
                    // New leave completely contains existing leave
                    {
                        startDate: { [Op.gte]: startDate },
                        endDate: { [Op.lte]: endDate }
                    },
                    // Existing leave completely contains new leave
                    {
                        startDate: { [Op.lte]: startDate },
                        endDate: { [Op.gte]: endDate }
                    }
                ]
            };

            // Exclude specific request if provided (for updates)
            if (excludeRequestId) {
                whereClause.id = { [Op.ne]: excludeRequestId };
            }

            const overlappingRequest = await LeaveRequest.findOne({
                where: whereClause,
                attributes: ['id', 'startDate', 'endDate', 'leaveType', 'status']
            });

            return {
                hasOverlap: !!overlappingRequest,
                overlappingRequest: overlappingRequest || null
            };

        } catch (error) {
            logger.error('Error checking leave overlap:', error);
            throw error;
        }
    }

    /**
     * Validate leave balance availability
     * @param {number} employeeId - Employee ID
     * @param {string} leaveType - Type of leave
     * @param {number} requestedDays - Number of days requested
     * @param {number} year - Leave year (optional, defaults to current year)
     * @returns {Promise<Object>} Balance validation result
     */
    static async validateLeaveBalance(employeeId, leaveType, requestedDays, year = null) {
        try {
            const targetYear = year || new Date().getFullYear();

            const leaveBalance = await LeaveBalance.findOne({
                where: {
                    employeeId,
                    leaveType,
                    year: targetYear
                }
            });

            if (!leaveBalance) {
                return {
                    isValid: false,
                    reason: `No leave balance found for ${leaveType} in ${targetYear}`,
                    available: 0,
                    requested: requestedDays
                };
            }

            const isValid = leaveBalance.remaining >= requestedDays;

            return {
                isValid,
                reason: isValid ? 'Sufficient balance available' : 
                       `Insufficient balance. Available: ${leaveBalance.remaining}, Requested: ${requestedDays}`,
                available: leaveBalance.remaining,
                requested: requestedDays,
                balance: leaveBalance
            };

        } catch (error) {
            logger.error('Error validating leave balance:', error);
            throw error;
        }
    }

    /**
     * Calculate leave balance adjustment
     * @param {number} employeeId - Employee ID
     * @param {string} leaveType - Type of leave
     * @param {number} days - Number of days to adjust
     * @param {string} operation - 'deduct' or 'restore'
     * @param {string} status - Leave status ('pending', 'approved', 'rejected')
     * @returns {Promise<Object>} Balance adjustment result
     */
    static async calculateBalanceAdjustment(employeeId, leaveType, days, operation, status) {
        try {
            const currentYear = new Date().getFullYear();
            
            const leaveBalance = await LeaveBalance.findOne({
                where: {
                    employeeId,
                    leaveType,
                    year: currentYear
                }
            });

            if (!leaveBalance) {
                throw new Error(`No leave balance found for ${leaveType}`);
            }

            let newRemaining = leaveBalance.remaining;
            let newUsed = leaveBalance.used;
            let newPending = leaveBalance.pending || 0;

            switch (operation) {
                case 'deduct':
                    if (status === 'pending') {
                        newPending += days;
                        newRemaining -= days;
                    } else if (status === 'approved') {
                        newUsed += days;
                        newRemaining -= days;
                    }
                    break;

                case 'restore':
                    if (status === 'pending') {
                        newPending -= days;
                        newRemaining += days;
                    } else if (status === 'approved') {
                        newUsed -= days;
                        newRemaining += days;
                    }
                    break;

                case 'convert_pending_to_approved':
                    newPending -= days;
                    newUsed += days;
                    // Remaining stays the same
                    break;

                default:
                    throw new Error(`Invalid operation: ${operation}`);
            }

            return {
                currentBalance: {
                    remaining: leaveBalance.remaining,
                    used: leaveBalance.used,
                    pending: leaveBalance.pending || 0
                },
                newBalance: {
                    remaining: Math.max(0, newRemaining),
                    used: Math.max(0, newUsed),
                    pending: Math.max(0, newPending)
                },
                adjustment: {
                    operation,
                    days,
                    status
                }
            };

        } catch (error) {
            logger.error('Error calculating balance adjustment:', error);
            throw error;
        }
    }

    /**
     * Get leave requests for a specific date range
     * @param {Date|string} startDate - Range start date
     * @param {Date|string} endDate - Range end date
     * @param {number} employeeId - Optional employee ID filter
     * @param {Array} statuses - Optional status filter
     * @returns {Promise<Array>} Leave requests in date range
     */
    static async getLeavesInDateRange(startDate, endDate, employeeId = null, statuses = ['approved']) {
        try {
            const whereClause = {
                status: { [Op.in]: statuses },
                [Op.or]: [
                    // Leave starts in range
                    {
                        startDate: { [Op.between]: [startDate, endDate] }
                    },
                    // Leave ends in range
                    {
                        endDate: { [Op.between]: [startDate, endDate] }
                    },
                    // Leave spans the entire range
                    {
                        startDate: { [Op.lte]: startDate },
                        endDate: { [Op.gte]: endDate }
                    }
                ]
            };

            if (employeeId) {
                whereClause.employeeId = employeeId;
            }

            const leaves = await LeaveRequest.findAll({
                where: whereClause,
                order: [['startDate', 'ASC']]
            });

            return leaves;

        } catch (error) {
            logger.error('Error getting leaves in date range:', error);
            throw error;
        }
    }
}

export default LeaveCalculationService;