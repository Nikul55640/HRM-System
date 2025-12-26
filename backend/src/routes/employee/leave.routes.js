import express from "express";
import { authenticate } from "../../middleware/authenticate.js";

import leaveController from "../../controllers/employee/leave.controller.js";
import leaveRequestController from "../../controllers/employee/leaveRequest.controller.js";

const router = express.Router();

/* ---------------------------------------------------------
   EMPLOYEE LEAVE BALANCE & HISTORY
--------------------------------------------------------- */
router.get("/leave-balance", authenticate, leaveController.getMyLeaveBalances);

router.get("/leave-history", authenticate, leaveController.getMyLeaveHistory);

router.get(
  "/leave-balance/history",
  authenticate,
  leaveController.getMyLeaveBalanceHistory
);

router.get(
  "/leave-balance/export",
  authenticate,
  leaveController.exportLeaveBalance
);

/* ---------------------------------------------------------
   EMPLOYEE LEAVE REQUESTS (CRUD)
--------------------------------------------------------- */
router.post(
  "/leave-requests",
  authenticate,
  leaveRequestController.createLeaveRequest
);

router.get(
  "/leave-requests",
  authenticate,
  leaveController.getMyLeaveRequests
);

router.get(
  "/leave-requests/:id",
  authenticate,
  leaveController.getLeaveRequestStatus
);

router.delete(
  "/leave-requests/:id",
  authenticate,
  leaveController.cancelMyLeaveRequest
);

/* ---------------------------------------------------------
   ADDITIONAL EMPLOYEE LEAVE FEATURES
--------------------------------------------------------- */
router.get("/eligibility", authenticate, leaveController.checkLeaveEligibility);

router.get("/pending", authenticate, leaveController.getMyPendingLeaveRequests);

export default router;
