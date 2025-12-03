import express from 'express';
import { authenticate } from '../../middleware/authenticate.js';
import { requireRoles } from '../../middleware/requireRoles.js';
import {
  getPayrollDashboard,
  getAllPayslips,
  generatePayslips,
  getPayslipById,
  deletePayslip
} from '../../controllers/admin/payrollController.js';

const router = express.Router();

// Apply authentication and role middleware
router.use(authenticate);
router.use(requireRoles(['SuperAdmin']));

// Payroll Dashboard
router.get('/dashboard', getPayrollDashboard);

// Get all payslips
router.get('/payslips', getAllPayslips);

// Generate payslips (bulk)
router.post('/generate', generatePayslips);

// Get payslip by ID
router.get('/payslips/:id', getPayslipById);

// Delete payslip
router.delete('/payslips/:id', deletePayslip);

export default router;
