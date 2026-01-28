/**
 * Attendance Policy Service
 * Implements attendance policy logic for determining day status and requirements
 * Priority: Weekend > Holiday > Leave > Working Day
 * 
 * IMPORTANT: This service should ONLY be used by:
 * - Attendance tracking
 * - Leave validation
 * - Payroll calculations
 * 
 * NOT for calendar UI - use CalendarService for UI needs
 */

import { WorkingRule, Holiday, LeaveRequest } from '../../models/index.js';
import DateCalculationService from '../core/dateCalculation.service.js';
import HolidayService from '../admin/holiday.service.js';
import { Op } from 'sequelize';

class AttendancePolicyService {
  /**
   * Get the attendance policy status of a specific date
   * @param {Date|string} date - The date to check
   * @param {number} employeeId - Optional employee ID for leave/attendance check
   * @returns {Promise<Object>} - Day status information for attendance purposes
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
    
    const dayOfWeek = DateCalculationService.getDayOfWeekUTC(date);
    const dateStr = DateCalculationService.formatLocalDate(new Date(year, month - 1, day));
    
    // 1. Check if it's a weekend (highest priority)
    // Get working rule for the specific date, not today's date
    const targetDate = new Date(year, month - 1, day);
    const workingRule = await DateCalculationService.getActiveWorkingRule(targetDate);
    const isWeekend = await DateCalculationService.isWeekendByDayIndex(dayOfWeek, workingRule);
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
    
    // 2. Check if it's a holiday (second priority) - use HolidayService as single source of truth
    const holidayResult = await HolidayService.isHoliday(dateStr);
    if (holidayResult.success && holidayResult.data.isHoliday) {
      const holiday = holidayResult.data.holiday;
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
    
    // 3. If employee ID provided, check for approved leave (third priority)
    if (employeeId) {
      const leave = await this.getLeaveForDate(dateStr, employeeId);
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
    
    // 4. Default to working day (lowest priority)
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
   * Get attendance policy status for a date range
   * @param {Date} startDate - Start date
   * @param {Date} endDate - End date
   * @param {number} employeeId - Optional employee ID
   * @returns {Promise<Array>} - Array of day status objects
   */
  async getDateRangeStatus(startDate, endDate, employeeId = null) {
    const dayStatuses = [];
    const currentDate = new Date(startDate);
    
    while (currentDate <= endDate) {
      const dayStatus = await this.getDayStatus(currentDate, employeeId);
      dayStatuses.push(dayStatus);
      currentDate.setDate(currentDate.getDate() + 1);
    }
    
    return dayStatuses;
  }
  
  /**
   * Get monthly attendance policy summary
   * @param {number} year - Year
   * @param {number} month - Month (1-12)
   * @param {number} employeeId - Optional employee ID
   * @returns {Promise<Object>} - Monthly summary with day statuses
   */
  async getMonthlySummary(year, month, employeeId = null) {
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0, 23, 59, 59, 999);
    
    const dayStatuses = await this.getDateRangeStatus(startDate, endDate, employeeId);
    
    // Calculate summary statistics
    const summary = {
      totalDays: dayStatuses.length,
      workingDays: dayStatuses.filter(d => d.status === 'WORKING_DAY').length,
      weekends: dayStatuses.filter(d => d.status === 'WEEKEND').length,
      holidays: dayStatuses.filter(d => d.status === 'HOLIDAY').length,
      leaves: dayStatuses.filter(d => d.status === 'LEAVE').length,
      attendanceRequiredDays: dayStatuses.filter(d => d.attendanceRequired).length
    };
    
    return {
      year,
      month,
      employeeId,
      summary,
      dayStatuses
    };
  }
  
  /**
   * Validate leave application against attendance policy
   * @param {Date} startDate - Leave start date
   * @param {Date} endDate - Leave end date
   * @param {number} employeeId - Employee ID
   * @returns {Promise<Object>} - Validation result
   */
  async validateLeaveApplication(startDate, endDate, employeeId) {
    const dayStatuses = await this.getDateRangeStatus(startDate, endDate, employeeId);
    
    const workingDaysRequested = dayStatuses.filter(d => d.status === 'WORKING_DAY').length;
    const nonWorkingDays = dayStatuses.filter(d => d.status !== 'WORKING_DAY');
    
    const validation = {
      isValid: true,
      workingDaysRequested,
      totalDaysRequested: dayStatuses.length,
      nonWorkingDaysIncluded: nonWorkingDays.length,
      warnings: [],
      errors: []
    };
    
    // Check for non-working days in the range
    if (nonWorkingDays.length > 0) {
      validation.warnings.push({
        type: 'NON_WORKING_DAYS_INCLUDED',
        message: `Leave request includes ${nonWorkingDays.length} non-working days`,
        days: nonWorkingDays.map(d => ({ date: d.date, reason: d.reason }))
      });
    }
    
    // Check if any days already have approved leave
    const existingLeaves = dayStatuses.filter(d => d.status === 'LEAVE');
    if (existingLeaves.length > 0) {
      validation.isValid = false;
      validation.errors.push({
        type: 'OVERLAPPING_LEAVE',
        message: 'Leave request overlaps with existing approved leave',
        days: existingLeaves.map(d => ({ date: d.date, leave: d.leave }))
      });
    }
    
    return validation;
  }
  
  /**
   * Get working days count in a date range (for leave calculations)
   * @param {Date} startDate - Start date
   * @param {Date} endDate - End date
   * @param {number} employeeId - Optional employee ID
   * @returns {Promise<number>} - Number of working days
   */
  async getWorkingDaysCount(startDate, endDate, employeeId = null) {
    const dayStatuses = await this.getDateRangeStatus(startDate, endDate, employeeId);
    return dayStatuses.filter(d => d.status === 'WORKING_DAY').length;
  }
  
  /**
   * Check if attendance is required for a specific date
   * @param {Date|string} date - Date to check
   * @param {number} employeeId - Employee ID
   * @returns {Promise<boolean>} - Whether attendance is required
   */
  async isAttendanceRequired(date, employeeId) {
    const dayStatus = await this.getDayStatus(date, employeeId);
    return dayStatus.attendanceRequired;
  }
  
  /**
   * Get leave for a specific date (private helper)
   * @param {string} dateStr - Date string (YYYY-MM-DD)
   * @param {number} employeeId - Employee ID
   * @returns {Promise<Object|null>} - Leave object or null
   */
  async getLeaveForDate(dateStr, employeeId) {
    const checkDate = new Date(dateStr);
    
    const leave = await LeaveRequest.findOne({
      where: {
        employeeId: employeeId,
        status: 'approved',
        startDate: {
          [Op.lte]: checkDate
        },
        endDate: {
          [Op.gte]: checkDate
        }
      },
      attributes: ['id', 'leaveType', 'startDate', 'endDate', 'reason', 'status', 'employeeId'],
      include: [{
        association: 'employee',
        attributes: ['id', 'firstName', 'lastName', 'employeeId'],
        required: false
      }],
      raw: false
    });
    
    if (leave) {
      // Format leave data with employee name
      const leaveData = leave.toJSON ? leave.toJSON() : leave;
      const employeeName = leaveData.employee 
        ? `${leaveData.employee.firstName} ${leaveData.employee.lastName}`
        : 'Unknown Employee';
      
      return {
        ...leaveData,
        employeeName,
        leaveType: leaveData.leaveType
      };
    }
    
    return null;
  }
}

// Export singleton instance
export default new AttendancePolicyService();