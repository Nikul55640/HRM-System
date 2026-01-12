import api from './api';

class SmartCalendarService {
  // Smart Calendar APIs
  async getSmartMonthlyCalendar(params = {}) {
    try {
      const response = await api.get('/calendar/smart/monthly', { params });
      return response.data;
    } catch (error) {
      console.error('Error fetching smart monthly calendar:', error);
      throw error;
    }
  }

  async getSmartDailyCalendar(date) {
    try {
      const response = await api.get('/calendar/smart/daily', {
        params: { date }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching smart daily calendar:', error);
      throw error;
    }
  }

  async validateLeaveApplication(leaveData) {
    try {
      const response = await api.post('/calendar/smart/validate-leave', leaveData);
      return response.data;
    } catch (error) {
      console.error('Error validating leave application:', error);
      throw error;
    }
  }

  async getWorkingDaysCount(params) {
    try {
      const response = await api.get('/calendar/smart/working-days', { params });
      return response.data;
    } catch (error) {
      console.error('Error getting working days count:', error);
      throw error;
    }
  }

  // Working Rules APIs
  async getWorkingRules(params = {}) {
    try {
      const response = await api.get('/admin/working-rules', { params });
      return response.data;
    } catch (error) {
      console.error('Error fetching working rules:', error);
      throw error;
    }
  }

  async getWorkingRuleById(id) {
    try {
      const response = await api.get(`/admin/working-rules/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching working rule:', error);
      throw error;
    }
  }

  async getActiveWorkingRule(date = null) {
    try {
      const params = date ? { date } : {};
      const response = await api.get('/admin/working-rules/active', { params });
      return response.data;
    } catch (error) {
      console.error('Error fetching active working rule:', error);
      throw error;
    }
  }

  async createWorkingRule(ruleData) {
    try {
      const response = await api.post('/admin/working-rules', ruleData);
      return response.data;
    } catch (error) {
      console.error('Error creating working rule:', error);
      throw error;
    }
  }

  async updateWorkingRule(id, ruleData) {
    try {
      const response = await api.put(`/admin/working-rules/${id}`, ruleData);
      return response.data;
    } catch (error) {
      console.error('Error updating working rule:', error);
      throw error;
    }
  }

  async deleteWorkingRule(id) {
    try {
      const response = await api.delete(`/admin/working-rules/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error deleting working rule:', error);
      throw error;
    }
  }

  async setDefaultWorkingRule(id) {
    try {
      const response = await api.patch(`/admin/working-rules/${id}/set-default`);
      return response.data;
    } catch (error) {
      console.error('Error setting default working rule:', error);
      throw error;
    }
  }

  async checkWorkingDay(date) {
    try {
      const response = await api.get(`/admin/working-rules/check/${date}`);
      return response.data;
    } catch (error) {
      console.error('Error checking working day:', error);
      throw error;
    }
  }

  // Enhanced Holiday APIs (updated for smart holidays)
  async createSmartHoliday(holidayData) {
    try {
      const response = await api.post('/admin/holidays', holidayData);
      return response.data;
    } catch (error) {
      console.error('Error creating smart holiday:', error);
      throw error;
    }
  }

  async updateSmartHoliday(id, holidayData) {
    try {
      const response = await api.put(`/admin/holidays/${id}`, holidayData);
      return response.data;
    } catch (error) {
      console.error('Error updating smart holiday:', error);
      throw error;
    }
  }

  async getRecurringHolidays() {
    try {
      const response = await api.get('/admin/holidays', {
        params: { type: 'RECURRING' }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching recurring holidays:', error);
      throw error;
    }
  }

  async getOneTimeHolidays(year = null) {
    try {
      const params = { type: 'ONE_TIME' };
      if (year) params.year = year;
      
      const response = await api.get('/admin/holidays', { params });
      return response.data;
    } catch (error) {
      console.error('Error fetching one-time holidays:', error);
      throw error;
    }
  }

  // Calendar Day Status Utilities
  async getDayStatus(date, employeeId = null) {
    try {
      const params = { date };
      if (employeeId) params.employeeId = employeeId;
      
      const response = await api.get('/calendar/smart/daily', { params });
      return response.data?.data?.dayStatus || null;
    } catch (error) {
      console.error('Error getting day status:', error);
      throw error;
    }
  }

  async getAttendanceRequirement(date, employeeId = null) {
    try {
      const params = { date };
      if (employeeId) params.employeeId = employeeId;
      
      const response = await api.get('/calendar/smart/daily', { params });
      return response.data?.data?.attendanceRequirement || null;
    } catch (error) {
      console.error('Error getting attendance requirement:', error);
      throw error;
    }
  }

  // Utility Methods
 formatDateForAPI(date) {
  if (!(date instanceof Date)) return date;

  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');

  return `${y}-${m}-${d}`; // LOCAL DATE, SAFE
}


  formatRecurringDate(month, day) {
    const monthStr = month.toString().padStart(2, '0');
    const dayStr = day.toString().padStart(2, '0');
    return `${monthStr}-${dayStr}`;
  }

  parseRecurringDate(recurringDate) {
    const [month, day] = recurringDate.split('-').map(Number);
    return { month, day };
  }

  getDayName(dayNumber) {
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    return days[dayNumber];
  }

  getWorkingDaysArray(workingDays) {
    return workingDays.map(day => this.getDayName(day));
  }

  getWeekendDaysArray(weekendDays) {
    return weekendDays.map(day => this.getDayName(day));
  }

  // Validation Helpers
  validateWorkingRule(ruleData) {
    const errors = [];

    if (!ruleData.ruleName?.trim()) {
      errors.push('Rule name is required');
    }

    if (!Array.isArray(ruleData.workingDays) || ruleData.workingDays.length === 0) {
      errors.push('At least one working day must be selected');
    }

    if (!Array.isArray(ruleData.weekendDays) || ruleData.weekendDays.length === 0) {
      errors.push('At least one weekend day must be selected');
    }

    // Check for overlapping days
    const workingSet = new Set(ruleData.workingDays);
    const weekendSet = new Set(ruleData.weekendDays);
    const intersection = [...workingSet].filter(day => weekendSet.has(day));
    
    if (intersection.length > 0) {
      errors.push('Working days and weekend days cannot overlap');
    }

    // Check if all days are covered
    const allDays = new Set([...ruleData.workingDays, ...ruleData.weekendDays]);
    if (allDays.size !== 7) {
      errors.push('All 7 days of the week must be assigned');
    }

    if (ruleData.effectiveFrom && ruleData.effectiveTo) {
      if (new Date(ruleData.effectiveFrom) > new Date(ruleData.effectiveTo)) {
        errors.push('Effective from date cannot be after effective to date');
      }
    }

    return errors;
  }

  validateSmartHoliday(holidayData) {
    const errors = [];

    if (!holidayData.name?.trim()) {
      errors.push('Holiday name is required');
    }

    if (!holidayData.type) {
      errors.push('Holiday type is required');
    }

    if (holidayData.type === 'ONE_TIME') {
      if (!holidayData.date) {
        errors.push('Date is required for one-time holidays');
      }
    } else if (holidayData.type === 'RECURRING') {
      if (!holidayData.recurringDate) {
        errors.push('Recurring date is required for recurring holidays');
      } else if (!/^(0[1-9]|1[0-2])-(0[1-9]|[12][0-9]|3[01])$/.test(holidayData.recurringDate)) {
        errors.push('Recurring date must be in MM-DD format');
      }
    }

    if (!holidayData.category) {
      errors.push('Holiday category is required');
    }

    return errors;
  }
}

export default new SmartCalendarService();