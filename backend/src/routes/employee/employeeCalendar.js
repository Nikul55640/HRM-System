import express from "express";
import { authenticate } from "../../middleware/authenticate.js";
import {
  getDailyCalendar,
  getMonthlyCalendar
} from "../../controllers/calendar/employeeDailyCalendarController.js";

const router = express.Router();

router.get("/daily", authenticate, getDailyCalendar);
router.get("/monthly", authenticate, getMonthlyCalendar);

export default router;
