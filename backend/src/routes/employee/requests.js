import express from 'express';
import { authenticate } from '../../middleware/authenticate.js';
import requestsController from '../../controllers/employee/requestsController.js';

const router = express.Router();

// Use regular authenticate - controllers will check for employeeId
router.post('/requests', authenticate, requestsController.createRequest);
router.get('/requests', authenticate, requestsController.getRequests);
router.get('/requests/:id', authenticate, requestsController.getRequestById);
router.put('/requests/:id/cancel', authenticate, requestsController.cancelRequest);

export default router;
