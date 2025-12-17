import express from 'express';
import { authenticate } from '../../middleware/authenticate.js';
import { checkPermission } from '../../middleware/checkPermission.js';
import { MODULES } from '../../config/rolePermissions.js';
import {
  getPayrollDashboard,
  getAllPayslips,
  generatePayslips,
  getPayslipById,
  deletePayslip,
  getEmployeePayroll,
  getSalaryStructures,
  createSalaryStructure,
  updateSalaryStructure,
  deleteSalaryStructure
} from '../../controllers/admin/payroll.controller.js';

const router = express.Router();

// Apply authentication to all routes
router.use(authenticate);

// Payroll Dashboard
// Permission: VIEW_ALL (Payroll Officer, SuperAdmin)
router.get('/dashboard',
  checkPermission(MODULES.PAYROLL.VIEW_ALL),
  getPayrollDashboard
);

// Get all payslips
// Permission: VIEW_ALL
router.get('/payslips',
  checkPermission(MODULES.PAYROLL.VIEW_ALL),
  getAllPayslips
);

// Generate payslips (bulk)
// Permission: PROCESS
router.post('/generate',
  checkPermission(MODULES.PAYROLL.PROCESS),
  generatePayslips
);

// Get payslip by ID
// Permission: VIEW_ALL
router.get('/payslips/:id',
  checkPermission(MODULES.PAYROLL.VIEW_ALL),
  getPayslipById
);

// Delete payslip
// Permission: PROCESS (only Payroll Officer and SuperAdmin)
router.delete('/payslips/:id',
  checkPermission(MODULES.PAYROLL.PROCESS),
  deletePayslip
);

// Employee payroll information
// Permission: VIEW_ALL
router.get('/employees',
  checkPermission(MODULES.PAYROLL.VIEW_ALL),
  getEmployeePayroll
);

// Salary structures
// Permission: VIEW_ALL for GET, MANAGE_STRUCTURE for modifications
router.get('/structures',
  checkPermission(MODULES.PAYROLL.VIEW_ALL),
  getSalaryStructures
);

router.post('/structures',
  checkPermission(MODULES.PAYROLL.MANAGE_STRUCTURE),
  createSalaryStructure
);

router.put('/structures/:id',
  checkPermission(MODULES.PAYROLL.MANAGE_STRUCTURE),
  updateSalaryStructure
);

router.delete('/structures/:id',
  checkPermission(MODULES.PAYROLL.MANAGE_STRUCTURE),
  deleteSalaryStructure
);

export default router;
