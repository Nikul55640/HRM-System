import express from "express";
import { authenticate } from "../../middleware/authenticate.js";
import employeeCalendarController from "../../controllers/employee/employeeCalendar.controller.js";

const router = express.Router();

// Root calendar endpoint for API testing
router.get("/", authenticate, async (req, res) => {
  try {
    res.json({
      success: true,
      message: "Employee calendar API is available",
      endpoints: [
        "GET /employee/calendar/daily - Get daily calendar",
        "GET /employee/calendar/monthly - Get monthly calendar"
      ]
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Calendar API error",
      error: error.message
    });
  }
});

router.get("/daily", authenticate, employeeCalendarController.getDailyCalendar);
router.get("/monthly", authenticate, employeeCalendarController.getMonthlyCalendar);

export default router;
