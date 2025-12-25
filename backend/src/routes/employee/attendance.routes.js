import express from "express";
import { authenticate } from "../../middleware/authenticate.js";
import attendanceController from "../../controllers/employee/attendance.controller.js";

const router = express.Router();

// GET attendance list
router.get(
  "/attendance",
  authenticate,
  attendanceController.getMyAttendanceRecords
);

// GET today's attendance status
router.get(
  "/attendance/today",
  authenticate,
  attendanceController.getTodayAttendance
);

// GET attendance status for specific date
router.get(
  "/attendance/status",
  authenticate,
  attendanceController.getAttendanceStatus
);

// GET monthly summary
router.get(
  "/attendance/summary/:year/:month",
  authenticate,
  attendanceController.getMyMonthlySummary
);

// GET working hours
router.get(
  "/attendance/working-hours",
  authenticate,
  attendanceController.getWorkingHours
);

// Clock-in
router.post("/attendance/clock-in", authenticate, attendanceController.clockIn);

// Clock-out
router.post("/attendance/clock-out", authenticate, attendanceController.clockOut);

// Start break
router.post("/attendance/break-in", authenticate, attendanceController.startBreak);

// End break
router.post("/attendance/break-out", authenticate, attendanceController.endBreak);

// Request attendance correction
router.post(
  "/attendance/correction/:attendanceId",
  authenticate,
  attendanceController.requestCorrection
);

export default router;
