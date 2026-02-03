import express from 'express';
import { authenticate, authorize } from '../../middleware/authenticate.js';
import { ROLES } from '../../config/roles.js';
import {
    getMyShifts,
    getCurrentShift,
    getShiftSchedule,
    requestShiftChange
} from '../../controllers/employee/shift.controller.js';

const router = express.Router();

// Apply authentication middleware to all routes
router.use(authenticate);
router.use(authorize([ROLES.EMPLOYEE, ROLES.HR_ADMIN, ROLES.SUPER_ADMIN]));

// Root shifts endpoint for API testing
router.get('/', async (req, res) => {
  try {
    res.json({
      success: true,
      message: "Employee shifts API is available",
      endpoints: [
        "GET /employee/shifts/my-shifts - Get my shift assignments",
        "GET /employee/shifts/current - Get current active shift",
        "GET /employee/shifts/schedule - Get shift schedule",
        "POST /employee/shifts/change-request - Request shift change"
      ]
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Shifts API error",
      error: error.message
    });
  }
});

// Get my shift assignments
router.get('/my-shifts', getMyShifts);

// Get current active shift
router.get('/current', getCurrentShift);

// Get shift schedule (weekly/monthly)
router.get('/schedule', getShiftSchedule);

// Request shift change
router.post('/change-request', requestShiftChange);

export default router;