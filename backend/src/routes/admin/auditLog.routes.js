import express from "express";
import { authenticate } from "../../middleware/authenticate.js";
import { authorize } from "../../middleware/authorize.js";
import auditLogController from "../../controllers/admin/auditLog.controller.js";

const router = express.Router();

// Apply authentication
router.use(authenticate);

// Restrict to SuperAdmin only
router.use(authorize("superadmin"));

// Get all audit logs with filters + pagination
router.get("/", auditLogController.getAuditLogs);

// Get audit log by ID
router.get("/:id", auditLogController.getAuditLogById);

// Cleanup old audit logs
router.post("/cleanup", auditLogController.cleanupAuditLogs);

export default router;
