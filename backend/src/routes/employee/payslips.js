import express from 'express';
import { authenticate } from '../../middleware/authenticate.js';
import payslipsController from '../../controllers/employee/payslipsController.js';

const router = express.Router();

// Use regular authenticate - controllers will check for employeeId
router.get('/payslips', authenticate, payslipsController.getPayslips);
router.get('/payslips/:id', authenticate, payslipsController.getPayslipById);
router.get('/payslips/:id/download', authenticate, payslipsController.downloadPayslip);

export default router;
