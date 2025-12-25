/**
 * Admin Attendance Routes
 * Routes for admin/HR attendance management
 * Updated for restructured AttendanceRecord model
 */

import express from 'express';
import { authenticate } from '../../middleware/authenticate.js';
import { checkPermission, checkAnyPermission } from '../../middleware/checkPermission.js';
import { MODULES } from '../../config/rolePermissions.js';
import attendanceController from '../../controllers/admin/attendance.controller.js';
import liveAttendanceController from '../../controllers/admin/liveAttendance.controller.js';
import employeeAttendanceController from '../../controllers/employee/attendance.controller.js';
import { AttendanceRecord } from '../../models/sequelize/index.js';
import {
  preventHistoricalModification,
  checkConsistencyBeforeSave,
  validateTimestamps,
} from '../../middleware/attendanceValidation.js';

const router = express.Router();

/* ============================================================
   ADMIN/HR ATTENDANCE ROUTES — UPDATED FOR NEW MODEL
   ============================================================ */

/* -----------------------------------
   GET ATTENDANCE RECORDS WITH FILTERING
   Permission: HR & SuperAdmin
----------------------------------- */
router.get(
  '/',
  authenticate,
  checkAnyPermission([
    MODULES.ATTENDANCE.VIEW_ALL,
    MODULES.ATTENDANCE.VIEW_TEAM,
  ]),
  attendanceController.getAttendanceRecords
);

/* -----------------------------------
   GET LIVE ATTENDANCE (CURRENTLY ACTIVE SESSIONS)
   Permission: HR & SuperAdmin
----------------------------------- */
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

/* -----------------------------------
   DEBUG ENDPOINTS (DEVELOPMENT ONLY)
----------------------------------- */

// DEBUG: Simple test endpoint to check database
router.get(
  '/debug',
  authenticate,
  checkPermission(MODULES.ATTENDANCE.VIEW_ALL),
  async (req, res) => {
    try {
      console.log('🧪 [DEBUG ENDPOINT] Testing database connection...');

      const totalRecords = await AttendanceRecord.count();
      console.log('🧪 [DEBUG ENDPOINT] Total attendance records:', totalRecords);

      const recentRecords = await AttendanceRecord.findAll({
        limit: 5,
        order: [['createdAt', 'DESC']],
        include: [{
          model: AttendanceRecord.sequelize.models.Employee,
          as: 'employee',
          attributes: ['id', 'employeeId', 'firstName', 'lastName'],
        }],
      });

      console.log('🧪 [DEBUG ENDPOINT] Recent records:', recentRecords.length);

      const debugData = recentRecords.map(record => ({
        id: record.id,
        employeeId: record.employeeId,
        date: record.date,
        clockIn: record.clockIn,
        clockOut: record.clockOut,
        status: record.status,
        employeeName: record.employee ?
          `${record.employee.firstName || ''} ${record.employee.lastName || ''}`.trim() :
          'Unknown'
      }));

      res.json({
        success: true,
        totalRecords,
        recentRecords: debugData,
        message: 'Debug endpoint working'
      });

    } catch (error) {
      console.error('🧪 [DEBUG ENDPOINT] Error:', error);
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }
);

export default router;