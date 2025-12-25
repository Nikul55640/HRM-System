import express from "express";
import { authenticate } from "../../middleware/authenticate.js";
import employeeCalendarController from "../../controllers/employee/employeeCalendar.controller.js";

const router = express.Router();

router.get("/daily", authenticate, employeeCalendarController.getDailyCalendar);
router.get("/monthly", authenticate, employeeCalendarController.getMonthlyCalendar);

export default router;
