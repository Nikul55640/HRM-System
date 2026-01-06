import express from "express";
import adminDashboardController from "../../controllers/admin/adminDashboard.Controller.js";
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
  authorize(["SuperAdmin", "HR", "HR"]),
  adminDashboardController.getDashboardStats
);

export default router;
