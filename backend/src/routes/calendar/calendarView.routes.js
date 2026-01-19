import express from 'express';
import { authenticate } from '../../middleware/authenticate.js';
import { checkPermission } from '../../middleware/checkPermission.js';
import { MODULES } from '../../config/rolePermissions.js';
import calendarViewController from '../../controllers/calendar/calendarView.controller.js';

const router = express.Router();

// All routes require authentication
router.use(authenticate);

/**
 * GET /api/calendar/view/monthly
 * Get comprehensive monthly calendar data
 * Includes events, leaves, holidays, birthdays, anniversaries, attendance
 */
router.get('/monthly',
  checkPermission(MODULES.LEAVE.VIEW_CALENDAR),
  calendarViewController.getMonthlyCalendarData
);

/**
 * GET /api/calendar/view/daily
 * Get detailed daily calendar data
 */
router.get('/daily',
  checkPermission(MODULES.LEAVE.VIEW_CALENDAR),
  calendarViewController.getDailyCalendarData
);

/**
 * GET /api/calendar/view/events
 * Get unified calendar events (events, holidays, leaves, birthdays, anniversaries)
 * Supports both date range (startDate/endDate) and month/year parameters
 */
router.get('/events',
  checkPermission(MODULES.LEAVE.VIEW_CALENDAR),
  calendarViewController.getEvents
);

/**
 * POST /api/calendar/view/apply-leave
 * Apply for leave directly from calendar
 */
router.post('/apply-leave',
  checkPermission(MODULES.LEAVE.APPLY_LEAVE),
  calendarViewController.applyLeaveFromCalendar
);

export default router;