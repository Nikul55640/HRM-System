
import AttendancePolicyService from '../../services/attendance/attendancePolicy.service.js';
import DateCalculationService from '../../services/core/dateCalculation.service.js';
import CalendarDataFetcherService from '../../services/core/calendarDataFetcher.service.js';
import { CompanyEvent, Holiday, LeaveRequest, Employee, WorkingRule } from '../../models/index.js';
import { Op } from 'sequelize';
import logger from '../../utils/logger.js';
import { getLocalDateString } from '../../utils/dateUtils.js';

/**
 * Get Smart Monthly Calendar Data
 * Returns comprehensive calendar data with proper day status evaluation
 */
export const getSmartMonthlyCalendar = async (req, res) => {
  try {
    const { year, month, employeeId, departmentId } = req.query;
    const currentYear = year ? parseInt(year) : new Date().getFullYear();
    const currentMonth = month ? parseInt(month) : new Date().getMonth() + 1;

    // Calculate date range for the month
    const startDate = new Date(currentYear, currentMonth - 1, 1);
    const endDate = new Date(currentYear, currentMonth, 0, 23, 59, 59, 999);

    const isHROrAdmin = ['SuperAdmin', 'HR', 'HR_Manager'].includes(req.user.role);
    const targetEmployeeId = employeeId || (isHROrAdmin ? null : req.user.employeeId);

    // Get monthly summary with day statuses using AttendancePolicyService
    const monthlySummary = await AttendancePolicyService.getMonthlySummary(
      currentYear, 
      currentMonth, 
      targetEmployeeId
    );

    // Debug logging for date issues
    console.log('🔍 Smart Calendar Debug:');
    console.log('📅 First few day statuses from service:');
    monthlySummary.dayStatuses.slice(0, 5).forEach((day, index) => {
      console.log(`  Day ${index + 1}: ${day.date} = dayOfWeek: ${day.dayOfWeek} (${['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][day.dayOfWeek]}), status: ${day.status}`);
    });

    // Get all events for the month using centralized data fetcher
    // 🔧 FIX: Don't fetch leaves separately - use only AttendancePolicyService data
    const fetchedCalendarData = await CalendarDataFetcherService.fetchAllCalendarData(
      startDate, 
      endDate, 
      req.user, 
      { departmentId, employeeId: targetEmployeeId, includeLeaves: false }
    );

    const { holidays, events, birthdays, anniversaries } = fetchedCalendarData;

    // Build calendar data with smart day evaluation
    const calendarData = {};
    
    monthlySummary.dayStatuses.forEach(dayStatus => {
      const dateKey = dayStatus.date;
      const dayEvents = events.filter(event => 
        isEventOnDate(event, new Date(dayStatus.date))
      );
      
      calendarData[dateKey] = {
        ...dayStatus,
        // Add boolean flags for frontend compatibility
        isWeekend: dayStatus.status === 'WEEKEND',
        isWorkingDay: dayStatus.status === 'WORKING_DAY',
        isHoliday: dayStatus.status === 'HOLIDAY',
        events: dayEvents,
        holiday: dayStatus.holiday || null,
        leave: dayStatus.leave || null, // This comes from AttendancePolicyService with correct employee data
        birthdays: birthdays.filter(b => 
          isEventOnDate({ startDate: b.date }, new Date(dayStatus.date))
        ),
        anniversaries: anniversaries.filter(a => 
          isEventOnDate({ startDate: a.date }, new Date(dayStatus.date))
        )
      };
    });

    // 🔧 REMOVED: No longer adding duplicate leaves array - use only the 'leave' property from AttendancePolicyService

    res.json({
      success: true,
      data: {
        year: currentYear,
        month: currentMonth,
        summary: {
          totalDays: monthlySummary.summary.totalDays,
          workingDays: monthlySummary.summary.workingDays,
          weekends: monthlySummary.summary.weekends,
          holidays: monthlySummary.summary.holidays,
          leaves: monthlySummary.summary.leaves
        },
        calendar: calendarData,
        activeWorkingRule: await DateCalculationService.getActiveWorkingRule(startDate)
      }
    });

  } catch (error) {
    logger.error('Error fetching smart monthly calendar:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch calendar data',
      error: error.message
    });
  }
};

/**
 * Get Smart Daily Calendar Data
 */
export const getSmartDailyCalendar = async (req, res) => {
  try {
    const { date } = req.query;
    
    if (!date) {
      return res.status(400).json({
        success: false,
        message: 'Date is required (YYYY-MM-DD format)'
      });
    }

    const checkDate = new Date(date);
    const isHROrAdmin = ['SuperAdmin', 'HR', 'HR_Manager'].includes(req.user.role);
    const targetEmployeeId = isHROrAdmin ? null : req.user.employeeId;

    // Get day status using AttendancePolicyService
    const dayStatus = await AttendancePolicyService.getDayStatus(checkDate, targetEmployeeId);

    // Check if attendance is required
    const attendanceRequired = await AttendancePolicyService.isAttendanceRequired(
      checkDate, 
      targetEmployeeId
    );

    // Get events for the day
    const startOfDay = new Date(checkDate);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(checkDate);
    endOfDay.setHours(23, 59, 59, 999);

    const [events, birthdays, anniversaries] = await Promise.all([
      getEventsForDay(startOfDay, endOfDay, req.user),
      isHROrAdmin ? getBirthdaysForDay(checkDate) : [],
      isHROrAdmin ? getAnniversariesForDay(checkDate) : []
    ]);

    res.json({
      success: true,
      data: {
        // ✅ FIX: Use local timezone
        date: getLocalDateString(checkDate),
        dayStatus,
        attendanceRequired,
        events,
        birthdays,
        anniversaries,
        workingRule: await DateCalculationService.getActiveWorkingRule(checkDate)
      }
    });

  } catch (error) {
    logger.error('Error fetching smart daily calendar:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch daily calendar data',
      error: error.message
    });
  }
};

/**
 * Validate Leave Application
 */
export const validateLeaveApplication = async (req, res) => {
  try {
    const { startDate, endDate, employeeId } = req.body;
    
    if (!startDate || !endDate) {
      return res.status(400).json({
        success: false,
        message: 'Start date and end date are required'
      });
    }

    const targetEmployeeId = employeeId || req.user.employeeId;
    const validation = await AttendancePolicyService.validateLeaveApplication(
      new Date(startDate),
      new Date(endDate),
      targetEmployeeId
    );

    res.json({
      success: true,
      data: validation
    });

  } catch (error) {
    logger.error('Error validating leave application:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to validate leave application',
      error: error.message
    });
  }
};

/**
 * Get Working Days Count
 */
export const getWorkingDaysCount = async (req, res) => {
  try {
    const { startDate, endDate, employeeId } = req.query;
    
    if (!startDate || !endDate) {
      return res.status(400).json({
        success: false,
        message: 'Start date and end date are required'
      });
    }

    const targetEmployeeId = employeeId || req.user.employeeId;
    const workingDays = await AttendancePolicyService.getWorkingDaysCount(
      new Date(startDate),
      new Date(endDate),
      targetEmployeeId
    );

    // Get date range status for breakdown
    const dateRangeStatus = await AttendancePolicyService.getDateRangeStatus(
      new Date(startDate),
      new Date(endDate),
      targetEmployeeId
    );

    const breakdown = {
      weekends: dateRangeStatus.filter(d => d.status === 'WEEKEND').length,
      holidays: dateRangeStatus.filter(d => d.status === 'HOLIDAY').length,
      leaves: dateRangeStatus.filter(d => d.status === 'LEAVE').length,
      total: dateRangeStatus.filter(d => d.status !== 'WORKING_DAY').length
    };

    res.json({
      success: true,
      data: {
        workingDays,
        nonWorkingDays: breakdown,
        totalDays: workingDays + breakdown.total
      }
    });

  } catch (error) {
    logger.error('Error calculating working days:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to calculate working days',
      error: error.message
    });
  }
};

// Helper functions
async function getEventsForMonth(startDate, endDate, user, departmentId) {
  const whereClause = {
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

  const isHROrAdmin = ['SuperAdmin', 'HR', 'HR_Manager'].includes(user.role);
  
  if (!isHROrAdmin) {
    whereClause[Op.and] = [
      whereClause[Op.and] || {},
      {
        [Op.or]: [
          { isPublic: true },
          { createdBy: user.id },
          { organizer: user.id }
        ]
      }
    ];
  }

  if (departmentId) {
    // Add department filtering logic if needed
  }

  return await CompanyEvent.findAll({
    where: whereClause,
    order: [['startDate', 'ASC']]
  });
}

async function getLeavesForMonth(startDate, endDate, user, employeeId) {
  const whereClause = {
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
    status: 'approved'
  };

  // 🔧 REMOVED: Employee filtering - now ALL users see ALL approved leaves
  // No role-based filtering anymore

  return await LeaveRequest.findAll({
    where: whereClause,
    include: [{
      model: Employee,
      as: 'employee', // Add the alias here
      attributes: ['id', 'firstName', 'lastName', 'employeeId'],
      required: true // Ensure we only get leaves with valid employee data
    }],
    order: [['startDate', 'ASC']]
  });
}

async function getEventsForDay(startDate, endDate, user) {
  const whereClause = {
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

  const isHROrAdmin = ['SuperAdmin', 'HR', 'HR_Manager'].includes(user.role);
  
  if (!isHROrAdmin) {
    whereClause[Op.and] = [
      whereClause[Op.and] || {},
      {
        [Op.or]: [
          { isPublic: true },
          { createdBy: user.id },
          { organizer: user.id }
        ]
      }
    ];
  }

  return await CompanyEvent.findAll({
    where: whereClause,
    order: [['startDate', 'ASC']]
  });
}

async function getBirthdaysForMonth(month) {
  return await Employee.findAll({
    where: {
      dateOfBirth: {
        [Op.not]: null
      }
    },
    attributes: ['id', 'firstName', 'lastName', 'employeeId', 'dateOfBirth'],
    raw: true
  }).then(employees => {
    return employees
      .filter(emp => new Date(emp.dateOfBirth).getMonth() + 1 === month)
      .map(emp => ({
        id: `birthday_${emp.id}`,
        employeeId: emp.id,
        employeeName: `${emp.firstName} ${emp.lastName}`,
        employeeCode: emp.employeeId,
        date: new Date(new Date().getFullYear(), month - 1, new Date(emp.dateOfBirth).getDate()),
        type: 'birthday',
        title: `${emp.firstName} ${emp.lastName}'s Birthday`
      }));
  });
}

async function getAnniversariesForMonth(month) {
  return await Employee.findAll({
    where: {
      joiningDate: {
        [Op.not]: null
      }
    },
    attributes: ['id', 'firstName', 'lastName', 'employeeId', 'joiningDate'],
    raw: true
  }).then(employees => {
    return employees
      .filter(emp => new Date(emp.joiningDate).getMonth() + 1 === month)
      .map(emp => ({
        id: `anniversary_${emp.id}`,
        employeeId: emp.id,
        employeeName: `${emp.firstName} ${emp.lastName}`,
        employeeCode: emp.employeeId,
        date: new Date(new Date().getFullYear(), month - 1, new Date(emp.joiningDate).getDate()),
        type: 'anniversary',
        title: `${emp.firstName} ${emp.lastName}'s Work Anniversary`
      }));
  });
}

async function getBirthdaysForDay(date) {
  const month = date.getMonth() + 1;
  const day = date.getDate();
  
  return await Employee.findAll({
    where: {
      dateOfBirth: {
        [Op.not]: null
      }
    },
    attributes: ['id', 'firstName', 'lastName', 'employeeId', 'dateOfBirth'],
    raw: true
  }).then(employees => {
    return employees
      .filter(emp => {
        const birthDate = new Date(emp.dateOfBirth);
        return birthDate.getMonth() + 1 === month && birthDate.getDate() === day;
      })
      .map(emp => ({
        id: `birthday_${emp.id}`,
        employeeId: emp.id,
        employeeName: `${emp.firstName} ${emp.lastName}`,
        employeeCode: emp.employeeId,
        date: date,
        type: 'birthday',
        title: `${emp.firstName} ${emp.lastName}'s Birthday`
      }));
  });
}

async function getAnniversariesForDay(date) {
  const month = date.getMonth() + 1;
  const day = date.getDate();
  
  return await Employee.findAll({
    where: {
      joiningDate: {
        [Op.not]: null
      }
    },
    attributes: ['id', 'firstName', 'lastName', 'employeeId', 'joiningDate'],
    raw: true
  }).then(employees => {
    return employees
      .filter(emp => {
        const joinDate = new Date(emp.joiningDate);
        return joinDate.getMonth() + 1 === month && joinDate.getDate() === day;
      })
      .map(emp => ({
        id: `anniversary_${emp.id}`,
        employeeId: emp.id,
        employeeName: `${emp.firstName} ${emp.lastName}`,
        employeeCode: emp.employeeId,
        date: date,
        type: 'anniversary',
        title: `${emp.firstName} ${emp.lastName}'s Work Anniversary`
      }));
  });
}

function isEventOnDate(event, date) {
  const eventStart = new Date(event.startDate);
  const eventEnd = new Date(event.endDate || event.startDate);
  const checkDate = new Date(date);
  
  checkDate.setHours(0, 0, 0, 0);
  const nextDay = new Date(checkDate);
  nextDay.setDate(nextDay.getDate() + 1);
  
  return eventStart < nextDay && eventEnd >= checkDate;
}
