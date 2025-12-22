import express from 'express';
import companyCalendarController from '../controllers/companyCalendar.controller.js';
import { authenticate, authorize } from '../middleware/authenticate.js';

const router = express.Router();

// =========================================================
// PUBLIC CALENDAR ROUTES (All authenticated users)
// =========================================================

// Get calendar events (holidays, company events, leaves, etc.)
router.get('/events',authenticate, companyCalendarController.getEvents);

// Get upcoming events
router.get('/upcoming', authenticate, companyCalendarController.getUpcomingEvents);

// =========================================================
// ADMIN/HR ONLY ROUTES
// =========================================================

// Company Events Management
router.post('/events', 
  authenticate, 
  authorize(['SuperAdmin', 'HR Administrator', 'HR Manager']), 
  companyCalendarController.createEvent
);

router.put('/events/:id', 
  authenticate, 
  authorize(['SuperAdmin', 'HR Administrator', 'HR Manager']), 
  companyCalendarController.updateEvent
);

router.delete('/events/:id', 
  authenticate, 
  authorize(['SuperAdmin', 'HR Administrator', 'HR Manager']), 
  companyCalendarController.deleteEvent
);

// Holiday Management
router.get('/holidays', authenticate, companyCalendarController.getHolidays);

router.post('/holidays', 
  authenticate, 
  authorize(['SuperAdmin', 'HR Administrator', 'HR Manager']), 
  companyCalendarController.createHoliday
);

router.put('/holidays/:id', 
  authenticate, 
  authorize(['SuperAdmin', 'HR Administrator', 'HR Manager']), 
  companyCalendarController.updateHoliday
);

router.delete('/holidays/:id', 
  authenticate, 
  authorize(['SuperAdmin', 'HR Administrator', 'HR Manager']), 
  companyCalendarController.deleteHoliday
);

// Employee Events Sync (Birthdays & Anniversaries)
router.post('/sync-employee-events', 
  authenticate, 
  authorize(['SuperAdmin', 'HR Adminiministrator']), 
  companyCalendarController.syncEmployeeEvents
);

export default router;