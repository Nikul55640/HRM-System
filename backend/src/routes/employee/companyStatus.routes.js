/**
 * Employee Company Status Routes
 * READ-ONLY, LIMITED company-wide status endpoints for employees
 * WITHOUT exposing sensitive HR/admin data
 */

import express from 'express';
import { authenticate } from '../../middleware/auth.middleware.js';
import { checkPermission } from '../../middleware/checkPermission.js';
import { MODULES } from '../../config/rolePermissions.js';
import companyStatusController from '../../controllers/employee/companyStatus.controller.js';

const router = express.Router();

/**
 * @route   GET /employee/company/leave-today
 * @desc    Get employees on leave today (company-wide, employee-safe)
 * @access  Employee (with VIEW_COMPANY_STATUS permission)
 * @returns {Array} List of employees on leave with basic info only
 */
router.get(
  '/leave-today',
  authenticate,
  checkPermission(MODULES.ATTENDANCE.VIEW_COMPANY_STATUS),
  companyStatusController.getTodayLeaveStatus
);

/**
 * @route   GET /employee/company/wfh-today
 * @desc    Get employees working from home today (company-wide, employee-safe)
 * @access  Employee (with VIEW_COMPANY_STATUS permission)
 * @returns {Array} List of employees working from home with basic info only
 */
router.get(
  '/wfh-today',
  authenticate,
  checkPermission(MODULES.ATTENDANCE.VIEW_COMPANY_STATUS),
  companyStatusController.getTodayWFHStatus
);

/**
 * @route   GET /employee/company/status-today
 * @desc    Get general company status today (combined view)
 * @access  Employee (with VIEW_COMPANY_STATUS permission)
 * @returns {Array} List of all employees with high-level status
 */
router.get(
  '/status-today',
  authenticate,
  checkPermission(MODULES.ATTENDANCE.VIEW_COMPANY_STATUS),
  companyStatusController.getTodayCompanyStatus
);

/**
 * @route   GET /employee/company/debug-attendance
 * @desc    DEBUG: Get raw attendance data structure (temporary)
 * @access  Employee (with VIEW_COMPANY_STATUS permission)
 * @returns {Array} Raw attendance data for debugging
 */
router.get(
  '/debug-attendance',
  authenticate,
  checkPermission(MODULES.ATTENDANCE.VIEW_COMPANY_STATUS),
  companyStatusController.getDebugAttendanceData
);

export default router;