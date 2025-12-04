import express from "express";
import { authenticate } from "../../middleware/authenticate.js";
import { checkPermission, checkAnyPermission } from "../../middleware/checkPermission.js";
import { MODULES } from "../../config/rolePermissions.js";

import leaveRequestController from "../../controllers/admin/leaveRequestController.js";
import leaveBalanceController from "../../controllers/admin/leaveBalanceController.js";

const router = express.Router();

// All routes require authentication
router.use(authenticate);

// ===== LEAVE BALANCE ROUTES =====

// Get all employees' leave balances
// Permission: VIEW_ALL or MANAGE_BALANCE
router.get("/balances",
  checkAnyPermission([
    MODULES.LEAVE.VIEW_ALL,
    MODULES.LEAVE.MANAGE_BALANCE,
  ]),
  leaveBalanceController.getAllLeaveBalances
);

// Assign/update leave balance for an employee
// Permission: MANAGE_BALANCE
router.post("/assign/:employeeId",
  checkPermission(MODULES.LEAVE.MANAGE_BALANCE),
  leaveBalanceController.assignLeaveBalance
);

// ===== LEAVE REQUEST ROUTES =====

// Get all leave requests
// Permission: VIEW_ALL, VIEW_TEAM, or VIEW_OWN
router.get("/leave-requests",
  checkAnyPermission([
    MODULES.LEAVE.VIEW_ALL,
    MODULES.LEAVE.VIEW_TEAM,
    MODULES.LEAVE.VIEW_OWN,
  ]),
  leaveRequestController.getAllLeaveRequests
);

// Get leave statistics
// Permission: VIEW_ALL or VIEW_TEAM
router.get(
  "/leave-requests/statistics",
  checkAnyPermission([
    MODULES.LEAVE.VIEW_ALL,
    MODULES.LEAVE.VIEW_TEAM,
  ]),
  leaveRequestController.getLeaveStatistics
);

// Get specific leave request
// Permission: VIEW_ALL, VIEW_TEAM, or VIEW_OWN
router.get("/leave-requests/:id",
  checkAnyPermission([
    MODULES.LEAVE.VIEW_ALL,
    MODULES.LEAVE.VIEW_TEAM,
    MODULES.LEAVE.VIEW_OWN,
  ]),
  leaveRequestController.getLeaveRequestById
);

// Approve leave
// Permission: APPROVE_ANY or APPROVE_TEAM
router.put(
  "/leave-requests/:id/approve",
  checkAnyPermission([
    MODULES.LEAVE.APPROVE_ANY,
    MODULES.LEAVE.APPROVE_TEAM,
  ]),
  leaveRequestController.approveLeaveRequest
);

// Reject leave
// Permission: APPROVE_ANY or APPROVE_TEAM
router.put(
  "/leave-requests/:id/reject",
  checkAnyPermission([
    MODULES.LEAVE.APPROVE_ANY,
    MODULES.LEAVE.APPROVE_TEAM,
  ]),
  leaveRequestController.rejectLeaveRequest
);

export default router;
