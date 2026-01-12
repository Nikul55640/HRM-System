/**
 * Calendar Day Status Service
 * Implements the smart calendar logic for determining day status
 * Priority: Weekend > Holiday > Working Day
 */

import { WorkingRule, Holiday, LeaveRequest } from '../../models/index.js';
import { Op } from 'sequelize';

// UTC-safe helper functions
function formatLocalDate(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

function getDayOfWeekUTC(year, month, day) {
  return new Date(Date.UTC(year, month - 1, day)).getUTCDay();
}

class CalendarDayStatusService {
  /**
   * Get the status of a specific date
   * @param {Date} date - The date to check
   * @param {number} employeeId - Optional employee ID for leave/attendance check
   * @returns {Object} - Day status information
   */
  async getDayStatus(date, employeeId = null) {
    let year, month, day;
    
    if (typeof date === 'string') {
      [year, month, day] = date.split('-').map(Number);
    } else {
      year = date.getFullYear();
      month = date.getMonth() + 1;
      day = date.getDate();
    }
    
    const dayOfWeek = getDayOfWeekUTC(year, month, day);
    const dateStr = `${year}-${String(month).padStart(2,'0')}-${String(day).padStart(2,'0')}`;
    
    // 1. Check if it's a weekend
    const isWeekend = await WorkingRule.isWeekendByDayIndex(dayOfWeek);
    if (isWeekend) {
      return {
        status: 'WEEKEND',
        type: 'non_working',
        attendanceRequired: false,
        reason: 'Weekend day',
        dayOfWeek,
        date: dateStr
      };
    }
    
    // 2. Check if it's a holiday
    const holiday = await Holiday.getHolidayForDate(dateStr);
    if (holiday) {
      return {
        status: 'HOLIDAY',
        type: 'non_working',
        attendanceRequired: false,
        reason: holiday.name,
        holiday: holiday,
        dayOfWeek,
        date: dateStr
      };
    }
    
    // 3. If employee ID provided, check for approved leave
    if (employeeId) {
      const leave = await this.getLeaveForDateUTC(year, month, day, employeeId);
      if (leave) {
        return {
          status: 'LEAVE',
          type: 'non_working',
          attendanceRequired: false,
          reason: `${leave.leaveType} Leave`,
          leave: leave,
          dayOfWeek,
          date: dateStr
        };
      }
    }
    
    // 4. Default to working day
    return {
      status: 'WORKING_DAY',
      type: 'working',
      attendanceRequired: true,
      reason: 'Regular working day',
      dayOfWeek,
      date: dateStr
    };
  }
  
  /**
   * Get day status for a date range
   * @param {Date} startDate - Start date
   * @param {Date} endDate - End date
   * @param {number} employeeId - Optional employee ID
   * @returns {Array} - Array of day status objects
   */
  async getDayStatusRange(startDate, endDate, employeeId = null) {
    const results = [];
    
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    for (
      let d = new Date(start.getFullYear(), start.getMonth(), start.getDate());
      d <= end;
      d.setDate(d.getDate() + 1)
    ) {
      const dateStr = formatLocalDate(d);
      results.push(await this.getDayStatus(dateStr, employeeId));
    }
    
    return results;
  }
  
  /**
   * Get working days count in a date range
   * @param {Date} startDate - Start date
   * @param {Date} endDate - End date
   * @param {number} employeeId - Optional employee ID to exclude leave days
   * @returns {number} - Number of working days
   */
  async getWorkingDaysCount(startDate, endDate, employeeId = null) {
    const dayStatuses = await this.getDayStatusRange(startDate, endDate, employeeId);
    return dayStatuses.filter(day => day.status === 'WORKING_DAY').length;
  }
  
  /**
   * Get non-working days count in a date range
   * @param {Date} startDate - Start date
   * @param {Date} endDate - End date
   * @param {number} employeeId - Optional employee ID
   * @returns {Object} - Breakdown of non-working days
   */
  async getNonWorkingDaysBreakdown(startDate, endDate, employeeId = null) {
    const dayStatuses = await this.getDayStatusRange(startDate, endDate, employeeId);
    
    const breakdown = {
      weekends: 0,
      holidays: 0,
      leaves: 0,
      total: 0
    };
    
    dayStatuses.forEach(day => {
      if (day.status === 'WEEKEND') breakdown.weekends++;
      else if (day.status === 'HOLIDAY') breakdown.holidays++;
      else if (day.status === 'LEAVE') breakdown.leaves++;
    });
    
    breakdown.total = breakdown.weekends + breakdown.holidays + breakdown.leaves;
    return breakdown;
  }
  
  /**
   * Check if leave application is valid (doesn't include weekends/holidays)
   * @param {Date} startDate - Leave start date
   * @param {Date} endDate - Leave end date
   * @param {number} employeeId - Employee ID
   * @returns {Object} - Validation result
   */
  async validateLeaveApplication(startDate, endDate, employeeId) {
    const dayStatuses = await this.getDayStatusRange(startDate, endDate, employeeId);
    
    const invalidDays = dayStatuses.filter(day => 
      day.status === 'WEEKEND' || day.status === 'HOLIDAY'
    );
    
    const validLeaveDays = dayStatuses.filter(day => 
      day.status === 'WORKING_DAY'
    ).length;
    
    return {
      isValid: invalidDays.length === 0,
      validLeaveDays,
      invalidDays: invalidDays.map(day => ({
        date: day.date,
        reason: day.reason,
        status: day.status
      })),
      message: invalidDays.length > 0 
        ? `Leave application includes ${invalidDays.length} non-working days`
        : 'Leave application is valid'
    };
  }
  
  /**
   * Get leave for a specific date and employee (UTC-safe version)
   * @param {number} year - Year
   * @param {number} month - Month (1-12)
   * @param {number} day - Day
   * @param {number} employeeId - Employee ID
   * @returns {Object|null} - Leave request if found
   */
  async getLeaveForDateUTC(year, month, day, employeeId) {
    const dateStr = `${year}-${String(month).padStart(2,'0')}-${String(day).padStart(2,'0')}`;
    
    return await LeaveRequest.findOne({
      where: {
        employeeId,
        status: 'approved',
        startDate: { [Op.lte]: dateStr },
        endDate: { [Op.gte]: dateStr }
      }
    });
  }

  /**
   * Get leave for a specific date and employee
   * @param {Date} date - Date to check
   * @param {number} employeeId - Employee ID
   * @returns {Object|null} - Leave request if found
   */
  async getLeaveForDate(date, employeeId) {
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);
    
    return await LeaveRequest.findOne({
      where: {
        employeeId,
        status: 'approved',
        startDate: { [Op.lte]: endOfDay },
        endDate: { [Op.gte]: startOfDay }
      }
    });
  }
  
  /**
   * Get attendance requirement for a date
   * @param {Date} date - Date to check
   * @param {number} employeeId - Employee ID
   * @returns {Object} - Attendance requirement info
   */
  async getAttendanceRequirement(date, employeeId) {
    const dayStatus = await this.getDayStatus(date, employeeId);
    
    return {
      required: dayStatus.attendanceRequired,
      status: dayStatus.status,
      reason: dayStatus.reason,
      autoStatus: dayStatus.status === 'HOLIDAY' ? 'holiday' : 
                  dayStatus.status === 'WEEKEND' ? 'weekend' :
                  dayStatus.status === 'LEAVE' ? 'leave' : null
    };
  }
  
  /**
   * Get monthly calendar summary
   * @param {number} year - Year
   * @param {number} month - Month (1-12)
   * @param {number} employeeId - Optional employee ID
   * @returns {Object} - Monthly summary
   */
  async getMonthlySummary(year, month, employeeId = null) {
    // Create dates using explicit year, month, day to avoid timezone issues
    const startDate = new Date(year, month - 1, 1); // First day of month
    const endDate = new Date(year, month, 0); // Last day of month (0th day of next month)
    
    const dayStatuses = await this.getDayStatusRange(startDate, endDate, employeeId);
    const nonWorkingBreakdown = await this.getNonWorkingDaysBreakdown(startDate, endDate, employeeId);
    
    return {
      year,
      month,
      totalDays: dayStatuses.length,
      workingDays: dayStatuses.filter(d => d.status === 'WORKING_DAY').length,
      nonWorkingDays: nonWorkingBreakdown,
      dayStatuses
    };
  }
}

export default new CalendarDayStatusService();