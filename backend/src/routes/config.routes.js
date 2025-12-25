import express from 'express';
import configController from '../controllers/config.controller.js';
import { authenticate } from '../middleware/authenticate.js';
import { checkPermission } from '../middleware/checkPermission.js';
import { MODULES } from '../config/rolePermissions.js';

const router = express.Router();

/**
 * Configuration Routes
 * Simplified for 8 core features
 */

/**
 * @route   GET /api/config
 * @desc    Get system configuration
 * @access  All authenticated users
 */
router.get(
  '/',
  authenticate,
  configController.getConfig,
);

/**
 * @route   PUT /api/config
 * @desc    Update system configuration
 * @access  SuperAdmin only
 * @permission SYSTEM.MANAGE_CONFIG
 */
router.put(
  '/',
  authenticate,
  checkPermission(MODULES.SYSTEM.MANAGE_CONFIG),
  configController.updateConfig,
);

export default router;
