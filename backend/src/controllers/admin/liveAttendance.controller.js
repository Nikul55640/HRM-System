/**
 * Live Attendance Controller
 * Handles real-time attendance monitoring for HR/Admin
 */

import AttendanceRecord from "../../models/sequelize/AttendanceRecord.js";
import Employee from "../../models/sequelize/Employee.js";
import AuditLog from "../../models/sequelize/AuditLog.js";

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
        clockIn: { [AttendanceRecord.sequelize.Sequelize.Op.ne]: null },
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
            "email",
            "designation",
            "department",
            "status",
          ],
        },
      ],
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

      // For now, we'll assume office location if not specified
      // This can be enhanced when location tracking is fully implemented
      const currentLocation = record.location?.workLocation || 'office';
      
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
        sessionDuration - (record.totalBreakMinutes || 0)
      );

      // Check if currently on break
      const breakSessions = record.breakSessions || [];
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

      liveAttendance.push({
        employeeId: record.employee.employeeId, // Use employee's ID, not the record ID
        fullName:
          `${record.employee.firstName || ""} ${
            record.employee.lastName || ""
          }`.trim() || "Unknown",
        email: record.employee.email || "",
        department: employeeDepartment,
        position: record.employee.designation || "",
        currentSession: {
          sessionId: `session-${record.id}`,
          checkInTime: record.clockIn,
          workLocation: currentLocation,
          locationDetails: record.location?.address || null,
          status: status,
          currentBreak,
          totalWorkedMinutes: currentWorkedMinutes,
          totalBreakMinutes: record.totalBreakMinutes || 0,
          breakCount: breakSessions.length,
        },
      });
    });

    // Only show mock data in development if no real records exist
    const isDev = process.env.NODE_ENV !== "production";

    if (liveAttendance.length === 0 && isDev) {
      const mockData = [
        {
          employeeId: "mock-emp-1",
          fullName: "John Smith",
          email: "john.smith@company.com",
          department: "Engineering",
          position: "Senior Developer",
          currentSession: {
            sessionId: "mock-session-1",
            checkInTime: new Date(Date.now() - 4 * 60 * 60 * 1000),
            workLocation: "office",
            locationDetails: "Main Office - Floor 3",
            status: "active",
            currentBreak: null,
            totalWorkedMinutes: 240,
            totalBreakMinutes: 15,
            breakCount: 1,
          },
        },
      ];

      liveAttendance = mockData.filter((emp) => {
        if (department && department !== "all" && emp.department !== department)
          return false;

        if (
          workLocation &&
          workLocation !== "all" &&
          emp.currentSession.workLocation !== workLocation
        )
          return false;

        return true;
      });
    }

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
        usingMockData: isDev && records.length === 0,
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
      },
      meta: {
        usingMockData: isDev && records.length === 0,
        realRecordsFound: records.length,
      },
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

    const record = await AttendanceRecord.findOne({
      where: { employeeId, date: dateOnly },
      include: [
        {
          model: Employee,
          as: "employee",
          attributes: [
            "id",
            "employeeId",
            "firstName",
            "lastName",
            "email",
            "designation",
            "department",
            "status",
          ],
        },
      ],
    });

    if (!record || !record.employee) {
      return res.json({
        success: true,
        data: null,
        message: "Employee not clocked in today",
      });
    }

    // Check if employee is currently clocked in (has clockIn but no clockOut)
    if (!record.clockIn || record.clockOut) {
      return res.json({
        success: true,
        data: {
          employeeId: record.employee.employeeId,
          fullName:
            `${record.employee.firstName || ""} ${
              record.employee.lastName || ""
            }`.trim() || "Unknown",
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
      sessionDuration - (record.totalBreakMinutes || 0)
    );

    // Check for active break
    const breakSessions = record.breakSessions || [];
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

    const currentLocation = record.location?.workLocation || 'office';

    const liveStatus = {
      employeeId: record.employee.employeeId,
      fullName:
        `${record.employee.firstName || ""} ${
          record.employee.lastName || ""
        }`.trim() || "Unknown",
      email: record.employee.email || "",
      department: record.employee.department || "",
      position: record.employee.designation || "",
      currentSession: {
        sessionId: `session-${record.id}`,
        checkInTime: record.clockIn,
        workLocation: currentLocation,
        locationDetails: record.location?.address || null,
        status: status,
        currentBreak,
        totalWorkedMinutes: currentWorkedMinutes,
        totalBreakMinutes: record.totalBreakMinutes || 0,
        breaks: breakSessions,
      },
      todayRecord: {
        clockIn: record.clockIn,
        clockOut: record.clockOut,
        totalWorkedMinutes: record.totalWorkedMinutes,
        totalBreakMinutes: record.totalBreakMinutes,
        breakSessions: breakSessions,
        status: record.status,
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
