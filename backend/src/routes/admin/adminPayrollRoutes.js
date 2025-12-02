import express from "express";
import { authenticate, authorize } from "../../middleware/authenticate.js";

import {
  generatePayslip,
  generatePayslipsForAll,
  publishPayslip,
} from "../../controllers/admin/payslipAdminnController.js";

const router = express.Router();

// Must be admin, hr or superadmin
router.use(authenticate, authorize("admin", "hr", "superadmin"));

// Generate payslip for 1 employee
router.post("/generate", generatePayslip);

// Generate for all employees
router.post("/generate-all", generatePayslipsForAll);

// Publish payslip
router.put("/publish/:id", publishPayslip);

export default router;
