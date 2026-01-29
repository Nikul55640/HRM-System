/**
 * Attendance Service Layer
 * Handles all business logic for attendance management with break and late tracking
 */

import { AttendanceRecord, Employee, Shift, EmployeeShift, AuditLog } from '../../models/index.js';
import { Op } from 'sequelize';
import logger from '../../utils/logger.js';
import { ROLES } from '../../config/rolePermissions.js';
import { getLocalDateString } from '../../utils/dateUtils.js';
import AttendanceCalculationService from '../core/attendanceCalculation.service.js';

class AttendanceService {
    /**
     * Clock In - Employee starts their work day
     * @param {Object} clockInData - Clock in data with location, device info
     * @param {Object} user - User clocking in
     * @param {Object} metadata - Request metadata
     * @returns {Promise<Object>} Clock in result
     */
    async clockIn(clockInData, user, metadata = {}) {
        const transaction = await AttendanceRecord.sequelize.transaction();
        
        try {
            if (!user.employee?.id) {
                throw { message: "No employee profile linked to this user", statusCode: 400 };
            }

            const today = getLocalDateString();
            
            // Check if already clocked in today
            let attendanceRecord = await AttendanceRecord.findOne({
                where: {
                    employeeId: user.employee?.id,
                    date: today
                },
                transaction
            });

            // Get employee's assigned shift first (needed for button control)
            let assignedShift = null;
            try {
                const employee = await Employee.findByPk(user.employee?.id, {
                    include: [{
                        model: EmployeeShift,
                        as: 'shiftAssignments',
                        where: { isActive: true },
                        required: false,
                        include: [{
                            model: Shift,
                            as: 'shift'
                        }]
                    }]
                });
                if (employee && employee.shiftAssignments && employee.shiftAssignments.length > 0) {
                    assignedShift = employee.shiftAssignments[0].shift;
                }
            } catch (error) {
                logger.warn('EmployeeShift association not found, using default shift');
            }

            // Fallback to default shift if no specific assignment
            if (!assignedShift) {
                assignedShift = await Shift.findOne({ where: { isDefault: true } });
            }

            // 🚫 APPLY ENHANCED BUTTON CONTROL RULES
            if (attendanceRecord) {
                const canClockIn = attendanceRecord.canClockIn(assignedShift);
                if (!canClockIn.allowed) {
                    throw { message: canClockIn.reason, statusCode: 400 };
                }
            }

            const clockInTime = new Date();
            
            // Extract work mode from request
            const workMode = clockInData.workMode || 'office';
            
            logger.debug('Clock-in data verification:', {
                workMode,
                hasLocation: !!clockInData.location,
                locationData: clockInData.location ? {
                    type: clockInData.location.type,
                    hasCoordinates: !!(clockInData.location.coordinates?.latitude)
                } : null,
                hasDeviceInfo: !!clockInData.deviceInfo,
                deviceInfoKeys: clockInData.deviceInfo ? Object.keys(clockInData.deviceInfo) : []
            });
            
            // Create or update attendance record
            if (!attendanceRecord) {
                try {
                    attendanceRecord = await AttendanceRecord.create({
                        employeeId: user.employee?.id,
                        shiftId: assignedShift?.id || null,
                        date: today,
                        clockIn: clockInTime,
                        workMode: workMode,
                        location: clockInData.location || null,
                        deviceInfo: clockInData.deviceInfo || null,
                        status: 'in_progress', // ✅ LIVE STATE: Employee is now working
                        createdBy: user.id
                    }, { transaction });
                } catch (createError) {
                    // Handle unique constraint violation
                    if (createError.name === 'SequelizeUniqueConstraintError') {
                        throw { message: 'Already clocked in today', statusCode: 400 };
                    }
                    throw createError;
                }
            } else {
                await attendanceRecord.update({
                    clockIn: clockInTime,
                    workMode: workMode,
                    location: clockInData.location || null,
                    deviceInfo: clockInData.deviceInfo || null,
                    status: 'in_progress', // ✅ LIVE STATE: Employee is now working
                    updatedBy: user.id
                }, { transaction });
            }

            // Calculate late status at clock-in using centralized service
            if (assignedShift) {
                const lateCalculation = AttendanceCalculationService.calculateLateStatus(clockInTime, assignedShift, today);
                
                // Update late status immediately (CRITICAL: Use transaction)
                await attendanceRecord.update({
                    lateMinutes: lateCalculation.lateMinutes,
                    isLate: lateCalculation.isLate,
                    updatedBy: user.id
                }, { transaction });
            }

            // Reload to get updated data
            await attendanceRecord.reload({ transaction });

            await transaction.commit();

            const clockInResponse = {
                ...attendanceRecord.toJSON(),
                clockInSummary: {
                    clockInTime: clockInTime.toLocaleTimeString('en-US', { 
                        hour: '2-digit', 
                        minute: '2-digit' 
                    }),
                    workMode: workMode,
                    shiftStartTime: assignedShift ? assignedShift.shiftStartTime : null,
                    isLate: attendanceRecord.isLate,
                    lateMinutes: attendanceRecord.lateMinutes,
                    status: attendanceRecord.isLate ? `Late by ${attendanceRecord.lateMinutes} minutes` : 'On time',
                    shiftName: assignedShift ? assignedShift.shiftName : null,
                    gracePeriodMinutes: assignedShift ? assignedShift.gracePeriodMinutes || 0 : 0
                }
            };

            return {
                success: true,
                data: clockInResponse,
                message: attendanceRecord.isLate ? 
                    `Clocked in successfully (${workMode}). You are late by ${attendanceRecord.lateMinutes} minutes.` : 
                    `Clocked in successfully (${workMode}). You are on time!`
            };
        } catch (error) {
            await transaction.rollback();
            logger.error('Error in clock in:', error);
            return {
                success: false,
                message: error.message || 'Failed to clock in',
                error: error.message
            };
        }
    }

    /**
     * Clock Out - Employee ends their work day
     * @param {Object} clockOutData - Clock out data
     * @param {Object} user - User clocking out
     * @param {Object} metadata - Request metadata
     * @returns {Promise<Object>} Clock out result
     */
    async clockOut(clockOutData, user, metadata = {}) {
        try {
            if (!user.employee?.id) {
                throw { message: "No employee profile linked to this user", statusCode: 404 };
            }

            const today = getLocalDateString();

            const attendanceRecord = await AttendanceRecord.findOne({
                where: {
                    employeeId: user.employee?.id,
                    date: today
                }
            });

            if (!attendanceRecord) {
                throw { message: "No attendance record found for today", statusCode: 400 };
            }

            // 🔥 NEW: Get employee's shift for grace period check
            const employeeShift = await EmployeeShift.findOne({
                where: {
                    employeeId: user.employee?.id,
                    isActive: true,
                    effectiveDate: { [Op.lte]: today },
                    [Op.or]: [
                        { endDate: null },
                        { endDate: { [Op.gte]: today } }
                    ]
                }
            });

            let shift = null;
            if (employeeShift) {
                shift = await Shift.findByPk(employeeShift.shiftId, {
                    attributes: ['shiftStartTime', 'shiftEndTime', 'fullDayHours', 'halfDayHours', 'gracePeriodMinutes']
                });
            }

            // 🚫 APPLY ENHANCED BUTTON CONTROL RULES (with grace period check)
            const canClockOut = attendanceRecord.canClockOut(shift);
            if (!canClockOut.allowed) {
                throw { message: canClockOut.reason, statusCode: 400 };
            }

            // Check if there's an active break session - must end break before clocking out
            if (attendanceRecord.breakSessions && attendanceRecord.breakSessions.some(session => session.breakIn && !session.breakOut)) {
                throw { message: "Please end your current break session before clocking out", statusCode: 400 };
            }

            const clockOutTime = new Date();

            // 🔧 CRITICAL FIX: Calculate work hours using AttendanceCalculationService
            const { workMinutes, breakMinutes } = AttendanceCalculationService.calculateWorkHours(
                attendanceRecord.clockIn,
                clockOutTime,
                attendanceRecord.breakSessions
            );

            await attendanceRecord.update({
                clockOut: clockOutTime,
                totalWorkedMinutes: workMinutes,
                totalBreakMinutes: breakMinutes,
                workHours: Math.round((workMinutes / 60) * 100) / 100,
                status: 'completed', // ✅ LIVE STATE: Employee completed work, pending finalization
                updatedBy: user.id
            });

            // Reload to get updated data with calculated hours and status
            await attendanceRecord.reload();

            // Log clock out action
            await AuditLog.logAction({
                userId: user.id,
                action: 'attendance_clock_out',
                module: 'attendance',
                targetType: 'AttendanceRecord',
                targetId: attendanceRecord.id,
                description: `Clocked out at ${clockOutTime.toLocaleTimeString()}. Status: ${attendanceRecord.status}, Hours: ${attendanceRecord.workHours}`,
                ipAddress: metadata.ipAddress,
                userAgent: metadata.userAgent,
                severity: 'low'
            });

            const clockOutResponse = {
                ...attendanceRecord.toJSON(),
                clockOutSummary: {
                    clockOutTime: clockOutTime.toLocaleTimeString('en-US', { 
                        hour: '2-digit', 
                        minute: '2-digit' 
                    }),
                    totalHours: attendanceRecord.workHours,
                    status: attendanceRecord.status,
                    statusReason: attendanceRecord.statusReason,
                    workMode: attendanceRecord.workMode || 'office'
                }
            };

            return {
                success: true,
                data: clockOutResponse,
                message: 'Clocked out successfully. Attendance will be finalized shortly.'
            };
        } catch (error) {
            logger.error('Error in clock out:', error);
            return {
                success: false,
                message: error.message || 'Failed to clock out',
                error: error.message
            };
        }
    }

    /**
     * Start Break - Employee starts a break
     * @param {Object} user - User starting break
     * @param {Object} metadata - Request metadata
     * @returns {Promise<Object>} Break start result
     */
    async startBreak(user, metadata = {}) {
        const transaction = await AttendanceRecord.sequelize.transaction();
        
        try {
            if (!user.employee?.id) {
                throw { message: "No employee profile linked to this user", statusCode: 404 };
            }

            // ✅ FIX: Use local timezone, not UTC
            const today = getLocalDateString();

            const attendanceRecord = await AttendanceRecord.findOne({
                where: {
                    employeeId: user.employee?.id,
                    date: today
                },
                transaction
            });

            if (!attendanceRecord || !attendanceRecord.canStartBreak()) {
                throw { message: "Cannot start break. Either not clocked in or already on break", statusCode: 400 };
            }
            
            const breakInTime = new Date();
            let breakSessions = AttendanceCalculationService.normalizeBreakSessions(attendanceRecord.breakSessions);

            logger.debug('Before adding break session:', {
                currentBreakSessions: breakSessions,
                breakSessionsLength: breakSessions.length
            });

            const newBreakSession = {
                breakIn: breakInTime,
                breakOut: null,
                duration: 0
            };
            
            breakSessions.push(newBreakSession);

            // 🔧 CRITICAL FIX: Use direct assignment + changed() + save() for JSON fields
            attendanceRecord.breakSessions = breakSessions;
            attendanceRecord.updatedBy = user.id;
            // Force Sequelize to recognize the JSON field change
            attendanceRecord.changed('breakSessions', true);
            await attendanceRecord.save({ transaction });

            // Log break start action (with error handling to prevent transaction rollback)
            try {
                await AuditLog.logAction({
                    userId: user.id,
                    action: 'attendance_break_in',
                    module: 'attendance',
                    targetType: 'AttendanceRecord',
                    targetId: attendanceRecord.id,
                    description: `Started break at ${breakInTime.toLocaleTimeString()}`,
                    ipAddress: metadata.ipAddress,
                    userAgent: metadata.userAgent,
                    severity: 'low'
                });
            } catch (auditError) {
                // Log the audit error but don't fail the transaction
                logger.warn('Failed to create audit log for break start:', auditError.message);
            }

            await transaction.commit();

            // 🔧 CRITICAL FIX: Reload the record after commit to get the updated data
            await attendanceRecord.reload();

            return {
                success: true,
                data: attendanceRecord,
                message: 'Break started successfully'
            };
        } catch (error) {
            await transaction.rollback();
            logger.error('Error starting break:', error);
            return {
                success: false,
                message: error.message || 'Failed to start break',
                error: error.message
            };
        }
    }

    /**
     * End Break - Employee ends their break
     * @param {Object} user - User ending break
     * @param {Object} metadata - Request metadata
     * @returns {Promise<Object>} Break end result
     */
    async endBreak(user, metadata = {}) {
        const transaction = await AttendanceRecord.sequelize.transaction();
        
        try {
            if (!user.employee?.id) {
                throw { message: "No employee profile linked to this user", statusCode: 404 };
            }

            // ✅ FIX: Use local timezone, not UTC
            const today = getLocalDateString();

            const attendanceRecord = await AttendanceRecord.findOne({
                where: {
                    employeeId: user.employee?.id,
                    date: today
                },
                transaction
            });

            if (!attendanceRecord || !attendanceRecord.canEndBreak()) {
                throw { message: "No active break session found", statusCode: 400 };
            }

            const breakOutTime = new Date();
            let breakSessions = AttendanceCalculationService.normalizeBreakSessions(attendanceRecord.breakSessions);
            
            const activeBreakIndex = breakSessions.findIndex(session => session.breakIn && !session.breakOut);

            if (activeBreakIndex === -1) {
                throw { message: "No active break session found", statusCode: 400 };
            }

            // End the active break session
            breakSessions[activeBreakIndex].breakOut = breakOutTime;
            breakSessions[activeBreakIndex].duration = AttendanceCalculationService.calculateBreakDuration(breakSessions[activeBreakIndex]);

            // 🔧 CRITICAL FIX: Use direct assignment + changed() + save() for JSON fields
            attendanceRecord.breakSessions = breakSessions;
            attendanceRecord.updatedBy = user.id;
            // Force Sequelize to recognize the JSON field change
            attendanceRecord.changed('breakSessions', true);
            await attendanceRecord.save({ transaction });

            // Log break end action (with error handling to prevent transaction rollback)
            try {
                await AuditLog.logAction({
                    userId: user.id,
                    action: 'attendance_break_out',
                    module: 'attendance',
                    targetType: 'AttendanceRecord',
                    targetId: attendanceRecord.id,
                    description: `Ended break at ${breakOutTime.toLocaleTimeString()} (Duration: ${breakSessions[activeBreakIndex].duration} minutes)`,
                    ipAddress: metadata.ipAddress,
                    userAgent: metadata.userAgent,
                    severity: 'low'
                });
            } catch (auditError) {
                // Log the audit error but don't fail the transaction
                logger.warn('Failed to create audit log for break end:', auditError.message);
            }

            await transaction.commit();

            // 🔧 CRITICAL FIX: Reload the record after commit to get the updated data
            await attendanceRecord.reload();

            return {
                success: true,
                data: attendanceRecord,
                message: `Break ended successfully. Duration: ${breakSessions[activeBreakIndex].duration} minutes`
            };
        } catch (error) {
            await transaction.rollback();
            logger.error('Error ending break:', error);
            return {
                success: false,
                message: error.message || 'Failed to end break',
                error: error.message
            };
        }
    }

    /**
     * Get today's attendance status for employee
     * @param {Object} user - User requesting attendance status
     * @returns {Promise<Object>} Today's attendance status
     */
    async getTodayAttendance(user) {
        try {
            if (!user.employee?.id) {
                throw { message: "No employee profile linked to this user", statusCode: 404 };
            }

            // ✅ FIX: Use local timezone, not UTC
            const today = getLocalDateString();

            // 🔧 CRITICAL FIX: Force fresh read from database to avoid stale data
            const attendanceRecord = await AttendanceRecord.findOne({
                where: {
                    employeeId: user.employee?.id,
                    date: today
                },
                include: [
                    {
                        model: Shift,
                        as: 'shift',
                        attributes: ['shiftName', 'shiftStartTime', 'shiftEndTime', 'gracePeriodMinutes']
                    }
                ],
                // Force fresh read from database, bypass any caching
                raw: false,
                nest: true,
                // Ensure we get the latest data
                order: [['updatedAt', 'DESC']]
            });

            // 🔧 CRITICAL FIX: If record exists, reload it to ensure we have the latest data
            if (attendanceRecord) {
                await attendanceRecord.reload({
                    include: [
                        {
                            model: Shift,
                            as: 'shift',
                            attributes: ['shiftName', 'shiftStartTime', 'shiftEndTime', 'gracePeriodMinutes']
                        }
                    ]
                });
            }

            // Debug logging
            if (attendanceRecord) {
                logger.debug('Raw attendance record after reload:', {
                    id: attendanceRecord.id,
                    breakSessions: attendanceRecord.breakSessions,
                    breakSessionsType: typeof attendanceRecord.breakSessions,
                    breakSessionsLength: attendanceRecord.breakSessions?.length,
                    updatedAt: attendanceRecord.updatedAt,
                    dataValues: attendanceRecord.dataValues?.breakSessions
                });

                // Ensure breakSessions is properly formatted
                if (attendanceRecord.breakSessions && Array.isArray(attendanceRecord.breakSessions)) {
                    // Normalize the break sessions to ensure consistent format
                    attendanceRecord.breakSessions = AttendanceCalculationService.normalizeBreakSessions(attendanceRecord.breakSessions);
                    
                    logger.debug('Normalized break sessions:', {
                        breakSessions: attendanceRecord.breakSessions,
                        activeBreaks: attendanceRecord.breakSessions.filter(s => s.breakIn && !s.breakOut).length
                    });
                }
            }

            return {
                success: true,
                data: attendanceRecord || null,
                message: 'Today\'s attendance retrieved successfully'
            };
        } catch (error) {
            logger.error('Error getting today\'s attendance:', error);
            return {
                success: false,
                message: error.message || 'Failed to get attendance status',
                error: error.message
            };
        }
    }

    /**
     * 🚫 NEW: Get button states for attendance controls
     * @param {Object} user - User requesting button states
     * @returns {Promise<Object>} Button states with reasons
     */
    async getButtonStates(user) {
        try {
            if (!user.employee?.id) {
                throw { message: "No employee profile linked to this user", statusCode: 404 };
            }

            const today = getLocalDateString();

            // Get or create today's attendance record
            let attendanceRecord = await AttendanceRecord.findOne({
                where: {
                    employeeId: user.employee?.id,
                    date: today
                }
            });

            // If no record exists, create a minimal one for button state evaluation
            if (!attendanceRecord) {
                attendanceRecord = AttendanceRecord.build({
                    employeeId: user.employee?.id,
                    date: today,
                    status: 'incomplete'
                });
            }

            // 🕐 NEW: Get employee's shift for today to check shift end time
            let shift = null;
            try {
                const employeeShift = await EmployeeShift.findOne({
                    where: {
                        employeeId: user.employee.id,
                        isActive: true,
                        effectiveDate: { [Op.lte]: today },
                        [Op.or]: [
                            { endDate: null },
                            { endDate: { [Op.gte]: today } }
                        ]
                    }
                });

                if (employeeShift) {
                    shift = await Shift.findByPk(employeeShift.shiftId, {
                        attributes: ['shiftStartTime', 'shiftEndTime', 'fullDayHours', 'halfDayHours']
                    });
                }
            } catch (shiftError) {
                logger.warn('Could not fetch shift data for button states:', shiftError.message);
            }

            // Get button states using the new enhanced methods with shift data
            const canClockIn = attendanceRecord.canClockIn(shift);
            const canClockOut = attendanceRecord.canClockOut(shift);
            const canStartBreak = attendanceRecord.canStartBreak();
            const canEndBreak = attendanceRecord.canEndBreak();

            const buttonStates = {
                clockIn: {
                    enabled: canClockIn.allowed,
                    reason: canClockIn.reason
                },
                clockOut: {
                    enabled: canClockOut.allowed,
                    reason: canClockOut.reason
                },
                startBreak: {
                    enabled: canStartBreak.allowed,
                    reason: canStartBreak.reason
                },
                endBreak: {
                    enabled: canEndBreak.allowed,
                    reason: canEndBreak.reason
                },
                // Additional context
                currentStatus: attendanceRecord.status,
                hasClockIn: !!attendanceRecord.clockIn,
                hasClockOut: !!attendanceRecord.clockOut,
                isOnBreak: !!attendanceRecord.getCurrentBreakSession?.(),
                workMode: attendanceRecord.workMode || 'office',
                // 🕐 NEW: Include shift info for frontend
                shiftInfo: shift ? {
                    startTime: shift.shiftStartTime,
                    endTime: shift.shiftEndTime
                } : null
            };

            return {
                success: true,
                data: buttonStates,
                message: 'Button states retrieved successfully'
            };
        } catch (error) {
            logger.error('Error getting button states:', error);
            return {
                success: false,
                message: error.message || 'Failed to get button states',
                error: error.message
            };
        }
    }

    /**
     * Get employee's own attendance records (Employee Self-Service)
     * @param {Object} filters - Filter criteria
     * @param {Object} user - User requesting records
     * @param {Object} pagination - Pagination options
     * @returns {Promise<Object>} Employee's own attendance records
     */
    async getEmployeeOwnAttendanceRecords(filters = {}, user, pagination = {}) {
        try {
            if (!user.employee?.id) {
                throw { message: "No employee profile linked to this user", statusCode: 404 };
            }

            const {
                page = 1,
                limit = 50, // Increase default limit for calendar view
                sortBy = 'date',
                sortOrder = 'DESC',
                month,
                year
            } = pagination;
            const offset = (page - 1) * limit;

            const whereClause = {
                employeeId: user.employee?.id // Only allow viewing own records
            };

            // 🔧 CRITICAL FIX: Handle month/year filtering for calendar
            if (month && year) {
                const startDate = `${year}-${String(month).padStart(2, '0')}-01`;
                const endDate = new Date(year, month, 0).toISOString().split('T')[0]; // Last day of month
                whereClause.date = {
                    [Op.between]: [startDate, endDate]
                };
            } else if (filters.startDate && filters.endDate) {
                whereClause.date = {
                    [Op.between]: [filters.startDate, filters.endDate]
                };
            } else if (filters.date) {
                whereClause.date = filters.date;
            }

            if (filters.status) {
                whereClause.status = filters.status;
            }

            // ✅ NEW: Support correction filters
            if (filters.correctionRequested !== undefined) {
                whereClause.correctionRequested = filters.correctionRequested;
            }

            if (filters.correctionStatus) {
                whereClause.correctionStatus = filters.correctionStatus;
            }

            if (filters.isLate !== undefined) {
                whereClause.isLate = filters.isLate;
            }

            const { count, rows } = await AttendanceRecord.findAndCountAll({
                where: whereClause,
                include: [
                    {
                        model: Employee,
                        as: 'employee',
                        attributes: ['id', 'employeeId', 'firstName', 'lastName', 'department'],
                        required: true
                    },
                    {
                        model: Shift,
                        as: 'shift',
                        attributes: ['shiftName', 'shiftStartTime', 'shiftEndTime'],
                        required: false
                    }
                ],
                order: [[sortBy, sortOrder]],
                limit: parseInt(limit),
                offset: parseInt(offset)
            });

            // 🔧 CRITICAL FIX: Transform data to match frontend expectations exactly
            const transformedRecords = rows.map(record => ({
                // Core fields from AttendanceRecord model
                id: record.id,
                employeeId: record.employeeId,
                date: record.date,
                clockIn: record.clockIn,
                clockOut: record.clockOut,
                
                // Status and timing fields
                status: record.status,
                isLate: record.isLate || false,
                lateMinutes: record.lateMinutes || 0,
                isEarlyDeparture: record.isEarlyDeparture || false,
                earlyExitMinutes: record.earlyExitMinutes || 0,
                
                // Work time calculations
                totalWorkedMinutes: record.totalWorkedMinutes || 0,
                totalBreakMinutes: record.totalBreakMinutes || 0,
                workHours: record.workHours || 0,
                overtimeHours: record.overtimeHours || 0,
                
                // Additional fields
                workMode: record.workMode || 'office',
                halfDayType: record.halfDayType,
                statusReason: record.statusReason,
                
                // Break sessions (if available)
                breakSessions: record.breakSessions || [],
                
                // Correction fields
                correctionRequested: record.correctionRequested || false,
                correctionStatus: record.correctionStatus,
                correctionReason: record.correctionReason,
                
                // Location and device info
                location: record.location,
                deviceInfo: record.deviceInfo,
                
                // Metadata
                createdAt: record.createdAt,
                updatedAt: record.updatedAt,
                
                // Related data
                employee: record.employee ? {
                    id: record.employee.id,
                    employeeId: record.employee.employeeId,
                    firstName: record.employee.firstName,
                    lastName: record.employee.lastName,
                    department: record.employee.department
                } : null,
                shift: record.shift ? {
                    shiftName: record.shift.shiftName,
                    shiftStartTime: record.shift.shiftStartTime,
                    shiftEndTime: record.shift.shiftEndTime
                } : null
            }));

            return {
                success: true,
                data: {
                    records: transformedRecords,
                    pagination: {
                        total: count,
                        page: parseInt(page),
                        limit: parseInt(limit),
                        totalPages: Math.ceil(count / limit)
                    }
                },
                message: 'Your attendance records retrieved successfully'
            };
        } catch (error) {
            logger.error('Error getting employee own attendance records:', error);
            return {
                success: false,
                message: error.message || 'Failed to get attendance records',
                error: error.message
            };
        }
    }

    /**
     * Get attendance records with filtering (Super Admin & HR)
     * @param {Object} filters - Filter criteria
     * @param {Object} user - User requesting records
     * @param {Object} pagination - Pagination options
     * @returns {Promise<Object>} Attendance records
     */
    async getAttendanceRecords(filters = {}, user, pagination = {}) {
        try {
            // Role-based access control
            if (user.role !== ROLES.SUPER_ADMIN && user.role !== ROLES.HR_ADMIN) {
                throw { message: "Unauthorized: Only Super Admin and HR can view attendance records", statusCode: 403 };
            }

            const {
                page = 1,
                limit = 20,
                sortBy = 'date',
                sortOrder = 'DESC'
            } = pagination;
            const offset = (page - 1) * limit;

            const whereClause = {};

            // Apply filters
            if (filters.employeeId) {
                whereClause.employeeId = filters.employeeId;
            }

            if (filters.dateFrom && filters.dateTo) {
                whereClause.date = {
                    [Op.between]: [filters.dateFrom, filters.dateTo]
                };
            } else if (filters.date) {
                whereClause.date = filters.date;
            }

            if (filters.status) {
                whereClause.status = filters.status;
            }

            // ✅ NEW: Support correction filters
            if (filters.correctionRequested !== undefined) {
                whereClause.correctionRequested = filters.correctionRequested;
            }

            if (filters.correctionStatus) {
                whereClause.correctionStatus = filters.correctionStatus;
            }

            if (filters.isLate !== undefined) {
                whereClause.isLate = filters.isLate;
            }

            // HR can only see employees in their assigned departments
            let employeeFilter = {};
            if (user.role === ROLES.HR_ADMIN && user.assignedDepartments?.length > 0) {
                employeeFilter.department = { [Op.in]: user.assignedDepartments };
            }

            const { count, rows } = await AttendanceRecord.findAndCountAll({
                where: whereClause,
                include: [
                    {
                        model: Employee,
                        as: 'employee',
                        attributes: ['id', 'employeeId', 'firstName', 'lastName', 'department'],
                        where: employeeFilter,
                        required: true
                    },
                    {
                        model: Shift,
                        as: 'shift',
                        attributes: ['shiftName', 'shiftStartTime', 'shiftEndTime'],
                        required: false
                    }
                ],
                order: [[sortBy, sortOrder]],
                limit: parseInt(limit),
                offset: parseInt(offset)
            });

            return {
                success: true,
                data: {
                    records: rows,
                    pagination: {
                        total: count,
                        page: parseInt(page),
                        limit: parseInt(limit),
                        totalPages: Math.ceil(count / limit)
                    }
                }
            };
        } catch (error) {
            logger.error('Error getting attendance records:', error);
            return {
                success: false,
                message: error.message || 'Failed to get attendance records',
                error: error.message
            };
        }
    }

    /**
     * Request attendance correction (Employee)
     * @param {String} attendanceId - Attendance record ID
     * @param {Object} correctionData - Correction request data
     * @param {Object} user - User requesting correction
     * @param {Object} metadata - Request metadata
     * @returns {Promise<Object>} Correction request result
     */
    async requestAttendanceCorrection(attendanceId, correctionData, user, metadata = {}) {
        try {
            const attendanceRecord = await AttendanceRecord.findByPk(attendanceId);

            if (!attendanceRecord) {
                throw { message: "Attendance record not found", statusCode: 404 };
            }

            // Employees can only request correction for their own records
            if (user.role === ROLES.EMPLOYEE && attendanceRecord.employeeId !== user.employee?.id) {
                throw { message: "You can only request correction for your own attendance", statusCode: 403 };
            }

            if (attendanceRecord.correctionRequested) {
                throw { message: "Correction already requested for this record", statusCode: 400 };
            }

            await attendanceRecord.update({
                correctionRequested: true,
                correctionReason: correctionData.reason,
                correctionStatus: 'pending',
                updatedBy: user.id
            });

            // Log correction request
            await AuditLog.logAction({
                userId: user.id,
                action: 'attendance_correction_request',
                module: 'attendance',
                targetType: 'AttendanceRecord',
                targetId: attendanceRecord.id,
                description: `Requested attendance correction: ${correctionData.reason}`,
                ipAddress: metadata.ipAddress,
                userAgent: metadata.userAgent,
                severity: 'medium'
            });

            return {
                success: true,
                data: attendanceRecord,
                message: 'Correction request submitted successfully'
            };
        } catch (error) {
            logger.error('Error requesting attendance correction:', error);
            return {
                success: false,
                message: error.message || 'Failed to request correction',
                error: error.message
            };
        }
    }

    /**
     * Approve/Reject attendance correction (HR)
     * ⚠️ SHIFT-AWARE FIX: After approval, reset to 'incomplete' to let finalization job re-evaluate
     * @param {String} attendanceId - Attendance record ID
     * @param {String} action - 'approve' or 'reject'
     * @param {Object} correctionData - Correction data if approving
     * @param {Object} user - User processing the correction
     * @param {Object} metadata - Request metadata
     * @returns {Promise<Object>} Correction processing result
     */
    async processAttendanceCorrection(attendanceId, action, correctionData, user, metadata = {}) {
        try {
            // Only HR and Super Admin can process corrections
            if (user.role !== ROLES.SUPER_ADMIN && user.role !== ROLES.HR_ADMIN) {
                throw { message: "Unauthorized: Only HR and Super Admin can process corrections", statusCode: 403 };
            }

            const attendanceRecord = await AttendanceRecord.findByPk(attendanceId);

            if (!attendanceRecord) {
                throw { message: "Attendance record not found", statusCode: 404 };
            }

            if (!attendanceRecord.correctionRequested || attendanceRecord.correctionStatus !== 'pending') {
                throw { message: "No pending correction request found", statusCode: 400 };
            }

            const oldValues = {
                clockIn: attendanceRecord.clockIn,
                clockOut: attendanceRecord.clockOut,
                status: attendanceRecord.status,
                correctionStatus: attendanceRecord.correctionStatus
            };

            if (action === 'approve') {
                // Apply corrections
                const updateData = {
                    correctionStatus: 'approved',
                    correctedBy: user.id,
                    correctedAt: new Date(),
                    // ✅ CRITICAL FIX: Reset to incomplete so finalization job can re-evaluate
                    status: 'incomplete',
                    statusReason: 'Correction approved - pending re-evaluation by finalization job'
                };

                if (correctionData.clockIn) {
                    updateData.clockIn = correctionData.clockIn;
                }
                if (correctionData.clockOut) {
                    updateData.clockOut = correctionData.clockOut;
                }
                if (correctionData.totalBreakMinutes !== undefined) {
                    updateData.totalBreakMinutes = correctionData.totalBreakMinutes;
                }

                await attendanceRecord.update(updateData);

                // 🔧 CRITICAL FIX: Recalculate working hours using AttendanceCalculationService
                if (correctionData.clockIn || correctionData.clockOut) {
                    const { workMinutes, breakMinutes } = AttendanceCalculationService.calculateWorkHours(
                        attendanceRecord.clockIn,
                        attendanceRecord.clockOut,
                        attendanceRecord.breakSessions
                    );

                    await attendanceRecord.update({
                        totalWorkedMinutes: workMinutes,
                        totalBreakMinutes: breakMinutes,
                        workHours: Math.round((workMinutes / 60) * 100) / 100
                    });

                    // ✅ IMMEDIATE FINALIZATION: Call finalizeWithShift to determine final status
                    const { EmployeeShift, Shift } = require('../../models/sequelize/index.js');
                    const employeeShift = await EmployeeShift.findOne({
                        where: { employeeId: attendanceRecord.employeeId },
                        include: [{ model: Shift, as: 'shift' }],
                        order: [['createdAt', 'DESC']]
                    });

                    if (employeeShift && employeeShift.shift) {
                        await attendanceRecord.finalizeWithShift(employeeShift.shift);
                        await attendanceRecord.save();
                    }
                }
            } else if (action === 'reject') {
                await attendanceRecord.update({
                    correctionStatus: 'rejected',
                    correctedBy: user.id,
                    correctedAt: new Date()
                });
            }

            // Log correction processing
            await AuditLog.logAction({
                userId: user.id,
                action: action === 'approve' ? 'attendance_correction_approve' : 'attendance_correction_reject',
                module: 'attendance',
                targetType: 'AttendanceRecord',
                targetId: attendanceRecord.id,
                oldValues,
                newValues: correctionData,
                description: `${action === 'approve' ? 'Approved' : 'Rejected'} attendance correction${action === 'approve' ? ' - reset to incomplete for re-evaluation' : ''}`,
                ipAddress: metadata.ipAddress,
                userAgent: metadata.userAgent,
                severity: 'high'
            });

            return {
                success: true,
                data: attendanceRecord,
                message: action === 'approve' 
                    ? 'Correction approved successfully. Record will be re-evaluated by the finalization job.'
                    : 'Correction rejected successfully'
            };
        } catch (error) {
            logger.error('Error processing attendance correction:', error);
            return {
                success: false,
                message: error.message || 'Failed to process correction',
                error: error.message
            };
        }
    }

    /**
     * Get attendance analytics (Super Admin & HR)
     * @param {Object} filters - Filter criteria
     * @param {Object} user - User requesting analytics
     * @returns {Promise<Object>} Attendance analytics
     */
    async getAttendanceAnalytics(filters = {}, user) {
        try {
            // Role-based access control
            if (user.role !== ROLES.SUPER_ADMIN && user.role !== ROLES.HR_ADMIN) {
                throw { message: "Unauthorized: Only Super Admin and HR can view analytics", statusCode: 403 };
            }

            const { dateFrom, dateTo, department } = filters;
            const whereClause = {};

            if (dateFrom && dateTo) {
                whereClause.date = { [Op.between]: [dateFrom, dateTo] };
            }

            // HR can only see analytics for their assigned departments
            let employeeFilter = {};
            if (user.role === ROLES.HR_ADMIN && user.assignedDepartments?.length > 0) {
                employeeFilter.department = { [Op.in]: user.assignedDepartments };
            }

            if (department) {
                employeeFilter.department = department;
            }

            const [
                totalRecords,
                presentDays,
                halfDays,
                leaveDays,
                lateDays,
                earlyDepartures,
                averageWorkHours,
                pendingCorrections
            ] = await Promise.all([
                AttendanceRecord.count({
                    where: whereClause,
                    include: [{ model: Employee, as: 'employee', where: employeeFilter, required: true }]
                }),
                AttendanceRecord.count({
                    where: { ...whereClause, status: 'present' },
                    include: [{ model: Employee, as: 'employee', where: employeeFilter, required: true }]
                }),
                AttendanceRecord.count({
                    where: { ...whereClause, status: 'half_day' },
                    include: [{ model: Employee, as: 'employee', where: employeeFilter, required: true }]
                }),
                AttendanceRecord.count({
                    where: { ...whereClause, status: 'leave' },
                    include: [{ model: Employee, as: 'employee', where: employeeFilter, required: true }]
                }),
                AttendanceRecord.count({
                    where: { ...whereClause, isLate: true },
                    include: [{ model: Employee, as: 'employee', where: employeeFilter, required: true }]
                }),
                AttendanceRecord.count({
                    where: { ...whereClause, isEarlyDeparture: true },
                    include: [{ model: Employee, as: 'employee', where: employeeFilter, required: true }]
                }),
                AttendanceRecord.findAll({
                    where: { ...whereClause, workHours: { [Op.gt]: 0 } },
                    include: [{ model: Employee, as: 'employee', where: employeeFilter, required: true }],
                    attributes: [[AttendanceRecord.sequelize.fn('AVG', AttendanceRecord.sequelize.col('workHours')), 'avgHours']],
                    raw: true
                }),
                AttendanceRecord.count({
                    where: { ...whereClause, correctionStatus: 'pending' },
                    include: [{ model: Employee, as: 'employee', where: employeeFilter, required: true }]
                })
            ]);

            // ✅ IMPROVED: Correct HRMS attendance rate formula
            // Attendance Rate = (Present + Half Days * 0.5) / Total Working Days * 100
            const totalWorkingDays = presentDays + halfDays + leaveDays;
            const effectivePresent = presentDays + (halfDays * 0.5);
            const attendanceRate = totalWorkingDays > 0 
                ? ((effectivePresent / totalWorkingDays) * 100).toFixed(2) 
                : 0;

            return {
                success: true,
                data: {
                    totalRecords,
                    presentDays,
                    halfDays,
                    leaveDays, // ✅ Renamed from absentDays
                    lateDays,
                    earlyDepartures,
                    averageWorkHours: parseFloat(averageWorkHours[0]?.avgHours || 0).toFixed(2),
                    pendingCorrections,
                    attendanceRate, // ✅ Improved formula
                    punctualityRate: presentDays > 0 ? (((presentDays - lateDays) / presentDays) * 100).toFixed(2) : 0
                }
            };
        } catch (error) {
            logger.error('Error getting attendance analytics:', error);
            return {
                success: false,
                message: error.message || 'Failed to get analytics',
                error: error.message
            };
        }
    }

    /**
     * Get employee's monthly attendance summary
     * @param {String} employeeId - Employee ID
     * @param {Number} year - Year
     * @param {Number} month - Month
     * @param {Object} user - User requesting summary
     * @returns {Promise<Object>} Monthly attendance summary
     */
async getMonthlyAttendanceSummary(employeeId, year, month, user) {
     try {
            // Employees can only view their own summary
            if (user.role === ROLES.EMPLOYEE && parseInt(user.employee?.id) !== parseInt(employeeId)) {
                throw { message: "You can only view your own attendance summary", statusCode: 403 };
            }

            // HR can only view summaries for employees in their departments
            if (user.role === ROLES.HR_ADMIN) {
                const employee = await Employee.findByPk(employeeId);
                if (!employee || !user.assignedDepartments?.includes(employee.department)) {
                    throw { message: "You don't have access to this employee's data", statusCode: 403 };
                }
            }

            const summary = await AttendanceRecord.getMonthlySummary(employeeId, year, month);

            return {
                success: true,
                data: summary
            };
        } catch (error) {
            logger.error('Error getting monthly attendance summary:', error);
            return {
                success: false,
                message: error.message || 'Failed to get monthly summary',
                error: error.message
            };
        }
    }

    /**
     * ⚠️ DEPRECATED: Use finalizeDailyAttendance job instead
     * Process end-of-day attendance - Mark as incomplete/absent if no clock-out
     * 
     * This method is kept for backward compatibility but internally calls the
     * shift-aware finalization job to avoid conflicts.
     * 
     * @deprecated Use finalizeDailyAttendance from jobs/attendanceFinalization.js
     */
    async processEndOfDayAttendance() {
        try {
            logger.warn('processEndOfDayAttendance is deprecated. Use finalizeDailyAttendance job instead.');
            
            // Import and call the finalization job
            const { finalizeDailyAttendance } = await import('../../jobs/attendanceFinalization.js');
            const result = await finalizeDailyAttendance();
            
            return {
                success: true,
                message: 'Attendance finalization completed via shift-aware job',
                data: result
            };
        } catch (error) {
            logger.error('Error processing end-of-day attendance:', error);
            return {
                success: false,
                message: 'Failed to process end-of-day attendance',
                error: error.message
            };
        }
    }

    /**
     * ✅ CORRECT: Check employees who haven't clocked in yet (informational only)
     * This should NOT permanently mark absent - just warn/log
     * 
     * @deprecated This logic is now handled by the finalization job
     */
    async checkAbsentEmployees() {
        try {
            logger.warn('checkAbsentEmployees is deprecated. Use checkAbsentEmployees from finalization job instead.');
            
            // Import and call the finalization job
            const { checkAbsentEmployees } = await import('../../jobs/attendanceFinalization.js');
            const result = await checkAbsentEmployees();
            
            return result;
        } catch (error) {
            logger.error('Error checking absent employees:', error);
            return {
                success: false,
                message: 'Failed to check absent employees',
                error: error.message
            };
        }
    }

    /**
     * Get overtime report (HR & Super Admin)
     * ⚠️ SHIFT-AWARE: Excludes incomplete records by default
     */
    async getOvertimeReport(filters = {}, user, pagination = {}) {
        try {
            // Role-based access control
            if (user.role !== ROLES.SUPER_ADMIN && user.role !== ROLES.HR_ADMIN) {
                throw { message: "Unauthorized: Only Super Admin and HR can view overtime reports", statusCode: 403 };
            }

            const {
                page = 1,
                limit = 20,
                sortBy = 'date',
                sortOrder = 'DESC'
            } = pagination;
            const offset = (page - 1) * limit;

            const whereClause = {
                // Only include finalized records (exclude incomplete)
                status: {
                    [Op.in]: ['present', 'half_day']
                }
            };

            // Apply filters
            if (filters.employeeId) {
                whereClause.employeeId = filters.employeeId;
            }

            if (filters.dateFrom && filters.dateTo) {
                whereClause.date = {
                    [Op.between]: [filters.dateFrom, filters.dateTo]
                };
            } else if (filters.date) {
                whereClause.date = filters.date;
            }

            // Filter for overtime (workHours > shift fullDayHours)
            whereClause.overtimeMinutes = {
                [Op.gt]: 0
            };

            // HR can only see employees in their assigned departments
            let employeeFilter = {};
            if (user.role === ROLES.HR_ADMIN && user.assignedDepartments?.length > 0) {
                employeeFilter.department = { [Op.in]: user.assignedDepartments };
            }

            const { count, rows } = await AttendanceRecord.findAndCountAll({
                where: whereClause,
                include: [
                    {
                        model: Employee,
                        as: 'employee',
                        attributes: ['id', 'employeeId', 'firstName', 'lastName', 'department'],
                        where: employeeFilter,
                        required: true
                    },
                    {
                        model: Shift,
                        as: 'shift',
                        attributes: ['shiftName', 'shiftStartTime', 'shiftEndTime', 'fullDayHours'],
                        required: false
                    }
                ],
                order: [[sortBy, sortOrder]],
                limit: parseInt(limit),
                offset: parseInt(offset)
            });

            return {
                success: true,
                data: {
                    records: rows,
                    pagination: {
                        total: count,
                        page: parseInt(page),
                        limit: parseInt(limit),
                        totalPages: Math.ceil(count / limit)
                    }
                }
            };
        } catch (error) {
            logger.error('Error getting overtime report:', error);
            return {
                success: false,
                message: error.message || 'Failed to get overtime report',
                error: error.message
            };
        }
    }

    /**
     * Get break violations report (HR & Super Admin)
     * ⚠️ SHIFT-AWARE: Excludes incomplete records by default
     */
    async getBreakViolationsReport(filters = {}, user, pagination = {}) {
        try {
            // Role-based access control
            if (user.role !== ROLES.SUPER_ADMIN && user.role !== ROLES.HR_ADMIN) {
                throw { message: "Unauthorized: Only Super Admin and HR can view break violations", statusCode: 403 };
            }

            const {
                page = 1,
                limit = 20,
                sortBy = 'date',
                sortOrder = 'DESC'
            } = pagination;
            const offset = (page - 1) * limit;

            const whereClause = {
                // Only include finalized records (exclude incomplete)
                status: {
                    [Op.in]: ['present', 'half_day']
                }
            };

            // Apply filters
            if (filters.employeeId) {
                whereClause.employeeId = filters.employeeId;
            }

            if (filters.dateFrom && filters.dateTo) {
                whereClause.date = {
                    [Op.between]: [filters.dateFrom, filters.dateTo]
                };
            } else if (filters.date) {
                whereClause.date = filters.date;
            }

            // HR can only see employees in their assigned departments
            let employeeFilter = {};
            if (user.role === ROLES.HR_ADMIN && user.assignedDepartments?.length > 0) {
                employeeFilter.department = { [Op.in]: user.assignedDepartments };
            }

            const { count, rows } = await AttendanceRecord.findAndCountAll({
                where: whereClause,
                include: [
                    {
                        model: Employee,
                        as: 'employee',
                        attributes: ['id', 'employeeId', 'firstName', 'lastName', 'department'],
                        where: employeeFilter,
                        required: true
                    },
                    {
                        model: Shift,
                        as: 'shift',
                        attributes: ['shiftName', 'allowedBreakMinutes'],
                        required: false
                    }
                ],
                order: [[sortBy, sortOrder]],
                limit: parseInt(limit),
                offset: parseInt(offset)
            });

            // Filter for break violations (totalBreakMinutes > allowedBreakMinutes)
            const violations = rows.filter(record => {
                const allowedBreak = record.shift?.allowedBreakMinutes || 60;
                return record.totalBreakMinutes > allowedBreak;
            });

            return {
                success: true,
                data: {
                    records: violations,
                    pagination: {
                        total: violations.length,
                        page: parseInt(page),
                        limit: parseInt(limit),
                        totalPages: Math.ceil(violations.length / limit)
                    }
                }
            };
        } catch (error) {
            logger.error('Error getting break violations report:', error);
            return {
                success: false,
                message: error.message || 'Failed to get break violations report',
                error: error.message
            };
        }
    }

    /**
     * Bulk process corrections (HR & Super Admin)
     */
    async bulkProcessCorrections(attendanceIds, action, user, metadata = {}) {
        try {
            // Only HR and Super Admin can bulk process
            if (user.role !== ROLES.SUPER_ADMIN && user.role !== ROLES.HR_ADMIN) {
                throw { message: "Unauthorized: Only Super Admin and HR can bulk process corrections", statusCode: 403 };
            }

            const results = {
                success: [],
                failed: []
            };

            for (const id of attendanceIds) {
                try {
                    const result = await this.processAttendanceCorrection(id, action, {}, user, metadata);
                    if (result.success) {
                        results.success.push(id);
                    } else {
                        results.failed.push({ id, reason: result.message });
                    }
                } catch (error) {
                    results.failed.push({ id, reason: error.message });
                }
            }

            return {
                success: true,
                message: `Bulk ${action} completed: ${results.success.length} succeeded, ${results.failed.length} failed`,
                data: results
            };
        } catch (error) {
            logger.error('Error in bulk process corrections:', error);
            return {
                success: false,
                message: error.message || 'Failed to bulk process corrections',
                error: error.message
            };
        }
    }

    /**
     * Export attendance data (HR & Super Admin)
     * ⚠️ SHIFT-AWARE: Includes status filter to exclude incomplete if needed
     */
    async exportAttendanceData(filters = {}, user) {
        try {
            // Role-based access control
            if (user.role !== ROLES.SUPER_ADMIN && user.role !== ROLES.HR_ADMIN) {
                throw { message: "Unauthorized: Only Super Admin and HR can export data", statusCode: 403 };
            }

            // This would generate an Excel/CSV file
            // For now, return the data structure
            const result = await this.getAttendanceRecords(filters, user, { limit: 10000 });

            if (!result.success) {
                return result;
            }

            // In a real implementation, this would use a library like xlsx or csv-writer
            // to generate the actual file
            return {
                success: true,
                data: result.data.records,
                message: 'Export data prepared successfully'
            };
        } catch (error) {
            logger.error('Error exporting attendance data:', error);
            return {
                success: false,
                message: error.message || 'Failed to export attendance data',
                error: error.message
            };
        }
    }
}

export default new AttendanceService();