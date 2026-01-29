import express from 'express';
import { authenticate } from '../../middleware/authenticate.js';
import { checkPermission, checkAnyPermission } from '../../middleware/checkPermission.js';
import { MODULES } from '../../config/rolePermissions.js';
import attendanceController from '../../controllers/admin/attendanceManagement.controller.js';
import liveAttendanceController from '../../controllers/admin/liveAttendance.controller.js';
import {
  preventHistoricalModification,
  checkConsistencyBeforeSave,
  validateTimestamps,
} from '../../middleware/attendanceValidation.js';

const router = express.Router();

/* GET ATTENDANCE RECORDS WITH FILTERING Permission: HR & SuperAdmin */
router.get(
  '/',
  authenticate,
  checkAnyPermission([
    MODULES.ATTENDANCE.VIEW_ALL,
    MODULES.ATTENDANCE.VIEW_TEAM,
  ]),
  attendanceController.getAttendanceRecords
);

/*  GET LIVE ATTENDANCE (CURRENTLY ACTIVE SESSIONS) Permission: HR & SuperAdmin*/
router.get(
  '/live',
  authenticate,
  checkAnyPermission([
    MODULES.ATTENDANCE.VIEW_ALL,
    MODULES.ATTENDANCE.VIEW_TEAM,
  
  ]),
  liveAttendanceController.getLiveAttendance
);

/* -----------------------------------
   GET LIVE STATUS FOR SPECIFIC EMPLOYEE
   Permission: HR & SuperAdmin
----------------------------------- */
router.get(
  '/live/:employeeId',
  authenticate,
  checkAnyPermission([
    MODULES.ATTENDANCE.VIEW_ALL,
    MODULES.ATTENDANCE.VIEW_TEAM,
  ]),
  liveAttendanceController.getEmployeeLiveStatus
);

/* -----------------------------------
   GET ATTENDANCE ANALYTICS
   Permission: HR & SuperAdmin
----------------------------------- */
router.get(
  '/analytics',
  authenticate,
  checkAnyPermission([
    MODULES.ATTENDANCE.VIEW_ALL,
    MODULES.ATTENDANCE.VIEW_TEAM,
  ]),
  attendanceController.getAttendanceAnalytics
);

/* -----------------------------------
   GET PENDING CORRECTION REQUESTS
   Permission: HR & SuperAdmin
----------------------------------- */
router.get(
  '/corrections/pending',
  authenticate,
  checkAnyPermission([
    MODULES.ATTENDANCE.APPROVE_CORRECTIONS,
    MODULES.ATTENDANCE.VIEW_ALL,
  ]),
  attendanceController.getPendingCorrections
);

/* -----------------------------------
   GET LATE ARRIVALS REPORT
   Permission: HR & SuperAdmin
----------------------------------- */
router.get(
  '/reports/late-arrivals',
  authenticate,
  checkAnyPermission([
    MODULES.ATTENDANCE.VIEW_ALL,
    MODULES.ATTENDANCE.VIEW_TEAM,
  ]),
  attendanceController.getLateArrivalsReport
);

/* -----------------------------------
   GET EARLY DEPARTURES REPORT
   Permission: HR & SuperAdmin
----------------------------------- */
router.get(
  '/reports/early-departures',
  authenticate,
  checkAnyPermission([
    MODULES.ATTENDANCE.VIEW_ALL,
    MODULES.ATTENDANCE.VIEW_TEAM,
  ]),
  attendanceController.getEarlyDeparturesReport
);

/* -----------------------------------
   GET OVERTIME REPORT
   Permission: HR & SuperAdmin
----------------------------------- */
router.get(
  '/reports/overtime',
  authenticate,
  checkAnyPermission([
    MODULES.ATTENDANCE.VIEW_ALL,
    MODULES.ATTENDANCE.VIEW_TEAM,
  ]),
  attendanceController.getOvertimeReport
);

/* -----------------------------------
   GET BREAK VIOLATIONS REPORT
   Permission: HR & SuperAdmin
----------------------------------- */
router.get(
  '/reports/break-violations',
  authenticate,
  checkAnyPermission([
    MODULES.ATTENDANCE.VIEW_ALL,
    MODULES.ATTENDANCE.VIEW_TEAM,
  ]),
  attendanceController.getBreakViolationsReport
);

/* -----------------------------------
   GET MONTHLY ATTENDANCE SUMMARY
   Permission: HR, SuperAdmin, or own employee
----------------------------------- */
router.get(
  '/summary/:employeeId/:year/:month',
  authenticate,
  checkAnyPermission([
    MODULES.ATTENDANCE.VIEW_ALL,
    MODULES.ATTENDANCE.VIEW_TEAM,
    MODULES.ATTENDANCE.VIEW_OWN,
  ]),
  attendanceController.getMonthlyAttendanceSummary
);

/* -----------------------------------
   PROCESS ATTENDANCE CORRECTION
   Permission: HR & SuperAdmin
----------------------------------- */
router.patch(
  '/corrections/:id/process',
  authenticate,
  checkPermission(MODULES.ATTENDANCE.APPROVE_CORRECTIONS),
  attendanceController.processAttendanceCorrection
);

/* -----------------------------------
   BULK APPROVE CORRECTIONS
   Permission: HR & SuperAdmin
----------------------------------- */
router.patch(
  '/corrections/bulk-approve',
  authenticate,
  checkPermission(MODULES.ATTENDANCE.APPROVE_CORRECTIONS),
  attendanceController.bulkApproveCorrections
);

/* -----------------------------------
   EDIT ATTENDANCE RECORD (SUPERADMIN ONLY)
   Permission: SuperAdmin only
----------------------------------- */
router.put(
  '/:id/edit',
  authenticate,
  checkPermission(MODULES.ATTENDANCE.EDIT_ANY),
  preventHistoricalModification,
  validateTimestamps,
  checkConsistencyBeforeSave,
  attendanceController.editAttendanceRecord
);

/* -----------------------------------
   EXPORT ATTENDANCE DATA
   Permission: HR & SuperAdmin
----------------------------------- */
router.get(
  '/export',
  authenticate,
  checkAnyPermission([
    MODULES.ATTENDANCE.VIEW_ALL,
    MODULES.ATTENDANCE.VIEW_TEAM,
  ]),
  attendanceController.exportAttendanceData
);

/* -----------------------------------
   LEGACY ENDPOINTS (FOR BACKWARD COMPATIBILITY)
----------------------------------- */

// Manual update attendance (HR/Admin only)
router.put(
  '/:recordId',
  authenticate,
  checkPermission(MODULES.ATTENDANCE.EDIT_ANY),
  preventHistoricalModification,
  validateTimestamps,
  checkConsistencyBeforeSave,
  attendanceController.editAttendanceRecord
);

// Get all employees attendance (admin view)
router.get(
  '/all',
  authenticate,
  checkPermission(MODULES.ATTENDANCE.VIEW_ALL),
  attendanceController.getAttendanceRecords
);

// Export attendance reports
router.get(
  '/export-legacy',
  authenticate,
  checkAnyPermission([
    MODULES.ATTENDANCE.VIEW_ALL,
    MODULES.ATTENDANCE.VIEW_TEAM,
  ]),
  attendanceController.exportAttendanceData
);

/* PROCESS END-OF-DAY ATTENDANCE Permission: SuperAdmin only (for automated jobs) */
router.post(
  '/process-end-of-day',
  authenticate,
  checkPermission(MODULES.ATTENDANCE.EDIT_ANY),
  attendanceController.processEndOfDayAttendance
);

/* CHECK ABSENT EMPLOYEES   Permission: SuperAdmin only (for automated jobs) */
router.post(
  '/check-absent',
  authenticate,
  checkPermission(MODULES.ATTENDANCE.EDIT_ANY),
  attendanceController.checkAbsentEmployees
);




export default router;