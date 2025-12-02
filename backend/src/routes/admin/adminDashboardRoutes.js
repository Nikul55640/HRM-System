import express from "express";
import adminDashboardController from "../../controllers/admin/adminDashboardController.js";
// ⛔️ NOTE: we still import these for the main route, not for /test
import { authenticate } from "../../middleware/authenticate.js";
import { authorize } from "../../middleware/authorize.js";

const router = express.Router();

/**
 * @route   GET /api/admin/dashboard
 * @desc    Admin dashboard statistics (PROTECTED)
 */
router.get(
  "/",
  authenticate,
  authorize("superadmin", "hr_manager", "hr_admin"),
  adminDashboardController.getDashboardStats
);

/**
 * @route   GET /api/admin/dashboard/test
 * @desc    Admin dashboard statistics (PUBLIC TEST - NO AUTH)
 */
router.get(
  "/test",
  // ❌ NO authenticate
  // ❌ NO authorize
  adminDashboardController.getDashboardStats
);

export default router;
