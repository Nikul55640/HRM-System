import { AttendanceRecord, LeaveRequest, CompanyEvent, Employee, Holiday } from "../../models/sequelize/index.js";
import { Op } from 'sequelize';
import { 
  normalizeBirthday, 
  normalizeAnniversary, 
  isEventInDateRange 
} from "../../utils/calendarEventNormalizer.js";

/**
 * ENHANCED EMPLOYEE CALENDAR - Shows ALL company events
 * ✅ Secure: No sensitive data exposed
 * ✅ Complete: All birthdays, anniversaries, holidays, leaves
 * ✅ Optimized: Efficient data fetching and processing
 */

/**
 * DAILY EMPLOYEE CALENDAR API
 * GET /api/employee/calendar/daily?date=2025-02-05
 * Returns attendance + ALL company events for the day
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
       1️⃣ FETCH USER'S ATTENDANCE
    -------------------------------------------------- */
    const attendance = await AttendanceRecord.findOne({
      where: {
        employeeId,
        date: {
          [Op.between]: [start, end]
        }
      }
    });

    /* --------------------------------------------------
       2️⃣ FETCH USER'S LEAVE
    -------------------------------------------------- */
    const userLeave = await LeaveRequest.findOne({
      where: {
        employeeId,
        status: "approved",
        startDate: { [Op.lte]: end },
        endDate: { [Op.gte]: start }
      }
    });

    /* --------------------------------------------------
       3️⃣ FETCH ALL COMPANY LEAVES (Employee-Safe)
    -------------------------------------------------- */
    const allLeaves = await LeaveRequest.findAll({
      where: {
        status: "approved",
        startDate: { [Op.lte]: end },
        endDate: { [Op.gte]: start }
      },
      include: [{
        model: Employee,
        as: 'employee',
        attributes: ['firstName', 'lastName', 'employeeId'] // Safe fields only
      }]
    });

    /* --------------------------------------------------
       4️⃣ FETCH ALL HOLIDAYS
    -------------------------------------------------- */
    const holidays = await Holiday.findAll({
      where: {
        [Op.or]: [
          // One-time holidays for this date
          {
            type: 'ONE_TIME',
            date: {
              [Op.between]: [start, end]
            }
          },
          // Recurring holidays (MM-DD format)
          {
            type: 'RECURRING',
            recurringDate: day.toISOString().slice(5, 10) // Extract MM-DD
          }
        ]
      }
    });

    /* --------------------------------------------------
       5️⃣ FETCH ALL EMPLOYEES FOR BIRTHDAYS/ANNIVERSARIES
    -------------------------------------------------- */
    const allEmployees = await Employee.findAll({
      attributes: ['id', 'firstName', 'lastName', 'employeeId', 'dateOfBirth', 'joiningDate']
    });

    // Generate birthday and anniversary events for the day
    const currentYear = day.getFullYear();
    const birthdayEvents = [];
    const anniversaryEvents = [];

    allEmployees.forEach(employee => {
      // Generate birthday events
      if (employee.dateOfBirth) {
        const birthdayEvent = normalizeBirthday(employee, currentYear);
        if (isEventInDateRange(birthdayEvent, start, end)) {
          birthdayEvents.push(birthdayEvent);
        }
      }

      // Generate anniversary events
      if (employee.joiningDate) {
        const anniversaryEvent = normalizeAnniversary(employee, currentYear);
        if (isEventInDateRange(anniversaryEvent, start, end)) {
          anniversaryEvents.push(anniversaryEvent);
        }
      }
    });

    /* --------------------------------------------------
       6️⃣ FETCH COMPANY EVENTS (meetings, announcements, etc.)
    -------------------------------------------------- */
    const companyEvents = await CompanyEvent.findAll({
      where: {
        startDate: { [Op.lte]: end },
        endDate: { [Op.gte]: start },
        status: 'scheduled'
      }
    });

    /* --------------------------------------------------
       7️⃣ PROCESS AND CATEGORIZE EVENTS
    -------------------------------------------------- */
    const processedEvents = {
      holidays: holidays.map(h => ({
        id: h.id,
        name: h.name,
        type: 'holiday',
        date: date,
        color: h.color || '#EF4444',
        category: h.category
      })),
      
      leaves: allLeaves.map(l => ({
        id: l.id,
        employeeName: `${l.employee?.firstName || ''} ${l.employee?.lastName || ''}`.trim(),
        leaveType: l.leaveType,
        type: 'leave',
        date: date,
        color: '#F59E0B',
        duration: l.duration || 'Full Day'
      })),
      
      birthdays: birthdayEvents.map(b => ({
        id: b.id,
        employeeName: b.employeeName,
        title: b.title,
        type: 'birthday',
        date: date,
        color: '#10B981'
      })),
      
      anniversaries: anniversaryEvents.map(a => ({
        id: a.id,
        employeeName: a.employeeName,
        title: a.title,
        type: 'anniversary',
        date: date,
        color: '#8B5CF6',
        years: a.years || null
      })),
      
      events: companyEvents.map(e => ({
        id: e.id,
        title: e.title,
        type: e.eventType || 'event',
        date: date,
        color: e.color || '#3B82F6',
        description: e.description
      }))
    };

    /* --------------------------------------------------
       8️⃣ FINAL RESPONSE
    -------------------------------------------------- */
    return res.json({
      success: true,
      date,
      data: {
        // User's personal data
        attendance: attendance || null,
        userLeave: userLeave || null,
        
        // Company-wide data (employee-safe)
        ...processedEvents,
        
        // Summary counts
        summary: {
          totalHolidays: processedEvents.holidays.length,
          totalLeaves: processedEvents.leaves.length,
          totalBirthdays: processedEvents.birthdays.length,
          totalAnniversaries: processedEvents.anniversaries.length,
          totalEvents: processedEvents.events.length
        }
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
 * ENHANCED MONTHLY EMPLOYEE CALENDAR
 * GET /api/employee/calendar/monthly?year=2025&month=2
 * Returns ALL company events for the month
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
    const [userAttendance, userLeaves, allLeaves, holidays, allEmployees, companyEvents] = await Promise.all([
      // User's personal data
      AttendanceRecord.findAll({
        where: {
          employeeId,
          date: { [Op.between]: [start, end] }
        }
      }),

      LeaveRequest.findAll({
        where: {
          employeeId,
          status: "approved",
          startDate: { [Op.lte]: end },
          endDate: { [Op.gte]: start }
        }
      }),

      // ALL company leaves (employee-safe)
      LeaveRequest.findAll({
        where: {
          status: "approved",
          startDate: { [Op.lte]: end },
          endDate: { [Op.gte]: start }
        },
        include: [{
          model: Employee,
          as: 'employee',
          attributes: ['firstName', 'lastName', 'employeeId']
        }]
      }),

      // ALL holidays for the month
      Holiday.findAll({
        where: {
          [Op.or]: [
            // One-time holidays in this month
            {
              type: 'ONE_TIME',
              date: { [Op.between]: [start, end] }
            },
            // Recurring holidays (check if MM-DD falls in this month)
            {
              type: 'RECURRING',
              recurringDate: {
                [Op.like]: `${String(month).padStart(2, '0')}-%`
              }
            }
          ]
        }
      }),

      // ALL employees for birthday/anniversary generation
      Employee.findAll({
        attributes: ['id', 'firstName', 'lastName', 'employeeId', 'dateOfBirth', 'joiningDate']
      }),

      // Company events (meetings, announcements, etc.)
      CompanyEvent.findAll({
        where: {
          startDate: { [Op.lte]: end },
          endDate: { [Op.gte]: start },
          status: 'scheduled'
        }
      })
    ]);

    /* --------------------------------------------------
       BUILD ENHANCED DAY-BY-DAY STRUCTURE
    -------------------------------------------------- */
    const daysInMonth = new Date(year, month, 0).getDate();
    const calendar = {};

    console.log(`📅 [CALENDAR] Building calendar for ${year}-${month} with ${allEmployees.length} employees`);
    console.log(`📅 [CALENDAR] Found ${allLeaves.length} approved leaves in date range:`);
    allLeaves.forEach(leave => {
      console.log(`   - ${leave.employee?.firstName} ${leave.employee?.lastName}: ${leave.leaveType} (${leave.startDate} to ${leave.endDate})`);
    });
    console.log(`📅 [CALENDAR] Employees with birthdays:`, allEmployees.filter(e => e.dateOfBirth).map(e => `${e.firstName} ${e.lastName} (${e.dateOfBirth})`));

    for (let day = 1; day <= daysInMonth; day++) {
      const currentDate = new Date(year, month - 1, day);
      const dayStart = new Date(currentDate.setHours(0, 0, 0, 0));
      const dayEnd = new Date(currentDate.setHours(23, 59, 59, 999));
      const dateStr = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;

      // User's personal data
      const attendance = userAttendance.find(
        (a) => new Date(a.date).toDateString() === dayStart.toDateString()
      );

      const userLeave = userLeaves.find(
        (l) => l.startDate <= dayEnd && l.endDate >= dayStart
      );

      // Company-wide data
      const dayLeaves = allLeaves.filter(
        (l) => {
          // ✅ FIX: Convert dates to proper Date objects for comparison
          const leaveStart = new Date(l.startDate);
          const leaveEnd = new Date(l.endDate);
          
          // Debug logging for February 4, 2026
          if (dateStr === '2026-02-04') {
            console.log(`🔍 [LEAVE DEBUG] Checking leave for ${dateStr}:`);
            console.log(`   Leave: ${l.employee?.firstName} ${l.employee?.lastName} - ${l.leaveType}`);
            console.log(`   Leave Start: ${leaveStart.toISOString()} (${leaveStart.toDateString()})`);
            console.log(`   Leave End: ${leaveEnd.toISOString()} (${leaveEnd.toDateString()})`);
            console.log(`   Day Start: ${dayStart.toISOString()} (${dayStart.toDateString()})`);
            console.log(`   Day End: ${dayEnd.toISOString()} (${dayEnd.toDateString()})`);
            console.log(`   Condition 1 (leaveStart <= dayEnd): ${leaveStart <= dayEnd}`);
            console.log(`   Condition 2 (leaveEnd >= dayStart): ${leaveEnd >= dayStart}`);
            console.log(`   Result: ${leaveStart <= dayEnd && leaveEnd >= dayStart}`);
          }
          
          return leaveStart <= dayEnd && leaveEnd >= dayStart;
        }
      );

      const dayHolidays = holidays.filter(h => {
        if (h.type === 'ONE_TIME') {
          const holidayDate = new Date(h.date);
          return holidayDate.toDateString() === dayStart.toDateString();
        } else if (h.type === 'RECURRING') {
          const monthDay = `${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
          return h.recurringDate === monthDay;
        }
        return false;
      });

      const dayEvents = companyEvents.filter(
        (ev) => ev.startDate <= dayEnd && ev.endDate >= dayStart
      );

      // Generate birthday and anniversary events for this day
      const dayBirthdays = [];
      const dayAnniversaries = [];

      allEmployees.forEach(employee => {
        // Generate birthday events
        if (employee.dateOfBirth) {
          try {
            const birthdayEvent = normalizeBirthday(employee, year);
            
            // ✅ FIX: Use proper date comparison for birthdays
            const birthdayDate = new Date(birthdayEvent.startDate);
            const birthdayDateOnly = new Date(birthdayDate.getFullYear(), birthdayDate.getMonth(), birthdayDate.getDate());
            const dayStartOnly = new Date(dayStart.getFullYear(), dayStart.getMonth(), dayStart.getDate());
            
            if (birthdayDateOnly.getTime() === dayStartOnly.getTime()) {
              console.log(`🎂 [CALENDAR] Adding birthday for ${employee.firstName} ${employee.lastName} on ${dateStr}`);
              dayBirthdays.push(birthdayEvent);
            }
          } catch (error) {
            console.error(`❌ [CALENDAR] Error processing birthday for ${employee.firstName} ${employee.lastName}:`, error);
          }
        }

        // Generate anniversary events
        if (employee.joiningDate) {
          try {
            const anniversaryEvent = normalizeAnniversary(employee, year);
            
            // ✅ FIX: Use proper date comparison for anniversaries
            const anniversaryDate = new Date(anniversaryEvent.startDate);
            const anniversaryDateOnly = new Date(anniversaryDate.getFullYear(), anniversaryDate.getMonth(), anniversaryDate.getDate());
            const dayStartOnly = new Date(dayStart.getFullYear(), dayStart.getMonth(), dayStart.getDate());
            
            if (anniversaryDateOnly.getTime() === dayStartOnly.getTime()) {
              console.log(`🎉 [CALENDAR] Adding anniversary for ${employee.firstName} ${employee.lastName} on ${dateStr}`);
              dayAnniversaries.push(anniversaryEvent);
            }
          } catch (error) {
            console.error(`❌ [CALENDAR] Error processing anniversary for ${employee.firstName} ${employee.lastName}:`, error);
          }
        }
      });

      // Build day data
      calendar[day] = {
        date: dateStr,
        
        // User's personal data
        attendance: attendance || null,
        userLeave: userLeave || null,
        
        // Company-wide data (employee-safe)
        holidays: dayHolidays.map(h => ({
          id: h.id,
          name: h.name,
          type: 'holiday',
          color: h.color || '#EF4444',
          category: h.category
        })),
        
        leaves: dayLeaves.map(l => ({
          id: l.id,
          employeeName: `${l.employee?.firstName || ''} ${l.employee?.lastName || ''}`.trim(),
          leaveType: l.leaveType,
          type: 'leave',
          color: '#F59E0B',
          duration: l.duration || 'Full Day'
        })),
        
        birthdays: dayBirthdays.map(b => ({
          id: b.id,
          employeeName: b.employeeName,
          title: b.title,
          type: 'birthday',
          color: '#10B981'
        })),
        
        anniversaries: dayAnniversaries.map(a => ({
          id: a.id,
          employeeName: a.employeeName,
          title: a.title,
          type: 'anniversary',
          color: '#8B5CF6',
          years: a.years || null
        })),
        
        events: dayEvents.map(e => ({
          id: e.id,
          title: e.title,
          type: e.eventType || 'event',
          color: e.color || '#3B82F6',
          description: e.description
        }))
      };
    }

    return res.json({ 
      success: true, 
      month, 
      year, 
      calendar,
      summary: {
        totalDays: daysInMonth,
        daysWithEvents: Object.values(calendar).filter(day => 
          day.holidays.length > 0 || 
          day.leaves.length > 0 || 
          day.birthdays.length > 0 || 
          day.anniversaries.length > 0 || 
          day.events.length > 0
        ).length
      }
    });
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
  getDailyCalendar,
}