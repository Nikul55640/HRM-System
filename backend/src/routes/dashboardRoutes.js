import express from 'express';
import dashboardController from '../controllers/dashboardController.js';
import { authenticate } from '../middleware/authenticate.js';

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
 */
router.get(
  '/profile',
  authenticate,
  dashboardController.getProfileSummary,
);

/**
 * @route   GET /api/dashboard/leave
 * @desc    Get leave balance (placeholder for Leave module)
 * @access  All authenticated users
 * @requirements 6.2
 */
router.get(
  '/leave',
  authenticate,
  dashboardController.getLeaveBalance,
);

/**
 * @route   GET /api/dashboard/attendance
 * @desc    Get attendance records (placeholder for Attendance module)
 * @access  All authenticated users
 * @requirements 6.2
 */
router.get(
  '/attendance',
  authenticate,
  dashboardController.getAttendanceRecords,
);

/**
 * @route   GET /api/dashboard/activity
 * @desc    Get recent activity feed from audit logs
 * @access  All authenticated users
 * @requirements 6.2
 */
router.get(
  '/activity',
  authenticate,
  dashboardController.getRecentActivity,
);

export default router;
