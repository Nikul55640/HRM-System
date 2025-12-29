/**
 * Attendance Service Layer
 * Handles all business logic for attendance management with break and late tracking
 */

import { AttendanceRecord, Employee, Shift, EmployeeShift, User, AuditLog, Holiday } from '../../models/sequelize/index.js';
import { Op } from 'sequelize';
import logger from '../../utils/logger.js';
import { ROLES } from '../../config/rolePermissions.js';

class AttendanceService {
    /**
     * Clock In - Employee starts their work day
     * @param {Object} clockInData - Clock in data with location, device info
     * @param {Object} user - User clocking in
     * @param {Object} metadata - Request metadata
     * @returns {Promise<Object>} Clock in result
     */
    async clockIn(clockInData, user, metadata = {}) {
        try {
            if (!user.employeeId) {
                throw { message: "No employee profile linked to this user", statusCode: 404 };
            }

            const today = new Date().toISOString().split('T')[0];

            // Check if already clocked in today
            let attendanceRecord = await AttendanceRecord.findOne({
                where: {
                    employeeId: user.employeeId,
                    date: today
                }
            });

            if (attendanceRecord && attendanceRecord.clockIn) {
                throw { message: "Already clocked in for today", statusCode: 400 };
            }

            // Get employee's assigned shift
            const employee = await Employee.findByPk(user.employeeId, {
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

            let assignedShift = null;
            if (employee.shiftAssignments && employee.shiftAssignments.length > 0) {
                assignedShift = employee.shiftAssignments[0].shift;
            } else {
                // Get default shift if no specific assignment
                assignedShift = await Shift.findOne({ where: { isDefault: true } });
            }

            const clockInTime = new Date();

            // Create or update attendance record
            if (!attendanceRecord) {
                attendanceRecord = await AttendanceRecord.create({
                    employeeId: user.employeeId,
                    shiftId: assignedShift?.id || null,
                    date: today,
                    clockIn: clockInTime,
                    location: clockInData.location || null,
                    deviceInfo: clockInData.deviceInfo || null,
                    status: 'present',
                    createdBy: user.id
                });
            } else {
                await attendanceRecord.update({
                    clockIn: clockInTime,
                    location: clockInData.location || null,
                    deviceInfo: clockInData.deviceInfo || null,
                    status: 'present',
                    updatedBy: user.id
                });
            }

            // Log clock in action
            await AuditLog.logAction({
                userId: user.id,
                action: 'attendance_clock_in',
                module: 'attendance',
                targetType: 'AttendanceRecord',
                targetId: attendanceRecord.id,
                description: `Clocked in at ${clockInTime.toLocaleTimeString()}`,
                ipAddress: metadata.ipAddress,
                userAgent: metadata.userAgent,
                severity: 'low'
            });

            return {
                success: true,
                data: attendanceRecord,
                message: 'Clocked in successfully'
            };
        } catch (error) {
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
            if (!user.employeeId) {
                throw { message: "No employee profile linked to this user", statusCode: 404 };
            }

            const today = new Date().toISOString().split('T')[0];

            const attendanceRecord = await AttendanceRecord.findOne({
                where: {
                    employeeId: user.employeeId,
                    date: today
                }
            });

            if (!attendanceRecord || !attendanceRecord.clockIn) {
                throw { message: "No clock in record found for today", statusCode: 400 };
            }

            if (attendanceRecord.clockOut) {
                throw { message: "Already clocked out for today", statusCode: 400 };
            }

            // Check if there's an active break session - must end break before clocking out
            // canEndBreak() returns true if there IS an active break session
            if (attendanceRecord.breakSessions && attendanceRecord.breakSessions.some(session => session.breakIn && !session.breakOut)) {
                throw { message: "Please end your current break session before clocking out", statusCode: 400 };
            }

            const clockOutTime = new Date();

            await attendanceRecord.update({
                clockOut: clockOutTime,
                updatedBy: user.id
            });

            // The working hours calculation will be handled by the model hook

            // Log clock out action
            await AuditLog.logAction({
                userId: user.id,
                action: 'attendance_clock_out',
                module: 'attendance',
                targetType: 'AttendanceRecord',
                targetId: attendanceRecord.id,
                description: `Clocked out at ${clockOutTime.toLocaleTimeString()}. Total hours: ${attendanceRecord.workHours}`,
                ipAddress: metadata.ipAddress,
                userAgent: metadata.userAgent,
                severity: 'low'
            });

            return {
                success: true,
                data: attendanceRecord,
                message: 'Clocked out successfully'
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
        try {
            if (!user.employeeId) {
                throw { message: "No employee profile linked to this user", statusCode: 404 };
            }

            const today = new Date().toISOString().split('T')[0];

            const attendanceRecord = await AttendanceRecord.findOne({
                where: {
                    employeeId: user.employeeId,
                    date: today
                }
            });

            if (!attendanceRecord || !attendanceRecord.canStartBreak()) {
                throw { message: "Cannot start break. Either not clocked in or already on break", statusCode: 400 };
            }

            const breakInTime = new Date();
            const breakSessions = attendanceRecord.breakSessions || [];

            breakSessions.push({
                breakIn: breakInTime,
                breakOut: null
            });

            await attendanceRecord.update({
                breakSessions,
                updatedBy: user.id
            });

            // Reload the record to get the updated data
            await attendanceRecord.reload();

            // Log break start action
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

            return {
                success: true,
                data: attendanceRecord,
                message: 'Break started successfully'
            };
        } catch (error) {
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
        try {
            if (!user.employeeId) {
                throw { message: "No employee profile linked to this user", statusCode: 404 };
            }

            const today = new Date().toISOString().split('T')[0];

            const attendanceRecord = await AttendanceRecord.findOne({
                where: {
                    employeeId: user.employeeId,
                    date: today
                }
            });

            if (!attendanceRecord || !attendanceRecord.canEndBreak()) {
                throw { message: "No active break session found", statusCode: 400 };
            }

            const breakOutTime = new Date();
            const breakSessions = [...attendanceRecord.breakSessions];
            const activeBreakIndex = breakSessions.findIndex(session => session.breakIn && !session.breakOut);

            if (activeBreakIndex !== -1) {
                breakSessions[activeBreakIndex].breakOut = breakOutTime;

                // Calculate break duration
                const breakInTime = new Date(breakSessions[activeBreakIndex].breakIn);
                const breakDuration = Math.floor((breakOutTime - breakInTime) / (1000 * 60)); // in minutes
                breakSessions[activeBreakIndex].duration = breakDuration;

                // Update total break minutes
                const totalBreakMinutes = breakSessions.reduce((total, session) => {
                    return total + (session.duration || 0);
                }, 0);

                await attendanceRecord.update({
                    breakSessions,
                    totalBreakMinutes,
                    updatedBy: user.id
                });

                // Reload the record to get the updated data
                await attendanceRecord.reload();
            }

            // Log break end action
            await AuditLog.logAction({
                userId: user.id,
                action: 'attendance_break_out',
                module: 'attendance',
                targetType: 'AttendanceRecord',
                targetId: attendanceRecord.id,
                description: `Ended break at ${breakOutTime.toLocaleTimeString()}`,
                ipAddress: metadata.ipAddress,
                userAgent: metadata.userAgent,
                severity: 'low'
            });

            return {
                success: true,
                data: attendanceRecord,
                message: 'Break ended successfully'
            };
        } catch (error) {
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
            if (!user.employeeId) {
                throw { message: "No employee profile linked to this user", statusCode: 404 };
            }

            const today = new Date().toISOString().split('T')[0];

            const attendanceRecord = await AttendanceRecord.findOne({
                where: {
                    employeeId: user.employeeId,
                    date: today
                },
                include: [
                    {
                        model: Shift,
                        as: 'shift',
                        attributes: ['shiftName', 'shiftStartTime', 'shiftEndTime', 'gracePeriodMinutes']
                    }
                ]
            });

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
     * Get employee's own attendance records (Employee Self-Service)
     * @param {Object} filters - Filter criteria
     * @param {Object} user - User requesting records
     * @param {Object} pagination - Pagination options
     * @returns {Promise<Object>} Employee's own attendance records
     */
    async getEmployeeOwnAttendanceRecords(filters = {}, user, pagination = {}) {
        try {
            if (!user.employeeId) {
                throw { message: "No employee profile linked to this user", statusCode: 404 };
            }

            const {
                page = 1,
                limit = 20,
                sortBy = 'date',
                sortOrder = 'DESC'
            } = pagination;
            const offset = (page - 1) * limit;

            const whereClause = {
                employeeId: user.employeeId // Only allow viewing own records
            };

            // Apply additional filters
            if (filters.startDate && filters.endDate) {
                whereClause.date = {
                    [Op.between]: [filters.startDate, filters.endDate]
                };
            } else if (filters.date) {
                whereClause.date = filters.date;
            }

            if (filters.status) {
                whereClause.status = filters.status;
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
            if (user.role === ROLES.EMPLOYEE && attendanceRecord.employeeId !== user.employeeId) {
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
                correctionStatus: attendanceRecord.correctionStatus
            };

            if (action === 'approve') {
                // Apply corrections
                const updateData = {
                    correctionStatus: 'approved',
                    correctedBy: user.id,
                    correctedAt: new Date()
                };

                if (correctionData.clockIn) {
                    updateData.clockIn = correctionData.clockIn;
                }
                if (correctionData.clockOut) {
                    updateData.clockOut = correctionData.clockOut;
                }

                await attendanceRecord.update(updateData);

                // Recalculate working hours if times were changed
                if (correctionData.clockIn || correctionData.clockOut) {
                    attendanceRecord.calculateWorkingHours();
                    await attendanceRecord.save();
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
                description: `${action === 'approve' ? 'Approved' : 'Rejected'} attendance correction`,
                ipAddress: metadata.ipAddress,
                userAgent: metadata.userAgent,
                severity: 'high'
            });

            return {
                success: true,
                data: attendanceRecord,
                message: `Correction ${action}d successfully`
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
                absentDays,
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
                    where: { ...whereClause, status: 'absent' },
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

            return {
                success: true,
                data: {
                    totalRecords,
                    presentDays,
                    absentDays,
                    lateDays,
                    earlyDepartures,
                    averageWorkHours: parseFloat(averageWorkHours[0]?.avgHours || 0).toFixed(2),
                    pendingCorrections,
                    attendanceRate: totalRecords > 0 ? ((presentDays / totalRecords) * 100).toFixed(2) : 0,
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
            if (user.role === ROLES.EMPLOYEE && parseInt(user.employeeId) !== parseInt(employeeId)) {
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
}

export default new AttendanceService();