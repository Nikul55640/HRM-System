/**
 * Break Controller
 * Handles break tracking within work sessions
 */

import { v4 as uuidv4 } from 'uuid';
import AttendanceRecord from '../../models/sequelize/AttendanceRecord.js';
import AuditLog from '../../models/sequelize/AuditLog.js';

// Helper: get user ID
const getUserId = (user) => user.id || user._id;

/**
 * Start a break
 */
export const startBreak = async (req, res) => {
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

    const record = await AttendanceRecord.findOne({ 
      where: { employeeId, date: dateOnly } 
    });

    if (!record) {
      return res.status(400).json({
        success: false,
        message: 'No active session found. Please clock in first.',
      });
    }

    // Check if employee can start break
    if (!record.canStartBreak()) {
      const activeSession = record.getActiveSession();
      if (!activeSession) {
        return res.status(400).json({
          success: false,
          message: 'No active session found. Please clock in first.',
        });
      }
      if (activeSession.status === 'on_break') {
        return res.status(400).json({
          success: false,
          message: 'Already on break',
        });
      }
      return res.status(400).json({
        success: false,
        message: 'Cannot start break at this time',
      });
    }

    // Get active session
    const activeSession = record.getActiveSession();

    // Create new break
    const newBreak = {
      breakId: uuidv4(),
      startTime: now,
      endTime: null,
      durationMinutes: 0,
    };

    activeSession.breaks.push(newBreak);
    activeSession.status = 'on_break';

    // Mark sessions field as changed for Sequelize
    record.changed('sessions', true);
    record.updatedBy = userId;
    await record.save();

    // Audit log
    await AuditLog.logAction({
      action: 'CREATE',
      severity: 'info',
      entityType: 'Attendance',
      entityId: newBreak.breakId,
      entityDisplayName: `${fullName} - Break Start`,
      userId,
      userRole: role,
      performedByName: fullName,
      performedByEmail: email,
      meta: {
        type: 'BREAK_START',
        sessionId: activeSession.sessionId,
        breakId: newBreak.breakId,
        startTime: now,
        date: dateOnly,
      },
      ipAddress: req.ip,
      userAgent: req.get('User-Agent'),
    });

    return res.json({
      success: true,
      message: 'Break started successfully',
      data: {
        break: newBreak,
        session: activeSession,
      },
    });
  } catch (error) {
    console.error('Error starting break:', error);
    return res.status(500).json({
      success: false,
      message: 'Error starting break',
      error: error.message,
    });
  }
};

/**
 * End a break
 */
export const endBreak = async (req, res) => {
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

    const record = await AttendanceRecord.findOne({ 
      where: { employeeId, date: dateOnly } 
    });

    if (!record) {
      return res.status(400).json({
        success: false,
        message: 'No active session found',
      });
    }

    // Check if employee can end break
    if (!record.canEndBreak()) {
      return res.status(400).json({
        success: false,
        message: 'No active break to end',
      });
    }

    // Get active session
    const activeSession = record.getActiveSession();

    // Find the active break (last break without endTime)
    const activeBreak = activeSession.breaks.find((b) => !b.endTime);

    if (!activeBreak) {
      return res.status(400).json({
        success: false,
        message: 'No active break found',
      });
    }

    // Update break
    activeBreak.endTime = now;
    
    // Convert startTime to Date object if it's a string (from JSON storage)
    const startTime = activeBreak.startTime instanceof Date 
      ? activeBreak.startTime 
      : new Date(activeBreak.startTime);
    
    const diffMs = now.getTime() - startTime.getTime();
    activeBreak.durationMinutes = Math.round(diffMs / (1000 * 60));

    // Update session status and total break time
    activeSession.status = 'active';
    activeSession.totalBreakMinutes = activeSession.breaks.reduce(
      (total, b) => total + (b.durationMinutes || 0),
      0
    );

    // Mark sessions field as changed for Sequelize
    record.changed('sessions', true);
    record.updatedBy = userId;
    await record.save();

    // Audit log
    await AuditLog.logAction({
      action: 'UPDATE',
      severity: 'info',
      entityType: 'Attendance',
      entityId: activeBreak.breakId,
      entityDisplayName: `${fullName} - Break End`,
      userId,
      userRole: role,
      performedByName: fullName,
      performedByEmail: email,
      meta: {
        type: 'BREAK_END',
        sessionId: activeSession.sessionId,
        breakId: activeBreak.breakId,
        endTime: now,
        durationMinutes: activeBreak.durationMinutes,
        date: dateOnly,
      },
      ipAddress: req.ip,
      userAgent: req.get('User-Agent'),
    });

    return res.json({
      success: true,
      message: 'Break ended successfully',
      data: {
        break: activeBreak,
        session: activeSession,
      },
    });
  } catch (error) {
    console.error('Error ending break:', error);
    return res.status(500).json({
      success: false,
      message: 'Error ending break',
      error: error.message,
    });
  }
};

export default {
  startBreak,
  endBreak,
};
