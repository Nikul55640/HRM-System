import express from 'express';
import attendanceCorrectionController from '../../controllers/admin/attendanceCorrection.controller.js';
import { authenticate } from '../../middleware/authenticate.js';
import { authorize } from '../../middleware/authorize.js';

const router = express.Router();

// All routes require authentication and admin/hr role
router.use(authenticate);
router.use(authorize(["SuperAdmin", "HR", "HR"]));

// Get pending corrections
router.get('/pending', attendanceCorrectionController.getPendingCorrections);

// Get correction history
router.get('/history', attendanceCorrectionController.getCorrectionHistory);

// Get employee correction requests (new endpoint)
router.get('/requests', attendanceCorrectionController.getEmployeeCorrectionRequests);

// Approve employee correction request
router.put('/requests/:requestId/approve', attendanceCorrectionController.approveEmployeeCorrectionRequest);

// Reject employee correction request
router.put('/requests/:requestId/reject', attendanceCorrectionController.rejectEmployeeCorrectionRequest);

// Apply single correction
router.put('/:recordId/correct', attendanceCorrectionController.applyCorrection);

// Flag attendance for correction
router.put('/:recordId/flag', attendanceCorrectionController.flagForCorrection);

// Bulk corrections
router.post('/bulk-correct', attendanceCorrectionController.bulkCorrection);

export default router;