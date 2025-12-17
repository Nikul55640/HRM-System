import express from "express";
import { authenticate } from "../../middleware/authenticate.js";
import { requireRoles } from "../../middleware/requireRoles.js";
import attendanceController from "../../controllers/employee/attendance.controller.js";

const router = express.Router();

// GET attendance list
router.get(
  "/attendance",
  authenticate,
  attendanceController.getAttendanceRecords
);

// GET monthly summary
router.get(
  "/attendance/summary",
  authenticate,
  attendanceController.getMonthlySummary
);

// Export attendance (PDF/Excel)
router.get(
  "/attendance/export",
  authenticate,
  attendanceController.exportAttendanceReport
);

// Clock-in
router.post("/attendance/check-in", authenticate, attendanceController.checkIn);

// Clock-out
router.post(
  "/attendance/check-out",
  authenticate,
  attendanceController.checkOut
);

// ⭐ HR / Admin manual update
router.patch(
  "/attendance/manual/:recordId",
  authenticate,
  requireRoles(["HR Manager", "HR Administrator", "SuperAdmin"]),
  attendanceController.manualUpdateAttendance
);

export default router;
