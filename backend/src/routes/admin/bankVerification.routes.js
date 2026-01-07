import express from 'express';
import { authenticate } from '../../middleware/authenticate.js';
import { checkPermission } from '../../middleware/checkPermission.js';
import { MODULES } from '../../config/rolePermissions.js';
import bankDetailsController from '../../controllers/employee/bankDetails.controller.js';

const router = express.Router();

// All routes require authentication
router.use(authenticate);

// Get all employees with pending bank verification (HR/Admin only)
router.get('/pending-verifications',
  checkPermission(MODULES.EMPLOYEE.VIEW_ALL),
  bankDetailsController.getPendingVerifications
);

// Verify bank details (HR/Admin only)
router.put('/verify/:employeeId',
  checkPermission(MODULES.EMPLOYEE.UPDATE_ANY),
  bankDetailsController.verifyBankDetails
);

export default router;