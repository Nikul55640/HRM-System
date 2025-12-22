import express from 'express';
import leadController from '../../controllers/admin/lead.controller.js';
import leadActivityController from '../../controllers/admin/leadActivity.controller.js';
import leadNoteController from '../../controllers/admin/leadNote.controller.js';
import { authenticate } from '../../middleware/authenticate.js';
import { authorize } from '../../middleware/authorize.js';

const router = express.Router();

// All routes require authentication
router.use(authenticate);

// Lead management routes (SuperAdmin, admin, hr, sales roles)
router.use(authorize(['SuperAdmin', 'admin', 'hr', 'sales', 'manager']));

// Lead CRUD operations
router.get('/', leadController.getLeads);
router.get('/stats', leadController.getLeadStats);
router.get('/:id', leadController.getLead);
router.post('/', leadController.createLead);
router.put('/:id', leadController.updateLead);
router.delete('/:id', leadController.deleteLead);
router.put('/bulk/update', leadController.bulkUpdate);

// Lead activities
router.get('/:leadId/activities', leadActivityController.getActivities);
router.post('/:leadId/activities', leadActivityController.createActivity);
router.put('/activities/:id', leadActivityController.updateActivity);
router.delete('/activities/:id', leadActivityController.deleteActivity);
router.put('/activities/:id/complete', leadActivityController.completeActivity);
router.get('/activities/upcoming', leadActivityController.getUpcomingActivities);

// Lead notes
router.get('/:leadId/notes', leadNoteController.getNotes);
router.post('/:leadId/notes', leadNoteController.createNote);
router.put('/notes/:id', leadNoteController.updateNote);
router.delete('/notes/:id', leadNoteController.deleteNote);

export default router;