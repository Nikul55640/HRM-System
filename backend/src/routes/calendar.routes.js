import express from 'express';
import companyCalendarController from '../controllers/companyCalendar.controller.js';
import aut

const router = express.Router();

// =========================================================
// PUBLIC CALENDAR ROUTES (All authenticated users)
// =========================================================

// Get calendar events (holidays, company events, leaves, etc.)
router.get('/events', authenticateToken, companyCalendarController.getEvents);

// Get upcoming events
router.get('/upcoming', authenticateToken, companyCalendarController.getUpcomingEvents);

// =========================================================
// ADMIN/HR ONLY ROUTES
// =========================================================

// Company Events Management
router.post('/events', 
  authenticateToken, 
  requireRole(['SuperAdmin', 'HR Administrator', 'HR Manager']), 
  companyCalendarController.createEvent
);

router.put('/events/:id', 
  authenticateToken, 
  requireRole(['SuperAdmin', 'HR Administrator', 'HR Manager']), 
  companyCalendarController.updateEvent
);

router.delete('/events/:id', 
  authenticateToken, 
  requireRole(['SuperAdmin', 'HR Administrator', 'HR Manager']), 
  companyCalendarController.deleteEvent
);

// Holiday Management
router.get('/holidays', authenticateToken, companyCalendarController.getHolidays);

router.post('/holidays', 
  authenticateToken, 
  requireRole(['SuperAdmin', 'HR Administrator', 'HR Manager']), 
  companyCalendarController.createHoliday
);

router.put('/holidays/:id', 
  authenticateToken, 
  requireRole(['SuperAdmin', 'HR Administrator', 'HR Manager']), 
  companyCalendarController.updateHoliday
);

router.delete('/holidays/:id', 
  authenticateToken, 
  requireRole(['SuperAdmin', 'HR Administrator', 'HR Manager']), 
  companyCalendarController.deleteHoliday
);

// Employee Events Sync (Birthdays & Anniversaries)
router.post('/sync-employee-events', 
  authenticateToken, 
  requireRole(['SuperAdmin', 'HR Administrator']), 
  companyCalendarController.syncEmployeeEvents
);

export default router;