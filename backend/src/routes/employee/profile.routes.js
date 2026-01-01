import express from 'express';
import {
  getProfile,
  updateProfile,
  uploadProfilePhoto,
  deleteProfilePhoto,
  changePassword,
  upload,
} from '../../controllers/employee/profile.controller.js';
import { authenticate } from '../../middleware/authenticate.js';
import { validateProfileUpdate, validatePasswordChange } from '../../validators/profileValidator.js';

const router = express.Router();

// Apply authentication to all routes
router.use(authenticate);

// Profile routes
router.get('/', getProfile);
router.put('/', validateProfileUpdate, updateProfile);

// Profile photo routes
router.post('/photo', upload.single('profilePhoto'), uploadProfilePhoto);
router.delete('/photo', deleteProfilePhoto);

// Password change route
router.put('/change-password', validatePasswordChange, changePassword);

export default router;