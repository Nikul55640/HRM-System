import express from "express";
import employeeController from "../../controllers/admin/employee.controller.js";

import { authenticate } from "../../middleware/authenticate.js";
import { authorize, checkDepartmentAccess } from "../../middleware/authorize.js";
import { checkPermission, checkAnyPermission } from "../../middleware/checkPermission.js";
import { MODULES } from "../../config/rolePermissions.js";
import { upload } from "../../middleware/upload.js";

import {
  validate,
  validateQuery,
  validateParams,
  createEmployeeSchema,
  updateEmployeeSchema,
  selfUpdateEmployeeSchema,
  searchEmployeeSchema,
  employeeIdParamSchema,
} from "../../validators/employeeValidator.js";

const router = express.Router();

/* ============================================================
   EMPLOYEE ROUTES — FULL RBAC + VALIDATION + FILTERS
   Updated for restructured Employee model
   ============================================================ */

/* -----------------------------------
   CREATE EMPLOYEE
   Permission: EMPLOYEE.CREATE
   Roles: HR, SuperAdmin
----------------------------------- */
router.post(
  "/",
  authenticate,
  checkPermission(MODULES.EMPLOYEE.CREATE),
  validate(createEmployeeSchema),
  employeeController.createEmployee
);

/* -----------------------------------
   LIST EMPLOYEES (with filters)
   Permission: VIEW_OWN, VIEW_TEAM, or VIEW_ALL
   Roles: All authenticated users (filtered by role)
----------------------------------- */
router.get(
  "/",
  authenticate,
  checkAnyPermission([
    MODULES.EMPLOYEE.VIEW_OWN,
    MODULES.EMPLOYEE.VIEW_TEAM,
    MODULES.EMPLOYEE.VIEW_ALL,
  ]),
  validateQuery(searchEmployeeSchema),
  employeeController.getEmployees
);

/* -----------------------------------
   SEARCH EMPLOYEES
   Permission: VIEW_OWN, VIEW_TEAM, or VIEW_ALL
   Roles: All authenticated users (filtered by role)
----------------------------------- */
router.get(
  "/search",
  authenticate,
  checkAnyPermission([
    MODULES.EMPLOYEE.VIEW_OWN,
    MODULES.EMPLOYEE.VIEW_TEAM,
    MODULES.EMPLOYEE.VIEW_ALL,
  ]),
  validateQuery(searchEmployeeSchema),
  employeeController.searchEmployees
);

/* -----------------------------------
   EMPLOYEE DIRECTORY
----------------------------------- */
router.get("/directory", authenticate, employeeController.getEmployeeDirectory);

/* -----------------------------------
   GET CURRENT EMPLOYEE (SELF)
----------------------------------- */
router.get("/me", authenticate, employeeController.getCurrentEmployee);

/* -----------------------------------
   GET EMPLOYEE FULL PROFILE
----------------------------------- */
router.get(
  "/:id/profile",
  authenticate,
  validateParams(employeeIdParamSchema),
  employeeController.getEmployeeFullProfile
);

/* -----------------------------------
   GET EMPLOYEE REPORTING STRUCTURE
----------------------------------- */
router.get(
  "/:id/reporting-structure",
  authenticate,
  validateParams(employeeIdParamSchema),
  employeeController.getReportingStructure
);

/* -----------------------------------
   GET EMPLOYEE BY ID
----------------------------------- */
router.get(
  "/:id",
  authenticate,
  validateParams(employeeIdParamSchema),
  employeeController.getEmployeeById
);

/* -----------------------------------
   SELF-UPDATE EMPLOYEE
----------------------------------- */
router.patch(
  "/:id/self-update",
  authenticate,
  validateParams(employeeIdParamSchema),
  validate(selfUpdateEmployeeSchema),
  employeeController.selfUpdateEmployee
);

/* -----------------------------------
   UPDATE PROFILE PICTURE
----------------------------------- */
router.patch(
  "/:id/profile-picture",
  authenticate,
  validateParams(employeeIdParamSchema),
  upload.single('profilePicture'),
  employeeController.updateProfilePicture
);

/* -----------------------------------
   UPDATE EMERGENCY CONTACT
----------------------------------- */
router.patch(
  "/:id/emergency-contact",
  authenticate,
  validateParams(employeeIdParamSchema),
  employeeController.updateEmergencyContact
);

/* -----------------------------------
   UPDATE BANK DETAILS
----------------------------------- */
router.patch(
  "/:id/bank-details",
  authenticate,
  validateParams(employeeIdParamSchema),
  employeeController.updateBankDetails
);

/* -----------------------------------
   VERIFY BANK DETAILS (HR & SuperAdmin only)
----------------------------------- */
router.patch(
  "/:id/verify-bank-details",
  authenticate,
  checkAnyPermission([
    MODULES.EMPLOYEE.UPDATE_ANY,
  ]),
  validateParams(employeeIdParamSchema),
  employeeController.verifyBankDetails
);

/* -----------------------------------
   UPDATE EMPLOYEE
   Permission: UPDATE_ANY or UPDATE_OWN
   Roles: HR, SuperAdmin, or self
----------------------------------- */
router.put(
  "/:id",
  authenticate,
  checkAnyPermission([
    MODULES.EMPLOYEE.UPDATE_ANY,
    MODULES.EMPLOYEE.UPDATE_OWN,
  ]),
  validateParams(employeeIdParamSchema),
  checkDepartmentAccess,
  validate(updateEmployeeSchema),
  employeeController.updateEmployee
);

/* -----------------------------------
   TOGGLE EMPLOYEE STATUS (SuperAdmin only)
   Permission: EMPLOYEE.DELETE
   Roles: SuperAdmin only
----------------------------------- */
router.patch(
  "/:id/status",
  authenticate,
  checkPermission(MODULES.EMPLOYEE.DELETE),
  validateParams(employeeIdParamSchema),
  employeeController.toggleEmployeeStatus
);

/* -----------------------------------
   ASSIGN ROLE (SuperAdmin only)
   Permission: EMPLOYEE.DELETE
   Roles: SuperAdmin only
----------------------------------- */
router.patch(
  "/:id/role",
  authenticate,
  checkPermission(MODULES.EMPLOYEE.DELETE),
  validateParams(employeeIdParamSchema),
  employeeController.assignRole
);

export default router;
