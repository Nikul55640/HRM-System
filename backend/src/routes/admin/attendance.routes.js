/**
 * Admin Attendance Routes
 * Routes for admin/HR attendance management
 */

import express from 'express';
import { authenticate } from '../../middleware/authenticate.js';
import { checkPermission, checkAnyPermission } from '../../middleware/checkPermission.js';
import { MODULES } from '../../config/rolePermissions.js';
import liveAttendanceController from '../../controllers/admin/liveAttendance.controller.js';
import attendanceController from '../../controllers/employee/attendance.controller.js';
import {
  preventHistoricalModification,
  checkConsistencyBeforeSave,
  validateTimestamps,
} from '../../middleware/attendanceValidation.js';

const router = express.Router();

/* ============================================================
   ADMIN/HR ATTENDANCE ROUTES
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

// Get all employees attendance (admin view)
router.get(
  '/all',
  authenticate,
  checkPermission(MODULES.ATTENDANCE.VIEW_ALL),
  attendanceController.getAllAttendanceRecords
);

// Export attendance reports
router.get(
  '/export',
  authenticate,
  checkAnyPermission([
    MODULES.ATTENDANCE.VIEW_ALL,
    MODULES.ATTENDANCE.VIEW_TEAM,
  ]),
  attendanceController.exportAttendanceReport
);

export default router;