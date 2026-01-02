/**
 * Employee Attendance Controller
 * Handles employee self-service attendance operations (Clock In/Out, Break, Corrections)
 */

import attendanceService from '../../services/admin/attendance.service.js';
import logger from '../../utils/logger.js';

/**
 * Wrapper for consistent API responses
 */
const sendResponse = (res, success, message, data = null, statusCode = 200) => {
  return res.status(statusCode).json({
    success,
    message,
    data,
  });
};

const employeeAttendanceController = {
  /**
   * Clock In - Employee starts their work day
   */
  clockIn: async (req, res) => {
    try {
      const metadata = {
        ipAddress: req.ip,
        userAgent: req.headers["user-agent"],
      };

      const result = await attendanceService.clockIn(req.body, req.user, metadata);

      if (!result.success) {
        return sendResponse(res, false, result.message, null, 400);
      }

      return sendResponse(res, true, result.message, result.data);
    } catch (error) {
      logger.error("Controller: Clock In Error", error);
      return sendResponse(res, false, "Internal server error", null, 500);
    }
  },

  /**
   * Clock Out - Employee ends their work day
   */
  clockOut: async (req, res) => {
    try {
      const metadata = {
        ipAddress: req.ip,
        userAgent: req.headers["user-agent"],
      };

      const result = await attendanceService.clockOut(req.body, req.user, metadata);

      if (!result.success) {
        return sendResponse(res, false, result.message, null, 400);
      }

      return sendResponse(res, true, result.message, result.data);
    } catch (error) {
      logger.error("Controller: Clock Out Error", error);
      return sendResponse(res, false, "Internal server error", null, 500);
    }
  },

  /**
   * Start Break - Employee starts a break
   */
  startBreak: async (req, res) => {
    try {
      const metadata = {
        ipAddress: req.ip,
        userAgent: req.headers["user-agent"],
      };

      const result = await attendanceService.startBreak(req.user, metadata);

      if (!result.success) {
        return sendResponse(res, false, result.message, null, 400);
      }

      return sendResponse(res, true, result.message, result.data);
    } catch (error) {
      logger.error("Controller: Start Break Error", error);
      return sendResponse(res, false, "Internal server error", null, 500);
    }
  },

  /**
   * End Break - Employee ends their break
   */
  endBreak: async (req, res) => {
    try {
      const metadata = {
        ipAddress: req.ip,
        userAgent: req.headers["user-agent"],
      };

      const result = await attendanceService.endBreak(req.user, metadata);

      if (!result.success) {
        return sendResponse(res, false, result.message, null, 400);
      }

      return sendResponse(res, true, result.message, result.data);
    } catch (error) {
      logger.error("Controller: End Break Error", error);
      return sendResponse(res, false, "Internal server error", null, 500);
    }
  },

  /**
   * Get today's attendance status
   */
  getTodayAttendance: async (req, res) => {
    try {
      const result = await attendanceService.getTodayAttendance(req.user);

      if (!result.success) {
        return sendResponse(res, false, result.message, null, 400);
      }

      return sendResponse(res, true, result.message, result.data);
    } catch (error) {
      logger.error("Controller: Get Today Attendance Error", error);
      return sendResponse(res, false, "Internal server error", null, 500);
    }
  },

  /**
   * Request attendance correction
   */
  requestCorrection: async (req, res) => {
    try {
      const { attendanceId } = req.params;
      const metadata = {
        ipAddress: req.ip,
        userAgent: req.headers["user-agent"],
      };

      const result = await attendanceService.requestAttendanceCorrection(
        attendanceId,
        req.body,
        req.user,
        metadata
      );

      if (!result.success) {
        const statusCode = result.message.includes('not found') ? 404 :
          result.message.includes('only request correction for your own') ? 403 : 400;
        return sendResponse(res, false, result.message, null, statusCode);
      }

      return sendResponse(res, true, result.message, result.data);
    } catch (error) {
      logger.error("Controller: Request Correction Error", error);
      return sendResponse(res, false, "Internal server error", null, 500);
    }
  },

  /**
   * Get employee's own attendance records
   */
  getMyAttendanceRecords: async (req, res) => {
    try {
      const filters = {
        ...req.query
      };

      const result = await attendanceService.getEmployeeOwnAttendanceRecords(filters, req.user, req.query);

      if (!result.success) {
        return sendResponse(res, false, result.message, null, 400);
      }

      return sendResponse(res, true, result.message, result.data.records, 200, result.data.pagination);
    } catch (error) {
      logger.error("Controller: Get My Attendance Records Error", error);
      return sendResponse(res, false, "Internal server error", null, 500);
    }
  },

  /**
   * Get employee's monthly attendance summary
   */
  getMyMonthlySummary: async (req, res) => {
    try {
      const { year, month } = req.params;

      const result = await attendanceService.getMonthlyAttendanceSummary(
        req.user.employee?.id,
        parseInt(year),
        parseInt(month),
        req.user
      );

      if (!result.success) {
        return sendResponse(res, false, result.message, null, 400);
      }

      return sendResponse(res, true, "Monthly attendance summary retrieved successfully", result.data);
    } catch (error) {
      logger.error("Controller: Get My Monthly Summary Error", error);
      return sendResponse(res, false, "Internal server error", null, 500);
    }
  },

  /**
   * Get working hours for a date range
   */
  getWorkingHours: async (req, res) => {
    try {
      const { startDate, endDate } = req.query;

      if (!startDate || !endDate) {
        return sendResponse(res, false, "Start date and end date are required", null, 400);
      }

      const filters = {
        employeeId: req.user.employee?.id,
        dateFrom: startDate,
        dateTo: endDate
      };

      const result = await attendanceService.getAttendanceRecords(filters, req.user, { limit: 100 });

      if (!result.success) {
        return sendResponse(res, false, result.message, null, 400);
      }

      // Calculate total working hours
      const totalHours = result.data.records.reduce((sum, record) => {
        return sum + (parseFloat(record.workHours) || 0);
      }, 0);

      const workingHoursSummary = {
        records: result.data.records,
        totalWorkingHours: totalHours.toFixed(2),
        totalDays: result.data.records.length,
        averageHoursPerDay: result.data.records.length > 0 ? (totalHours / result.data.records.length).toFixed(2) : 0
      };

      return sendResponse(res, true, "Working hours retrieved successfully", workingHoursSummary);
    } catch (error) {
      logger.error("Controller: Get Working Hours Error", error);
      return sendResponse(res, false, "Internal server error", null, 500);
    }
  },

  /**
   * Get attendance status for a date range
   */
  getAttendanceStatus: async (req, res) => {
    try {
      const { date } = req.query;
      const targetDate = date || new Date().toISOString().split('T')[0];

      const filters = {
        employeeId: req.user.employee?.id,
        date: targetDate
      };

      const result = await attendanceService.getAttendanceRecords(filters, req.user, { limit: 1 });

      if (!result.success) {
        return sendResponse(res, false, result.message, null, 400);
      }

      const record = result.data.records[0];

      if (!record) {
        return sendResponse(res, true, "No attendance record found for the specified date", null);
      }

      const status = {
        date: record.date,
        clockIn: record.clockIn,
        clockOut: record.clockOut,
        isLate: record.isLate,
        lateMinutes: record.lateMinutes,
        isEarlyDeparture: record.isEarlyDeparture,
        earlyExitMinutes: record.earlyExitMinutes,
        workHours: record.workHours,
        totalBreakMinutes: record.totalBreakMinutes,
        status: record.status,
        overtimeHours: record.overtimeHours
      };

      return sendResponse(res, true, "Attendance status retrieved successfully", status);
    } catch (error) {
      logger.error("Controller: Get Attendance Status Error", error);
      return sendResponse(res, false, "Internal server error", null, 500);
    }
  },

  /**
   * Get employee's attendance summary (without parameters)
   */
  getMyAttendanceSummary: async (req, res) => {
    try {
      const currentDate = new Date();
      const year = currentDate.getFullYear();
      const month = currentDate.getMonth() + 1;

      const result = await attendanceService.getMonthlyAttendanceSummary(
        req.user.employee?.id,
        year,
        month,
        req.user
      );

      if (!result.success) {
        return sendResponse(res, false, result.message, null, 400);
      }

      return sendResponse(res, true, "Attendance summary retrieved successfully", result.data);
    } catch (error) {
      logger.error("Controller: Get My Attendance Summary Error", error);
      return sendResponse(res, false, "Internal server error", null, 500);
    }
  }
};

export default employeeAttendanceController;