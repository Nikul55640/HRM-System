import express from 'express';
import { body } from 'express-validator';

import {
  getAttendanceIssues,
  getCorrectionRequests,
  submitCorrectionRequest,
  getCorrectionRequest,
  cancelCorrectionRequest
} from '../../controllers/employee/attendanceCorrectionRequests.controller.js';

import { authenticate } from '../../middleware/authenticate.js';
import { checkPermission } from '../../middleware/checkPermission.js';
import { MODULES } from '../../config/rolePermissions.js';

const router = express.Router();

// Validation middleware
const validateCorrectionRequest = [
  body('date')
    .notEmpty()
    .withMessage('Date is required')
    .isISO8601()
    .withMessage('Date must be in valid ISO format'),
  body('reason')
    .notEmpty()
    .withMessage('Reason is required')
    .isLength({ min: 10, max: 500 })
    .withMessage('Reason must be between 10 and 500 characters'),
  body('expectedClockIn')
    .optional()
    .matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/)
    .withMessage('Expected clock in time must be in HH:MM format'),
  body('expectedClockOut')
    .optional()
    .matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/)
    .withMessage('Expected clock out time must be in HH:MM format'),
  body('breakDuration')
    .optional()
    .isInt({ min: 0, max: 480 })
    .withMessage('Break duration must be between 0 and 480 minutes'),
  body('issueType')
    .optional()
    .isIn(['missed_punch', 'incorrect_time', 'system_error', 'other'])
    .withMessage('Invalid issue type')
];

// Apply authentication to all routes
router.use(authenticate);

/**
 * @route   GET /api/employee/attendance/issues
 * @desc    Get attendance issues for current employee
 * @access  Private (Employee only)
 */
router.get('/attendance/issues', 
  checkPermission(MODULES.ATTENDANCE.VIEW_OWN),
  getAttendanceIssues
);

/**
 * @route   GET /api/employee/attendance-correction-requests
 * @desc    Get correction requests for current employee
 * @access  Private (Employee only)
 */
router.get('/attendance-correction-requests', 
  checkPermission(MODULES.ATTENDANCE.VIEW_OWN),
  getCorrectionRequests
);

/**
 * @route   POST /api/employee/attendance-correction-requests
 * @desc    Submit a new correction request
 * @access  Private (Employee only)
 */
router.post('/attendance-correction-requests', 
  checkPermission(MODULES.ATTENDANCE.REQUEST_CORRECTION),
  validateCorrectionRequest, 
  submitCorrectionRequest
);

/**
 * @route   GET /api/employee/attendance-correction-requests/:id
 * @desc    Get a specific correction request
 * @access  Private (Employee only)
 */
router.get('/attendance-correction-requests/:id', 
  checkPermission(MODULES.ATTENDANCE.VIEW_OWN),
  getCorrectionRequest
);

/**
 * @route   PUT /api/employee/attendance-correction-requests/:id/cancel
 * @desc    Cancel a pending correction request
 * @access  Private (Employee only)
 */
router.put('/attendance-correction-requests/:id/cancel', 
  checkPermission(MODULES.ATTENDANCE.REQUEST_CORRECTION),
  cancelCorrectionRequest
);

export default router;