/**
 * Date Calculation Service
 * Single source of truth for all date/working day logic
 * Moved from WorkingRule model to maintain separation of concerns
 */

import { WorkingRule } from '../../models/index.js';
import { Op } from 'sequelize';
import { getLocalDateString } from '../../utils/dateUtils.js';

class DateCalculationService {
  /**
   * Get day of week in UTC (0=Sunday, 1=Monday, ..., 6=Saturday)
   * @param {Date|string} date - Date to check
   * @returns {number} - Day of week index
   */
  static getDayOfWeekUTC(date) {
    if (typeof date === 'string') {
      const [year, month, day] = date.split('-').map(Number);
      return new Date(Date.UTC(year, month - 1, day)).getUTCDay();
    }
    return new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate())).getUTCDay();
  }

  /**
   * Check if a date is a working day according to working rules
   * @param {Date|string} date - Date to check
   * @param {Object} workingRule - Working rule object (optional, will fetch active if not provided)
   * @returns {Promise<boolean>} - Whether the date is a working day
   */
  static async isWorkingDay(date, workingRule = null) {
    const dayOfWeek = this.getDayOfWeekUTC(date);
    
    if (!workingRule) {
      workingRule = await this.getActiveWorkingRule(date);
    }
    
    if (!workingRule) {
      // 🔧 FIX: Try to get default rule as final fallback
      const defaultRule = await WorkingRule.findOne({
        where: { isDefault: true, isActive: true }
      });
      
      if (defaultRule) {
        return defaultRule.workingDays.includes(dayOfWeek);
      }
      
      // Ultimate fallback: Monday-Friday if no rules exist at all
      return [1, 2, 3, 4, 5].includes(dayOfWeek);
    }
    
    return workingRule.workingDays.includes(dayOfWeek);
  }

  /**
   * Check if a date is a weekend according to working rules
   * @param {Date|string} date - Date to check
   * @param {Object} workingRule - Working rule object (optional, will fetch active if not provided)
   * @returns {Promise<boolean>} - Whether the date is a weekend
   */
  static async isWeekend(date, workingRule = null) {
    const dayOfWeek = this.getDayOfWeekUTC(date);
    
    if (!workingRule) {
      workingRule = await this.getActiveWorkingRule(date);
    }
    
    if (!workingRule) {
      // 🔧 FIX: Try to get default rule as final fallback
      const defaultRule = await WorkingRule.findOne({
        where: { isDefault: true, isActive: true }
      });
      
      if (defaultRule) {
        return defaultRule.weekendDays.includes(dayOfWeek);
      }
      
      // Ultimate fallback: Saturday-Sunday if no rules exist at all
      return [0, 6].includes(dayOfWeek);
    }
    
    return workingRule.weekendDays.includes(dayOfWeek);
  }

  /**
   * Check if a date is a weekend by day index
   * @param {number} dayOfWeek - Day of week index (0=Sunday, 1=Monday, ..., 6=Saturday)
   * @param {Object} workingRule - Working rule object (optional, will fetch current active if not provided)
   * @returns {Promise<boolean>} - Whether the day index is a weekend
   */
  static async isWeekendByDayIndex(dayOfWeek, workingRule = null) {
    if (!workingRule) {
      workingRule = await this.getActiveWorkingRule();
    }
    
    if (!workingRule) {
      // 🔧 FIX: Try to get default rule as final fallback
      const defaultRule = await WorkingRule.findOne({
        where: { isDefault: true, isActive: true }
      });
      
      if (defaultRule) {
        return defaultRule.weekendDays.includes(dayOfWeek);
      }
      
      // Ultimate fallback: Saturday-Sunday if no rules exist at all
      return [0, 6].includes(dayOfWeek);
    }
    
    return workingRule.weekendDays.includes(dayOfWeek);
  }

  /**
   * Get active working rule for a specific date
   * @param {Date|string} date - Date to check (optional, defaults to today)
   * @returns {Promise<Object|null>} - Active working rule or null
   */
  static async getActiveWorkingRule(date = null) {
    const checkDate = date ? new Date(date) : new Date();
    // ✅ FIX: Use local timezone, not UTC
    const dateStr = getLocalDateString(checkDate);
    
    // First, try to find an active rule for the date
    let workingRule = await WorkingRule.findOne({
      where: {
        isActive: true,
        effectiveFrom: {
          [Op.lte]: dateStr
        },
        [Op.or]: [
          { effectiveTo: null },
          { effectiveTo: { [Op.gte]: dateStr } }
        ]
      },
      order: [['effectiveFrom', 'DESC']]
    });
    
    // 🔧 FIX: If no active rule found, use the most recent expired rule as fallback
    if (!workingRule) {
      workingRule = await WorkingRule.findOne({
        where: {
          isActive: true,
          effectiveFrom: {
            [Op.lte]: dateStr
          },
          effectiveTo: {
            [Op.lt]: dateStr  // Rule has expired
          }
        },
        order: [['effectiveTo', 'DESC']]  // Get the most recently expired rule
      });
    }
    
    return workingRule;
  }

  /**
   * Get working days count in a date range
   * @param {Date} startDate - Start date
   * @param {Date} endDate - End date
   * @param {Object} workingRule - Working rule object (optional, will fetch active if not provided)
   * @returns {Promise<number>} - Number of working days
   */
  static async getWorkingDaysInRange(startDate, endDate, workingRule = null) {
    if (!workingRule) {
      workingRule = await this.getActiveWorkingRule(startDate);
    }
    
    if (!workingRule) {
      // Default calculation if no rule found
      return this.getDefaultWorkingDaysInRange(startDate, endDate);
    }
    
    let workingDays = 0;
    const currentDate = new Date(startDate);
    
    while (currentDate <= endDate) {
      const dayOfWeek = this.getDayOfWeekUTC(currentDate);
      if (workingRule.workingDays.includes(dayOfWeek)) {
        workingDays++;
      }
      currentDate.setDate(currentDate.getDate() + 1);
    }
    
    return workingDays;
  }

  /**
   * Default working days calculation (Monday-Friday)
   * @param {Date} startDate - Start date
   * @param {Date} endDate - End date
   * @returns {number} - Number of working days
   */
  static getDefaultWorkingDaysInRange(startDate, endDate) {
    let workingDays = 0;
    const currentDate = new Date(startDate);
    
    while (currentDate <= endDate) {
      const dayOfWeek = this.getDayOfWeekUTC(currentDate);
      if ([1, 2, 3, 4, 5].includes(dayOfWeek)) { // Monday-Friday
        workingDays++;
      }
      currentDate.setDate(currentDate.getDate() + 1);
    }
    
    return workingDays;
  }

  /**
   * Format date to local date string (YYYY-MM-DD)
   * @param {Date} date - Date to format
   * @returns {string} - Formatted date string
   */
  static formatLocalDate(date) {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  }

  /**
   * Get next working day from a given date
   * @param {Date} date - Starting date
   * @param {Object} workingRule - Working rule object (optional)
   * @returns {Promise<Date>} - Next working day
   */
  static async getNextWorkingDay(date, workingRule = null) {
    if (!workingRule) {
      workingRule = await this.getActiveWorkingRule(date);
    }
    
    const nextDay = new Date(date);
    nextDay.setDate(nextDay.getDate() + 1);
    
    while (!(await this.isWorkingDay(nextDay, workingRule))) {
      nextDay.setDate(nextDay.getDate() + 1);
    }
    
    return nextDay;
  }

  /**
   * Get previous working day from a given date
   * @param {Date} date - Starting date
   * @param {Object} workingRule - Working rule object (optional)
   * @returns {Promise<Date>} - Previous working day
   */
  static async getPreviousWorkingDay(date, workingRule = null) {
    if (!workingRule) {
      workingRule = await this.getActiveWorkingRule(date);
    }
    
    const prevDay = new Date(date);
    prevDay.setDate(prevDay.getDate() - 1);
    
    while (!(await this.isWorkingDay(prevDay, workingRule))) {
      prevDay.setDate(prevDay.getDate() - 1);
    }
    
    return prevDay;
  }
}

export default DateCalculationService;