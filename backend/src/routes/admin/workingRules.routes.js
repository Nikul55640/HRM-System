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

// Admin routes - require calendar management permissions (HR can view, only Admin can modify)
router.get('/', checkPermission(MODULES.CALENDAR.VIEW_SMART_CALENDAR), getWorkingRules);
router.get('/:id', checkPermission(MODULES.CALENDAR.VIEW_SMART_CALENDAR), getWorkingRuleById);
router.post('/', checkPermission(MODULES.SYSTEM.MANAGE_CONFIG), createWorkingRule); // Admin only
router.put('/:id', checkPermission(MODULES.SYSTEM.MANAGE_CONFIG), updateWorkingRule); // Admin only
router.patch('/:id/set-default', checkPermission(MODULES.SYSTEM.MANAGE_CONFIG), setDefaultWorkingRule); // Admin only
router.delete('/:id', checkPermission(MODULES.SYSTEM.MANAGE_CONFIG), deleteWorkingRule); // Admin only

export default router;