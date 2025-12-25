import express from 'express';
import { authenticate, authorize } from '../../middleware/authenticate.js';
import {
    getMyShifts,
    getCurrentShift,
    getShiftSchedule,
    requestShiftChange
} from '../../controllers/employee/shift.controller.js';

const router = express.Router();

// Apply authentication middleware to all routes
router.use(authenticate);
router.use(authorize(['Employee', 'HR', 'SuperAdmin']));

// Get my shift assignments
router.get('/my-shifts', getMyShifts);

// Get current active shift
router.get('/current', getCurrentShift);

// Get shift schedule (weekly/monthly)
router.get('/schedule', getShiftSchedule);

// Request shift change
router.post('/change-request', requestShiftChange);

export default router;