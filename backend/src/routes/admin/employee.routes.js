import express from "express";
import employeeController from "../../controllers/admin/employee.controller.js";

import { authenticate } from "../../middleware/authenticate.js";
import { authorize, checkDepartmentAccess } from "../../middleware/authorize.js";
import { checkPermission, checkAnyPermission } from "../../middleware/checkPermission.js";
import { MODULES } from "../../config/rolePermissions.js";

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
   ============================================================ */

/* -----------------------------------
   CREATE EMPLOYEE
   Permission: EMPLOYEE.CREATE
   Roles: HR Manager, HR Admin, SuperAdmin
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
   UPDATE EMPLOYEE
   Permission: UPDATE_ANY or UPDATE_OWN
   Roles: HR Manager, HR Admin, SuperAdmin, or self
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
   DELETE EMPLOYEE (Soft Delete)
   Permission: EMPLOYEE.DELETE
   Roles: HR Admin, SuperAdmin only
----------------------------------- */
router.delete(
  "/:id",
  authenticate,
  checkPermission(MODULES.EMPLOYEE.DELETE),
  validateParams(employeeIdParamSchema),
  checkDepartmentAccess,
  employeeController.deleteEmployee
);

export default router;
