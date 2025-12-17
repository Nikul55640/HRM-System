import { CompanyEvent, Employee, LeaveRequest, AttendanceRecord } from "../../models/sequelize/index.js";
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

    // 1. Get Company Events (holidays, meetings, trainings) - Using working approach
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
      attributes: ['id', 'title', 'description', 'startDate', 'endDate', 'eventType', 'isAllDay', 'color', 'location', 'priority'],
      order: [['startDate', 'ASC']]
    });

    // Separate holidays from other events
    calendarData.events = events.filter(e => e.eventType !== 'holiday');
    calendarData.holidays = events.filter(e => e.eventType === 'holiday');

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
          where: { 'jobInfo.managerId': req.user.id },
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
        attributes: ['id', 'employeeId', 'personalInfo', 'jobInfo']
      }],
      order: [['startDate', 'ASC']]
    });

    calendarData.leaves = leaves.map(leave => ({
      id: leave.id,
      employeeId: leave.employeeId,
      employeeName: `${leave.employee?.personalInfo?.firstName || ''} ${leave.employee?.personalInfo?.lastName || ''}`.trim(),
      employeeCode: leave.employee?.employeeId,
      department: leave.employee?.jobInfo?.departmentName || 'N/A',
      leaveType: leave.leaveType,
      startDate: leave.startDate,
      endDate: leave.endDate,
      totalDays: leave.totalDays,
      isHalfDay: leave.isHalfDay,
      halfDayPeriod: leave.halfDayPeriod,
      reason: leave.reason,
      status: leave.status
    }));

    // 3. Get Birthdays and Anniversaries
    const employeeFilters = { status: 'Active' };
    if (departmentId) {
      employeeFilters['jobInfo.departmentId'] = departmentId;
    }

    const employees = await Employee.findAll({
      where: employeeFilters,
      attributes: ['id', 'employeeId', 'personalInfo', 'jobInfo']
    });

    employees.forEach(employee => {
      // Birthdays
      if (employee.personalInfo?.dateOfBirth) {
        const dob = new Date(employee.personalInfo.dateOfBirth);
        if (dob.getMonth() === currentMonth - 1) {
          const birthdayThisYear = new Date(currentYear, dob.getMonth(), dob.getDate());
          calendarData.birthdays.push({
            id: `birthday-${employee.id}`,
            employeeId: employee.id,
            employeeName: `${employee.personalInfo.firstName || ''} ${employee.personalInfo.lastName || ''}`.trim(),
            employeeCode: employee.employeeId,
            date: birthdayThisYear,
            age: currentYear - dob.getFullYear()
          });
        }
      }

      // Work Anniversaries
      if (employee.jobInfo?.joiningDate) {
        const joinDate = new Date(employee.jobInfo.joiningDate);
        if (joinDate.getMonth() === currentMonth - 1 && joinDate.getFullYear() < currentYear) {
          const anniversaryThisYear = new Date(currentYear, joinDate.getMonth(), joinDate.getDate());
          const years = currentYear - joinDate.getFullYear();
          calendarData.anniversaries.push({
            id: `anniversary-${employee.id}`,
            employeeId: employee.id,
            employeeName: `${employee.personalInfo.firstName || ''} ${employee.personalInfo.lastName || ''}`.trim(),
            employeeCode: employee.employeeId,
            date: anniversaryThisYear,
            years: years
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
            where: { 'jobInfo.managerId': req.user.id },
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
          attributes: ['id', 'employeeId', 'personalInfo']
        }],
        order: [['date', 'ASC']]
      });

      calendarData.attendance = attendance.map(record => ({
        id: record.id,
        employeeId: record.employeeId,
        employeeName: `${record.employee?.personalInfo?.firstName || ''} ${record.employee?.personalInfo?.lastName || ''}`.trim(),
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
          where: { 'jobInfo.managerId': req.user.id },
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
        attributes: ['id', 'employeeId', 'personalInfo']
      }]
    });

    dailyData.leaves = leaves.map(leave => ({
      id: leave.id,
      employeeId: leave.employeeId,
      employeeName: `${leave.employee?.personalInfo?.firstName || ''} ${leave.employee?.personalInfo?.lastName || ''}`.trim(),
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
            where: { 'jobInfo.managerId': req.user.id },
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
          attributes: ['id', 'employeeId', 'personalInfo']
        }]
      });

      dailyData.attendance = attendance.map(record => ({
        id: record.id,
        employeeId: record.employeeId,
        employeeName: `${record.employee?.personalInfo?.firstName || ''} ${record.employee?.personalInfo?.lastName || ''}`.trim(),
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

export default {
  getMonthlyCalendarData,
  getDailyCalendarData,
  applyLeaveFromCalendar
};