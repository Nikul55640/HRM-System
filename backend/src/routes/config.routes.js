import express from 'express';
import configController from '../controllers/config.controller.js';
import { authenticate } from '../middleware/authenticate.js';
import { checkPermission } from '../middleware/checkPermission.js';
import { MODULES } from '../config/rolePermissions.js';

const router = express.Router();

/**
 * Configuration Routes
 * All routes require authentication
 */

/**
 * @route   GET /api/config/departments/hierarchy
 * @desc    Get department hierarchy tree
 * @access  All authenticated users
 * @requirements 12.1, 13.4
 */
router.get(
  '/departments/hierarchy',
  authenticate,
  configController.getDepartmentHierarchy,
);

/**
 * @route   GET /api/config/departments
 * @desc    Get all departments with optional filtering
 * @access  All authenticated users
 * @requirements 12.1, 13.4
 */
router.get(
  '/departments',
  authenticate,
  configController.getDepartments,
);

/**
 * @route   POST /api/config/departments
 * @desc    Create a new department
 * @access  HR Admin, SuperAdmin
 * @requirements 12.1, 12.3
 * @permission DEPARTMENT.CREATE
 */
router.post(
  '/departments',
  authenticate,
  checkPermission(MODULES.DEPARTMENT.CREATE),
  configController.createDepartment,
);

/**
 * @route   GET /api/config/departments/:id
 * @desc    Get department by ID
 * @access  All authenticated users
 * @requirements 12.1, 13.4
 * @permission DEPARTMENT.VIEW
 */
router.get(
  '/departments/:id',
  authenticate,
  checkPermission(MODULES.DEPARTMENT.VIEW),
  configController.getDepartmentById,
);

/**
 * @route   PUT /api/config/departments/:id
 * @desc    Update a department
 * @access  HR Admin, SuperAdmin
 * @requirements 12.1, 12.3
 * @permission DEPARTMENT.UPDATE
 */
router.put(
  '/departments/:id',
  authenticate,
  checkPermission(MODULES.DEPARTMENT.UPDATE),
  configController.updateDepartment,
);

/**
 * @route   DELETE /api/config/departments/:id
 * @desc    Delete (deactivate) a department
 * @access  SuperAdmin only
 * @requirements 12.1, 12.3
 * @permission DEPARTMENT.DELETE
 */
router.delete(
  '/departments/:id',
  authenticate,
  checkPermission(MODULES.DEPARTMENT.DELETE),
  configController.deleteDepartment,
);

/**
 * @route   GET /api/config/custom-fields
 * @desc    Get custom employee fields and document categories
 * @access  All authenticated users
 * @requirements 12.2, 12.4
 */
router.get(
  '/custom-fields',
  authenticate,
  configController.getCustomFields,
);

/**
 * @route   POST /api/config/custom-fields/employee
 * @desc    Set custom employee fields
 * @access  SuperAdmin only
 * @requirements 12.2, 12.3
 * @permission SYSTEM.MANAGE_CONFIG
 */
router.post(
  '/custom-fields/employee',
  authenticate,
  checkPermission(MODULES.SYSTEM.MANAGE_CONFIG),
  configController.setCustomEmployeeFields,
);

/**
 * @route   POST /api/config/custom-fields/document
 * @desc    Set custom document categories
 * @access  SuperAdmin only
 * @requirements 12.2, 12.3
 * @permission SYSTEM.MANAGE_CONFIG
 */
router.post(
  '/custom-fields/document',
  authenticate,
  checkPermission(MODULES.SYSTEM.MANAGE_CONFIG),
  configController.setCustomDocumentCategories,
);

/**
 * @route   GET /api/config/system
 * @desc    Get all system configurations
 * @access  SuperAdmin only
 * @requirements 12.2, 12.4, 12.5
 * @permission SYSTEM.VIEW_CONFIG
 */
router.get(
  '/system',
  authenticate,
  checkPermission(MODULES.SYSTEM.VIEW_CONFIG),
  configController.getAllConfigs,
);

/**
 * @route   POST /api/config/system
 * @desc    Set a system configuration
 * @access  SuperAdmin only
 * @requirements 12.2, 12.3, 12.5
 * @permission SYSTEM.MANAGE_CONFIG
 */
router.post(
  '/system',
  authenticate,
  checkPermission(MODULES.SYSTEM.MANAGE_CONFIG),
  configController.setSystemConfig,
);

export default router;
