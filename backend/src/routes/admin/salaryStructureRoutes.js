import express from "express";
import {
  createOrUpdateSalaryStructure,
  getSalaryStructure,
  getAllSalaryStructures,
} from "../../controllers/admin/salaryStructureController.js";
import { authenticate, authorize } from "../../middleware/authenticate.js";

const router = express.Router();

router.use(authenticate);

// Admin / HR only
router.post(
  "/:employeeId",
  authorize("admin", "hr", "superadmin"),
  createOrUpdateSalaryStructure
);

router.get(
  "/employee/:employeeId",
  authorize("admin", "hr", "superadmin"),
  getSalaryStructure
);

router.get("/", authorize("admin", "hr", "superadmin"), getAllSalaryStructures);

export default router;
