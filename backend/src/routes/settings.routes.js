import express from 'express';
import { getSettings, updateSettings } from '../controllers/admin/settings.controller.js';
import { authenticate } from '../middleware/authenticate.js';

const router = express.Router();

/**
 * Get user settings
 * GET /users/:userId/settings
 */
router.get('/users/:userId/settings', authenticate, getSettings);

/**
 * Update user settings
 * PUT /users/:userId/settings
 */
router.put('/users/:userId/settings', authenticate, updateSettings);

export default router;
