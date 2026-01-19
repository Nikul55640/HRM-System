/**
 * Admin Configuration Routes
 * Handles system-wide configuration settings
 */

import express from 'express';
import adminConfigController from '../../controllers/admin/adminConfig.controller.js';
import { authenticate } from '../../middleware/authenticate.js';
import { requireRoles } from '../../middleware/requireRoles.js';

const router = express.Router();

// All routes require authentication and SuperAdmin role
router.use(authenticate);
router.use(requireRoles(['SuperAdmin']));

// System Configuration Routes
router.get('/system', adminConfigController.getSystemConfig);
router.put('/system', adminConfigController.updateSystemConfig);

// Email Configuration Routes
router.get('/email', adminConfigController.getEmailSettings);
router.put('/email', adminConfigController.updateEmailSettings);
router.post('/email/test', adminConfigController.testEmailSettings);

// Notification Configuration Routes
router.get('/notifications', adminConfigController.getNotificationSettings);
router.put('/notifications', adminConfigController.updateNotificationSettings);

// Security Configuration Routes
router.get('/security', adminConfigController.getSecuritySettings);
router.put('/security', adminConfigController.updateSecuritySettings);

// Backup Configuration Routes
router.get('/backup', adminConfigController.getBackupSettings);
router.put('/backup', adminConfigController.updateBackupSettings);
router.post('/backup/create', adminConfigController.createBackup);
router.get('/backup/history', adminConfigController.getBackupHistory);
router.post('/backup/restore/:backupId', adminConfigController.restoreBackup);

export default router;