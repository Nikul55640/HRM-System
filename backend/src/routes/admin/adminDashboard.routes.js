import express from "express";
import adminDashboardController from "../../controllers/admin/adminDashboard.Controller.js";
import { authenticate } from "../../middleware/authenticate.js";
import { authorize } from "../../middleware/authorize.js";
import { ROLES } from "../../config/roles.js";

const router = express.Router();

/**
 * @route   GET /api/admin/dashboard
 * @desc    Admin dashboard statistics (PROTECTED)
 */
router.get(
  "/",
  authenticate,
  authorize([ROLES.SUPER_ADMIN, ROLES.HR_ADMIN, ROLES.HR_MANAGER]),
  adminDashboardController.getDashboardStats
);

export default router;
