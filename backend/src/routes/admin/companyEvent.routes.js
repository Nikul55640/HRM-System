import express from 'express';
import { authenticate, authorize } from '../../middleware/authenticate.js';
import {
    getAllEvents,
    getEventById,
    createEvent,
    updateEvent,
    deleteEvent,
    getUpcomingEvents
} from '../../controllers/admin/companyEvent.controller.js';

const router = express.Router();

// Apply authentication middleware to all routes
router.use(authenticate);

// Get all company events (SuperAdmin, HR)
router.get('/', authorize(["SuperAdmin", "HR", "HR"]), getAllEvents);

// Get upcoming events (SuperAdmin, HR)
router.get('/upcoming', authorize(["SuperAdmin", "HR", "HR"]), getUpcomingEvents);

// Get event by ID (SuperAdmin, HR)
router.get('/:id', authorize(["SuperAdmin", "HR", "HR"]), getEventById);

// Create new event (SuperAdmin, HR)
router.post('/', authorize(["SuperAdmin", "HR", "HR"]), createEvent);

// Update event (SuperAdmin, HR)
router.put('/:id', authorize(["SuperAdmin", "HR", "HR"]), updateEvent);

// Delete event (SuperAdmin only)
router.delete('/:id', authorize(["SuperAdmin"]), deleteEvent);

export default router;