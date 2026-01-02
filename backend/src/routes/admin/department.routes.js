import express from "express";
import departmentController from "../../controllers/admin/department.controller.js";
import { authenticate } from "../../middleware/authenticate.js";
import { checkPermission } from "../../middleware/checkPermission.js";
import { MODULES } from "../../config/rolePermissions.js";

const router = express.Router();

// --------------------------------------
// CREATE DEPARTMENT
// Permission: DEPARTMENT.CREATE
// Roles: HR Admin, SuperAdmin
// --------------------------------------
router.post(
  "/",
  authenticate,
  checkPermission(MODULES.DEPARTMENT.CREATE),
  departmentController.createDepartment
);

// --------------------------------------
// UPDATE DEPARTMENT
// Permission: DEPARTMENT.UPDATE
// Roles: HR Admin, SuperAdmin
// --------------------------------------
router.put(
  "/:id",
  authenticate,
  checkPermission(MODULES.DEPARTMENT.UPDATE),
  departmentController.updateDepartment
);

// --------------------------------------
// DELETE (SOFT DELETE)
// Permission: DEPARTMENT.DELETE
// Roles: SuperAdmin only
// --------------------------------------
router.delete(
  "/:id",
  authenticate,
  checkPermission(MODULES.DEPARTMENT.DELETE),
  departmentController.deleteDepartment
);

// --------------------------------------
// GET DEPARTMENT HIERARCHY (TREE)
// Permission: DEPARTMENT.VIEW
// Roles: All authenticated users
// --------------------------------------
router.get(
  "/hierarchy",
  authenticate,
  checkPermission(MODULES.DEPARTMENT.VIEW),
  departmentController.getDepartmentHierarchy
);

// --------------------------------------
// GET ALL DEPARTMENTS (LIST)
// Permission: DEPARTMENT.VIEW
// Roles: All authenticated users
// --------------------------------------
router.get(
  "/",
  authenticate,
  checkPermission(MODULES.DEPARTMENT.VIEW),
  departmentController.getDepartments
);

// --------------------------------------
// GET DEPARTMENT BY ID
// Permission: DEPARTMENT.VIEW
// Roles: All authenticated users
// --------------------------------------
router.get(
  "/:id",
  authenticate,
  checkPermission(MODULES.DEPARTMENT.VIEW),
  departmentController.getDepartmentById
);

// --------------------------------------
// HIERARCHY TREE
// Permission: DEPARTMENT.VIEW
// Roles: All authenticated users
// --------------------------------------
router.get(
  "/:id/hierarchy",
  authenticate,
  checkPermission(MODULES.DEPARTMENT.VIEW),
  departmentController.getDepartmentHierarchy
);

// --------------------------------------
// SEARCH DEPARTMENTS
// Permission: DEPARTMENT.VIEW
// Roles: All authenticated users
// --------------------------------------
router.get(
  "/search/query",
  authenticate,
  checkPermission(MODULES.DEPARTMENT.VIEW),
  departmentController.searchDepartments
);

// --------------------------------------
// TOGGLE DEPARTMENT STATUS (ACTIVATE/DEACTIVATE)
// Permission: DEPARTMENT.UPDATE
// Roles: HR Admin, SuperAdmin
// --------------------------------------
router.patch(
  "/:id/toggle-status",
  authenticate,
  checkPermission(MODULES.DEPARTMENT.UPDATE),
  departmentController.toggleDepartmentStatus
);

export default router;
