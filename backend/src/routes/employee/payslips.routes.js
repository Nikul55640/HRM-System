import express from 'express';
import { authenticate } from '../../middleware/authenticate.js';
import { checkPermission } from '../../middleware/checkPermission.js';
import { MODULES } from '../../config/rolePermissions.js';
import payslipsController from '../../controllers/employee/payslips.controller.js';

const router = express.Router();

// All routes require authentication
router.use(authenticate);

// Get all payslips for the employee
// Permission: VIEW_OWN (employee can view own payslips)
router.get('/payslips',
  checkPermission(MODULES.PAYROLL.VIEW_OWN),
  payslipsController.getPayslips
);

// Get specific payslip by ID
// Permission: VIEW_OWN (employee can view own payslip)
router.get('/payslips/:id',
  checkPermission(MODULES.PAYROLL.VIEW_OWN),
  payslipsController.getPayslipById
);

// Download payslip as PDF
// Permission: VIEW_OWN (employee can download own payslip)
router.get('/payslips/:id/download',
  checkPermission(MODULES.PAYROLL.VIEW_OWN),
  payslipsController.downloadPayslip
);

export default router;
