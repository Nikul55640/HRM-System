import express from 'express';
import { authenticate } from '../../middleware/authenticate.js';
import bankDetailsController from '../../controllers/employee/bankDetailsController.js';

const router = express.Router();

// Use regular authenticate - controllers will check for employeeId
router.get('/bank-details', authenticate, bankDetailsController.getBankDetails);
router.put('/bank-details', authenticate, bankDetailsController.updateBankDetails);
router.post('/bank-details/verify', authenticate, bankDetailsController.requestVerification);

export default router;
