import express from 'express';
import { authenticate } from '../../middleware/authenticate.js';
import { checkPermission } from '../../middleware/checkPermission.js';
import { MODULES } from '../../config/rolePermissions.js';
import bankDetailsController from '../../controllers/employee/bankDetailsController.js';

const router = express.Router();

// All routes require authentication
router.use(authenticate);

// Get bank details
// Permission: VIEW_OWN (employee can view own bank details)
router.get('/bank-details',
  checkPermission(MODULES.EMPLOYEE.VIEW_OWN),
  bankDetailsController.getBankDetails
);

// Update bank details
// Permission: UPDATE_OWN (employee can update own bank details)
router.put('/bank-details',
  checkPermission(MODULES.EMPLOYEE.UPDATE_OWN),
  bankDetailsController.updateBankDetails
);

// Request verification
router.post('/bank-details/verify',
  checkPermission(MODULES.EMPLOYEE.UPDATE_OWN),
  bankDetailsController.requestVerification
);

export default router;
