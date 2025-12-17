import { CompanyEvent, Employee, LeaveRequest, AttendanceRecord, AuditLog } from "../models/sequelize/index.js";
import logger from "../utils/logger.js";

/**
 * -----------------------------------------------------
 * GET EVENTS (FULL CALENDAR)
 * Includes:
 * 1. Company Events (with recurrence expansion)
 * 2. Approved Leave Requests
 * 3. Attendance Records (optional)
 * -----------------------------------------------------
 * GET /api/calendar/events
 */
 const getEvents = async (req, res) => {
  try {
    const {
      startDate,
      endDate,
      type,
      departmentId,
      includeAttendance = false,
    } = req.query;

    if (!startDate || !endDate) {
      return res.status(400).json({
        success: false,
        message: "Start date and end date are required",
      });
    }

    const start = new Date(startDate);
    const end = new Date(endDate);

    /* -----------------------------------------------------
       1. FILTERS FOR EVENTS
    ----------------------------------------------------- */
    const filters = {};
    if (type) filters.type = type;
    if (departmentId) filters.departments = departmentId;

    /* -----------------------------------------------------
       2. GET COMPANY EVENTS (including recurrence expanded)
    ----------------------------------------------------- */
    const events = await CompanyEvent.getEventsInRange(start, end, filters);

    /* -----------------------------------------------------
       3. GET APPROVED LEAVE REQUESTS IN RANGE
    ----------------------------------------------------- */
    const leaves = await LeaveRequest.find({
      startDate: { $lte: end },
      endDate: { $gte: start },
      status: "approved",
    }).populate(
      "employeeId",
      "employeeId personalInfo.firstName personalInfo.lastName"
    );

    const leaveEvents = leaves.map((leave) => ({
      _id: `leave-${leave._id}`,
      title: `${leave.employeeId.personalInfo.firstName} ${leave.employeeId.personalInfo.lastName} - ${leave.type} Leave`,
      type: "leave",
      date: leave.startDate,
      endDate: leave.endDate,
      isAllDay: true,
      color: "#f59e0b",
      employee: leave.employeeId,
    }));

    /* -----------------------------------------------------
       4. ATTENDANCE (optional)
    ----------------------------------------------------- */
    let attendanceEvents = [];

    if (includeAttendance === "true") {
      const attendance = await AttendanceRecord.findAll({
        where: {
          date: { [AttendanceRecord.sequelize.Sequelize.Op.between]: [start, end] },
        },
        include: [
          {
            model: Employee,
            as: 'employee',
            attributes: ['employeeId', 'personalInfo'],
          },
        ],
      });

      attendanceEvents = attendance.map((a) => ({
        _id: `att-${a.id}`,
        type: "attendance",
        title: `${a.employee.personalInfo.firstName} ${a.employee.personalInfo.lastName} - ${a.status}`,
        date: a.date,
        isAllDay: false,
        checkIn: a.checkIn,
        checkOut: a.checkOut,
        color: a.status === "Present" ? "#10b981" : "#ef4444",
        employee: a.employeeId,
      }));
    }

    /* -----------------------------------------------------
       5. FINAL RESPONSE
    ----------------------------------------------------- */
    res.json({
      success: true,
      data: [...events, ...leaveEvents, ...attendanceEvents],
    });
  } catch (error) {
    logger.error("Error fetching calendar events:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching calendar events",
      error: error.message,
    });
  }
};

/**
 * -----------------------------------------------------
 * GET UPCOMING EVENTS
 * -----------------------------------------------------
 */
const getUpcomingEvents = async (req, res) => {
  try {
    const { limit = 10 } = req.query;
    const events = await CompanyEvent.getUpcomingEvents(parseInt(limit));

    res.json({ success: true, data: events });
  } catch (error) {
    logger.error("Error fetching upcoming events:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching upcoming events",
      error: error.message,
    });
  }
};

/**
 * -----------------------------------------------------
 * CREATE EVENT
 * -----------------------------------------------------
 */
const createEvent = async (req, res) => {
  try {
    const eventData = { ...req.body, createdBy: req.user._id };

    const event = new CompanyEvent(eventData);
    await event.save();

    await AuditLog.logAction({
      action: "CREATE",
      entityType: "CompanyEvent",
      entityId: event._id,
      userId: req.user._id,
      userRole: req.user.role,
      changes: [{ field: "event", oldValue: null, newValue: event.title }],
      ipAddress: req.ip,
      userAgent: req.get("user-agent"),
    });

    res.status(201).json({
      success: true,
      data: event,
      message: "Event created successfully",
    });
  } catch (error) {
    logger.error("Error creating event:", error);
    res.status(500).json({
      success: false,
      message: "Error creating event",
      error: error.message,
    });
  }
};

/**
 * -----------------------------------------------------
 * UPDATE EVENT
 * -----------------------------------------------------
 */
 const updateEvent = async (req, res) => {
  try {
    const { id } = req.params;

    const updateData = {
      ...req.body,
      updatedBy: req.user._id,
    };

    const event = await CompanyEvent.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    });

    if (!event) {
      return res.status(404).json({
        success: false,
        message: "Event not found",
      });
    }

    await AuditLog.logAction({
      action: "UPDATE",
      entityType: "CompanyEvent",
      entityId: event._id,
      userId: req.user._id,
      userRole: req.user.role,
      changes: Object.keys(req.body).map((key) => ({
        field: key,
        oldValue: null,
        newValue: req.body[key],
      })),
      ipAddress: req.ip,
      userAgent: req.get("user-agent"),
    });

    res.json({
      success: true,
      data: event,
      message: "Event updated successfully",
    });
  } catch (error) {
    logger.error("Error updating event:", error);
    res.status(500).json({
      success: false,
      message: "Error updating event",
      error: error.message,
    });
  }
};

/**
 * -----------------------------------------------------
 * DELETE EVENT
 * -----------------------------------------------------
 */
const deleteEvent = async (req, res) => {
  try {
    const { id } = req.params;

    const event = await CompanyEvent.findByIdAndDelete(id);

    if (!event) {
      return res.status(404).json({
        success: false,
        message: "Event not found",
      });
    }

    await AuditLog.logAction({
      action: "DELETE",
      entityType: "CompanyEvent",
      entityId: event._id,
      userId: req.user._id,
      userRole: req.user.role,
      changes: [{ field: "event", oldValue: event.title, newValue: null }],
      ipAddress: req.ip,
      userAgent: req.get("user-agent"),
    });

    res.json({
      success: true,
      message: "Event deleted successfully",
    });
  } catch (error) {
    logger.error("Error deleting event:", error);
    res.status(500).json({
      success: false,
      message: "Error deleting event",
      error: error.message,
    });
  }
};

/**
 * -----------------------------------------------------
 * SYNC BIRTHDAYS & WORK ANNIVERSARIES
 * -----------------------------------------------------
 */
const syncEmployeeEvents = async (req, res) => {
  try {
    const employees = await Employee.find({ status: "active" });
    const currentYear = new Date().getFullYear();

    let birthdaysCreated = 0;
    let anniversariesCreated = 0;

    for (const employee of employees) {
      /* -----------------------------------------------------
         BIRTHDAY
      ----------------------------------------------------- */
      if (employee.personalInfo.dateOfBirth) {
        const dob = new Date(employee.personalInfo.dateOfBirth);
        const birthday = new Date(currentYear, dob.getMonth(), dob.getDate());

        const exists = await CompanyEvent.findOne({
          type: "birthday",
          employeeId: employee._id,
          date: birthday,
        });

        if (!exists) {
          await CompanyEvent.create({
            title: `${employee.personalInfo.firstName} ${employee.personalInfo.lastName}'s Birthday`,
            type: "birthday",
            date: birthday,
            employeeId: employee._id,
            isAllDay: true,
            isRecurring: true,
            recurrencePattern: "yearly",
            createdBy: req.user._id,
          });
          birthdaysCreated++;
        }
      }

      /* -----------------------------------------------------
         WORK ANNIVERSARY
      ----------------------------------------------------- */
      if (employee.jobInfo.joiningDate) {
        const joiningDate = new Date(employee.jobInfo.joiningDate);
        const anniversary = new Date(
          currentYear,
          joiningDate.getMonth(),
          joiningDate.getDate()
        );

        if (joiningDate < new Date()) {
          const exists = await CompanyEvent.findOne({
            type: "work_anniversary",
            employeeId: employee._id,
            date: anniversary,
          });

          if (!exists) {
            const years = currentYear - joiningDate.getFullYear();
            await CompanyEvent.create({
              title: `${employee.personalInfo.firstName} ${employee.personalInfo.lastName} – ${years} Year${
                years > 1 ? "s" : ""
              } Anniversary`,
              type: "work_anniversary",
              date: anniversary,
              isRecurring: true,
              recurrencePattern: "yearly",
              employeeId: employee._id,
              isAllDay: true,
              createdBy: req.user._id,
            });
            anniversariesCreated++;
          }
        }
      }
    }

    res.json({
      success: true,
      message: "Employee events synced successfully",
      data: { birthdaysCreated, anniversariesCreated },
    });
  } catch (error) {
    logger.error("Error syncing employee events:", error);
    res.status(500).json({
      success: false,
      message: "Error syncing employee events",
      error: error.message,
    });
  }
};

export default {
  getEvents,
  getUpcomingEvents,
  syncEmployeeEvents,
deleteEvent,
  createEvent,
  updateEvent,
};