/**
 * Leave Balance Rollover Routes
 * Routes for managing automatic leave balance rollover
 */

import express from 'express';
import leaveBalanceRolloverController from '../../controllers/admin/leaveBalanceRollover.controller.js';
import { authenticate } from '../../middleware/authenticate.js';
import { checkPermission, checkAnyPermission } from '../../middleware/checkPermission.js';
import { MODULES } from '../../config/rolePermissions.js';

const router = express.Router();

// All routes require authentication
router.use(authenticate);

/**
 * @route POST /api/admin/leave-balance-rollover/perform
 * @desc Perform manual year-end rollover
 * @access Super Admin only
 */
router.post(
  '/perform',
  checkPermission(MODULES.LEAVE.MANAGE_BALANCES),
  leaveBalanceRolloverController.performRollover
);

/**
 * @route GET /api/admin/leave-balance-rollover/status
 * @desc Get rollover status for a specific year
 * @access Super Admin and HR Admin
 */
router.get(
  '/status',
  checkAnyPermission([
    MODULES.LEAVE.VIEW_ALL_BALANCES,
    MODULES.LEAVE.MANAGE_BALANCES
  ]),
  leaveBalanceRolloverController.getRolloverStatus
);

/**
 * @route POST /api/admin/leave-balance-rollover/assign-employee
 * @desc Assign default balances to specific employee
 * @access Super Admin and HR Admin
 */
router.post(
  '/assign-employee',
  checkAnyPermission([
    MODULES.LEAVE.MANAGE_BALANCES,
    MODULES.LEAVE.ASSIGN_BALANCES
  ]),
  leaveBalanceRolloverController.assignToEmployee
);

/**
 * @route GET /api/admin/leave-balance-rollover/default-config
 * @desc Get default leave balance configuration
 * @access Super Admin and HR Admin
 */
router.get(
  '/default-config',
  checkAnyPermission([
    MODULES.LEAVE.VIEW_ALL_BALANCES,
    MODULES.LEAVE.MANAGE_BALANCES
  ]),
  leaveBalanceRolloverController.getDefaultConfig
);

export default router;