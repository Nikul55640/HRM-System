/**
 * Email Testing Routes
 * 
 * Admin routes for testing email providers
 * Test Mailtrap, Resend, and SMTP configurations
 */

import express from 'express';
import {
  getEmailProviderStatus,
  testCurrentProvider,
  testSpecificProvider,
  testAllProviders,
  verifyCurrentConfig
} from '../../controllers/admin/emailTest.controller.js';
import { authenticate } from '../../middleware/authenticate.js';
import { requireRoles } from '../../middleware/requireRoles.js';

const router = express.Router();

// All routes require admin authentication
router.use(authenticate);
router.use(requireRoles(['admin', 'super_admin']));

/**
 * @route GET /api/admin/email-test/status
 * @desc Get email provider status and configuration
 * @access Admin
 */
router.get('/status', getEmailProviderStatus);

/**
 * @route POST /api/admin/email-test/verify
 * @desc Verify current email provider configuration
 * @access Admin
 */
router.post('/verify', verifyCurrentConfig);

/**
 * @route POST /api/admin/email-test/current
 * @desc Test current email provider
 * @access Admin
 * @body { email: string }
 */
router.post('/current', testCurrentProvider);

/**
 * @route POST /api/admin/email-test/provider
 * @desc Test specific email provider
 * @access Admin
 * @body { provider: 'MAILTRAP'|'RESEND'|'SMTP', email: string }
 */
router.post('/provider', testSpecificProvider);

/**
 * @route POST /api/admin/email-test/all
 * @desc Test all configured email providers
 * @access Admin
 * @body { email: string }
 */
router.post('/all', testAllProviders);

export default router;