import express from 'express';
import { authenticate, authorize } from '../../middleware/authenticate.js';
import { ROLES } from '../../config/roles.js';
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
router.get('/', authorize([ROLES.SUPER_ADMIN, ROLES.HR_ADMIN, ROLES.HR_MANAGER]), getAllEvents);

// Get upcoming events (SuperAdmin, HR)
router.get('/upcoming', authorize([ROLES.SUPER_ADMIN, ROLES.HR_ADMIN, ROLES.HR_MANAGER]), getUpcomingEvents);

// Get event by ID (SuperAdmin, HR)
router.get('/:id', authorize([ROLES.SUPER_ADMIN, ROLES.HR_ADMIN, ROLES.HR_MANAGER]), getEventById);

// Create new event (SuperAdmin, HR)
router.post('/', authorize([ROLES.SUPER_ADMIN, ROLES.HR_ADMIN, ROLES.HR_MANAGER]), createEvent);

// Update event (SuperAdmin, HR)
router.put('/:id', authorize([ROLES.SUPER_ADMIN, ROLES.HR_ADMIN, ROLES.HR_MANAGER]), updateEvent);

// Delete event (SuperAdmin only)
router.delete('/:id', authorize([ROLES.SUPER_ADMIN]), deleteEvent);

export default router;