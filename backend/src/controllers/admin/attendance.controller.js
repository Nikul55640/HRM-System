/**
 * Attendance Controller
 * Handles HTTP requests for attendance management with break and late tracking
 * Updated for restructured AttendanceRecord model with enhanced audit logging
 */

import attendanceService from '../../services/admin/attendance.service.js';
import logger from '../../utils/logger.js';
import { AuditLog } from '../../models/sequelize/index.js';

/**
 * Wrapper for consistent API responses
 */
const sendResponse = (res, success, message, data = null, statusCode = 200, pagination = null) => {
    const response = {
        success,
        message,
        data,
    };

    if (pagination) {
        response.pagination = pagination;
    }

    return res.status(statusCode).json(response);
};

const attendanceController = {
    /**
     * Get attendance records with filtering (Super Admin & HR)
     */
    getAttendanceRecords: async (req, res) => {
        try {
            const result = await attendanceService.getAttendanceRecords(req.query, req.user, req.query);

            if (!result.success) {
                const statusCode = result.message.includes('Unauthorized') ? 403 : 400;
                return sendResponse(res, false, result.message, null, statusCode);
            }

            return sendResponse(res, true, "Attendance records retrieved successfully", result.data.records, 200, result.data.pagination);
        } catch (error) {
            logger.error("Controller: Get Attendance Records Error", error);
            return sendResponse(res, false, "Internal server error", null, 500);
        }
    },

    /**
     * Process attendance correction request (HR & Super Admin)
     */
    processAttendanceCorrection: async (req, res) => {
        try {
            const { id } = req.params;
            const { action, correctionData } = req.body; // action: 'approve' or 'reject'
            const metadata = {
                ipAddress: req.ip,
                userAgent: req.headers["user-agent"],
            };

            const result = await attendanceService.processAttendanceCorrection(id, action, correctionData, req.user, metadata);

            if (!result.success) {
                const statusCode = result.message.includes('Unauthorized') ? 403 :
                    result.message.includes('not found') ? 404 : 400;
                return sendResponse(res, false, result.message, null, statusCode);
            }

            return sendResponse(res, true, result.message, result.data);
        } catch (error) {
            logger.error("Controller: Process Attendance Correction Error", error);
            return sendResponse(res, false, "Internal server error", null, 500);
        }
    },

    /**
     * Get attendance analytics (Super Admin & HR)
     */
    getAttendanceAnalytics: async (req, res) => {
        try {
            const result = await attendanceService.getAttendanceAnalytics(req.query, req.user);

            if (!result.success) {
                const statusCode = result.message.includes('Unauthorized') ? 403 : 400;
                return sendResponse(res, false, result.message, null, statusCode);
            }

            return sendResponse(res, true, "Attendance analytics retrieved successfully", result.data);
        } catch (error) {
            logger.error("Controller: Get Attendance Analytics Error", error);
            return sendResponse(res, false, "Internal server error", null, 500);
        }
    },

    /**
     * Get monthly attendance summary
     */
    getMonthlyAttendanceSummary: async (req, res) => {
        try {
            const { employeeId, year, month } = req.params;

            const result = await attendanceService.getMonthlyAttendanceSummary(
                employeeId,
                parseInt(year),
                parseInt(month),
                req.user
            );

            if (!result.success) {
                const statusCode = result.message.includes('access') ? 403 : 400;
                return sendResponse(res, false, result.message, null, statusCode);
            }

            return sendResponse(res, true, "Monthly attendance summary retrieved successfully", result.data);
        } catch (error) {
            logger.error("Controller: Get Monthly Attendance Summary Error", error);
            return sendResponse(res, false, "Internal server error", null, 500);
        }
    },

    /**
     * Edit/Override attendance record (Super Admin only)
     */
    editAttendanceRecord: async (req, res) => {
        try {
            // Only Super Admin can directly edit attendance records
            if (req.user.role !== 'SuperAdmin') {
                return sendResponse(res, false, "Unauthorized: Only Super Admin can edit attendance records", null, 403);
            }

            const { id } = req.params;
            const metadata = {
                ipAddress: req.ip,
                userAgent: req.headers["user-agent"],
            };

            // This would be implemented as a direct update to attendance record
            // For now, we'll use the correction approval process
            const result = await attendanceService.processAttendanceCorrection(id, 'approve', req.body, req.user, metadata);

            if (!result.success) {
                const statusCode = result.message.includes('not found') ? 404 : 400;
                return sendResponse(res, false, result.message, null, statusCode);
            }

            return sendResponse(res, true, "Attendance record updated successfully", result.data);
        } catch (error) {
            logger.error("Controller: Edit Attendance Record Error", error);
            return sendResponse(res, false, "Internal server error", null, 500);
        }
    },

    /**
     * Get pending correction requests (HR & Super Admin)
     */
    getPendingCorrections: async (req, res) => {
        try {
            const filters = {
                ...req.query,
                correctionStatus: 'pending'
            };

            const result = await attendanceService.getAttendanceRecords(filters, req.user, req.query);

            if (!result.success) {
                const statusCode = result.message.includes('Unauthorized') ? 403 : 400;
                return sendResponse(res, false, result.message, null, statusCode);
            }

            return sendResponse(res, true, "Pending correction requests retrieved successfully", result.data.records, 200, result.data.pagination);
        } catch (error) {
            logger.error("Controller: Get Pending Corrections Error", error);
            return sendResponse(res, false, "Internal server error", null, 500);
        }
    },

    /**
     * Get late arrivals report (HR & Super Admin)
     */
    getLateArrivalsReport: async (req, res) => {
        try {
            const filters = {
                ...req.query,
                isLate: true
            };

            const result = await attendanceService.getAttendanceRecords(filters, req.user, req.query);

            if (!result.success) {
                const statusCode = result.message.includes('Unauthorized') ? 403 : 400;
                return sendResponse(res, false, result.message, null, statusCode);
            }

            return sendResponse(res, true, "Late arrivals report retrieved successfully", result.data.records, 200, result.data.pagination);
        } catch (error) {
            logger.error("Controller: Get Late Arrivals Report Error", error);
            return sendResponse(res, false, "Internal server error", null, 500);
        }
    },

    /**
     * Get early departures report (HR & Super Admin)
     */
    getEarlyDeparturesReport: async (req, res) => {
        try {
            const filters = {
                ...req.query,
                isEarlyDeparture: true
            };

            const result = await attendanceService.getAttendanceRecords(filters, req.user, req.query);

            if (!result.success) {
                const statusCode = result.message.includes('Unauthorized') ? 403 : 400;
                return sendResponse(res, false, result.message, null, statusCode);
            }

            return sendResponse(res, true, "Early departures report retrieved successfully", result.data.records, 200, result.data.pagination);
        } catch (error) {
            logger.error("Controller: Get Early Departures Report Error", error);
            return sendResponse(res, false, "Internal server error", null, 500);
        }
    },

    /**
     * Get overtime report (HR & Super Admin)
     */
    getOvertimeReport: async (req, res) => {
        try {
            const filters = {
                ...req.query,
                hasOvertime: true
            };

            const result = await attendanceService.getOvertimeReport(filters, req.user, req.query);

            if (!result.success) {
                const statusCode = result.message.includes('Unauthorized') ? 403 : 400;
                return sendResponse(res, false, result.message, null, statusCode);
            }

            return sendResponse(res, true, "Overtime report retrieved successfully", result.data.records, 200, result.data.pagination);
        } catch (error) {
            logger.error("Controller: Get Overtime Report Error", error);
            return sendResponse(res, false, "Internal server error", null, 500);
        }
    },

    /**
     * Get break violations report (HR & Super Admin)
     */
    getBreakViolationsReport: async (req, res) => {
        try {
            const result = await attendanceService.getBreakViolationsReport(req.query, req.user, req.query);

            if (!result.success) {
                const statusCode = result.message.includes('Unauthorized') ? 403 : 400;
                return sendResponse(res, false, result.message, null, statusCode);
            }

            return sendResponse(res, true, "Break violations report retrieved successfully", result.data.records, 200, result.data.pagination);
        } catch (error) {
            logger.error("Controller: Get Break Violations Report Error", error);
            return sendResponse(res, false, "Internal server error", null, 500);
        }
    },

    /**
     * Bulk approve attendance corrections (HR & Super Admin)
     */
    bulkApproveCorrections: async (req, res) => {
        try {
            const { attendanceIds } = req.body;
            const metadata = {
                ipAddress: req.ip,
                userAgent: req.headers["user-agent"],
            };

            if (!Array.isArray(attendanceIds) || attendanceIds.length === 0) {
                return sendResponse(res, false, "Please provide valid attendance IDs", null, 400);
            }

            const result = await attendanceService.bulkProcessCorrections(attendanceIds, 'approve', req.user, metadata);

            if (!result.success) {
                const statusCode = result.message.includes('Unauthorized') ? 403 : 400;
                return sendResponse(res, false, result.message, null, statusCode);
            }

            // Log bulk approval
            await AuditLog.logAction({
                userId: req.user.id,
                action: 'attendance_correction_bulk_approve',
                module: 'attendance',
                description: `Bulk approved ${attendanceIds.length} attendance corrections`,
                metadata: { attendanceIds },
                ipAddress: req.ip,
                userAgent: req.headers["user-agent"],
                severity: 'medium'
            });

            return sendResponse(res, true, result.message, result.data);
        } catch (error) {
            logger.error("Controller: Bulk Approve Corrections Error", error);
            return sendResponse(res, false, "Internal server error", null, 500);
        }
    },

    /**
     * Export attendance data (HR & Super Admin)
     */
    exportAttendanceData: async (req, res) => {
        try {
            const result = await attendanceService.exportAttendanceData(req.query, req.user);

            if (!result.success) {
                const statusCode = result.message.includes('Unauthorized') ? 403 : 400;
                return sendResponse(res, false, result.message, null, statusCode);
            }

            // Log export action
            await AuditLog.logAction({
                userId: req.user.id,
                action: 'attendance_export',
                module: 'attendance',
                description: `Exported attendance data with filters: ${JSON.stringify(req.query)}`,
                ipAddress: req.ip,
                userAgent: req.headers["user-agent"],
                severity: 'medium'
            });

            // Set headers for file download
            res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
            res.setHeader('Content-Disposition', `attachment; filename=attendance-export-${new Date().toISOString().split('T')[0]}.xlsx`);

            return res.send(result.data);
        } catch (error) {
            logger.error("Controller: Export Attendance Data Error", error);
            return sendResponse(res, false, "Internal server error", null, 500);
        }
    }
};

export default attendanceController;