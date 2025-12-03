import express from 'express';
import { authenticate } from '../../middleware/authenticate.js';
import { requireRoles } from '../../middleware/requireRoles.js';
import {
  getAuditLogs,
  getAuditLogById,
  exportAuditLogs,
  cleanupAuditLogs
} from '../../controllers/admin/auditLogController.js';

const router = express.Router();

// Apply authentication and role middleware
router.use(authenticate);
router.use(requireRoles(['SuperAdmin']));

// Get all audit logs with filtering and pagination
router.get('/', getAuditLogs);

// Export audit logs (CSV or JSON)
router.get('/export', exportAuditLogs);

// Get audit log by ID
router.get('/:id', getAuditLogById);

// Cleanup old audit logs
router.post('/cleanup', cleanupAuditLogs);

export default router;
