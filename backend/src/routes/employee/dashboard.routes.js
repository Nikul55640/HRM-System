import express from 'express';
import dashboardController from '../../controllers/employee/dashboard.controller.js';
import { authenticate } from '../../middleware/authenticate.js';
import { checkAnyPermission } from '../../middleware/checkPermission.js';
import { MODULES } from '../../config/rolePermissions.js';

const router = express.Router();

/**
 * Dashboard Routes
 * All routes require authentication and are for employee self-service
 */

/**
 * @route   GET /api/dashboard
 * @desc    Get complete dashboard data (profile, leave, attendance, activity)
 * @access  All authenticated users
 * @requirements 6.1, 6.2
 * @permission Any authenticated user (role-based filtering in controller)
 */
router.get(
  '/',
  authenticate,
  dashboardController.getDashboard,
);

/**
 * @route   GET /api/dashboard/profile
 * @desc    Get employee profile summary
 * @access  All authenticated users
 * @requirements 6.1
 * @permission EMPLOYEE.VIEW_OWN
 */
router.get(
  '/profile',
  authenticate,
  checkAnyPermission([
    MODULES.EMPLOYEE.VIEW_OWN,
    MODULES.EMPLOYEE.VIEW_ALL,
  ]),
  dashboardController.getProfileSummary,
);

/**
 * @route   GET /api/dashboard/leave
 * @desc    Get leave balance
 * @access  All authenticated users
 * @requirements 6.2
 * @permission LEAVE.VIEW_OWN
 */
router.get(
  '/leave',
  authenticate,
  checkAnyPermission([
    MODULES.LEAVE.VIEW_OWN,
    MODULES.LEAVE.VIEW_ALL,
  ]),
  dashboardController.getLeaveBalance,
);

/**
 * @route   GET /api/dashboard/attendance
 * @desc    Get attendance records
 * @access  All authenticated users
 * @requirements 6.2
 * @permission ATTENDANCE.VIEW_OWN
 */
router.get(
  '/attendance',
  authenticate,
  checkAnyPermission([
    MODULES.ATTENDANCE.VIEW_OWN,
    MODULES.ATTENDANCE.VIEW_ALL,
  ]),
  dashboardController.getAttendanceRecords,
);

/**
 * @route   GET /api/dashboard/activity
 * @desc    Get recent activity feed from audit logs
 * @access  All authenticated users
 * @requirements 6.2
 * @permission Any authenticated user
 */
router.get(
  '/activity',
  authenticate,
  dashboardController.getRecentActivity,
);

export default router;
