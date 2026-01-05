/**
 * Calendar Day Status Service
 * Implements the smart calendar logic for determining day status
 * Priority: Weekend > Holiday > Working Day
 */

import { WorkingRule, Holiday, LeaveRequest, AttendanceRecord } from '../../models/index.js';
import { Op } from 'sequelize';

class CalendarDayStatusService {
  /**
   * Get the status of a specific date
   * @param {Date} date - The date to check
   * @param {number} employeeId - Optional employee ID for leave/attendance check
   * @returns {Object} - Day status information
   */
  async getDayStatus(date, employeeId = null) {
    const checkDate = new Date(date);
    const dayOfWeek = checkDate.getDay(); // 0 = Sunday, 6 = Saturday
    
    // 1. Check if it's a weekend
    const isWeekend = await WorkingRule.isWeekend(checkDate);
    if (isWeekend) {
      return {
        status: 'WEEKEND',
        type: 'non_working',
        attendanceRequired: false,
        reason: 'Weekend day',
        dayOfWeek,
        date: checkDate.toISOString().split('T')[0]
      };
    }
    
    // 2. Check if it's a holiday
    const holiday = await Holiday.getHolidayForDate(checkDate);
    if (holiday) {
      return {
        status: 'HOLIDAY',
        type: 'non_working',
        attendanceRequired: false,
        reason: holiday.name,
        holiday: holiday,
        dayOfWeek,
        date: checkDate.toISOString().split('T')[0]
      };
    }
    
    // 3. If employee ID provided, check for approved leave
    if (employeeId) {
      const leave = await this.getLeaveForDate(checkDate, employeeId);
      if (leave) {
        return {
          status: 'LEAVE',
          type: 'non_working',
          attendanceRequired: false,
          reason: `${leave.leaveType} Leave`,
          leave: leave,
          dayOfWeek,
          date: checkDate.toISOString().split('T')[0]
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
      date: checkDate.toISOString().split('T')[0]
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
    const currentDate = new Date(startDate);
    
    while (currentDate <= endDate) {
      const dayStatus = await this.getDayStatus(currentDate, employeeId);
      results.push(dayStatus);
      currentDate.setDate(currentDate.getDate() + 1);
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
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0); // Last day of month
    
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