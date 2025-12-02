import express from "express";
import employeeController from "../controllers/employeeController.js";

import { authenticate } from "../middleware/authenticate.js";
import { authorize, checkDepartmentAccess } from "../middleware/authorize.js";

import {
  validate,
  validateQuery,
  validateParams,
  createEmployeeSchema,
  updateEmployeeSchema,
  selfUpdateEmployeeSchema,
  searchEmployeeSchema,
  employeeIdParamSchema,
} from "../validators/employeeValidator.js";

const router = express.Router();

/* ============================================================
   EMPLOYEE ROUTES — FULL RBAC + VALIDATION + FILTERS
   ============================================================ */

/* -----------------------------------
   CREATE EMPLOYEE
----------------------------------- */
router.post(
  "/",
  authenticate,
  authorize("HR Administrator", "HR Manager", "SuperAdmin"),
  validate(createEmployeeSchema),
  employeeController.createEmployee
);

/* -----------------------------------
   LIST EMPLOYEES (with filters)
----------------------------------- */
router.get(
  "/",
  authenticate,
  validateQuery(searchEmployeeSchema),
  employeeController.getEmployees
);

/* -----------------------------------
   SEARCH EMPLOYEES
----------------------------------- */
router.get(
  "/search",
  authenticate,
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
----------------------------------- */
router.put(
  "/:id",
  authenticate,
  authorize("HR Administrator", "HR Manager", "SuperAdmin"),
  validateParams(employeeIdParamSchema),
  checkDepartmentAccess,
  validate(updateEmployeeSchema),
  employeeController.updateEmployee
);

/* -----------------------------------
   DELETE EMPLOYEE (Soft Delete)
----------------------------------- */
router.delete(
  "/:id",
  authenticate,
  authorize("HR Administrator", "HR Manager", "SuperAdmin"),
  validateParams(employeeIdParamSchema),
  checkDepartmentAccess,
  employeeController.deleteEmployee
);

export default router;
