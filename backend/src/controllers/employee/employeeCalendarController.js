import Attendance from "../../models/AttendanceRecord.js";
import LeaveRequest from "../../models/LeaveRequest.js";
import CompanyEvent from "../../models/CompanyEvent.js";
import Employee from "../../models/Employee.js";

/**
 * DAILY EMPLOYEE CALENDAR API
 * GET /api/calendar/daily?date=2025-02-05
 * Returns attendance + leave + events
 */
const getDailyCalendar = async (req, res) => {
  try {
    const { employeeId } = req.user;
    const { date } = req.query;

    if (!date) {
      return res.status(400).json({
        success: false,
        message: "Date is required (YYYY-MM-DD)",
      });
    }

    // Normalized start/end of the day
    const day = new Date(date);
    const start = new Date(day.setHours(0, 0, 0, 0));
    const end = new Date(day.setHours(23, 59, 59, 999));

    /* --------------------------------------------------
       1️⃣ FETCH ATTENDANCE
    -------------------------------------------------- */
    const attendance = await Attendance.findOne({
      employeeId,
      date: { $gte: start, $lte: end },
    });

    /* --------------------------------------------------
       2️⃣ FETCH LEAVE (approved + overlaps with date)
    -------------------------------------------------- */
    const leave = await LeaveRequest.findOne({
      employeeId,
      status: "approved",
      startDate: { $lte: end },
      endDate: { $gte: start },
    });

    /* --------------------------------------------------
       3️⃣ COMPANY EVENTS (holiday, meeting, etc.)
    -------------------------------------------------- */
    const events = await CompanyEvent.find({
      date: { $lte: end },
      endDate: { $gte: start },
    })
      .populate("employeeId", "personalInfo.firstName personalInfo.lastName")
      .lean();

    /* --------------------------------------------------
       4️⃣ HOLIDAY
    -------------------------------------------------- */
    const holiday = events.find((ev) => ev.type === "holiday") || null;

    /* --------------------------------------------------
       5️⃣ BIRTHDAY (already populated in model)
    -------------------------------------------------- */
    const birthday = events.find((ev) => ev.type === "birthday") || null;

    /* --------------------------------------------------
       6️⃣ WORK ANNIVERSARY
    -------------------------------------------------- */
    const anniversary = events.find((ev) => ev.type === "work_anniversary") || null;

    /* --------------------------------------------------
       7️⃣ FINAL RESPONSE
    -------------------------------------------------- */
    return res.json({
      success: true,
      date,
      data: {
        attendance: attendance || null,
        leave: leave || null,
        holiday,
        birthday,
        anniversary,
        events: events.filter(
          (ev) =>
            !["holiday", "birthday", "work_anniversary"].includes(ev.type)
        ),
      },
    });
  } catch (error) {
    console.error("Error fetching daily calendar:", error);
    return res.status(500).json({
      success: false,
      message: "Error fetching calendar",
      error: error.message,
    });
  }
};

/**
 * MONTHLY EMPLOYEE CALENDAR
 * GET /api/calendar/monthly?year=2025&month=2
 * Returns structured data for each day
 */
const getMonthlyCalendar = async (req, res) => {
  try {
    const { employeeId } = req.user;
    const { year, month } = req.query;

    if (!year || !month) {
      return res.status(400).json({
        success: false,
        message: "Year and month are required",
      });
    }

    const start = new Date(year, month - 1, 1);
    const end = new Date(year, month, 0, 23, 59, 59, 999);

    /* --------------------------------------------------
       FETCH ALL DATA IN RANGE
    -------------------------------------------------- */
    const [attendanceList, leaves, events] = await Promise.all([
      Attendance.find({
        employeeId,
        date: { $gte: start, $lte: end },
      }).lean(),

      LeaveRequest.find({
        employeeId,
        status: "approved",
        startDate: { $lte: end },
        endDate: { $gte: start },
      }).lean(),

      CompanyEvent.find({
        date: { $lte: end },
        endDate: { $gte: start },
      })
        .populate("employeeId", "personalInfo.firstName personalInfo.lastName")
        .lean(),
    ]);

    /* --------------------------------------------------
       BUILD DAY-BY-DAY STRUCTURE
    -------------------------------------------------- */
    const daysInMonth = new Date(year, month, 0).getDate();
    const calendar = {};

    for (let day = 1; day <= daysInMonth; day++) {
      const d = new Date(year, month - 1, day);

      const dayStart = new Date(d.setHours(0, 0, 0, 0));
      const dayEnd = new Date(d.setHours(23, 59, 59, 999));

      const attendance = attendanceList.find(
        (a) => new Date(a.date).toDateString() === dayStart.toDateString()
      );

      const leave = leaves.find(
        (l) => l.startDate <= dayEnd && l.endDate >= dayStart
      );

      const dayEvents = events.filter(
        (ev) => ev.date <= dayEnd && ev.endDate >= dayStart
      );

      calendar[day] = {
        date: `${year}-${month}-${day}`,
        attendance: attendance || null,
        leave: leave || null,
        holiday: dayEvents.find((e) => e.type === "holiday") || null,
        birthday: dayEvents.find((e) => e.type === "birthday") || null,
        anniversary: dayEvents.find((e) => e.type === "work_anniversary") || null,
        events: dayEvents.filter(
          (ev) =>
            !["holiday", "birthday", "work_anniversary"].includes(ev.type)
        ),
      };
    }

    return res.json({ success: true, month, year, calendar });
  } catch (error) {
    console.error("Monthly calendar error:", error);
    return res.status(500).json({
      success: false,
      message: "Error fetching calendar",
      error: error.message,
    });
  }
};

export default {
  getMonthlyCalendar,
  getdailyCalendar,
}