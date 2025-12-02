import express from 'express';
import configController from '../controllers/configController.js';
import { authenticate } from '../middleware/authenticate.js';
import { authorize } from '../middleware/authorize.js';

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
 * @access  SuperAdmin only
 * @requirements 12.1, 12.3
 */
router.post(
  '/departments',
  authenticate,
  authorize('SuperAdmin'),
  configController.createDepartment,
);

/**
 * @route   GET /api/config/departments/:id
 * @desc    Get department by ID
 * @access  All authenticated users
 * @requirements 12.1, 13.4
 */
router.get(
  '/departments/:id',
  authenticate,
  configController.getDepartmentById,
);

/**
 * @route   PUT /api/config/departments/:id
 * @desc    Update a department
 * @access  SuperAdmin only
 * @requirements 12.1, 12.3
 */
router.put(
  '/departments/:id',
  authenticate,
  authorize('SuperAdmin'),
  configController.updateDepartment,
);

/**
 * @route   DELETE /api/config/departments/:id
 * @desc    Delete (deactivate) a department
 * @access  SuperAdmin only
 * @requirements 12.1, 12.3
 */
router.delete(
  '/departments/:id',
  authenticate,
  authorize('SuperAdmin'),
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
 */
router.post(
  '/custom-fields/employee',
  authenticate,
  authorize('SuperAdmin'),
  configController.setCustomEmployeeFields,
);

/**
 * @route   POST /api/config/custom-fields/document
 * @desc    Set custom document categories
 * @access  SuperAdmin only
 * @requirements 12.2, 12.3
 */
router.post(
  '/custom-fields/document',
  authenticate,
  authorize('SuperAdmin'),
  configController.setCustomDocumentCategories,
);

/**
 * @route   GET /api/config/system
 * @desc    Get all system configurations
 * @access  SuperAdmin only
 * @requirements 12.2, 12.4, 12.5
 */
router.get(
  '/system',
  authenticate,
  authorize('SuperAdmin'),
  configController.getAllConfigs,
);

/**
 * @route   POST /api/config/system
 * @desc    Set a system configuration
 * @access  SuperAdmin only
 * @requirements 12.2, 12.3, 12.5
 */
router.post(
  '/system',
  authenticate,
  authorize('SuperAdmin'),
  configController.setSystemConfig,
);

export default router;
