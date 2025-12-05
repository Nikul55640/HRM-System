/**
 * Attendance Validation Middleware
 * Validates attendance data for integrity and consistency
 */

import AttendanceRecord from '../models/AttendanceRecord.js';

/**
 * Validate session start request
 */
export const validateSessionStart = (req, res, next) => {
  const { workLocation, locationDetails } = req.body;

  // Required fields
  if (!workLocation) {
    return res.status(400).json({
      success: false,
      message: 'Required field missing: workLocation',
      error: {
        code: 'VALIDATION_ERROR',
        field: 'workLocation',
      },
    });
  }

  // Valid work location
  const validLocations = ['office', 'wfh', 'client_site'];
  if (!validLocations.includes(workLocation)) {
    return res.status(400).json({
      success: false,
      message: `Invalid work location. Must be one of: ${validLocations.join(', ')}`,
      error: {
        code: 'INVALID_WORK_LOCATION',
        validValues: validLocations,
      },
    });
  }

  // Location details required for client site
  if (workLocation === 'client_site' && !locationDetails) {
    return res.status(400).json({
      success: false,
      message: 'Location details required for client site',
      error: {
        code: 'MISSING_LOCATION_DETAILS',
        field: 'locationDetails',
      },
    });
  }

  next();
};

/**
 * Prevent modification of past attendance records by employees
 */
export const preventHistoricalModification = async (req, res, next) => {
  try {
    const { recordId } = req.params;
    const { role } = req.user;

    // Only apply to employees (not HR/Admin)
    if (role === 'hr' || role === 'admin') {
      return next();
    }

    const record = await AttendanceRecord.findById(recordId);

    if (!record) {
      return res.status(404).json({
        success: false,
        message: 'Attendance record not found',
      });
    }

    // Check if record is from a past date
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const recordDate = new Date(record.date);
    recordDate.setHours(0, 0, 0, 0);

    if (recordDate < today) {
      return res.status(403).json({
        success: false,
        message: 'Cannot modify past attendance records',
        error: {
          code: 'HISTORICAL_RECORD_MODIFICATION',
          recordDate: record.date,
        },
      });
    }

    next();
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Error validating record modification',
      error: error.message,
    });
  }
};

/**
 * Detect and flag data inconsistencies
 */
export const detectInconsistencies = async (record) => {
  const inconsistencies = [];

  // Check each session for inconsistencies
  if (record.sessions && record.sessions.length > 0) {
    record.sessions.forEach((session, index) => {
      // Check 1: Clock-out before clock-in
      if (session.checkOut && session.checkIn) {
        if (new Date(session.checkOut) < new Date(session.checkIn)) {
          inconsistencies.push({
            type: 'INVALID_TIMESTAMP_ORDER',
            message: `Session ${index + 1}: Clock-out time is before clock-in time`,
            sessionId: session.sessionId,
          });
        }
      }

      // Check 2: Negative worked minutes
      if (session.workedMinutes < 0) {
        inconsistencies.push({
          type: 'NEGATIVE_DURATION',
          message: `Session ${index + 1}: Negative worked minutes`,
          sessionId: session.sessionId,
        });
      }

      // Check 3: Break inconsistencies
      if (session.breaks && session.breaks.length > 0) {
        session.breaks.forEach((breakItem, bIndex) => {
          // Break end before start
          if (breakItem.endTime && breakItem.startTime) {
            if (new Date(breakItem.endTime) < new Date(breakItem.startTime)) {
              inconsistencies.push({
                type: 'INVALID_BREAK_TIMESTAMP',
                message: `Session ${index + 1}, Break ${bIndex + 1}: End time before start time`,
                sessionId: session.sessionId,
                breakId: breakItem.breakId,
              });
            }
          }

          // Negative break duration
          if (breakItem.durationMinutes < 0) {
            inconsistencies.push({
              type: 'NEGATIVE_BREAK_DURATION',
              message: `Session ${index + 1}, Break ${bIndex + 1}: Negative duration`,
              sessionId: session.sessionId,
              breakId: breakItem.breakId,
            });
          }

          // Break outside session time
          if (session.checkIn && breakItem.startTime) {
            if (new Date(breakItem.startTime) < new Date(session.checkIn)) {
              inconsistencies.push({
                type: 'BREAK_BEFORE_SESSION',
                message: `Session ${index + 1}, Break ${bIndex + 1}: Break starts before session`,
                sessionId: session.sessionId,
                breakId: breakItem.breakId,
              });
            }
          }

          if (session.checkOut && breakItem.endTime) {
            if (new Date(breakItem.endTime) > new Date(session.checkOut)) {
              inconsistencies.push({
                type: 'BREAK_AFTER_SESSION',
                message: `Session ${index + 1}, Break ${bIndex + 1}: Break ends after session`,
                sessionId: session.sessionId,
                breakId: breakItem.breakId,
              });
            }
          }
        });
      }

      // Check 4: Total break time exceeds session time
      if (session.checkOut && session.checkIn) {
        const sessionDuration =
          (new Date(session.checkOut) - new Date(session.checkIn)) / (1000 * 60);
        if (session.totalBreakMinutes > sessionDuration) {
          inconsistencies.push({
            type: 'BREAK_EXCEEDS_SESSION',
            message: `Session ${index + 1}: Total break time exceeds session duration`,
            sessionId: session.sessionId,
          });
        }
      }
    });
  }

  // Check 5: Session overlap
  if (record.sessions && record.sessions.length > 1) {
    for (let i = 0; i < record.sessions.length - 1; i++) {
      const currentSession = record.sessions[i];
      const nextSession = record.sessions[i + 1];

      if (currentSession.checkOut && nextSession.checkIn) {
        if (new Date(nextSession.checkIn) < new Date(currentSession.checkOut)) {
          inconsistencies.push({
            type: 'SESSION_OVERLAP',
            message: `Session ${i + 2} starts before Session ${i + 1} ends`,
            sessionIds: [currentSession.sessionId, nextSession.sessionId],
          });
        }
      }
    }
  }

  return inconsistencies;
};

/**
 * Middleware to check for inconsistencies before saving
 */
export const checkConsistencyBeforeSave = async (req, res, next) => {
  try {
    const { recordId } = req.params;
    const record = await AttendanceRecord.findById(recordId);

    if (!record) {
      return res.status(404).json({
        success: false,
        message: 'Attendance record not found',
      });
    }

    // Apply updates from request body
    Object.assign(record, req.body);

    // Detect inconsistencies
    const inconsistencies = await detectInconsistencies(record);

    if (inconsistencies.length > 0) {
      // Flag record for review
      record.approvalStatus = 'pending';
      record.statusReason = `Flagged for review: ${inconsistencies.length} inconsistencies detected`;

      // Store inconsistencies in remarks
      if (!record.remarksHistory) {
        record.remarksHistory = [];
      }
      record.remarksHistory.push({
        note: `System detected inconsistencies: ${JSON.stringify(inconsistencies)}`,
        addedBy: req.user.id || req.user._id,
        addedAt: new Date(),
      });

      // Attach inconsistencies to request for logging
      req.inconsistencies = inconsistencies;
    }

    next();
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Error checking data consistency',
      error: error.message,
    });
  }
};

/**
 * Validate timestamps are not in the future
 */
export const validateTimestamps = (req, res, next) => {
  const { checkIn, checkOut } = req.body;
  const now = new Date();

  if (checkIn && new Date(checkIn) > now) {
    return res.status(400).json({
      success: false,
      message: 'Check-in time cannot be in the future',
      error: {
        code: 'FUTURE_TIMESTAMP',
        field: 'checkIn',
      },
    });
  }

  if (checkOut && new Date(checkOut) > now) {
    return res.status(400).json({
      success: false,
      message: 'Check-out time cannot be in the future',
      error: {
        code: 'FUTURE_TIMESTAMP',
        field: 'checkOut',
      },
    });
  }

  next();
};

export default {
  validateSessionStart,
  preventHistoricalModification,
  detectInconsistencies,
  checkConsistencyBeforeSave,
  validateTimestamps,
};
