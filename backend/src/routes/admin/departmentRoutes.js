import express from "express";
import departmentController from "../../controllers/admin/departmentController.js";
import {authenticate} from "../../middleware/authenticate.js";
import { authorize } from "../../middleware/authorize.js";

const router = express.Router();

// Allowed roles
const ADMIN_ROLES = ["SuperAdmin", "HR Manager"];
const READ_ROLES = ["SuperAdmin", "HR Manager", "HR Administrator"];

// --------------------------------------
// CREATE DEPARTMENT
// --------------------------------------
router.post(
  "/",
  authenticate,
  authorize(ADMIN_ROLES),
  departmentController.createDepartment
);

// --------------------------------------
// UPDATE DEPARTMENT
// --------------------------------------
router.put(
  "/:id",
  authenticate,
  authorize(ADMIN_ROLES),
  departmentController.updateDepartment
);

// --------------------------------------
// DELETE (SOFT DELETE)
// --------------------------------------
router.delete(
  "/:id",
  authenticate,
  authorize(ADMIN_ROLES),
  departmentController.deleteDepartment
);

// --------------------------------------
// GET ALL DEPARTMENTS (LIST)
// --------------------------------------
router.get(
  "/",
  authenticate,
  authorize(READ_ROLES),
  departmentController.getDepartments
);

// --------------------------------------
// GET DEPARTMENT BY ID
// --------------------------------------
router.get(
  "/:id",
  authenticate,
  authorize(READ_ROLES),
  departmentController.getDepartmentById
);

// --------------------------------------
// HIERARCHY TREE
// --------------------------------------
router.get(
  "/:id/hierarchy",
  authenticate,
  authorize(READ_ROLES),
  departmentController.getDepartmentHierarchy
);

// --------------------------------------
// SEARCH DEPARTMENTS
// --------------------------------------
router.get(
  "/search/query",
  authenticate,
  authorize(READ_ROLES),
  departmentController.searchDepartments
);

export default router;
