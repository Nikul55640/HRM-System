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

    const records = await AttendanceRecord.findAll({
      where: { date: dateOnly },
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

      const sessions = record.sessions || [];

      const activeSession = sessions.find(
        (s) => s.status === "active" || s.status === "on_break"
      );

      if (!activeSession) return;

      const employeeDepartment = record.employee.department || "";

      // ✅ Correct filter handling
      if (
        department &&
        department !== "all" &&
        employeeDepartment !== department
      ) {
        return;
      }

      if (
        workLocation &&
        workLocation !== "all" &&
        activeSession.workLocation !== workLocation
      ) {
        return;
      }

      const now = new Date();
      const sessionDuration = Math.round(
        (now - new Date(activeSession.checkIn)) / (1000 * 60)
      );

      const currentWorkedMinutes = Math.max(
        0,
        sessionDuration - (activeSession.totalBreakMinutes || 0)
      );

      // Current break info
      let currentBreak = null;
      if (activeSession.status === "on_break") {
        const activeBreakObj = activeSession.breaks?.find((b) => !b.endTime);
        if (activeBreakObj) {
          const breakDuration = Math.round(
            (now - new Date(activeBreakObj.startTime)) / (1000 * 60)
          );
          currentBreak = {
            breakId: activeBreakObj.breakId,
            startTime: activeBreakObj.startTime,
            durationMinutes: breakDuration,
          };
        }
      }

      liveAttendance.push({
        employeeId: record.employee.id,
        fullName:
          `${record.employee.firstName || ""} ${
            record.employee.lastName || ""
          }`.trim() || "Unknown",
        email: record.employee.email || "",
        department: employeeDepartment,
        position: record.employee.designation || "",
        currentSession: {
          sessionId: activeSession.sessionId,
          checkInTime: activeSession.checkIn,
          workLocation: activeSession.workLocation,
          locationDetails: activeSession.locationDetails,
          status: activeSession.status,
          currentBreak,
          totalWorkedMinutes: currentWorkedMinutes,
          totalBreakMinutes: activeSession.totalBreakMinutes || 0,
          breakCount: activeSession.breaks?.length || 0,
        },
      });
    });

    // ✅ Mock data ONLY in development
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

    // Sort newest first
    liveAttendance.sort(
      (a, b) =>
        new Date(b.currentSession.checkInTime) -
        new Date(a.currentSession.checkInTime)
    );

    // Audit log
    await AuditLog.logAction({
      action: "VIEW",
      severity: "info",
      entityType: "Live Attendance",
      entityId: "live-attendance-dashboard",
      entityDisplayName: "Live Attendance Dashboard",
      userId,
      userRole: role,
      performedByName: fullName,
      performedByEmail: email,
      meta: {
        activeEmployees: liveAttendance.length,
        filters: { department, workLocation },
        usingMockData: isDev && records.length === 0,
      },
      ipAddress: req.ip,
      userAgent: req.get("User-Agent"),
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

    const sessions = record.sessions || [];
    const activeSession = sessions.find(
      (s) => s.status === "active" || s.status === "on_break"
    );

    if (!activeSession) {
      return res.json({
        success: true,
        data: {
          employeeId: record.employee.id,
          fullName:
            `${record.employee.firstName || ""} ${
              record.employee.lastName || ""
            }`.trim() || "Unknown",
          status: "clocked_out",
          sessions,
        },
      });
    }

    const now = new Date();
    const sessionDuration = Math.round(
      (now - new Date(activeSession.checkIn)) / (1000 * 60)
    );

    const currentWorkedMinutes = Math.max(
      0,
      sessionDuration - (activeSession.totalBreakMinutes || 0)
    );

    let currentBreak = null;
    if (activeSession.status === "on_break") {
      const activeBreakObj = activeSession.breaks?.find((b) => !b.endTime);
      if (activeBreakObj) {
        const breakDuration = Math.round(
          (now - new Date(activeBreakObj.startTime)) / (1000 * 60)
        );
        currentBreak = {
          breakId: activeBreakObj.breakId,
          startTime: activeBreakObj.startTime,
          durationMinutes: breakDuration,
        };
      }
    }

    const liveStatus = {
      employeeId: record.employee.id,
      fullName:
        `${record.employee.firstName || ""} ${
          record.employee.lastName || ""
        }`.trim() || "Unknown",
      email: record.employee.email || "",
      department: record.employee.department || "",
      position: record.employee.designation || "",
      currentSession: {
        sessionId: activeSession.sessionId,
        checkInTime: activeSession.checkIn,
        workLocation: activeSession.workLocation,
        locationDetails: activeSession.locationDetails,
        status: activeSession.status,
        currentBreak,
        totalWorkedMinutes: currentWorkedMinutes,
        totalBreakMinutes: activeSession.totalBreakMinutes,
        breaks: activeSession.breaks || [],
      },
      allSessions: sessions,
    };

    await AuditLog.logAction({
      action: "VIEW",
      severity: "info",
      entityType: "Employee Live Status",
      entityId: employeeId,
      entityDisplayName: liveStatus.fullName,
      userId,
      userRole: role,
      performedByName: fullName,
      performedByEmail: email,
      meta: {
        targetEmployeeId: employeeId,
        status: activeSession.status,
      },
      ipAddress: req.ip,
      userAgent: req.get("User-Agent"),
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
