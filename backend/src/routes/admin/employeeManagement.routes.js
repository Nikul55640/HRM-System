/**
 * Employee Management Routes
 * Enhanced employee management with role assignment and designation system
 */

import express from 'express';
import employeeManagementController from '../../controllers/admin/employeeManagement.controller.js';
import { authenticate, authorize } from '../../middleware/authenticate.js';
import { ROLES } from '../../config/rolePermissions.js';

const router = express.Router();

// Apply authentication to all routes
router.use(authenticate);

/**
 * @route GET /api/admin/employee-management/form-data
 * @desc Get form data for employee creation/editing (departments, designations, managers, roles)
 * @access HR Admin, Super Admin
 */
router.get('/form-data',
  authorize([ROLES.HR_ADMIN, ROLES.SUPER_ADMIN]),
  employeeManagementController.getEmployeeFormData
);

/**
 * @route POST /api/admin/employee-management/employees
 * @desc Create new employee with role assignment and designation
 * @access HR Admin, Super Admin
 */
router.post('/employees',
  authorize([ROLES.HR_ADMIN, ROLES.SUPER_ADMIN]),
  employeeManagementController.createEmployeeWithRole
);

/**
 * @route PUT /api/admin/employee-management/employees/:id
 * @desc Update employee with role and designation management
 * @access HR Admin, Super Admin
 */
router.put('/employees/:id',
  authorize([ROLES.HR_ADMIN, ROLES.SUPER_ADMIN]),
  employeeManagementController.updateEmployeeWithRole
);

/**
 * @route GET /api/admin/employee-management/employees/:id
 * @desc Get employee with system role information
 * @access HR Admin, Super Admin
 */
router.get('/employees/:id',
  authorize([ROLES.HR_ADMIN, ROLES.SUPER_ADMIN]),
  employeeManagementController.getEmployeeWithRole
);

export default router;