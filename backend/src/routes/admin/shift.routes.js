import express from 'express';
import shiftController from '../../controllers/admin/shift.controller.js';
import employeeShiftController from '../../controllers/admin/employeeShift.controller.js';
import { authenticate } from '../../middleware/authenticate.js';
import { authorize } from '../../middleware/authorize.js';

const router = express.Router();

// All routes require authentication
router.use(authenticate);

// Shift management routes (Admin, HR roles)
router.use(authorize(['SuperAdmin', 'HR Administrator', 'HR Manager']));

// Shift CRUD operations
router.get('/', shiftController.getShifts);
router.get('/stats', shiftController.getShiftStats);
router.get('/:id', shiftController.getShift);
router.post('/', shiftController.createShift);
router.put('/:id', shiftController.updateShift);
router.delete('/:id', shiftController.deleteShift);
router.patch('/:id/set-default', shiftController.setDefaultShift);

// Employee shift assignment routes
router.get('/assignments/list', employeeShiftController.getEmployeeShifts);
router.get('/assignments/employee/:employeeId/current', employeeShiftController.getCurrentEmployeeShift);
router.post('/assignments', employeeShiftController.assignShift);
router.put('/assignments/:id', employeeShiftController.updateShiftAssignment);
router.patch('/assignments/:id/end', employeeShiftController.endShiftAssignment);
router.post('/assignments/bulk', employeeShiftController.bulkAssignShifts);

export default router;