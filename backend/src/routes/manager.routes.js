  import express from "express";
import managerController from "../controllers/manager/manager.controller.js";
import { authenticate } from "../middleware/authenticate.js";
  import { checkPermission } from "../middleware/checkPermission.js";
import { MODULES } from "../config/rolePermissions.js";

const router = express.Router();

/**
 * MANAGER ROUTES
 * All routes require authentication and MANAGER role
 * 
 * Manager has access to:
 * - Team view (employees assigned to them)
 * - Leave approvals for team
 * - Attendance correction approvals for team
 * - Team reports and analytics
 */

/* ============================================================
   DASHBOARD & OVERVIEW
   ============================================================ */

/**
 * GET /api/manager/dashboard
 * Get manager's dashboard with team stats and pending items
 * Permission: All managers
 */
router.get(
  "/dashboard",
  authenticate,
  managerController.getDashboard
);

/* ============================================================
   TEAM MANAGEMENT
   ============================================================ */

/**
 * GET /api/manager/team
 * Get list of employees under manager
 * Permission: VIEW_TEAM
 */
router.get(
  "/team",
  authenticate,
  checkPermission(MODULES.EMPLOYEE.VIEW_TEAM),
  managerController.getTeam
);

/**
 * GET /api/manager/team/:employeeId
 * Get specific team member details
 * Permission: VIEW_TEAM
 */
router.get(
  "/team/:employeeId",
  authenticate,
  checkPermission(MODULES.EMPLOYEE.VIEW_TEAM),
  managerController.getTeamMember
);

/**
 * GET /api/manager/team-stats
 * Get team performance statistics
 * Permission: VIEW_TEAM
 */
router.get(
  "/team-stats",
  authenticate,
  checkPermission(MODULES.EMPLOYEE.VIEW_TEAM),
  managerController.getTeamStats
);

/* ============================================================
   TEAM ATTENDANCE
   ============================================================ */

/**
 * GET /api/manager/team-attendance
 * Get team attendance records
 * Query params: fromDate, toDate (optional)
 * Permission: ATTENDANCE.VIEW_TEAM
 */
router.get(
  "/team-attendance",
  authenticate,
  checkPermission(MODULES.ATTENDANCE.VIEW_TEAM),
  managerController.getTeamAttendance
);

/* ============================================================
   LEAVE MANAGEMENT - APPROVALS
   ============================================================ */

/**
 * GET /api/manager/leave-requests
 * Get leave requests from team
 * Query params: status (Pending, Approved, Rejected)
 * Permission: LEAVE.APPROVE_TEAM
 */
router.get(
  "/leave-requests",
  authenticate,
  checkPermission(MODULES.LEAVE.APPROVE_TEAM),
  managerController.getLeaveRequests
);

/**
 * PUT /api/manager/leave-requests/:id/approve
 * Approve a leave request
 * Body: { comment?: string }
 * Permission: LEAVE.APPROVE_TEAM
 */
router.put(
  "/leave-requests/:id/approve",
  authenticate,
  checkPermission(MODULES.LEAVE.APPROVE_TEAM),
  managerController.approveLeaveRequest
);

/**
 * PUT /api/manager/leave-requests/:id/reject
 * Reject a leave request
 * Body: { reason?: string }
 * Permission: LEAVE.APPROVE_TEAM
 */
router.put(
  "/leave-requests/:id/reject",
  authenticate,
  checkPermission(MODULES.LEAVE.APPROVE_TEAM),
  managerController.rejectLeaveRequest
);

/* ============================================================
   ATTENDANCE CORRECTIONS - APPROVALS
   ============================================================ */

/**
 * GET /api/manager/attendance-corrections
 * Get attendance correction requests from team
 * Query params: status (Pending, Approved, Rejected)
 * Permission: ATTENDANCE.APPROVE_CORRECTION
 */
router.get(
  "/attendance-corrections",
  authenticate,
  checkPermission(MODULES.ATTENDANCE.APPROVE_CORRECTION),
  managerController.getAttendanceCorrections
);

/**
 * PUT /api/manager/attendance-corrections/:id/approve
 * Approve an attendance correction request
 * Body: { comment?: string }
 * Permission: ATTENDANCE.APPROVE_CORRECTION
 */
router.put(
  "/attendance-corrections/:id/approve",
  authenticate,
  checkPermission(MODULES.ATTENDANCE.APPROVE_CORRECTION),
  managerController.approveAttendanceCorrection
);

/**
 * PUT /api/manager/attendance-corrections/:id/reject
 * Reject an attendance correction request
 * Body: { reason?: string }
 * Permission: ATTENDANCE.APPROVE_CORRECTION
 */
router.put(
  "/attendance-corrections/:id/reject",
  authenticate,
  checkPermission(MODULES.ATTENDANCE.APPROVE_CORRECTION),
  managerController.rejectAttendanceCorrection
);

/* ============================================================
   REPORTS
   ============================================================ */

/**
 * GET /api/manager/reports/attendance
 * Get team attendance report
 * Query params: month, year (optional)
 * Permission: ATTENDANCE.VIEW_TEAM
 */
router.get(
  "/reports/attendance",
  authenticate,
  checkPermission(MODULES.ATTENDANCE.VIEW_TEAM),
  managerController.getAttendanceReport
);

/**
 * GET /api/manager/reports/leave
 * Get team leave report
 * Query params: month, year (optional)
 * Permission: LEAVE.VIEW_TEAM
 */
router.get(
  "/reports/leave",
  authenticate,
  checkPermission(MODULES.LEAVE.VIEW_TEAM),
  managerController.getLeaveReport
);

export default router;
