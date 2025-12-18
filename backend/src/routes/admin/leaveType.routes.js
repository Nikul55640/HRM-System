import express from 'express';
import {
  getLeaveTypes,
  getLeaveTypeById,
  createLeaveType,
  updateLeaveType,
  deleteLeaveType,
  toggleLeaveTypeStatus,
  getActiveLeaveTypes
} from '../../controllers/admin/leaveType.controller.js';
import { authenticate } from '../../middleware/authenticate.js';
import { checkPermission } from '../../middleware/checkPermission.js';
import { MODULES } from '../../config/rolePermissions.js';
import { validateLeaveType } from '../../validators/leaveTypeValidator.js';

const router = express.Router();

// Apply authentication to all routes
router.use(authenticate);

// Get active leave types (for dropdowns) - accessible by all authenticated users
router.get('/active', getActiveLeaveTypes);

// Admin only routes - require leave management permissions
router.get('/', checkPermission(MODULES.LEAVE.MANAGE_POLICIES), getLeaveTypes);
router.get('/:id', checkPermission(MODULES.LEAVE.MANAGE_POLICIES), getLeaveTypeById);
router.post('/', checkPermission(MODULES.LEAVE.MANAGE_POLICIES), validateLeaveType, createLeaveType);
router.put('/:id', checkPermission(MODULES.LEAVE.MANAGE_POLICIES), validateLeaveType, updateLeaveType);
router.patch('/:id/toggle-status', checkPermission(MODULES.LEAVE.MANAGE_POLICIES), toggleLeaveTypeStatus);
router.delete('/:id', checkPermission(MODULES.LEAVE.MANAGE_POLICIES), deleteLeaveType);

export default router;