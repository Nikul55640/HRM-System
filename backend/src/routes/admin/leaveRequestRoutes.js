import express from "express";
import { authenticate } from "../../middleware/authenticate.js";
import { requireRoles } from "../../middleware/requireRoles.js";

import leaveRequestController from "../../controllers/admin/leaveRequestController.js";

const router = express.Router();

// All routes require authentication & HR/Admin roles
router.use(authenticate, requireRoles(["HRManager", "HRAdmin", "SuperAdmin"]));

// Get all leave requests
router.get("/leave-requests", leaveRequestController.getAllLeaveRequests);

// Get leave statistics
router.get(
  "/leave-requests/statistics",
  leaveRequestController.getLeaveStatistics
);

// Get specific leave request
router.get("/leave-requests/:id", leaveRequestController.getLeaveRequestById);

// Approve leave
router.put(
  "/leave-requests/:id/approve",
  leaveRequestController.approveLeaveRequest
);

// Reject leave
router.put(
  "/leave-requests/:id/reject",
  leaveRequestController.rejectLeaveRequest
);

export default router;
