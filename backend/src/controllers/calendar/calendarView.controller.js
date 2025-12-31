import { CompanyEvent, Employee, LeaveRequest, AttendanceRecord, Holiday } from "../../models/sequelize/index.js";
import { Op } from "sequelize";
import logger from "../../utils/logger.js";

/**
 * Enhanced Calendar View Controller
 * Provides comprehensive calendar data for different user roles
 * Based on the working companyCalendarController approach
 */

/**
 * Get Monthly Calendar Data
 * Returns events, leaves, attendance, holidays for a specific month
 */
const getMonthlyCalendarData = async (req, res) => {
  try {
    const { year, month, departmentId, employeeId, includeAttendance = false } = req.query;
    const currentYear = year ? parseInt(year) : new Date().getFullYear();
    const currentMonth = month ? parseInt(month) : new Date().getMonth() + 1;

    // Calculate date range for the month
    const startDate = new Date(currentYear, currentMonth - 1, 1);
    const endDate = new Date(currentYear, currentMonth, 0, 23, 59, 59, 999);

    const calendarData = {
      year: currentYear,
      month: currentMonth,
      events: [],
      leaves: [],
      holidays: [],
      birthdays: [],
      anniversaries: [],
      attendance: [],
      summary: {}
    };

    // Build filters based on user role and permissions
    const isHROrAdmin = ['SuperAdmin', 'HR Administrator', 'HR Manager'].includes(req.user.role);
    const isManager = req.user.role === 'Manager';

    // 1. Get Company Events (meetings, trainings, company events)
    const eventFilters = {
      [Op.or]: [
        {
          startDate: { [Op.between]: [startDate, endDate] }
        },
        {
          endDate: { [Op.between]: [startDate, endDate] }
        },
        {
          [Op.and]: [
            { startDate: { [Op.lte]: startDate } },
            { endDate: { [Op.gte]: endDate } }
          ]
        }
      ],
      status: 'scheduled',
      eventType: { [Op.ne]: 'holiday' } // Exclude holidays from CompanyEvent
    };

    if (!isHROrAdmin) {
      eventFilters[Op.or] = [
        { isPublic: true },
        { createdBy: req.user.id },
        { organizer: req.user.id }
      ];
    }

    const events = await CompanyEvent.findAll({
      where: eventFilters,
      attributes: ['id', 'title', 'description', 'startDate', 'endDate', 'eventType', 'isAllDay', 'color', 'location', 'priority'],
      order: [['startDate', 'ASC']]
    });

    calendarData.events = events.map(event => ({
      id: event.id,
      title: event.title,
      description: event.description,
      startDate: event.startDate,
      endDate: event.endDate,
      eventType: event.eventType,
      isAllDay: event.isAllDay,
      color: event.color || '#3498db',
      location: event.location,
      priority: event.priority
    }));

    // 1.5. Get Holidays from Holiday model
    const holidayFilters = {
      date: { [Op.between]: [startDate, endDate] },
      isActive: true
    };

    const holidays = await Holiday.findAll({
      where: holidayFilters,
      attributes: ['id', 'name', 'date', 'type', 'description', 'color', 'isPaid', 'isRecurring'],
      order: [['date', 'ASC']]
    });

    calendarData.holidays = holidays.map(holiday => ({
      id: holiday.id,
      title: holiday.name,
      name: holiday.name,
      date: holiday.date,
      startDate: holiday.date,
      endDate: holiday.date,
      eventType: 'holiday',
      type: holiday.type,
      description: holiday.description,
      color: holiday.color || '#dc2626',
      isPaid: holiday.isPaid,
      isRecurring: holiday.isRecurring,
      isAllDay: true
    }));

    // 2. Get Leave Requests - Using simple approach without Department association
    const leaveFilters = {
      startDate: { [Op.lte]: endDate },
      endDate: { [Op.gte]: startDate },
      status: 'approved'
    };

    // Apply role-based filtering for leaves
    if (!isHROrAdmin) {
      if (isManager) {
        // Managers can see their team's leaves
        const teamEmployees = await Employee.findAll({
          where: { reportingManager: req.user.id },
          attributes: ['id']
        });
        const teamIds = teamEmployees.map(emp => emp.id);
        teamIds.push(req.user.employeeId); // Include manager's own leaves
        leaveFilters.employeeId = { [Op.in]: teamIds };
      } else {
        // Employees can only see their own leaves
        leaveFilters.employeeId = req.user.employeeId;
      }
    }

    if (employeeId) {
      leaveFilters.employeeId = employeeId;
    }

    // Simple leave query without problematic Department association
    const leaves = await LeaveRequest.findAll({
      where: leaveFilters,
      include: [{
        model: Employee,
        as: 'employee',
        attributes: ['id', 'employeeId', 'firstName', 'lastName', 'department']
      }],
      order: [['startDate', 'ASC']]
    });

    calendarData.leaves = leaves.map(leave => ({
      id: leave.id,
      employeeId: leave.employeeId,
      employeeName: `${leave.employee?.firstName || ''} ${leave.employee?.lastName || ''}`.trim(),
      employeeCode: leave.employee?.employeeId,
      department: leave.employee?.department || 'N/A',
      leaveType: leave.leaveType,
      startDate: leave.startDate,
      endDate: leave.endDate,
      totalDays: leave.totalDays,
      isHalfDay: leave.isHalfDay,
      halfDayPeriod: leave.halfDayPeriod,
      reason: leave.reason,
      status: leave.status,
      eventType: 'leave',
      title: `${leave.employee?.firstName || ''} ${leave.employee?.lastName || ''} - ${leave.leaveType}`.trim(),
      color: '#f59e0b', // Orange color for leaves
      isAllDay: true
    }));

    // 3. Get Birthdays and Anniversaries
    const employeeFilters = { status: 'Active' };
    if (departmentId) {
      employeeFilters.department = departmentId;
    }

    const employees = await Employee.findAll({
      where: employeeFilters,
      attributes: ['id', 'employeeId', 'firstName', 'lastName', 'dateOfBirth', 'joiningDate', 'department']
    });

    employees.forEach(employee => {
      // Birthdays
      if (employee.dateOfBirth) {
        const dob = new Date(employee.dateOfBirth);
        if (dob.getMonth() === currentMonth - 1) {
          const birthdayThisYear = new Date(currentYear, dob.getMonth(), dob.getDate());
          calendarData.birthdays.push({
            id: `birthday-${employee.id}`,
            employeeId: employee.id,
            employeeName: `${employee.firstName || ''} ${employee.lastName || ''}`.trim(),
            employeeCode: employee.employeeId,
            date: birthdayThisYear,
            startDate: birthdayThisYear,
            endDate: birthdayThisYear,
            age: currentYear - dob.getFullYear(),
            eventType: 'birthday',
            title: `🎂 ${employee.firstName || ''} ${employee.lastName || ''}`.trim(),
            color: '#ec4899', // Pink color for birthdays
            isAllDay: true
          });
        }
      }

      // Work Anniversaries
      if (employee.joiningDate) {
        const joinDate = new Date(employee.joiningDate);
        if (joinDate.getMonth() === currentMonth - 1 && joinDate.getFullYear() < currentYear) {
          const anniversaryThisYear = new Date(currentYear, joinDate.getMonth(), joinDate.getDate());
          const years = currentYear - joinDate.getFullYear();
          calendarData.anniversaries.push({
            id: `anniversary-${employee.id}`,
            employeeId: employee.id,
            employeeName: `${employee.firstName || ''} ${employee.lastName || ''}`.trim(),
            employeeCode: employee.employeeId,
            date: anniversaryThisYear,
            startDate: anniversaryThisYear,
            endDate: anniversaryThisYear,
            years: years,
            eventType: 'anniversary',
            title: `🎊 ${employee.firstName || ''} ${employee.lastName || ''} - ${years} years`.trim(),
            color: '#8b5cf6', // Purple color for anniversaries
            isAllDay: true
          });
        }
      }
    });

    // 4. Get Attendance Data (if requested and user has permission)
    if (includeAttendance === 'true' && (isHROrAdmin || isManager)) {
      const attendanceFilters = {
        date: { [Op.between]: [startDate, endDate] }
      };

      if (!isHROrAdmin) {
        if (isManager) {
          const teamEmployees = await Employee.findAll({
            where: { reportingManager: req.user.id },
            attributes: ['id']
          });
          const teamIds = teamEmployees.map(emp => emp.id);
          attendanceFilters.employeeId = { [Op.in]: teamIds };
        } else {
          attendanceFilters.employeeId = req.user.employeeId;
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

      calendarData.attendance = attendance.map(record => ({
        id: record.id,
        employeeId: record.employeeId,
        employeeName: `${record.employee?.firstName || ''} ${record.employee?.lastName || ''}`.trim(),
        employeeCode: record.employee?.employeeId,
        date: record.date,
        checkIn: record.checkIn,
        checkOut: record.checkOut,
        status: record.status,
        workHours: record.workHours,
        isLate: record.isLate,
        isEarlyDeparture: record.isEarlyDeparture,
        lateMinutes: record.lateMinutes,
        earlyExitMinutes: record.earlyExitMinutes
      }));
    }

    // 5. Generate Summary Statistics
    calendarData.summary = {
      totalEvents: calendarData.events.length,
      totalHolidays: calendarData.holidays.length,
      totalLeaves: calendarData.leaves.length,
      totalBirthdays: calendarData.birthdays.length,
      totalAnniversaries: calendarData.anniversaries.length,
      leavesByType: calendarData.leaves.reduce((acc, leave) => {
        acc[leave.leaveType] = (acc[leave.leaveType] || 0) + 1;
        return acc;
      }, {}),
      attendanceSummary: calendarData.attendance.length > 0 ? {
        totalRecords: calendarData.attendance.length,
        presentDays: calendarData.attendance.filter(a => a.status === 'present').length,
        absentDays: calendarData.attendance.filter(a => a.status === 'absent').length,
        lateDays: calendarData.attendance.filter(a => a.isLate).length,
        earlyDepartures: calendarData.attendance.filter(a => a.isEarlyDeparture).length
      } : null
    };

    res.json({
      success: true,
      data: calendarData
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
 * Returns detailed information for a specific date
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

    const dailyData = {
      date: date,
      events: [],
      leaves: [],
      attendance: [],
      holidays: []
    };

    // Get events for the day
    const eventFilters = {
      [Op.or]: [
        {
          startDate: { [Op.between]: [startOfDay, endOfDay] }
        },
        {
          endDate: { [Op.between]: [startOfDay, endOfDay] }
        },
        {
          [Op.and]: [
            { startDate: { [Op.lte]: startOfDay } },
            { endDate: { [Op.gte]: endOfDay } }
          ]
        }
      ],
      status: 'scheduled'
    };

    if (!isHROrAdmin) {
      eventFilters[Op.or] = [
        { isPublic: true },
        { createdBy: req.user.id },
        { organizer: req.user.id }
      ];
    }

    const events = await CompanyEvent.findAll({
      where: eventFilters,
      order: [['startDate', 'ASC']]
    });

    dailyData.events = events.filter(e => e.eventType !== 'holiday');
    dailyData.holidays = events.filter(e => e.eventType === 'holiday');

    // Get leaves for the day
    const leaveFilters = {
      startDate: { [Op.lte]: endOfDay },
      endDate: { [Op.gte]: startOfDay },
      status: 'approved'
    };

    if (!isHROrAdmin) {
      if (isManager) {
        const teamEmployees = await Employee.findAll({
          where: { reportingManager: req.user.id },
          attributes: ['id']
        });
        const teamIds = teamEmployees.map(emp => emp.id);
        teamIds.push(req.user.employeeId);
        leaveFilters.employeeId = { [Op.in]: teamIds };
      } else {
        leaveFilters.employeeId = req.user.employeeId;
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
        attributes: ['id', 'employeeId', 'firstName', 'lastName']
      }]
    });

    dailyData.leaves = leaves.map(leave => ({
      id: leave.id,
      employeeId: leave.employeeId,
      employeeName: `${leave.employee?.firstName || ''} ${leave.employee?.lastName || ''}`.trim(),
      employeeCode: leave.employee?.employeeId,
      leaveType: leave.leaveType,
      isHalfDay: leave.isHalfDay,
      halfDayPeriod: leave.halfDayPeriod,
      reason: leave.reason
    }));

    // Get attendance for the day
    if (isHROrAdmin || isManager || employeeId === req.user.employeeId) {
      const attendanceFilters = {
        date: startOfDay
      };

      if (!isHROrAdmin) {
        if (isManager) {
          const teamEmployees = await Employee.findAll({
            where: { reportingManager: req.user.id },
            attributes: ['id']
          });
          const teamIds = teamEmployees.map(emp => emp.id);
          attendanceFilters.employeeId = { [Op.in]: teamIds };
        } else {
          attendanceFilters.employeeId = req.user.employeeId;
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

      dailyData.attendance = attendance.map(record => ({
        id: record.id,
        employeeId: record.employeeId,
        employeeName: `${record.employee?.firstName || ''} ${record.employee?.lastName || ''}`.trim(),
        employeeCode: record.employee?.employeeId,
        checkIn: record.checkIn,
        checkOut: record.checkOut,
        status: record.status,
        workHours: record.workHours,
        breakTime: record.breakTime,
        isLate: record.isLate,
        isEarlyDeparture: record.isEarlyDeparture,
        lateMinutes: record.lateMinutes,
        earlyExitMinutes: record.earlyExitMinutes,
        sessions: record.sessions
      }));
    }

    res.json({
      success: true,
      data: dailyData
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
    const hasOverlap = await LeaveRequest.hasOverlap(req.user.employeeId, start, end);
    if (hasOverlap) {
      return res.status(400).json({
        success: false,
        message: "You already have a leave request for this period"
      });
    }

    // Create leave request
    const leaveRequest = await LeaveRequest.create({
      employeeId: req.user.employeeId,
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
 * Returns all calendar events (holidays, company events, leaves, etc.) in a unified format
 * This is the main endpoint used by /calendar/events
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

    const calendarData = {
      events: [],
      holidays: [],
      leaves: [],
      birthdays: [],
      anniversaries: []
    };

    // 1. Get Company Events
    const eventFilters = {
      [Op.or]: [
        { startDate: { [Op.between]: [rangeStart, rangeEnd] } },
        { endDate: { [Op.between]: [rangeStart, rangeEnd] } },
        {
          [Op.and]: [
            { startDate: { [Op.lte]: rangeStart } },
            { endDate: { [Op.gte]: rangeEnd } }
          ]
        }
      ],
      status: 'scheduled',
      eventType: { [Op.ne]: 'holiday' }
    };

    if (!isHROrAdmin) {
      eventFilters[Op.or] = [
        { isPublic: true },
        { createdBy: req.user.id },
        { organizer: req.user.id }
      ];
    }

    const events = await CompanyEvent.findAll({
      where: eventFilters,
      attributes: ['id', 'title', 'description', 'startDate', 'endDate', 'eventType', 'isAllDay', 'color', 'location', 'priority'],
      order: [['startDate', 'ASC']]
    });

    calendarData.events = events.map(event => ({
      id: event.id,
      title: event.title,
      description: event.description,
      startDate: event.startDate,
      endDate: event.endDate,
      eventType: event.eventType,
      isAllDay: event.isAllDay,
      color: event.color || '#3498db',
      location: event.location,
      priority: event.priority
    }));

    // 2. Get Holidays from Holiday model
    const holidayFilters = {
      date: { [Op.between]: [rangeStart, rangeEnd] },
      isActive: true
    };

    const holidays = await Holiday.findAll({
      where: holidayFilters,
      attributes: ['id', 'name', 'date', 'type', 'description', 'color', 'isPaid', 'isRecurring'],
      order: [['date', 'ASC']]
    });

    calendarData.holidays = holidays.map(holiday => ({
      id: holiday.id,
      title: holiday.name,
      name: holiday.name,
      date: holiday.date,
      startDate: holiday.date,
      endDate: holiday.date,
      eventType: 'holiday',
      type: holiday.type,
      description: holiday.description,
      color: holiday.color || '#dc2626',
      isPaid: holiday.isPaid,
      isRecurring: holiday.isRecurring,
      isAllDay: true
    }));

    // 3. Get Leave Requests
    const leaveFilters = {
      startDate: { [Op.lte]: rangeEnd },
      endDate: { [Op.gte]: rangeStart },
      status: 'approved'
    };

    if (!isHROrAdmin) {
      if (isManager) {
        const teamEmployees = await Employee.findAll({
          where: { reportingManager: req.user.id },
          attributes: ['id']
        });
        const teamIds = teamEmployees.map(emp => emp.id);
        teamIds.push(req.user.employeeId);
        leaveFilters.employeeId = { [Op.in]: teamIds };
      } else {
        leaveFilters.employeeId = req.user.employeeId;
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

    calendarData.leaves = leaves.map(leave => ({
      id: leave.id,
      employeeId: leave.employeeId,
      employeeName: `${leave.employee?.firstName || ''} ${leave.employee?.lastName || ''}`.trim(),
      employeeCode: leave.employee?.employeeId,
      department: leave.employee?.department || 'N/A',
      leaveType: leave.leaveType,
      startDate: leave.startDate,
      endDate: leave.endDate,
      totalDays: leave.totalDays,
      isHalfDay: leave.isHalfDay,
      halfDayPeriod: leave.halfDayPeriod,
      reason: leave.reason,
      status: leave.status,
      eventType: 'leave',
      title: `${leave.employee?.firstName || ''} ${leave.employee?.lastName || ''} - ${leave.leaveType}`.trim(),
      color: '#f59e0b',
      isAllDay: true
    }));

    // 4. Get Birthdays and Anniversaries
    const employeeFilters = { status: 'Active' };
    if (departmentId) {
      employeeFilters.department = departmentId;
    }

    const employees = await Employee.findAll({
      where: employeeFilters,
      attributes: ['id', 'employeeId', 'firstName', 'lastName', 'dateOfBirth', 'joiningDate', 'department']
    });

    const currentYear = rangeStart.getFullYear();
    const currentMonth = rangeStart.getMonth();

    employees.forEach(employee => {
      // Birthdays
      if (employee.dateOfBirth) {
        const dob = new Date(employee.dateOfBirth);
        if (dob.getMonth() === currentMonth) {
          const birthdayThisYear = new Date(currentYear, dob.getMonth(), dob.getDate());
          if (birthdayThisYear >= rangeStart && birthdayThisYear <= rangeEnd) {
            calendarData.birthdays.push({
              id: `birthday-${employee.id}`,
              employeeId: employee.id,
              employeeName: `${employee.firstName || ''} ${employee.lastName || ''}`.trim(),
              employeeCode: employee.employeeId,
              date: birthdayThisYear,
              startDate: birthdayThisYear,
              endDate: birthdayThisYear,
              age: currentYear - dob.getFullYear(),
              eventType: 'birthday',
              title: `🎂 ${employee.firstName || ''} ${employee.lastName || ''}`.trim(),
              color: '#ec4899',
              isAllDay: true
            });
          }
        }
      }

      // Work Anniversaries
      if (employee.joiningDate) {
        const joinDate = new Date(employee.joiningDate);
        if (joinDate.getMonth() === currentMonth && joinDate.getFullYear() < currentYear) {
          const anniversaryThisYear = new Date(currentYear, joinDate.getMonth(), joinDate.getDate());
          if (anniversaryThisYear >= rangeStart && anniversaryThisYear <= rangeEnd) {
            const years = currentYear - joinDate.getFullYear();
            calendarData.anniversaries.push({
              id: `anniversary-${employee.id}`,
              employeeId: employee.id,
              employeeName: `${employee.firstName || ''} ${employee.lastName || ''}`.trim(),
              employeeCode: employee.employeeId,
              date: anniversaryThisYear,
              startDate: anniversaryThisYear,
              endDate: anniversaryThisYear,
              years: years,
              eventType: 'anniversary',
              title: `🎊 ${employee.firstName || ''} ${employee.lastName || ''} - ${years} years`.trim(),
              color: '#8b5cf6',
              isAllDay: true
            });
          }
        }
      }
    });

    res.json({
      success: true,
      data: calendarData
    });

  } catch (error) {
    logger.error("Error fetching calendar events:", error);
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