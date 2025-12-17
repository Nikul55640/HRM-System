import express from 'express';
import { authenticate } from '../middleware/authenticate.js';
import { checkPermission } from '../middleware/checkPermission.js';
import { MODULES } from '../config/rolePermissions.js';
import calendarController from '../controllers/companyCalendar.controller.js';

const router = express.Router();

// All routes require authentication
router.use(authenticate);

// Get events (all users)
// Permission: VIEW_CALENDAR
router.get('/events',
  checkPermission(MODULES.LEAVE.VIEW_CALENDAR),
  calendarController.getEvents
);

// Get upcoming events (all users)
// Permission: VIEW_CALENDAR
router.get('/upcoming',
  checkPermission(MODULES.LEAVE.VIEW_CALENDAR),
  calendarController.getUpcomingEvents
);

// Create event (HR/Admin only)
// Permission: MANAGE_POLICIES (calendar events are part of leave policies)
router.post('/events',
  checkPermission(MODULES.LEAVE.MANAGE_POLICIES),
  calendarController.createEvent
);

// Update event (HR/Admin only)
// Permission: MANAGE_POLICIES
router.put('/events/:id',
  checkPermission(MODULES.LEAVE.MANAGE_POLICIES),
  calendarController.updateEvent
);

// Delete event (HR/Admin only)
// Permission: MANAGE_POLICIES
router.delete('/events/:id',
  checkPermission(MODULES.LEAVE.MANAGE_POLICIES),
  calendarController.deleteEvent
);

// Sync employee events (HR/Admin only)
// Permission: MANAGE_POLICIES
router.post('/sync',
  checkPermission(MODULES.LEAVE.MANAGE_POLICIES),
  calendarController.syncEmployeeEvents
);

export default router;
