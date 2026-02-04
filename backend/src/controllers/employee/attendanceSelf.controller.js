/**
 * Employee Attendance Controller
 * Handles employee self-service attendance operations (Clock In/Out, Break, Corrections)
 */

import attendanceService from '../../services/admin/attendance.service.js';
import logger from '../../utils/logger.js';
import { getLocalDateString } from '../../utils/dateUtils.js';

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
      // 🔥 ENHANCED: Merge request metadata with frontend device info
      const metadata = {
        ipAddress: req.ip,
        userAgent: req.headers["user-agent"],
        // Add any additional server-side metadata
        serverTimestamp: new Date().toISOString(),
        requestHeaders: {
          'x-forwarded-for': req.headers['x-forwarded-for'],
          'x-real-ip': req.headers['x-real-ip']
        }
      };

      // 🔥 ENHANCED: Combine frontend deviceInfo with server metadata
      const enhancedClockInData = {
        ...req.body,
        // Merge device info if provided from frontend
        deviceInfo: req.body.deviceInfo ? {
          ...req.body.deviceInfo,
          serverMetadata: metadata
        } : metadata
      };

      console.log('🔍 Enhanced clock-in data:', {
        workMode: enhancedClockInData.workMode,
        hasLocation: !!enhancedClockInData.location,
        hasDeviceInfo: !!enhancedClockInData.deviceInfo,
        locationDetails: enhancedClockInData.locationDetails
      });

      const result = await attendanceService.clockIn(enhancedClockInData, req.user, metadata);
      
      if (!result.success) {
        return sendResponse(res, false, result.message, null, 400);
      }
      
      return sendResponse(res, true, result.message, result.data);
    } catch (error) {
      logger.error("Controller: Clock In Error", error);
      
      // Provide more specific error messages based on error type
      let errorMessage = "Unable to clock in at this time";
      
      if (error.message?.includes('already clocked in')) {
        errorMessage = "You are already clocked in for today";
      } else if (error.message?.includes('outside working hours')) {
        errorMessage = "Clock in is only allowed during working hours";
      } else if (error.message?.includes('weekend')) {
        errorMessage = "Clock in is not allowed on weekends";
      } else if (error.message?.includes('holiday')) {
        errorMessage = "Clock in is not allowed on holidays";
      } else if (error.message?.includes('leave')) {
        errorMessage = "You are on approved leave today";
      }
      
      return sendResponse(res, false, errorMessage, null, 500);
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
      
      // Provide more specific error messages
      let errorMessage = "Unable to clock out at this time";
      
      if (error.message?.includes('not clocked in')) {
        errorMessage = "You must clock in before you can clock out";
      } else if (error.message?.includes('already clocked out')) {
        errorMessage = "You have already clocked out for today";
      } else if (error.message?.includes('minimum work hours')) {
        errorMessage = "You must work the minimum required hours before clocking out";
      }
      
      return sendResponse(res, false, errorMessage, null, 500);
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
      
      // Provide more specific error messages
      let errorMessage = "Unable to start break at this time";
      
      if (error.message?.includes('not clocked in')) {
        errorMessage = "You must clock in before taking a break";
      } else if (error.message?.includes('already on break')) {
        errorMessage = "You are already on a break";
      } else if (error.message?.includes('maximum break')) {
        errorMessage = "You have reached the maximum number of breaks for today";
      } else if (error.message?.includes('break duration')) {
        errorMessage = "Break duration limit exceeded";
      }
      
      return sendResponse(res, false, errorMessage, null, 500);
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
      
      // Provide more specific error messages
      let errorMessage = "Unable to end break at this time";
      
      if (error.message?.includes('not on break')) {
        errorMessage = "You are not currently on a break";
      } else if (error.message?.includes('minimum break')) {
        errorMessage = "Break must be at least a few minutes long";
      } else if (error.message?.includes('break session not found')) {
        errorMessage = "Active break session not found";
      }
      
      return sendResponse(res, false, errorMessage, null, 500);
    }
  },

  /**
   * Get today's attendance status with button controls
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
      
      // Provide more specific error messages
      let errorMessage = "Unable to retrieve attendance information";
      
      if (error.message?.includes('employee not found')) {
        errorMessage = "Employee profile not found";
      } else if (error.message?.includes('shift not assigned')) {
        errorMessage = "No shift assigned for today";
      }
      
      return sendResponse(res, false, errorMessage, null, 500);
    }
  },

  /**
   * 🚫 NEW: Get button states for attendance controls
   */
  getButtonStates: async (req, res) => {
    try {
      const result = await attendanceService.getButtonStates(req.user);
      if (!result.success) {
        return sendResponse(res, false, result.message, null, 400);
      }
      return sendResponse(res, true, "Button states retrieved successfully", result.data);
    } catch (error) {
      logger.error("Controller: Get Button States Error", error);
      
      // Provide more specific error messages
      let errorMessage = "Unable to retrieve attendance controls";
      
      if (error.message?.includes('employee not found')) {
        errorMessage = "Employee profile not found";
      } else if (error.message?.includes('shift not found')) {
        errorMessage = "Shift information not available";
      }
      
      return sendResponse(res, false, errorMessage, null, 500);
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
      
      // Provide more specific error messages
      let errorMessage = "Unable to submit correction request";
      
      if (error.message?.includes('already pending')) {
        errorMessage = "A correction request is already pending for this attendance record";
      } else if (error.message?.includes('correction window')) {
        errorMessage = "Correction requests can only be made within the allowed time window";
      } else if (error.message?.includes('invalid reason')) {
        errorMessage = "Please provide a valid reason for the correction";
      } else if (error.message?.includes('attendance not found')) {
        errorMessage = "Attendance record not found";
      }
      
      return sendResponse(res, false, errorMessage, null, 500);
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
      
      // 🔧 CRITICAL FIX: Return data in format expected by frontend
      // Frontend expects: { data: [...], pagination: {...} }
      return res.status(200).json({
        success: true,
        message: result.message,
        data: result.data.records, // Direct array for calendar component
        pagination: result.data.pagination
      });
    } catch (error) {
      logger.error("Controller: Get My Attendance Records Error", error);
      
      // Provide more specific error messages
      let errorMessage = "Unable to retrieve attendance records";
      
      if (error.message?.includes('invalid date range')) {
        errorMessage = "Please provide a valid date range";
      } else if (error.message?.includes('employee not found')) {
        errorMessage = "Employee profile not found";
      }
      
      return sendResponse(res, false, errorMessage, null, 500);
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
      
      // Provide more specific error messages
      let errorMessage = "Unable to retrieve monthly summary";
      
      if (error.message?.includes('invalid month')) {
        errorMessage = "Please provide a valid month (1-12)";
      } else if (error.message?.includes('invalid year')) {
        errorMessage = "Please provide a valid year";
      } else if (error.message?.includes('employee not found')) {
        errorMessage = "Employee profile not found";
      }
      
      return sendResponse(res, false, errorMessage, null, 500);
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
      
      // Provide more specific error messages
      let errorMessage = "Unable to retrieve working hours";
      
      if (error.message?.includes('invalid date format')) {
        errorMessage = "Please provide dates in valid format (YYYY-MM-DD)";
      } else if (error.message?.includes('date range too large')) {
        errorMessage = "Date range is too large. Please select a smaller range";
      } else if (error.message?.includes('employee not found')) {
        errorMessage = "Employee profile not found";
      }
      
      return sendResponse(res, false, errorMessage, null, 500);
    }
  },

  /**
   * Get attendance status for a date range
   */
  getAttendanceStatus: async (req, res) => {
    try {
      const { date } = req.query;
      // ✅ FIX: Use local timezone, not UTC
      const targetDate = date || getLocalDateString();

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
      
      // Provide more specific error messages
      let errorMessage = "Unable to retrieve attendance status";
      
      if (error.message?.includes('invalid date')) {
        errorMessage = "Please provide a valid date";
      } else if (error.message?.includes('employee not found')) {
        errorMessage = "Employee profile not found";
      }
      
      return sendResponse(res, false, errorMessage, null, 500);
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
      
      // Provide more specific error messages
      let errorMessage = "Unable to retrieve attendance summary";
      
      if (error.message?.includes('employee not found')) {
        errorMessage = "Employee profile not found";
      } else if (error.message?.includes('no attendance data')) {
        errorMessage = "No attendance data available for this month";
      }
      
      return sendResponse(res, false, errorMessage, null, 500);
    }
  }
};

export default employeeAttendanceController;