import express from 'express';
import calendarViewController from '../controllers/calendar/calendarView.controller.js';
import { authenticate, authorize } from '../middleware/authenticate.js';
import calendarViewRoutes from './calendar/calendarView.routes.js';

const router = express.Router();

// =========================================================
// CALENDAR VIEW ROUTES (Monthly, Daily, etc.)
// =========================================================
router.use('/view', calendarViewRoutes);

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
  authorize(["SuperAdmin", "HR", "HR"]), 
  calendarViewController.createEvent
);

router.put('/events/:id', 
  authenticate, 
  authorize(["SuperAdmin", "HR", "HR"]), 
  calendarViewController.updateEvent
);

router.delete('/events/:id', 
  authenticate, 
  authorize(["SuperAdmin", "HR", "HR"]), 
  calendarViewController.deleteEvent
);

// Holiday Management
router.get('/holidays', authenticate, calendarViewController.getHolidays);

router.post('/holidays', 
  authenticate, 
  authorize(["SuperAdmin", "HR", "HR"]), 
  calendarViewController.createHoliday
);

router.put('/holidays/:id', 
  authenticate, 
  authorize(["SuperAdmin", "HR", "HR"]), 
  calendarViewController.updateHoliday
);

router.delete('/holidays/:id', 
  authenticate, 
  authorize(["SuperAdmin", "HR", "HR"]), 
  calendarViewController.deleteHoliday
);

// Employee Events Sync (Birthdays & Anniversaries)
router.post('/sync-employee-events', 
  authenticate, 
  authorize(["SuperAdmin", 'HR Adminiministrator']), 
  calendarViewController.syncEmployeeEvents
);

export default router;