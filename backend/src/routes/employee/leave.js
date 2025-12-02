import express from "express";
import { authenticate } from "../../middleware/authenticate.js";

import leaveController from "../../controllers/employee/leaveController.js";
import leaveRequestController from "../../controllers/employee/leaveRequestController.js";

const router = express.Router();

/* ---------------------------------------------------------
   EMPLOYEE LEAVE BALANCE & HISTORY
--------------------------------------------------------- */
router.get("/leave-balance", authenticate, leaveController.getLeaveBalance);

router.get("/leave-history", authenticate, leaveController.getLeaveHistory);

router.get(
  "/leave-balance/export",
  authenticate,
  leaveController.exportLeaveSummary
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
  leaveRequestController.getLeaveRequests
);

router.get(
  "/leave-requests/:id",
  authenticate,
  leaveRequestController.getLeaveRequest
);

router.delete(
  "/leave-requests/:id",
  authenticate,
  leaveRequestController.cancelLeaveRequest
);

export default router;
