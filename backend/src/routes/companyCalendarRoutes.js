import express from 'express';
import { authenticate, authorize } from '../middleware/authenticate.js';
import calendarController from '../controllers/companyCalendarController.js';

const router = express.Router();

// All routes require authentication
router.use(authenticate);

// Get events (all users)
router.get('/events', calendarController.getEvents);

// Get upcoming events (all users)
router.get('/upcoming', calendarController.getUpcomingEvents);

// Create event (HR/Admin only)
router.post('/events', authorize(['HR Administrator', 'HR Manager', 'SuperAdmin']), calendarController.createEvent);

// Update event (HR/Admin only)
router.put('/events/:id', authorize(['HR Administrator', 'HR Manager', 'SuperAdmin']), calendarController.updateEvent);

// Delete event (HR/Admin only)
router.delete('/events/:id', authorize(['HR Administrator', 'HR Manager', 'SuperAdmin']), calendarController.deleteEvent);

// Sync employee events (HR/Admin only)
router.post('/sync', authorize(['HR Administrator', 'SuperAdmin']), calendarController.syncEmployeeEvents);

export default router;
