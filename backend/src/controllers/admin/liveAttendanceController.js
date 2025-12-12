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

    // If no live attendance found, add mock data for demonstration
    if (liveAttendance.length === 0) {
      const mockData = [
        {
          employeeId: 'mock-emp-1',
          fullName: 'John Smith',
          email: 'john.smith@company.com',
          department: 'Engineering',
          position: 'Senior Developer',
          currentSession: {
            sessionId: 'mock-session-1',
            checkInTime: new Date(Date.now() - 4 * 60 * 60 * 1000), // 4 hours ago
            workLocation: 'office',
            locationDetails: 'Main Office - Floor 3',
            status: 'active',
            currentBreak: null,
            totalWorkedMinutes: 240, // 4 hours
            totalBreakMinutes: 15,
            breakCount: 1,
          },
        },
        {
          employeeId: 'mock-emp-2',
          fullName: 'Sarah Johnson',
          email: 'sarah.johnson@company.com',
          department: 'HR',
          position: 'HR Manager',
          currentSession: {
            sessionId: 'mock-session-2',
            checkInTime: new Date(Date.now() - 3.5 * 60 * 60 * 1000), // 3.5 hours ago
            workLocation: 'wfh',
            locationDetails: 'Home Office',
            status: 'on_break',
            currentBreak: {
              breakId: 'mock-break-1',
              startTime: new Date(Date.now() - 10 * 60 * 1000), // 10 minutes ago
              durationMinutes: 10,
            },
            totalWorkedMinutes: 200, // 3.3 hours
            totalBreakMinutes: 25,
            breakCount: 2,
          },
        },
        {
          employeeId: 'mock-emp-3',
          fullName: 'Mike Davis',
          email: 'mike.davis@company.com',
          department: 'Sales',
          position: 'Sales Representative',
          currentSession: {
            sessionId: 'mock-session-3',
            checkInTime: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
            workLocation: 'client_site',
            locationDetails: 'Client Office - Downtown',
            status: 'active',
            currentBreak: null,
            totalWorkedMinutes: 120, // 2 hours
            totalBreakMinutes: 0,
            breakCount: 0,
          },
        },
        {
          employeeId: 'mock-emp-4',
          fullName: 'Emily Chen',
          email: 'emily.chen@company.com',
          department: 'Marketing',
          position: 'Marketing Specialist',
          currentSession: {
            sessionId: 'mock-session-4',
            checkInTime: new Date(Date.now() - 5 * 60 * 60 * 1000), // 5 hours ago
            workLocation: 'office',
            locationDetails: 'Main Office - Floor 2',
            status: 'active',
            currentBreak: null,
            totalWorkedMinutes: 285, // 4.75 hours
            totalBreakMinutes: 15,
            breakCount: 1,
          },
        },
        {
          employeeId: 'mock-emp-5',
          fullName: 'David Wilson',
          email: 'david.wilson@company.com',
          department: 'Finance',
          position: 'Financial Analyst',
          currentSession: {
            sessionId: 'mock-session-5',
            checkInTime: new Date(Date.now() - 6 * 60 * 60 * 1000), // 6 hours ago
            workLocation: 'wfh',
            locationDetails: 'Home Office',
            status: 'on_break',
            currentBreak: {
              breakId: 'mock-break-2',
              startTime: new Date(Date.now() - 5 * 60 * 1000), // 5 minutes ago
              durationMinutes: 5,
            },
            totalWorkedMinutes: 340, // 5.67 hours
            totalBreakMinutes: 20,
            breakCount: 2,
          },
        },
      ];

      // Apply filters to mock data
      liveAttendance = mockData.filter(emp => {
        if (department && department !== 'all' && emp.department !== department) return false;
        if (workLocation && workLocation !== 'all' && emp.currentSession.workLocation !== workLocation) return false;
        return true;
      });
    }

    // Sort by check-in time (most recent first)
    liveAttendance.sort(
      (a, b) =>
        new Date(b.currentSession.checkInTime).getTime() -
        new Date(a.currentSession.checkInTime).getTime()
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
        usingMockData: records.length === 0,
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
      meta: {
        usingMockData: records.length === 0,
        message: records.length === 0 ? 'Showing demo data - no active sessions found' : null,
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
