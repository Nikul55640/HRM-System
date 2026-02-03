/**
 * Live Attendance Controller
 * Handles real-time attendance monitoring for HR/Admin
 */

import { Op } from 'sequelize';
import AttendanceRecord from "../../models/sequelize/AttendanceRecord.js";
import Employee from "../../models/sequelize/Employee.js";
import User from "../../models/sequelize/User.js";
import Shift from "../../models/sequelize/Shift.js";
import EmployeeShift from "../../models/sequelize/EmployeeShift.js";
import AuditLog from "../../models/sequelize/AuditLog.js";
import { getLocalDateString } from '../../utils/dateUtils.js';

// Helper: get user ID
const getUserId = (user) => user.id || user._id;

/**
 * Get all currently active sessions (live attendance)
 */
export const getLiveAttendance = async (req, res) => {
  try {
    const { fullName, email, role } = req.user;
    const userId = getUserId(req.user);

    const { department, workLocation } = req.query;

    const today = new Date();
    const dateOnly = new Date(
      today.getFullYear(),
      today.getMonth(),
      today.getDate()
    );

    // Get attendance records for today where employees are clocked in but not clocked out
    const records = await AttendanceRecord.findAll({
      where: { 
        date: dateOnly,
        clockIn: { [Op.ne]: null },
        clockOut: null // Only get records where employee hasn't clocked out
      },
      include: [
        {
          model: Employee,
          as: "employee",
          attributes: [
            "id",
            "employeeId",
            "firstName",
            "lastName",
            "designation",
            "department",
            "status",
          ],
          include: [
            {
              model: User,
              as: 'user',
              attributes: ['id', 'email']
            },
            {
              model: EmployeeShift,
              as: 'shiftAssignments',
              where: {
                isActive: true,
                effectiveDate: { [Op.lte]: today },
                [Op.or]: [
                  { endDate: null },
                  { endDate: { [Op.gte]: today } }
                ]
              },
              required: false, // LEFT JOIN to include employees without shifts
              include: [
                {
                  model: Shift,
                  as: 'shift',
                  attributes: ['id', 'shiftName', 'shiftStartTime', 'shiftEndTime']
                }
              ]
            }
          ]
        },
      ],
      order: [['clockIn', 'DESC']] // Most recent clock-ins first
    });

    let liveAttendance = [];

    records.forEach((record) => {
      if (!record.employee) return;

      const employeeDepartment = record.employee.department || "";

      // Apply filters
      if (
        department &&
        department !== "all" &&
        employeeDepartment !== department
      ) {
        return;
      }

      // Get current location from attendance record
      const currentLocation = record.workMode || record.location?.workLocation || 'office';
      
      if (
        workLocation &&
        workLocation !== "all" &&
        currentLocation !== workLocation
      ) {
        return;
      }

      const now = new Date();
      const clockInTime = new Date(record.clockIn);
      const sessionDuration = Math.round((now - clockInTime) / (1000 * 60));

      // Calculate current worked minutes (total time minus break time)
      const currentWorkedMinutes = Math.max(
        0,
        sessionDuration - (record.breakMinutes || 0)
      );

      // Parse break sessions from JSON if it exists
      let breakSessions = [];
      try {
        if (record.breakSessions && typeof record.breakSessions === 'string') {
          breakSessions = JSON.parse(record.breakSessions);
        } else if (Array.isArray(record.breakSessions)) {
          breakSessions = record.breakSessions;
        }
      } catch (error) {
        console.warn('Error parsing break sessions for record:', record.id, error);
        breakSessions = [];
      }

      // Check if currently on break
      const activeBreak = breakSessions.find(session => session.breakIn && !session.breakOut);
      
      let currentBreak = null;
      let status = 'active';
      
      if (activeBreak) {
        status = 'on_break';
        const breakDuration = Math.round(
          (now - new Date(activeBreak.breakIn)) / (1000 * 60)
        );
        currentBreak = {
          breakId: activeBreak.id || `break-${Date.now()}`,
          startTime: activeBreak.breakIn,
          durationMinutes: breakDuration,
        };
      }

      // Get shift information from employee's active shift
      let shiftInfo = null;
      if (record.employee.shiftAssignments && record.employee.shiftAssignments.length > 0) {
        const activeShift = record.employee.shiftAssignments[0]; // Get the first (most recent) active shift
        if (activeShift.shift) {
          shiftInfo = {
            id: activeShift.shift.id,
            shiftName: activeShift.shift.shiftName,
            shiftStartTime: activeShift.shift.shiftStartTime,
            shiftEndTime: activeShift.shift.shiftEndTime
          };
        }
      }

      liveAttendance.push({
        employeeId: record.employee.employeeId, // Use employee's ID, not the record ID
        fullName:
          `${record.employee.firstName || ""} ${
            record.employee.lastName || ""
          }`.trim() || "Unknown",
        email: record.employee.user?.email || "",
        department: employeeDepartment,
        position: record.employee.designation || "",
        // ✅ ENHANCED: Include late status from attendance record
        isLate: record.isLate || false,
        lateMinutes: record.lateMinutes || 0,
        status: record.status || 'present',
        shift: shiftInfo, // Include shift information
        currentSession: {
          sessionId: `session-${record.id}`,
          checkInTime: record.clockIn,
          workLocation: currentLocation,
          locationDetails: record.location?.address || null,
          status: status,
          currentBreak,
          totalWorkedMinutes: currentWorkedMinutes,
          totalBreakMinutes: record.breakMinutes || 0,
          breakCount: breakSessions.length,
          // Include late status in session as well for compatibility
          isLate: record.isLate || false,
          lateMinutes: record.lateMinutes || 0,
        },
      });
    });

    // Sort by check-in time (newest first)
    liveAttendance.sort(
      (a, b) =>
        new Date(b.currentSession.checkInTime) -
        new Date(a.currentSession.checkInTime)
    );

    // Audit log
    await AuditLog.logAction({
      userId,
      action: "attendance_clock_in", // Using existing enum value
      module: "attendance",
      targetType: "Live Attendance",
      targetId: null,
      description: `Viewed live attendance dashboard with ${liveAttendance.length} active employees`,
      newValues: {
        activeEmployees: liveAttendance.length,
        filters: { department, workLocation },
        usingMockData: false, // Always false - no mock data
      },
      ipAddress: req.ip,
      userAgent: req.get("User-Agent"),
      severity: "low",
      metadata: {
        performedByName: fullName,
        performedByEmail: email,
      }
    });

    return res.json({
      success: true,
      data: liveAttendance,
      summary: {
        totalActive: liveAttendance.length,
        working: liveAttendance.filter(
          (e) => e.currentSession.status === "active"
        ).length,
        onBreak: liveAttendance.filter(
          (e) => e.currentSession.status === "on_break"
        ).length,
        // ✅ ENHANCED: Include late and incomplete counts
        late: liveAttendance.filter(e => e.isLate).length,
        overtime: liveAttendance.filter(e => {
          // ✅ IMPROVEMENT: Better overtime calculation using shift data
          if (!e.shift?.shiftEndTime) {
            // If no shift data, assume 8-hour workday (480 minutes)
            return e.currentSession.totalWorkedMinutes > 480;
          }
          
          try {
            const now = new Date();
            // ✅ FIX: Use local timezone, not UTC
            const today = getLocalDateString(now);
            const [hours, minutes] = e.shift.shiftEndTime.split(':').map(Number);
            const shiftEndTime = new Date(today);
            shiftEndTime.setHours(hours, minutes, 0, 0);
            
            return now > shiftEndTime;
          } catch (error) {
            console.warn('Error calculating overtime for employee:', e.employeeId, error);
            // Fallback to 8-hour rule
            return e.currentSession.totalWorkedMinutes > 480;
          }
        }).length,
        incomplete: 0, // Live attendance shows active sessions, incomplete would be from previous days
      },
      meta: {
        usingMockData: false, // Always false - no mock data
        realRecordsFound: records.length,
      },
      // ✅ IMPROVEMENT: Include server time for accurate client-side calculations
      serverTime: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Error fetching live attendance:", error);
    return res.status(500).json({
      success: false,
      message: "Error fetching live attendance",
      error: error.message,
    });
  }
};

/**
 * Get live attendance for a specific employee
 */
export const getEmployeeLiveStatus = async (req, res) => {
  try {
    const { fullName, email, role } = req.user;
    const userId = getUserId(req.user);
    const { employeeId } = req.params;

    const today = new Date();
    const dateOnly = new Date(
      today.getFullYear(),
      today.getMonth(),
      today.getDate()
    );

    // Find employee first to get the internal ID
    const employee = await Employee.findOne({
      where: { employeeId },
      attributes: ['id', 'employeeId', 'firstName', 'lastName', 'designation', 'department', 'status'],
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'email']
        },
        {
          model: EmployeeShift,
          as: 'shiftAssignments',
          where: {
            isActive: true,
            effectiveDate: { [Op.lte]: today },
            [Op.or]: [
              { endDate: null },
              { endDate: { [Op.gte]: today } }
            ]
          },
          required: false,
          include: [
            {
              model: Shift,
              as: 'shift',
              attributes: ['id', 'shiftName', 'shiftStartTime', 'shiftEndTime']
            }
          ]
        }
      ]
    });

    if (!employee) {
      return res.status(404).json({
        success: false,
        message: "Employee not found",
      });
    }

    const record = await AttendanceRecord.findOne({
      where: { 
        employeeId: employee.id, // Use internal employee ID
        date: dateOnly 
      },
    });

    if (!record) {
      return res.json({
        success: true,
        data: {
          employeeId: employee.employeeId,
          fullName: `${employee.firstName || ""} ${employee.lastName || ""}`.trim() || "Unknown",
          status: "not_clocked_in",
          message: "Employee has not clocked in today"
        },
      });
    }

    // Check if employee is currently clocked in (has clockIn but no clockOut)
    if (!record.clockIn || record.clockOut) {
      return res.json({
        success: true,
        data: {
          employeeId: employee.employeeId,
          fullName: `${employee.firstName || ""} ${employee.lastName || ""}`.trim() || "Unknown",
          status: "clocked_out",
          lastClockIn: record.clockIn,
          lastClockOut: record.clockOut,
        },
      });
    }

    const now = new Date();
    const clockInTime = new Date(record.clockIn);
    const sessionDuration = Math.round((now - clockInTime) / (1000 * 60));

    const currentWorkedMinutes = Math.max(
      0,
      sessionDuration - (record.breakMinutes || 0)
    );

    // Parse break sessions from JSON if it exists
    let breakSessions = [];
    try {
      if (record.breakSessions && typeof record.breakSessions === 'string') {
        breakSessions = JSON.parse(record.breakSessions);
      } else if (Array.isArray(record.breakSessions)) {
        breakSessions = record.breakSessions;
      }
    } catch (error) {
      console.warn('Error parsing break sessions for record:', record.id, error);
      breakSessions = [];
    }

    // Check for active break
    const activeBreak = breakSessions.find(session => session.breakIn && !session.breakOut);
    
    let currentBreak = null;
    let status = 'active';
    
    if (activeBreak) {
      status = 'on_break';
      const breakDuration = Math.round(
        (now - new Date(activeBreak.breakIn)) / (1000 * 60)
      );
      currentBreak = {
        breakId: activeBreak.id || `break-${Date.now()}`,
        startTime: activeBreak.breakIn,
        durationMinutes: breakDuration,
      };
    }

    const currentLocation = record.workMode || record.location?.workLocation || 'office';

    // Get shift information
    let shiftInfo = null;
    if (employee.shiftAssignments && employee.shiftAssignments.length > 0) {
      const activeShift = employee.shiftAssignments[0];
      if (activeShift.shift) {
        shiftInfo = {
          id: activeShift.shift.id,
          shiftName: activeShift.shift.shiftName,
          shiftStartTime: activeShift.shift.shiftStartTime,
          shiftEndTime: activeShift.shift.shiftEndTime
        };
      }
    }

    const liveStatus = {
      employeeId: employee.employeeId,
      fullName: `${employee.firstName || ""} ${employee.lastName || ""}`.trim() || "Unknown",
      email: employee.user?.email || "",
      department: employee.department || "",
      position: employee.designation || "",
      shift: shiftInfo,
      isLate: record.isLate || false,
      lateMinutes: record.lateMinutes || 0,
      currentSession: {
        sessionId: `session-${record.id}`,
        checkInTime: record.clockIn,
        workLocation: currentLocation,
        locationDetails: record.location?.address || null,
        status: status,
        currentBreak,
        totalWorkedMinutes: currentWorkedMinutes,
        totalBreakMinutes: record.breakMinutes || 0,
        breakCount: breakSessions.length,
        breaks: breakSessions,
      },
      todayRecord: {
        clockIn: record.clockIn,
        clockOut: record.clockOut,
        totalWorkedMinutes: record.totalWorkedMinutes,
        totalBreakMinutes: record.breakMinutes,
        breakSessions: breakSessions,
        status: record.status,
        isLate: record.isLate || false,
        lateMinutes: record.lateMinutes || 0,
      }
    };

    await AuditLog.logAction({
      userId,
      action: "attendance_clock_in", // Using existing enum value
      module: "attendance",
      targetType: "Employee Live Status",
      targetId: employeeId,
      description: `Viewed live status for employee ${liveStatus.fullName}`,
      newValues: {
        targetEmployeeId: employeeId,
        status: status,
      },
      ipAddress: req.ip,
      userAgent: req.get("User-Agent"),
      severity: "low",
      metadata: {
        performedByName: fullName,
        performedByEmail: email,
      }
    });

    return res.json({
      success: true,
      data: liveStatus,
    });
  } catch (error) {
    console.error("Error fetching employee live status:", error);
    return res.status(500).json({
      success: false,
      message: "Error fetching employee live status",
      error: error.message,
    });
  }
};

export default {
  getLiveAttendance,
  getEmployeeLiveStatus,
};
