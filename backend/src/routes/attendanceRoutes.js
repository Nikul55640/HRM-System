/**
 * Attendance Routes
 * Routes for enhanced attendance system with sessions and breaks
 */

import express from 'express';
import { authenticate } from '../middleware/authenticate.js';
import { checkPermission, checkAnyPermission } from '../middleware/checkPermission.js';
import { MODULES } from '../config/rolePermissions.js';
import attendanceController from '../controllers/employee/attendanceController.js';
import sessionController from '../controllers/employee/sessionController.js';
import breakController from '../controllers/employee/breakController.js';
import liveAttendanceController from '../controllers/admin/liveAttendanceController.js';
import {
  validateSessionStart,
  preventHistoricalModification,
  checkConsistencyBeforeSave,
  validateTimestamps,
} from '../middleware/attendanceValidation.js';

const router = express.Router();

/* ============================================================
   EMPLOYEE ATTENDANCE ROUTES
   ============================================================ */

// Legacy attendance endpoints (backward compatibility)
router.get(
  '/',
  authenticate,
  checkPermission(MODULES.ATTENDANCE.VIEW_OWN),
  attendanceController.getAttendanceRecords
);

router.get(
  '/summary',
  authenticate,
  checkPermission(MODULES.ATTENDANCE.VIEW_OWN),
  attendanceController.getMonthlySummary
);

router.get(
  '/export',
  authenticate,
  checkPermission(MODULES.ATTENDANCE.VIEW_OWN),
  attendanceController.exportAttendanceReport
);

router.post(
  '/check-in',
  authenticate,
  checkPermission(MODULES.ATTENDANCE.CLOCK_IN_OUT),
  attendanceController.checkIn
);

router.post(
  '/check-out',
  authenticate,
  checkPermission(MODULES.ATTENDANCE.CLOCK_IN_OUT),
  attendanceController.checkOut
);

/* ============================================================
   ENHANCED SESSION MANAGEMENT ROUTES
   ============================================================ */

// Start a new work session (clock-in with location)
router.post(
  '/session/start',
  authenticate,
  checkPermission(MODULES.ATTENDANCE.CLOCK_IN_OUT),
  validateSessionStart,
  sessionController.startSession
);

// End current work session (clock-out)
router.post(
  '/session/end',
  authenticate,
  checkPermission(MODULES.ATTENDANCE.CLOCK_IN_OUT),
  sessionController.endSession
);

// Get all sessions for date range
router.get(
  '/sessions',
  authenticate,
  checkPermission(MODULES.ATTENDANCE.VIEW_OWN),
  sessionController.getSessions
);

/* ============================================================
   BREAK MANAGEMENT ROUTES
   ============================================================ */

// Start a break
router.post(
  '/break/start',
  authenticate,
  checkPermission(MODULES.ATTENDANCE.CLOCK_IN_OUT),
  breakController.startBreak
);

// End a break
router.post(
  '/break/end',
  authenticate,
  checkPermission(MODULES.ATTENDANCE.CLOCK_IN_OUT),
  breakController.endBreak
);

/* ============================================================
   ADMIN/HR ROUTES
   ============================================================ */

// Get live attendance (currently active sessions)
router.get(
  '/live',
  authenticate,
  checkAnyPermission([
    MODULES.ATTENDANCE.VIEW_ALL,
    MODULES.ATTENDANCE.VIEW_TEAM,
  ]),
  liveAttendanceController.getLiveAttendance
);

// Get live status for specific employee
router.get(
  '/live/:employeeId',
  authenticate,
  checkAnyPermission([
    MODULES.ATTENDANCE.VIEW_ALL,
    MODULES.ATTENDANCE.VIEW_TEAM,
  ]),
  liveAttendanceController.getEmployeeLiveStatus
);

// Manual update attendance (HR/Admin only)
router.put(
  '/:recordId',
  authenticate,
  checkPermission(MODULES.ATTENDANCE.EDIT_ANY),
  preventHistoricalModification,
  validateTimestamps,
  checkConsistencyBeforeSave,
  attendanceController.manualUpdateAttendance
);

export default router;
