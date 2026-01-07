
import calendarDayStatusService from '../../services/calendar/calendarDayStatus.service.js';
import { CompanyEvent, Holiday, LeaveRequest, Employee, WorkingRule } from '../../models/index.js';
import { Op } from 'sequelize';
import logger from '../../utils/logger.js';

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

    // Get monthly summary with day statuses
    const monthlySummary = await calendarDayStatusService.getMonthlySummary(
      currentYear, 
      currentMonth, 
      targetEmployeeId
    );

    // Get all events for the month
    const [holidays, events, leaves] = await Promise.all([
      Holiday.getHolidaysInRange(startDate, endDate),
      getEventsForMonth(startDate, endDate, req.user, departmentId),
      getLeavesForMonth(startDate, endDate, req.user, targetEmployeeId)
    ]);

    // Get birthdays and anniversaries if HR/Admin
    let birthdays = [];
    let anniversaries = [];
    
    if (isHROrAdmin) {
      [birthdays, anniversaries] = await Promise.all([
        getBirthdaysForMonth(currentMonth),
        getAnniversariesForMonth(currentMonth)
      ]);
    }

    // Build calendar data with smart day evaluation
    const calendarData = {};
    
    monthlySummary.dayStatuses.forEach(dayStatus => {
      const dateKey = dayStatus.date;
      const dayEvents = events.filter(event => 
        isEventOnDate(event, new Date(dayStatus.date))
      );
      
      calendarData[dateKey] = {
        ...dayStatus,
        events: dayEvents,
        holiday: dayStatus.holiday || null,
        leave: dayStatus.leave || null,
        birthdays: birthdays.filter(b => 
          isEventOnDate({ startDate: b.date }, new Date(dayStatus.date))
        ),
        anniversaries: anniversaries.filter(a => 
          isEventOnDate({ startDate: a.date }, new Date(dayStatus.date))
        )
      };
    });

    res.json({
      success: true,
      data: {
        year: currentYear,
        month: currentMonth,
        summary: {
          totalDays: monthlySummary.totalDays,
          workingDays: monthlySummary.workingDays,
          weekends: monthlySummary.nonWorkingDays.weekends,
          holidays: monthlySummary.nonWorkingDays.holidays,
          leaves: monthlySummary.nonWorkingDays.leaves
        },
        calendar: calendarData,
        activeWorkingRule: await WorkingRule.getActiveRule(startDate)
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

    // Get day status
    const dayStatus = await calendarDayStatusService.getDayStatus(checkDate, targetEmployeeId);

    // Get attendance requirement
    const attendanceReq = await calendarDayStatusService.getAttendanceRequirement(
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
        date: checkDate.toISOString().split('T')[0],
        dayStatus,
        attendanceRequirement: attendanceReq,
        events,
        birthdays,
        anniversaries,
        workingRule: await WorkingRule.getActiveRule(checkDate)
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
    const validation = await calendarDayStatusService.validateLeaveApplication(
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
    const workingDays = await calendarDayStatusService.getWorkingDaysCount(
      new Date(startDate),
      new Date(endDate),
      targetEmployeeId
    );

    const breakdown = await calendarDayStatusService.getNonWorkingDaysBreakdown(
      new Date(startDate),
      new Date(endDate),
      targetEmployeeId
    );

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

  const isHROrAdmin = ['SuperAdmin', 'HR', 'HR_Manager'].includes(user.role);
  
  if (!isHROrAdmin && employeeId) {
    whereClause.employeeId = employeeId;
  }

  return await LeaveRequest.findAll({
    where: whereClause,
    include: [{
      model: Employee,
      as: 'employee', // Add the alias here
      attributes: ['firstName', 'lastName', 'employeeId']
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
        title: `🎂 ${emp.firstName} ${emp.lastName}'s Birthday`
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
        title: `🎊 ${emp.firstName} ${emp.lastName}'s Work Anniversary`
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
        title: `🎂 ${emp.firstName} ${emp.lastName}'s Birthday`
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
        title: `🎊 ${emp.firstName} ${emp.lastName}'s Work Anniversary`
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