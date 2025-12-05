/**
 * Session Controller
 * Handles multiple daily work sessions for attendance tracking
 */

import mongoose from 'mongoose';
import AttendanceRecord from '../../models/AttendanceRecord.js';
import AuditLog from '../../models/AuditLog.js';
import IPService from '../../services/IPService.js';
import NotificationService from '../../services/notificationService.js';

// Helper: get user ID
const getUserId = (user) => user.id || user._id;

// Helper: get device type
const getDeviceType = (userAgent = '') => {
  const ua = userAgent.toLowerCase();
  if (ua.includes('android') || ua.includes('iphone') || ua.includes('ipad')) {
    return 'mobile';
  }
  return 'web';
};

/**
 * Start a new work session (clock-in)
 */
export const startSession = async (req, res) => {
  try {
    console.log('🔵 [BACKEND] START SESSION - Request received');
    console.log('🔵 [BACKEND] User:', req.user);
    console.log('🔵 [BACKEND] Body:', req.body);
    
    const { employeeId, fullName, email, role } = req.user;
    const userId = getUserId(req.user);

    if (!employeeId) {
      console.log('❌ [BACKEND] No employeeId found');
      return res.status(400).json({
        success: false,
        message: 'Employee profile not linked.',
      });
    }

    const { workLocation, locationDetails } = req.body;
    console.log('🔵 [BACKEND] Work Location:', workLocation);
    console.log('🔵 [BACKEND] Location Details:', locationDetails);

    // Validate work location
    if (!workLocation || !['office', 'wfh', 'client_site'].includes(workLocation)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid work location. Must be one of: office, wfh, client_site',
      });
    }

    // Validate location details for client site
    if (workLocation === 'client_site' && !locationDetails) {
      return res.status(400).json({
        success: false,
        message: 'Location details required for client site',
      });
    }

    const now = new Date();
    const dateOnly = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    // Find or create attendance record for today
    let record = await AttendanceRecord.findOne({ employeeId, date: dateOnly });

    if (!record) {
      record = new AttendanceRecord({
        employeeId,
        date: dateOnly,
        sessions: [],
        createdBy: userId,
        source: 'self',
      });
    }

    // Check if employee can clock in (no active session)
    if (!record.canClockIn()) {
      const activeSession = record.getActiveSession();
      return res.status(400).json({
        success: false,
        message: 'Already clocked in. Current session started at ' + 
                 activeSession.checkIn.toISOString(),
        data: { activeSession },
      });
    }

    // Capture and encrypt IP
    const encryptedIP = IPService.captureAndEncryptIP(req);

    // Create new session
    const newSession = {
      sessionId: new mongoose.Types.ObjectId().toString(),
      checkIn: now,
      checkOut: null,
      workLocation,
      locationDetails: workLocation === 'client_site' ? locationDetails : null,
      ipAddressCheckIn: encryptedIP,
      ipAddressCheckOut: null,
      breaks: [],
      totalBreakMinutes: 0,
      workedMinutes: 0,
      status: 'active',
    };

    record.sessions.push(newSession);
    record.updatedBy = userId;
    record.source = 'self';

    await record.save();
    console.log('✅ [BACKEND] Session saved successfully');
    console.log('✅ [BACKEND] New session:', newSession);

    // Send notification to HR (non-blocking)
    NotificationService.notifyHRClockIn(
      { fullName, email, employeeId },
      { sessionId: newSession.sessionId, workLocation, checkInTime: now }
    ).catch((err) => console.error('Notification error:', err));

    // Audit log
    await AuditLog.logAction({
      action: 'CREATE',
      severity: 'info',
      entityType: 'Attendance',
      entityId: newSession.sessionId,
      entityDisplayName: `${fullName} - Session Start`,
      userId,
      userRole: role,
      performedByName: fullName,
      performedByEmail: email,
      meta: {
        type: 'SESSION_START',
        sessionId: newSession.sessionId,
        checkInTime: now,
        workLocation,
        date: dateOnly,
      },
      ipAddress: req.ip,
      userAgent: req.get('User-Agent'),
    });

    console.log('✅ [BACKEND] Sending success response');
    return res.json({
      success: true,
      message: 'Session started successfully',
      data: {
        session: newSession,
        record: record.toSummary(),
      },
    });
  } catch (error) {
    console.error('❌ [BACKEND] Error starting session:', error);
    console.error('❌ [BACKEND] Error stack:', error.stack);
    return res.status(500).json({
      success: false,
      message: 'Error starting session',
      error: error.message,
    });
  }
};

/**
 * End current work session (clock-out)
 */
export const endSession = async (req, res) => {
  try {
    const { employeeId, fullName, email, role } = req.user;
    const userId = getUserId(req.user);

    if (!employeeId) {
      return res.status(400).json({
        success: false,
        message: 'Employee profile not linked.',
      });
    }

    const now = new Date();
    const dateOnly = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    const record = await AttendanceRecord.findOne({ employeeId, date: dateOnly });

    if (!record) {
      return res.status(400).json({
        success: false,
        message: 'No active session found today',
      });
    }

    // Check if employee can clock out
    if (!record.canClockOut()) {
      const activeSession = record.getActiveSession();
      if (activeSession && activeSession.status === 'on_break') {
        return res.status(400).json({
          success: false,
          message: 'Cannot clock out while on break. Please end your break first.',
        });
      }
      return res.status(400).json({
        success: false,
        message: 'No active session to clock out',
      });
    }

    // Get active session
    const activeSession = record.getActiveSession();

    // Capture and encrypt IP
    const encryptedIP = IPService.captureAndEncryptIP(req);

    // Update session
    activeSession.checkOut = now;
    activeSession.ipAddressCheckOut = encryptedIP;
    activeSession.status = 'completed';

    // Calculate worked minutes
    const diffMs = now.getTime() - activeSession.checkIn.getTime();
    const totalMinutes = diffMs / (1000 * 60);
    activeSession.workedMinutes = Math.max(
      0,
      Math.round(totalMinutes - activeSession.totalBreakMinutes)
    );

    record.updatedBy = userId;
    await record.save();

    // Send notification to HR (non-blocking)
    NotificationService.notifyHRClockOut(
      { fullName, email, employeeId },
      { sessionId: activeSession.sessionId, workedMinutes: activeSession.workedMinutes }
    ).catch((err) => console.error('Notification error:', err));

    // Audit log
    await AuditLog.logAction({
      action: 'UPDATE',
      severity: 'info',
      entityType: 'Attendance',
      entityId: activeSession.sessionId,
      entityDisplayName: `${fullName} - Session End`,
      userId,
      userRole: role,
      performedByName: fullName,
      performedByEmail: email,
      meta: {
        type: 'SESSION_END',
        sessionId: activeSession.sessionId,
        checkOutTime: now,
        workedMinutes: activeSession.workedMinutes,
        date: dateOnly,
      },
      ipAddress: req.ip,
      userAgent: req.get('User-Agent'),
    });

    return res.json({
      success: true,
      message: 'Session ended successfully',
      data: {
        session: activeSession,
        record: record.toSummary(),
      },
    });
  } catch (error) {
    console.error('Error ending session:', error);
    return res.status(500).json({
      success: false,
      message: 'Error ending session',
      error: error.message,
    });
  }
};

/**
 * Get all sessions for a date range
 */
export const getSessions = async (req, res) => {
  try {
    const { employeeId, fullName, email, role } = req.user;
    const userId = getUserId(req.user);

    if (!employeeId) {
      return res.status(403).json({
        success: false,
        message: 'Employee profile not linked to your account.',
      });
    }

    const {
      startDate,
      endDate,
      workLocation,
      page = 1,
      limit = 31,
    } = req.query;

    const query = { employeeId };
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    // Date range filter
    if (startDate && endDate) {
      query.date = {
        $gte: new Date(startDate),
        $lte: new Date(endDate),
      };
    } else {
      // Default to current month
      const now = new Date();
      const start = new Date(now.getFullYear(), now.getMonth(), 1);
      const end = new Date(now.getFullYear(), now.getMonth() + 1, 0);
      query.date = { $gte: start, $lte: end };
    }

    // Work location filter
    if (workLocation) {
      query['sessions.workLocation'] = workLocation;
    }

    const [records, total] = await Promise.all([
      AttendanceRecord.find(query)
        .sort({ date: -1 })
        .skip(skip)
        .limit(limitNum)
        .lean(),
      AttendanceRecord.countDocuments(query),
    ]);

    // Audit log
    await AuditLog.logAction({
      action: 'VIEW',
      severity: 'info',
      entityType: 'Attendance',
      entityId: employeeId,
      entityDisplayName: fullName,
      userId,
      userRole: role,
      performedByName: fullName,
      performedByEmail: email,
      meta: {
        type: 'SESSION_HISTORY_VIEW',
        count: records.length,
        filters: { startDate, endDate, workLocation },
      },
      ipAddress: req.ip,
      userAgent: req.get('User-Agent'),
    });

    return res.json({
      success: true,
      data: records,
      pagination: {
        current: pageNum,
        total: Math.ceil(total / limitNum),
        count: records.length,
        totalRecords: total,
      },
    });
  } catch (error) {
    console.error('Error fetching sessions:', error);
    return res.status(500).json({
      success: false,
      message: 'Error fetching sessions',
      error: error.message,
    });
  }
};

export default {
  startSession,
  endSession,
  getSessions,
};
