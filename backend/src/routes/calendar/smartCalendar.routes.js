import express from 'express';
import { authenticate } from '../../middleware/authenticate.js';
import { checkPermission } from '../../middleware/checkPermission.js';
import { MODULES } from '../../config/rolePermissions.js';
import {
  getSmartMonthlyCalendar,
  getSmartDailyCalendar,
  validateLeaveApplication,
  getWorkingDaysCount
} from '../../controllers/calendar/smartCalendar.controller.js';

const router = express.Router();

// All routes require authentication
router.use(authenticate);

/**
 * GET /api/calendar/smart/monthly
 * Get smart monthly calendar with proper day status evaluation
 * Query params: year, month, employeeId, departmentId
 */
router.get('/monthly',
  checkPermission(MODULES.LEAVE.VIEW_CALENDAR),
  getSmartMonthlyCalendar
);

/**
 * GET /api/calendar/smart/daily
 * Get smart daily calendar with day status and attendance requirements
 * Query params: date (YYYY-MM-DD)
 */
router.get('/daily',
  checkPermission(MODULES.LEAVE.VIEW_CALENDAR),
  getSmartDailyCalendar
);

/**
 * POST /api/calendar/smart/validate-leave
 * Validate leave application against working rules and holidays
 * Body: { startDate, endDate, employeeId }
 */
router.post('/validate-leave',
  checkPermission(MODULES.LEAVE.APPLY_LEAVE),
  validateLeaveApplication
);

/**
 * GET /api/calendar/smart/working-days
 * Get working days count for a date range
 * Query params: startDate, endDate, employeeId
 */
router.get('/working-days',
  checkPermission(MODULES.LEAVE.VIEW_CALENDAR),
  getWorkingDaysCount
);

export default router;