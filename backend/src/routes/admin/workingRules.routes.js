import express from 'express';
import {
  getWorkingRules,
  getWorkingRuleById,
  getActiveWorkingRule,
  createWorkingRule,
  updateWorkingRule,
  deleteWorkingRule,
  setDefaultWorkingRule,
  checkWorkingDay
} from '../../controllers/admin/workingRules.controller.js';
import { authenticate } from '../../middleware/authenticate.js';
import { checkPermission } from '../../middleware/checkPermission.js';
import { MODULES } from '../../config/rolePermissions.js';

const router = express.Router();

// Apply authentication to all routes
router.use(authenticate);

// Public routes (accessible by all authenticated users)
router.get('/active', getActiveWorkingRule);
router.get('/check/:date', checkWorkingDay);

// Admin routes - require system configuration permissions
router.get('/', checkPermission(MODULES.SYSTEM.MANAGE_CONFIG), getWorkingRules);
router.get('/:id', checkPermission(MODULES.SYSTEM.MANAGE_CONFIG), getWorkingRuleById);
router.post('/', checkPermission(MODULES.SYSTEM.MANAGE_CONFIG), createWorkingRule);
router.put('/:id', checkPermission(MODULES.SYSTEM.MANAGE_CONFIG), updateWorkingRule);
router.patch('/:id/set-default', checkPermission(MODULES.SYSTEM.MANAGE_CONFIG), setDefaultWorkingRule);
router.delete('/:id', checkPermission(MODULES.SYSTEM.MANAGE_CONFIG), deleteWorkingRule);

export default router;