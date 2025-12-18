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
import { authenticateToken } from '../../middleware/auth.js';
import { requireRole } from '../../middleware/rbac.js';
import { validateLeaveType } from '../../validators/leaveTypeValidator.js';

const router = express.Router();

// Apply authentication to all routes
router.use(authenticateToken);

// Get active leave types (for dropdowns) - accessible by all authenticated users
router.get('/active', getActiveLeaveTypes);

// Admin only routes
router.use(requireRole(['admin', 'hr']));

// Get all leave types with pagination and search
router.get('/', getLeaveTypes);

// Get leave type by ID
router.get('/:id', getLeaveTypeById);

// Create new leave type
router.post('/', validateLeaveType, createLeaveType);

// Update leave type
router.put('/:id', validateLeaveType, updateLeaveType);

// Toggle leave type status
router.patch('/:id/toggle-status', toggleLeaveTypeStatus);

// Delete leave type
router.delete('/:id', deleteLeaveType);

export default router;