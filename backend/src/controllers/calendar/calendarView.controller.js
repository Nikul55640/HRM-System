import { CompanyEvent, Employee, LeaveRequest, AttendanceRecord, Holiday } from "../../models/sequelize/index.js";
import { Op } from "sequelize";
import logger from "../../utils/logger.js";
import {
  normalizeCompanyEvent,
  normalizeHoliday,
  normalizeLeaveRequest,
  normalizeBirthday,
  normalizeAnniversary,
  normalizeAttendance,
  filterEventsByDateRange,
  sortEventsByPriorityAndDate,
  groupEventsByDate,
  getEventsForDate,
  isEventInDateRange,
  buildDateRangeFilter,
  buildEventDateRangeFilter,
  convertToLegacyFormat
} from "../../utils/calendarEventNormalizer.js";

/**
 * Enhanced Calendar View Controller
 * Provides comprehensive calendar data using unified event model
 * All events are normalized and filtered using date-range comparison
 */

/**
 * Get Monthly Calendar Data
 * Returns events, leaves, attendance, holidays for a specific month using unified event model
 */
const getMonthlyCalendarData = async (req, res) => {
  try {
    const { year, month, departmentId, employeeId, includeAttendance = false } = req.query;
    const currentYear = year ? parseInt(year) : new Date().getFullYear();
    const currentMonth = month ? parseInt(month) : new Date().getMonth() + 1;

    // Calculate date range for the month
    const startDate = new Date(currentYear, currentMonth - 1, 1);
    const endDate = new Date(currentYear, currentMonth, 0, 23, 59, 59, 999);

    const isHROrAdmin = ['SuperAdmin', 'HR Administrator', 'HR Manager'].includes(req.user.role);
    const isManager = req.user.role === 'Manager';

    // Collect all normalized events
    const allNormalizedEvents = [];

    // 1. Get and normalize Company Events
    const eventFilters = {
      ...buildEventDateRangeFilter(startDate, endDate),
      status: 'scheduled',
      eventType: { [Op.ne]: 'holiday' }
    };

    if (!isHROrAdmin) {
      eventFilters[Op.and] = [
        eventFilters[Op.and] || {},
        {
          [Op.or]: [
            { isPublic: true },
            { createdBy: req.user.id },
            { organizer: req.user.id }
          ]
        }
      ];
    }

    const companyEvents = await CompanyEvent.findAll({
      where: eventFilters,
      attributes: ['id', 'title', 'description', 'startDate', 'endDate', 'eventType', 'isAllDay', 'color', 'location', 'priority', 'organizer', 'isPublic', 'status'],
      order: [['startDate', 'ASC']]
    });

    companyEvents.forEach(event => {
      allNormalizedEvents.push(normalizeCompanyEvent(event));
    });

    // 2. Get and normalize Holidays
    const holidayFilters = buildDateRangeFilter(startDate, endDate, 'date');
    holidayFilters.isActive = true;

    const holidays = await Holiday.findAll({
      where: holidayFilters,
      attributes: ['id', 'name', 'date', 'type', 'description', 'color', 'isPaid', 'isRecurring', 'recurrencePattern', 'isActive'],
      order: [['date', 'ASC']]
    });

    holidays.forEach(holiday => {
      allNormalizedEvents.push(normalizeHoliday(holiday));
    });

    // 3. Get and normalize Leave Requests
    const leaveFilters = buildEventDateRangeFilter(startDate, endDate);
    leaveFilters.status = 'approved';

    // Apply role-based filtering for leaves
    if (!isHROrAdmin) {
      if (isManager) {
        const teamEmployees = await Employee.findAll({
          where: { reportingManager: req.user.id },
          attributes: ['id']
        });
        const teamIds = teamEmployees.map(emp => emp.id);
        teamIds.push(req.user.employee?.id);
        leaveFilters.employeeId = { [Op.in]: teamIds };
      } else {
        leaveFilters.employeeId = req.user.employee?.id;
      }
    }

    if (employeeId) {
      leaveFilters.employeeId = employeeId;
    }

    const leaves = await LeaveRequest.findAll({
      where: leaveFilters,
      include: [{
        model: Employee,
        as: 'employee',
        attributes: ['id', 'employeeId', 'firstName', 'lastName', 'department']
      }],
      order: [['startDate', 'ASC']]
    });

    leaves.forEach(leave => {
      allNormalizedEvents.push(normalizeLeaveRequest(leave));
    });

    // 4. Get and normalize Employee Birthdays and Anniversaries
    const employeeFilters = { status: 'Active' };
    if (departmentId) {
      employeeFilters.department = departmentId;
    }

    const employees = await Employee.findAll({
      where: employeeFilters,
      attributes: ['id', 'employeeId', 'firstName', 'lastName', 'dateOfBirth', 'joiningDate', 'department']
    });

    employees.forEach(employee => {
      // Generate birthday events
      if (employee.dateOfBirth) {
        const birthdayEvent = normalizeBirthday(employee, currentYear);
        if (isEventInDateRange(birthdayEvent, startDate, endDate)) {
          allNormalizedEvents.push(birthdayEvent);
        }
      }

      // Generate anniversary events
      if (employee.joiningDate) {
        const joinYear = new Date(employee.joiningDate).getFullYear();
        if (joinYear < currentYear) {
          const anniversaryEvent = normalizeAnniversary(employee, currentYear);
          if (isEventInDateRange(anniversaryEvent, startDate, endDate)) {
            allNormalizedEvents.push(anniversaryEvent);
          }
        }
      }
    });

    // 5. Get and normalize Attendance Data (if requested and user has permission)
    if (includeAttendance === 'true' && (isHROrAdmin || isManager)) {
      const attendanceFilters = buildDateRangeFilter(startDate, endDate, 'date');

      if (!isHROrAdmin) {
        if (isManager) {
          const teamEmployees = await Employee.findAll({
            where: { reportingManager: req.user.id },
            attributes: ['id']
          });
          const teamIds = teamEmployees.map(emp => emp.id);
          attendanceFilters.employeeId = { [Op.in]: teamIds };
        } else {
          attendanceFilters.employeeId = req.user.employee?.id;
        }
      }

      if (employeeId) {
        attendanceFilters.employeeId = employeeId;
      }

      const attendance = await AttendanceRecord.findAll({
        where: attendanceFilters,
        include: [{
          model: Employee,
          as: 'employee',
          attributes: ['id', 'employeeId', 'firstName', 'lastName']
        }],
        order: [['date', 'ASC']]
      });

      attendance.forEach(record => {
        allNormalizedEvents.push(normalizeAttendance(record));
      });
    }

    // Sort all events by priority and date
    const sortedEvents = sortEventsByPriorityAndDate(allNormalizedEvents);

    // Convert to legacy format for frontend compatibility
    const legacyFormat = convertToLegacyFormat(sortedEvents);

    // Generate summary statistics
    const summary = {
      totalEvents: legacyFormat.events.length,
      totalHolidays: legacyFormat.holidays.length,
      totalLeaves: legacyFormat.leaves.length,
      totalBirthdays: legacyFormat.birthdays.length,
      totalAnniversaries: legacyFormat.anniversaries.length,
      leavesByType: legacyFormat.leaves.reduce((acc, leave) => {
        acc[leave.leaveType] = (acc[leave.leaveType] || 0) + 1;
        return acc;
      }, {}),
      attendanceSummary: legacyFormat.attendance.length > 0 ? {
        totalRecords: legacyFormat.attendance.length,
        presentDays: legacyFormat.attendance.filter(a => a.status === 'present').length,
        absentDays: legacyFormat.attendance.filter(a => a.status === 'absent').length,
        lateDays: legacyFormat.attendance.filter(a => a.isLate).length,
        earlyDepartures: legacyFormat.attendance.filter(a => a.isEarlyDeparture).length
      } : null
    };

    res.json({
      success: true,
      data: {
        year: currentYear,
        month: currentMonth,
        ...legacyFormat,
        summary
      }
    });

  } catch (error) {
    logger.error("Error fetching monthly calendar data:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching calendar data",
      error: error.message
    });
  }
};

/**
 * Get Daily Calendar Data
 * Returns detailed information for a specific date using unified event model
 */
const getDailyCalendarData = async (req, res) => {
  try {
    const { date, employeeId } = req.query;
    
    if (!date) {
      return res.status(400).json({
        success: false,
        message: "Date parameter is required"
      });
    }

    const targetDate = new Date(date);
    const startOfDay = new Date(targetDate.setHours(0, 0, 0, 0));
    const endOfDay = new Date(targetDate.setHours(23, 59, 59, 999));

    const isHROrAdmin = ['SuperAdmin', 'HR Administrator', 'HR Manager'].includes(req.user.role);
    const isManager = req.user.role === 'Manager';

    // Collect all normalized events for the day
    const allNormalizedEvents = [];

    // 1. Get and normalize Company Events
    const eventFilters = {
      ...buildEventDateRangeFilter(startOfDay, endOfDay),
      status: 'scheduled',
      eventType: { [Op.ne]: 'holiday' }
    };

    if (!isHROrAdmin) {
      eventFilters[Op.and] = [
        eventFilters[Op.and] || {},
        {
          [Op.or]: [
            { isPublic: true },
            { createdBy: req.user.id },
            { organizer: req.user.id }
          ]
        }
      ];
    }

    const companyEvents = await CompanyEvent.findAll({
      where: eventFilters,
      order: [['startDate', 'ASC']]
    });

    companyEvents.forEach(event => {
      allNormalizedEvents.push(normalizeCompanyEvent(event));
    });

    // 2. Get and normalize Holidays
    const holidayFilters = buildDateRangeFilter(startOfDay, endOfDay, 'date');
    holidayFilters.isActive = true;

    const holidays = await Holiday.findAll({
      where: holidayFilters,
      order: [['date', 'ASC']]
    });

    holidays.forEach(holiday => {
      allNormalizedEvents.push(normalizeHoliday(holiday));
    });

    // 3. Get and normalize Leave Requests
    const leaveFilters = buildEventDateRangeFilter(startOfDay, endOfDay);
    leaveFilters.status = 'approved';

    if (!isHROrAdmin) {
      if (isManager) {
        const teamEmployees = await Employee.findAll({
          where: { reportingManager: req.user.id },
          attributes: ['id']
        });
        const teamIds = teamEmployees.map(emp => emp.id);
        teamIds.push(req.user.employee?.id);
        leaveFilters.employeeId = { [Op.in]: teamIds };
      } else {
        leaveFilters.employeeId = req.user.employee?.id;
      }
    }

    if (employeeId) {
      leaveFilters.employeeId = employeeId;
    }

    const leaves = await LeaveRequest.findAll({
      where: leaveFilters,
      include: [{
        model: Employee,
        as: 'employee',
        attributes: ['id', 'employeeId', 'firstName', 'lastName', 'department']
      }]
    });

    leaves.forEach(leave => {
      allNormalizedEvents.push(normalizeLeaveRequest(leave));
    });

    // 4. Get and normalize Employee Birthdays and Anniversaries
    const employees = await Employee.findAll({
      where: { status: 'Active' },
      attributes: ['id', 'employeeId', 'firstName', 'lastName', 'dateOfBirth', 'joiningDate', 'department']
    });

    const targetYear = targetDate.getFullYear();

    employees.forEach(employee => {
      // Check for birthdays on this date
      if (employee.dateOfBirth) {
        const birthdayEvent = normalizeBirthday(employee, targetYear);
        if (isEventInDateRange(birthdayEvent, startOfDay, endOfDay)) {
          allNormalizedEvents.push(birthdayEvent);
        }
      }

      // Check for anniversaries on this date
      if (employee.joiningDate) {
        const joinYear = new Date(employee.joiningDate).getFullYear();
        if (joinYear < targetYear) {
          const anniversaryEvent = normalizeAnniversary(employee, targetYear);
          if (isEventInDateRange(anniversaryEvent, startOfDay, endOfDay)) {
            allNormalizedEvents.push(anniversaryEvent);
          }
        }
      }
    });

    // 5. Get and normalize Attendance for the day
    if (isHROrAdmin || isManager || employeeId === req.user.employee?.id) {
      const attendanceFilters = buildDateRangeFilter(startOfDay, endOfDay, 'date');

      if (!isHROrAdmin) {
        if (isManager) {
          const teamEmployees = await Employee.findAll({
            where: { reportingManager: req.user.id },
            attributes: ['id']
          });
          const teamIds = teamEmployees.map(emp => emp.id);
          attendanceFilters.employeeId = { [Op.in]: teamIds };
        } else {
          attendanceFilters.employeeId = req.user.employee?.id;
        }
      }

      if (employeeId) {
        attendanceFilters.employeeId = employeeId;
      }

      const attendance = await AttendanceRecord.findAll({
        where: attendanceFilters,
        include: [{
          model: Employee,
          as: 'employee',
          attributes: ['id', 'employeeId', 'firstName', 'lastName']
        }]
      });

      attendance.forEach(record => {
        allNormalizedEvents.push(normalizeAttendance(record));
      });
    }

    // Sort all events by priority and date
    const sortedEvents = sortEventsByPriorityAndDate(allNormalizedEvents);

    // Convert to legacy format for frontend compatibility
    const legacyFormat = convertToLegacyFormat(sortedEvents);

    res.json({
      success: true,
      data: {
        date: date,
        ...legacyFormat,
        totalEvents: sortedEvents.length
      }
    });

  } catch (error) {
    logger.error("Error fetching daily calendar data:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching daily calendar data",
      error: error.message
    });
  }
};

/**
 * Apply for Leave from Calendar
 */
const applyLeaveFromCalendar = async (req, res) => {
  try {
    const { startDate, endDate, leaveType, reason, isHalfDay, halfDayPeriod } = req.body;

    // Validate required fields
    if (!startDate || !endDate || !leaveType || !reason) {
      return res.status(400).json({
        success: false,
        message: "Start date, end date, leave type, and reason are required"
      });
    }

    // Calculate total days
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffTime = Math.abs(end - start);
    const totalDays = isHalfDay ? 0.5 : Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;

    // Check for overlapping leaves
    const hasOverlap = await LeaveRequest.hasOverlap(req.user.employee?.id, start, end);
    if (hasOverlap) {
      return res.status(400).json({
        success: false,
        message: "You already have a leave request for this period"
      });
    }

    // Create leave request
    const leaveRequest = await LeaveRequest.create({
      employeeId: req.user.employee?.id,
      leaveType,
      startDate: start,
      endDate: end,
      totalDays,
      reason,
      isHalfDay: isHalfDay || false,
      halfDayPeriod: halfDayPeriod || null,
      status: 'pending',
      createdBy: req.user.id
    });

    res.status(201).json({
      success: true,
      data: leaveRequest,
      message: "Leave application submitted successfully"
    });

  } catch (error) {
    logger.error("Error applying for leave:", error);
    res.status(500).json({
      success: false,
      message: "Error submitting leave application",
      error: error.message
    });
  }
};

/**
 * Get Unified Calendar Events
 * Returns all calendar events in a normalized, unified format
 */
const getEvents = async (req, res) => {
  try {
    const { year, month, startDate, endDate, departmentId, employeeId } = req.query;
    
    // Determine date range
    let rangeStart, rangeEnd;
    
    if (startDate && endDate) {
      rangeStart = new Date(startDate);
      rangeEnd = new Date(endDate);
    } else if (year && month) {
      const currentYear = parseInt(year);
      const currentMonth = parseInt(month);
      rangeStart = new Date(currentYear, currentMonth - 1, 1);
      rangeEnd = new Date(currentYear, currentMonth, 0, 23, 59, 59, 999);
    } else {
      // Default to current month
      const now = new Date();
      rangeStart = new Date(now.getFullYear(), now.getMonth(), 1);
      rangeEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);
    }

    const isHROrAdmin = ['SuperAdmin', 'HR Administrator', 'HR Manager'].includes(req.user.role);
    const isManager = req.user.role === 'Manager';

    // Collect all normalized events
    const allNormalizedEvents = [];

    // 1. Get and normalize Company Events
    const eventFilters = {
      ...buildEventDateRangeFilter(rangeStart, rangeEnd),
      status: 'scheduled',
      eventType: { [Op.ne]: 'holiday' }
    };

    if (!isHROrAdmin) {
      eventFilters[Op.and] = [
        eventFilters[Op.and] || {},
        {
          [Op.or]: [
            { isPublic: true },
            { createdBy: req.user.id },
            { organizer: req.user.id }
          ]
        }
      ];
    }

    const companyEvents = await CompanyEvent.findAll({
      where: eventFilters,
      attributes: ['id', 'title', 'description', 'startDate', 'endDate', 'eventType', 'isAllDay', 'color', 'location', 'priority', 'organizer', 'isPublic', 'status'],
      order: [['startDate', 'ASC']]
    });

    companyEvents.forEach(event => {
      allNormalizedEvents.push(normalizeCompanyEvent(event));
    });

    // 2. Get and normalize Holidays
    const holidayFilters = buildDateRangeFilter(rangeStart, rangeEnd, 'date');
    holidayFilters.isActive = true;

    const holidays = await Holiday.findAll({
      where: holidayFilters,
      attributes: ['id', 'name', 'date', 'type', 'description', 'color', 'isPaid', 'isRecurring', 'recurrencePattern', 'isActive'],
      order: [['date', 'ASC']]
    });

    holidays.forEach(holiday => {
      allNormalizedEvents.push(normalizeHoliday(holiday));
    });

    // 3. Get and normalize Leave Requests
    const leaveFilters = buildEventDateRangeFilter(rangeStart, rangeEnd);
    leaveFilters.status = 'approved';

    // Apply role-based filtering for leaves
    if (!isHROrAdmin) {
      if (isManager) {
        const teamEmployees = await Employee.findAll({
          where: { reportingManager: req.user.id },
          attributes: ['id']
        });
        const teamIds = teamEmployees.map(emp => emp.id);
        teamIds.push(req.user.employee?.id);
        leaveFilters.employeeId = { [Op.in]: teamIds };
      } else {
        leaveFilters.employeeId = req.user.employee?.id;
      }
    }

    if (employeeId) {
      leaveFilters.employeeId = employeeId;
    }

    const leaves = await LeaveRequest.findAll({
      where: leaveFilters,
      include: [{
        model: Employee,
        as: 'employee',
        attributes: ['id', 'employeeId', 'firstName', 'lastName', 'department']
      }],
      order: [['startDate', 'ASC']]
    });

    leaves.forEach(leave => {
      allNormalizedEvents.push(normalizeLeaveRequest(leave));
    });

    // 4. Get and normalize Employee Birthdays and Anniversaries
    const employeeFilters = { status: 'Active' };
    if (departmentId) {
      employeeFilters.department = departmentId;
    }

    const employees = await Employee.findAll({
      where: employeeFilters,
      attributes: ['id', 'employeeId', 'firstName', 'lastName', 'dateOfBirth', 'joiningDate', 'department']
    });

    const targetYear = rangeStart.getFullYear();

    employees.forEach(employee => {
      // Generate birthday events
      if (employee.dateOfBirth) {
        const birthdayEvent = normalizeBirthday(employee, targetYear);
        if (isEventInDateRange(birthdayEvent, rangeStart, rangeEnd)) {
          allNormalizedEvents.push(birthdayEvent);
        }
      }

      // Generate anniversary events
      if (employee.joiningDate) {
        const joinYear = new Date(employee.joiningDate).getFullYear();
        if (joinYear < targetYear) {
          const anniversaryEvent = normalizeAnniversary(employee, targetYear);
          if (isEventInDateRange(anniversaryEvent, rangeStart, rangeEnd)) {
            allNormalizedEvents.push(anniversaryEvent);
          }
        }
      }
    });

    // Sort all events by priority and date
    const sortedEvents = sortEventsByPriorityAndDate(allNormalizedEvents);

    // Convert to legacy format for frontend compatibility
    const legacyFormat = convertToLegacyFormat(sortedEvents);

    res.json({
      success: true,
      data: legacyFormat,
      meta: {
        totalEvents: sortedEvents.length,
        dateRange: {
          start: rangeStart,
          end: rangeEnd
        },
        eventsByType: {
          companyEvents: legacyFormat.events.length,
          holidays: legacyFormat.holidays.length,
          leaves: legacyFormat.leaves.length,
          birthdays: legacyFormat.birthdays.length,
          anniversaries: legacyFormat.anniversaries.length
        }
      }
    });

  } catch (error) {
    logger.error("Error fetching unified calendar events:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching calendar events",
      error: error.message
    });
  }
};

export default {
  // Main calendar views
  getMonthlyCalendarData,
  getDailyCalendarData,
  applyLeaveFromCalendar,
  
  // Unified calendar events endpoint
  getEvents,
  getUpcomingEvents: getDailyCalendarData,
  createEvent: async (req, res) => {
    res.status(501).json({ success: false, message: "Not implemented" });
  },
  updateEvent: async (req, res) => {
    res.status(501).json({ success: false, message: "Not implemented" });
  },
  deleteEvent: async (req, res) => {
    res.status(501).json({ success: false, message: "Not implemented" });
  },
  getHolidays: async (req, res) => {
    try {
      const { year } = req.query;
      const currentYear = year ? parseInt(year) : new Date().getFullYear();
      
      const holidays = await Holiday.findAll({
        where: {
          date: {
            [Op.gte]: `${currentYear}-01-01`,
            [Op.lte]: `${currentYear}-12-31`
          },
          isActive: true
        },
        attributes: ['id', 'name', 'date', 'type', 'description', 'color', 'isPaid', 'isRecurring'],
        order: [['date', 'ASC']]
      });

      res.json({
        success: true,
        data: holidays.map(holiday => ({
          id: holiday.id,
          name: holiday.name,
          title: holiday.name,
          date: holiday.date,
          startDate: holiday.date,
          endDate: holiday.date,
          type: holiday.type,
          eventType: 'holiday',
          description: holiday.description,
          color: holiday.color || '#dc2626',
          isPaid: holiday.isPaid,
          isRecurring: holiday.isRecurring,
          isAllDay: true
        }))
      });
    } catch (error) {
      logger.error("Error fetching holidays:", error);
      res.status(500).json({
        success: false,
        message: "Error fetching holidays",
        error: error.message
      });
    }
  },

  createHoliday: async (req, res) => {
    try {
      const { name, date, type, description, color, isPaid, isRecurring, recurrencePattern } = req.body;
      
      const holiday = await Holiday.create({
        name,
        date,
        type: type || 'public',
        description,
        color: color || '#dc2626',
        isPaid: isPaid !== undefined ? isPaid : true,
        isRecurring: isRecurring || false,
        recurrencePattern,
        createdBy: req.user.id
      });

      res.status(201).json({
        success: true,
        message: 'Holiday created successfully',
        data: {
          id: holiday.id,
          name: holiday.name,
          title: holiday.name,
          date: holiday.date,
          startDate: holiday.date,
          endDate: holiday.date,
          type: holiday.type,
          eventType: 'holiday',
          description: holiday.description,
          color: holiday.color,
          isPaid: holiday.isPaid,
          isRecurring: holiday.isRecurring,
          isAllDay: true
        }
      });
    } catch (error) {
      logger.error("Error creating holiday:", error);
      res.status(500).json({
        success: false,
        message: "Error creating holiday",
        error: error.message
      });
    }
  },

  updateHoliday: async (req, res) => {
    try {
      const { id } = req.params;
      const { name, date, type, description, color, isPaid, isRecurring, recurrencePattern } = req.body;
      
      const holiday = await Holiday.findByPk(id);
      if (!holiday) {
        return res.status(404).json({
          success: false,
          message: 'Holiday not found'
        });
      }

      await holiday.update({
        name,
        date,
        type,
        description,
        color,
        isPaid,
        isRecurring,
        recurrencePattern,
        updatedBy: req.user.id
      });

      res.json({
        success: true,
        message: 'Holiday updated successfully',
        data: {
          id: holiday.id,
          name: holiday.name,
          title: holiday.name,
          date: holiday.date,
          startDate: holiday.date,
          endDate: holiday.date,
          type: holiday.type,
          eventType: 'holiday',
          description: holiday.description,
          color: holiday.color,
          isPaid: holiday.isPaid,
          isRecurring: holiday.isRecurring,
          isAllDay: true
        }
      });
    } catch (error) {
      logger.error("Error updating holiday:", error);
      res.status(500).json({
        success: false,
        message: "Error updating holiday",
        error: error.message
      });
    }
  },

  deleteHoliday: async (req, res) => {
    try {
      const { id } = req.params;
      
      const holiday = await Holiday.findByPk(id);
      if (!holiday) {
        return res.status(404).json({
          success: false,
          message: 'Holiday not found'
        });
      }

      await holiday.destroy();

      res.json({
        success: true,
        message: 'Holiday deleted successfully'
      });
    } catch (error) {
      logger.error("Error deleting holiday:", error);
      res.status(500).json({
        success: false,
        message: "Error deleting holiday",
        error: error.message
      });
    }
  },
  syncEmployeeEvents: async (req, res) => {
    res.status(501).json({ success: false, message: "Not implemented" });
  }
};