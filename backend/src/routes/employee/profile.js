import express from 'express';
import { authenticate } from '../../middleware/authenticate.js';
import profileController from '../../controllers/employee/profileController.js';

const router = express.Router();

// Use regular authenticate - controllers will check for employeeId
// Profile routes
router.get('/me', authenticate, profileController.getMyProfile);
router.get('/profile', authenticate, profileController.getProfile);
router.put('/profile', authenticate, profileController.updateProfile);
router.get('/profile/history', authenticate, profileController.getChangeHistory);

// Document routes
router.post('/profile/documents', authenticate, profileController.uploadDocument);
router.get('/profile/documents', authenticate, profileController.getDocuments);
router.get('/profile/documents/:id/download', authenticate, profileController.downloadDocument);

export default router;
