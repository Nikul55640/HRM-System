/**
 * Designation Routes
 * Handles all designation-related API endpoints
 */

import express from 'express';
import employeeManagementController from '../../controllers/admin/employeeManagement.controller.js';
import { authenticate, authorize } from '../../middleware/authenticate.js';
import { ROLES } from '../../config/roles.js';

const router = express.Router();

// Apply authentication to all routes
router.use(authenticate);

/**
 * @route GET /api/admin/designations
 * @desc Get all designations with filtering and pagination
 * @access HR Admin, Super Admin
 */
router.get('/', 
  authorize([ROLES.SUPER_ADMIN, ROLES.HR_ADMIN]),
  employeeManagementController.getDesignations
);

/**
 * @route POST /api/admin/designations
 * @desc Create a new designation
 * @access HR Admin, Super Admin
 */
router.post('/',
  authorize([ROLES.SUPER_ADMIN, ROLES.HR_ADMIN]),
  employeeManagementController.createDesignation
);

/**
 * @route PUT /api/admin/designations/:id
 * @desc Update a designation
 * @access HR Admin, Super Admin
 */
router.put('/:id',
  authorize([ROLES.SUPER_ADMIN, ROLES.HR_ADMIN]),
  employeeManagementController.updateDesignation
);

/**
 * @route DELETE /api/admin/designations/:id
 * @desc Delete a designation (soft delete)
 * @access Super Admin only
 */
router.delete('/:id',
  authorize(['SuperAdmin']),
  employeeManagementController.deleteDesignation
);

export default router;