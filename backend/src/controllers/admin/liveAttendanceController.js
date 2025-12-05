/**
 * Live Attendance Controller
 * Handles real-time attendance monitoring for HR/Admin
 */

import AttendanceRecord from '../../models/AttendanceRecord.js';
import Employee from '../../models/Employee.js';
import AuditLog from '../../models/AuditLog.js';

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
    const dateOnly = new Date(today.getFullYear(), today.getMonth(), today.getDate());

    // Build query
    const query = {
      date: dateOnly,
      'sessions.status': { $in: ['active', 'on_break'] },
    };

    // Find all records with active sessions
    const records = await AttendanceRecord.find(query)
      .populate({
        path: 'employeeId',
        select: 'firstName lastName email department position',
      })
      .lean();

    // Filter and format active sessions
    let liveAttendance = [];

    records.forEach((record) => {
      if (!record.employeeId) return; // Skip if employee not found

      // Find active session
      const activeSession = record.sessions.find(
        (s) => s.status === 'active' || s.status === 'on_break'
      );

      if (!activeSession) return;

      // Apply filters
      if (department && record.employeeId.department !== department) return;
      if (workLocation && activeSession.workLocation !== workLocation) return;

      // Calculate current worked duration
      const now = new Date();
      const sessionDuration = Math.round(
        (now.getTime() - activeSession.checkIn.getTime()) / (1000 * 60)
      );
      const currentWorkedMinutes = Math.max(
        0,
        sessionDuration - activeSession.totalBreakMinutes
      );

      // Find current break if on break
      let currentBreak = null;
      if (activeSession.status === 'on_break') {
        const activeBreakObj = activeSession.breaks.find((b) => !b.endTime);
        if (activeBreakObj) {
          const breakDuration = Math.round(
            (now.getTime() - activeBreakObj.startTime.getTime()) / (1000 * 60)
          );
          currentBreak = {
            breakId: activeBreakObj.breakId,
            startTime: activeBreakObj.startTime,
            durationMinutes: breakDuration,
          };
        }
      }

      liveAttendance.push({
        employeeId: record.employeeId._id,
        fullName: `${record.employeeId.firstName} ${record.employeeId.lastName}`,
        email: record.employeeId.email,
        department: record.employeeId.department,
        position: record.employeeId.position,
        currentSession: {
          sessionId: activeSession.sessionId,
          checkInTime: activeSession.checkIn,
          workLocation: activeSession.workLocation,
          locationDetails: activeSession.locationDetails,
          status: activeSession.status,
          currentBreak,
          totalWorkedMinutes: currentWorkedMinutes,
          totalBreakMinutes: activeSession.totalBreakMinutes,
          breakCount: activeSession.breaks.length,
        },
      });
    });

    // Sort by check-in time (most recent first)
    liveAttendance.sort(
      (a, b) =>
        b.currentSession.checkInTime.getTime() -
        a.currentSession.checkInTime.getTime()
    );

    // Audit log
    await AuditLog.logAction({
      action: 'VIEW',
      severity: 'info',
      entityType: 'Live Attendance',
      entityId: 'live-attendance-dashboard',
      entityDisplayName: 'Live Attendance Dashboard',
      userId,
      userRole: role,
      performedByName: fullName,
      performedByEmail: email,
      meta: {
        activeEmployees: liveAttendance.length,
        filters: { department, workLocation },
      },
      ipAddress: req.ip,
      userAgent: req.get('User-Agent'),
    });

    return res.json({
      success: true,
      data: liveAttendance,
      summary: {
        totalActive: liveAttendance.length,
        working: liveAttendance.filter((e) => e.currentSession.status === 'active')
          .length,
        onBreak: liveAttendance.filter((e) => e.currentSession.status === 'on_break')
          .length,
      },
    });
  } catch (error) {
    console.error('Error fetching live attendance:', error);
    return res.status(500).json({
      success: false,
      message: 'Error fetching live attendance',
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
    const dateOnly = new Date(today.getFullYear(), today.getMonth(), today.getDate());

    // Find today's record for the employee
    const record = await AttendanceRecord.findOne({
      employeeId,
      date: dateOnly,
    })
      .populate({
        path: 'employeeId',
        select: 'firstName lastName email department position',
      })
      .lean();

    if (!record || !record.employeeId) {
      return res.json({
        success: true,
        data: null,
        message: 'Employee not clocked in today',
      });
    }

    // Find active session
    const activeSession = record.sessions.find(
      (s) => s.status === 'active' || s.status === 'on_break'
    );

    if (!activeSession) {
      return res.json({
        success: true,
        data: {
          employeeId: record.employeeId._id,
          fullName: `${record.employeeId.firstName} ${record.employeeId.lastName}`,
          status: 'clocked_out',
          sessions: record.sessions,
        },
      });
    }

    // Calculate current worked duration
    const now = new Date();
    const sessionDuration = Math.round(
      (now.getTime() - activeSession.checkIn.getTime()) / (1000 * 60)
    );
    const currentWorkedMinutes = Math.max(
      0,
      sessionDuration - activeSession.totalBreakMinutes
    );

    // Find current break if on break
    let currentBreak = null;
    if (activeSession.status === 'on_break') {
      const activeBreakObj = activeSession.breaks.find((b) => !b.endTime);
      if (activeBreakObj) {
        const breakDuration = Math.round(
          (now.getTime() - activeBreakObj.startTime.getTime()) / (1000 * 60)
        );
        currentBreak = {
          breakId: activeBreakObj.breakId,
          startTime: activeBreakObj.startTime,
          durationMinutes: breakDuration,
        };
      }
    }

    const liveStatus = {
      employeeId: record.employeeId._id,
      fullName: `${record.employeeId.firstName} ${record.employeeId.lastName}`,
      email: record.employeeId.email,
      department: record.employeeId.department,
      position: record.employeeId.position,
      currentSession: {
        sessionId: activeSession.sessionId,
        checkInTime: activeSession.checkIn,
        workLocation: activeSession.workLocation,
        locationDetails: activeSession.locationDetails,
        status: activeSession.status,
        currentBreak,
        totalWorkedMinutes: currentWorkedMinutes,
        totalBreakMinutes: activeSession.totalBreakMinutes,
        breaks: activeSession.breaks,
      },
      allSessions: record.sessions,
    };

    // Audit log
    await AuditLog.logAction({
      action: 'VIEW',
      severity: 'info',
      entityType: 'Employee Live Status',
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
      userAgent: req.get('User-Agent'),
    });

    return res.json({
      success: true,
      data: liveStatus,
    });
  } catch (error) {
    console.error('Error fetching employee live status:', error);
    return res.status(500).json({
      success: false,
      message: 'Error fetching employee live status',
      error: error.message,
    });
  }
};

export default {
  getLiveAttendance,
  getEmployeeLiveStatus,
};
