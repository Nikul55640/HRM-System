import express from 'express';
import calendarViewController from '../controllers/calendar/calendarView.controller.js';
import { authenticate, authorize } from '../middleware/authenticate.js';

const router = express.Router();

// =========================================================
// PUBLIC CALENDAR ROUTES (All authenticated users)
// =========================================================

// Get calendar events (holidays, company events, leaves, etc.)
router.get('/events',authenticate, calendarViewController.getEvents);

// Get upcoming events
router.get('/upcoming', authenticate, calendarViewController.getUpcomingEvents);

// =========================================================
// ADMIN/HR ONLY ROUTES
// =========================================================

// Company Events Management
router.post('/events', 
  authenticate, 
  authorize(['SuperAdmin', 'HR Administrator', 'HR Manager']), 
  calendarViewController.createEvent
);

router.put('/events/:id', 
  authenticate, 
  authorize(['SuperAdmin', 'HR Administrator', 'HR Manager']), 
  calendarViewController.updateEvent
);

router.delete('/events/:id', 
  authenticate, 
  authorize(['SuperAdmin', 'HR Administrator', 'HR Manager']), 
  calendarViewController.deleteEvent
);

// Holiday Management
router.get('/holidays', authenticate, calendarViewController.getHolidays);

router.post('/holidays', 
  authenticate, 
  authorize(['SuperAdmin', 'HR Administrator', 'HR Manager']), 
  calendarViewController.createHoliday
);

router.put('/holidays/:id', 
  authenticate, 
  authorize(['SuperAdmin', 'HR Administrator', 'HR Manager']), 
  calendarViewController.updateHoliday
);

router.delete('/holidays/:id', 
  authenticate, 
  authorize(['SuperAdmin', 'HR Administrator', 'HR Manager']), 
  calendarViewController.deleteHoliday
);

// Employee Events Sync (Birthdays & Anniversaries)
router.post('/sync-employee-events', 
  authenticate, 
  authorize(['SuperAdmin', 'HR Adminiministrator']), 
  calendarViewController.syncEmployeeEvents
);

export default router;