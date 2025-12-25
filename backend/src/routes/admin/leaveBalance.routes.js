import express from "express";
import leaveBalanceController from "../../controllers/admin/leaveBalance.controller.js";

import { authenticate } from "../../middleware/authenticate.js";
import { checkPermission, checkAnyPermission } from "../../middleware/checkPermission.js";
import { MODULES } from "../../config/rolePermissions.js";

const router = express.Router();

/* ============================================================
   LEAVE BALANCE ROUTES — HR & SUPERADMIN
   Manages leave balance assignment and tracking
   ============================================================ */

/* -----------------------------------
   ASSIGN LEAVE BALANCES (BULK)
   Permission: HR & SuperAdmin
----------------------------------- */
router.post(
    "/assign",
    authenticate,
    checkAnyPermission([
        MODULES.LEAVE.MANAGE_BALANCES,
        MODULES.LEAVE.ASSIGN_BALANCES
    ]),
    leaveBalanceController.assignLeaveBalances
);

/* -----------------------------------
   BULK ASSIGN DEFAULT QUOTAS
   Permission: SuperAdmin only
----------------------------------- */
router.post(
    "/bulk-assign-defaults",
    authenticate,
    checkPermission(MODULES.LEAVE.MANAGE_BALANCES),
    leaveBalanceController.bulkAssignDefaultQuotas
);

/* -----------------------------------
   GET ALL EMPLOYEES LEAVE BALANCES
   Permission: HR & SuperAdmin
----------------------------------- */
router.get(
    "/all-employees",
    authenticate,
    checkAnyPermission([
        MODULES.LEAVE.VIEW_ALL_BALANCES,
        MODULES.LEAVE.MANAGE_BALANCES
    ]),
    leaveBalanceController.getAllEmployeesLeaveBalances
);

/* -----------------------------------
   GET LEAVE UTILIZATION REPORT
   Permission: HR & SuperAdmin
----------------------------------- */
router.get(
    "/utilization-report",
    authenticate,
    checkAnyPermission([
        MODULES.LEAVE.VIEW_ALL_BALANCES,
        MODULES.LEAVE.MANAGE_BALANCES
    ]),
    leaveBalanceController.getLeaveUtilizationReport
);

/* -----------------------------------
   GET EMPLOYEE LEAVE BALANCES
   Permission: HR, SuperAdmin, or own employee
----------------------------------- */
router.get(
    "/employee/:employeeId",
    authenticate,
    checkAnyPermission([
        MODULES.LEAVE.VIEW_ALL_BALANCES,
        MODULES.LEAVE.VIEW_OWN_BALANCE
    ]),
    leaveBalanceController.getEmployeeLeaveBalances
);

/* -----------------------------------
   GET EMPLOYEE LEAVE BALANCE HISTORY
   Permission: HR, SuperAdmin, or own employee
----------------------------------- */
router.get(
    "/employee/:employeeId/history",
    authenticate,
    checkAnyPermission([
        MODULES.LEAVE.VIEW_ALL_BALANCES,
        MODULES.LEAVE.VIEW_OWN_BALANCE
    ]),
    leaveBalanceController.getLeaveBalanceHistory
);

/* -----------------------------------
   ASSIGN SINGLE EMPLOYEE QUOTA
   Permission: HR & SuperAdmin
----------------------------------- */
router.post(
    "/employee/:employeeId/assign",
    authenticate,
    checkAnyPermission([
        MODULES.LEAVE.MANAGE_BALANCES,
        MODULES.LEAVE.ASSIGN_BALANCES
    ]),
    leaveBalanceController.assignSingleEmployeeQuota
);

/* -----------------------------------
   ADJUST LEAVE BALANCE MANUALLY
   Permission: HR & SuperAdmin
----------------------------------- */
router.patch(
    "/:id/adjust",
    authenticate,
    checkPermission(MODULES.LEAVE.MANAGE_BALANCES),
    leaveBalanceController.adjustLeaveBalance
);

export default router;