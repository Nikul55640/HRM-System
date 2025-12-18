import { CompanyEvent, Employee, LeaveRequest, AttendanceRecord, AuditLog, Holiday } from "../models/sequelize/index.js";
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

/**
 * -----------------------------------------------------
 * GET HOLIDAYS
 * -----------------------------------------------------
 */
const getHolidays = async (req, res) => {
  try {
    const { year } = req.query;
    
    const filters = {};
    if (year) {
      const startDate = new Date(year, 0, 1);
      const endDate = new Date(year, 11, 31, 23, 59, 59);
      filters.date = {
        [Holiday.sequelize.Sequelize.Op.between]: [startDate, endDate]
      };
    }

    const holidays = await Holiday.findAll({
      where: filters,
      order: [['date', 'ASC']]
    });

    res.json({
      success: true,
      data: holidays
    });
  } catch (error) {
    logger.error("Error fetching holidays:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching holidays",
      error: error.message,
    });
  }
};

/**
 * -----------------------------------------------------
 * CREATE HOLIDAY
 * -----------------------------------------------------
 */
const createHoliday = async (req, res) => {
  try {
    const holidayData = {
      ...req.body,
      createdBy: req.user._id || req.user.id
    };

    const holiday = await Holiday.create(holidayData);

    await AuditLog.create({
      action: "CREATE",
      entityType: "Holiday",
      entityId: holiday.id.toString(),
      userId: req.user._id || req.user.id,
      userRole: req.user.role,
      performedByName: req.user.fullName,
      performedByEmail: req.user.email,
      meta: {
        name: holiday.name,
        date: holiday.date,
        type: holiday.type
      },
      ipAddress: req.ip,
      userAgent: req.get("User-Agent"),
    });

    res.status(201).json({
      success: true,
      data: holiday,
      message: "Holiday created successfully",
    });
  } catch (error) {
    logger.error("Error creating holiday:", error);
    res.status(500).json({
      success: false,
      message: "Error creating holiday",
      error: error.message,
    });
  }
};

/**
 * -----------------------------------------------------
 * UPDATE HOLIDAY
 * -----------------------------------------------------
 */
const updateHoliday = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = {
      ...req.body,
      updatedBy: req.user._id || req.user.id,
    };

    const [updatedRows] = await Holiday.update(updateData, {
      where: { id },
      returning: true
    });

    if (updatedRows === 0) {
      return res.status(404).json({
        success: false,
        message: "Holiday not found",
      });
    }

    const holiday = await Holiday.findByPk(id);

    await AuditLog.create({
      action: "UPDATE",
      entityType: "Holiday",
      entityId: holiday.id.toString(),
      userId: req.user._id || req.user.id,
      userRole: req.user.role,
      performedByName: req.user.fullName,
      performedByEmail: req.user.email,
      meta: {
        name: holiday.name,
        date: holiday.date,
        type: holiday.type
      },
      ipAddress: req.ip,
      userAgent: req.get("User-Agent"),
    });

    res.json({
      success: true,
      data: holiday,
      message: "Holiday updated successfully",
    });
  } catch (error) {
    logger.error("Error updating holiday:", error);
    res.status(500).json({
      success: false,
      message: "Error updating holiday",
      error: error.message,
    });
  }
};

/**
 * -----------------------------------------------------
 * DELETE HOLIDAY
 * -----------------------------------------------------
 */
const deleteHoliday = async (req, res) => {
  try {
    const { id } = req.params;

    const holiday = await Holiday.findByPk(id);
    if (!holiday) {
      return res.status(404).json({
        success: false,
        message: "Holiday not found",
      });
    }

    await Holiday.destroy({ where: { id } });

    await AuditLog.create({
      action: "DELETE",
      entityType: "Holiday",
      entityId: id,
      userId: req.user._id || req.user.id,
      userRole: req.user.role,
      performedByName: req.user.fullName,
      performedByEmail: req.user.email,
      meta: {
        name: holiday.name,
        date: holiday.date,
        type: holiday.type
      },
      ipAddress: req.ip,
      userAgent: req.get("User-Agent"),
    });

    res.json({
      success: true,
      message: "Holiday deleted successfully",
    });
  } catch (error) {
    logger.error("Error deleting holiday:", error);
    res.status(500).json({
      success: false,
      message: "Error deleting holiday",
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
  getHolidays,
  createHoliday,
  updateHoliday,
  deleteHoliday,
};