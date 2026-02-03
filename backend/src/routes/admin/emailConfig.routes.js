import express from 'express';
import { testEmail, getEmailStatus, sendTestNotification } from '../../controllers/admin/emailConfig.controller.js';
import { authenticate } from '../../middleware/authenticate.js'
import { requireRoles } from '../../middleware/requireRoles.js';
import { ROLES } from '../../config/roles.js';

const router = express.Router();

// All routes require authentication
router.use(authenticate);

/**
 * @route   GET /api/admin/email/status
 * @desc    Get email service status
 * @access  Super Admin, HR Admin
 */
router.get('/status', requireRoles([ROLES.SUPER_ADMIN, ROLES.HR_ADMIN]), getEmailStatus);

/**
 * @route   POST /api/admin/email/test
 * @desc    Send test email
 * @access  Super Admin only
 */
router.post('/test', requireRoles([ROLES.SUPER_ADMIN]), testEmail);

/**
 * @route   POST /api/admin/email/test-notification
 * @desc    Send test notification with email
 * @access  Super Admin only
 */
router.post('/test-notification', requireRoles([ROLES.SUPER_ADMIN]), sendTestNotification);

export default router;