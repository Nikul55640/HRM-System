import express from 'express';
import { triggerFinalization, getFinalizationStatus, getEmployeeFinalizationStatus } from '../../controllers/admin/attendanceFinalization.controller.js';
import { authenticate } from '../../middleware/auth.middleware.js';
import { requireRoles } from '../../middleware/requireRoles.js';
import { ROLES } from '../../config/roles.js';

const router = express.Router();

// All routes require authentication and admin/hr role
router.use(authenticate);
router.use(requireRoles([ROLES.SUPER_ADMIN, ROLES.HR_ADMIN, ROLES.HR_MANAGER]));

/**
 * @route   POST /api/admin/attendance-finalization/trigger
 * @desc    Manually trigger attendance finalization for a specific date
 * @access  Admin, HR
 * @body    { date?: "YYYY-MM-DD" } - Optional date, defaults to today
 */
router.post('/trigger', triggerFinalization);

/**
 * @route   GET /api/admin/attendance-finalization/status
 * @desc    Check finalization status for a date
 * @access  Admin, HR
 * @query   date - Optional date in YYYY-MM-DD format
 */
router.get('/status', getFinalizationStatus);

/**
 * @route   GET /api/admin/attendance-finalization/employee-status
 * @desc    Get finalization status for a specific employee
 * @access  Admin, HR
 * @query   employeeId - Employee ID (required)
 * @query   date - Date in YYYY-MM-DD format (required)
 */
router.get('/employee-status', getEmployeeFinalizationStatus);

export default router;
