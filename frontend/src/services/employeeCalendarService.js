import api from './api';

/**
 * Enhanced Employee Calendar Service
 * ✅ Shows ALL company events (birthdays, anniversaries, holidays, leaves)
 * ✅ Employee-safe (no sensitive data exposed)
 * ✅ Uses employee-specific endpoints to avoid 403 errors
 */
const employeeCalendarService = {
  // Get daily calendar data for a specific date
  getDailyCalendar: async (date) => {
    try {
      const response = await api.get('/employee/calendar/daily', {
        params: { date }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching daily calendar:', error);
      return { success: false, data: null };
    }
  },

  // Get monthly calendar data (Enhanced with Smart Calendar)
  getMonthlyCalendar: async (year, month) => {
    try {
      console.log(`📅 [EMPLOYEE CALENDAR SERVICE] Fetching calendar for ${year}-${month}`);
      
      // First try to get smart calendar data for weekend detection
      let smartCalendarData = null;
      try {
        console.log('📅 [EMPLOYEE CALENDAR SERVICE] Attempting to fetch smart calendar data...');
        const smartResponse = await api.get('/calendar/smart/monthly', {
          params: { year, month }
        });
        if (smartResponse.data.success) {
          smartCalendarData = smartResponse.data.data.calendar;
          console.log('✅ [EMPLOYEE CALENDAR SERVICE] Smart calendar data loaded:', Object.keys(smartCalendarData).length, 'days');
        }
      } catch (smartError) {
        console.warn('⚠️ [EMPLOYEE CALENDAR SERVICE] Smart calendar not available, will add fallback weekend detection:', smartError.message);
      }

      // Get regular employee calendar data
      console.log('📅 [EMPLOYEE CALENDAR SERVICE] Fetching employee calendar data...');
      const response = await api.get('/employee/calendar/monthly', {
        params: { year, month }
      });
      
      if (response.data.success) {
        const employeeCalendar = response.data.calendar;
        console.log('✅ [EMPLOYEE CALENDAR SERVICE] Employee calendar data loaded:', Object.keys(employeeCalendar).length, 'days');
        
        // Enhance employee calendar data with weekend information
        Object.keys(employeeCalendar).forEach(dayKey => {
          const dayData = employeeCalendar[dayKey];
          if (dayData && dayData.date) {
            // Try to get weekend info from smart calendar first
            if (smartCalendarData && smartCalendarData[dayData.date]) {
              const smartDayData = smartCalendarData[dayData.date];
              dayData.isWeekend = smartDayData.isWeekend;
              dayData.isWorkingDay = smartDayData.isWorkingDay;
              dayData.isHoliday = smartDayData.isHoliday;
              dayData.status = smartDayData.status;
              dayData.dayOfWeek = smartDayData.dayOfWeek;
              console.log(`📅 [EMPLOYEE CALENDAR SERVICE] Enhanced day ${dayKey} with smart calendar data: ${dayData.status}`);
            } else {
              // Fallback: Add basic weekend detection
              const dayDate = new Date(dayData.date);
              const dayOfWeek = dayDate.getDay();
              const isWeekend = dayOfWeek === 0 || dayOfWeek === 6; // Sunday or Saturday
              
              dayData.isWeekend = isWeekend;
              dayData.isWorkingDay = !isWeekend;
              dayData.isHoliday = false;
              dayData.status = isWeekend ? 'WEEKEND' : 'WORKING_DAY';
              dayData.dayOfWeek = dayOfWeek;
              console.log(`📅 [EMPLOYEE CALENDAR SERVICE] Added fallback weekend detection for day ${dayKey}: ${dayData.status}`);
            }
          }
        });
        
        return {
          ...response.data,
          calendar: employeeCalendar
        };
      }
      
      return response.data;
      console.log(
  '📅 Monthly calendar birthdays:',
  Object.values(monthlyData.calendar)
    .flatMap(d => d.birthdays || []).length
);

   
    } catch (error) {
      console.error('Error fetching monthly calendar:', error);
      return { success: false, calendar: {} };
    }
  },

  // Get events for date range (transforms monthly data to events format)
  getEventsByDateRange: async (startDate, endDate) => {
    try {
      const start = new Date(startDate);
      const end = new Date(endDate);
      const events = [];

      // Get data for each month in the range
      let current = new Date(start.getFullYear(), start.getMonth(), 1);
      const endMonth = new Date(end.getFullYear(), end.getMonth(), 1);

      while (current <= endMonth) {
        const year = current.getFullYear();
        const month = current.getMonth() + 1;

        const monthlyData = await employeeCalendarService.getMonthlyCalendar(year, month);
        
        if (monthlyData.success && monthlyData.calendar) {
          Object.values(monthlyData.calendar).forEach(day => {
            const dayDate = new Date(day.date);
            
            // Only include days within the requested range
            if (dayDate >= start && dayDate <= end) {
              // ✅ Add ALL holiday events
              if (day.holidays && day.holidays.length > 0) {
                day.holidays.forEach(holiday => {
                  events.push({
                    ...holiday,
                    eventType: 'holiday',
                    title: holiday.name,
                    startDate: day.date,
                    date: day.date,
                    color: holiday.color || '#EF4444'
                  });
                });
              }

              // ✅ Add ALL birthday events
              if (day.birthdays && day.birthdays.length > 0) {
                day.birthdays.forEach(birthday => {
                  events.push({
                    ...birthday,
                    eventType: 'birthday',
                    title: birthday.title || `${birthday.employeeName}'s Birthday`,
                    employeeName: birthday.employeeName,
                    startDate: day.date,
                    date: day.date,
                    color: birthday.color || '#10B981'
                  });
                });
              }

              // ✅ Add ALL anniversary events
              if (day.anniversaries && day.anniversaries.length > 0) {
                day.anniversaries.forEach(anniversary => {
                  events.push({
                    ...anniversary,
                    eventType: 'anniversary',
                    title: anniversary.title || `${anniversary.employeeName}'s Work Anniversary`,
                    employeeName: anniversary.employeeName,
                    startDate: day.date,
                    date: day.date,
                    color: anniversary.color || '#8B5CF6',
                    years: anniversary.years
                  });
                });
              }

              // ✅ Add ALL leave events (company-wide)
              if (day.leaves && day.leaves.length > 0) {
                day.leaves.forEach(leave => {
                  events.push({
                    ...leave,
                    eventType: 'leave',
                    title: `${leave.employeeName} - ${leave.leaveType}`,
                    employeeName: leave.employeeName,
                    leaveType: leave.leaveType,
                    startDate: day.date,
                    date: day.date,
                    color: leave.color || '#F59E0B',
                    duration: leave.duration
                  });
                });
              }

              // ✅ Add other company events
              if (day.events && day.events.length > 0) {
                day.events.forEach(event => {
                  events.push({
                    ...event,
                    eventType: 'event',
                    title: event.title,
                    startDate: day.date,
                    date: day.date,
                    color: event.color || '#3B82F6'
                  });
                });
              }
            }
          });
        }

        // Move to next month
        current = new Date(current.getFullYear(), current.getMonth() + 1, 1);
      }

      // Sort events by date and priority
      events.sort((a, b) => {
        const dateCompare = new Date(a.startDate) - new Date(b.startDate);
        if (dateCompare !== 0) return dateCompare;
        
        // Priority order: holidays > leaves > birthdays > anniversaries > events
        const priority = { holiday: 1, leave: 2, birthday: 3, anniversary: 4, event: 5 };
        return (priority[a.eventType] || 5) - (priority[b.eventType] || 5);
      });

      console.log('📅 [EMPLOYEE CALENDAR] Enhanced events loaded:', {
        total: events.length,
        holidays: events.filter(e => e.eventType === 'holiday').length,
        leaves: events.filter(e => e.eventType === 'leave').length,
        birthdays: events.filter(e => e.eventType === 'birthday').length,
        anniversaries: events.filter(e => e.eventType === 'anniversary').length,
        events: events.filter(e => e.eventType === 'event').length
      });

      return {
        success: true,
        data: {
          events,
          leaves: events.filter(e => e.eventType === 'leave'),
          holidays: events.filter(e => e.eventType === 'holiday'),
          birthdays: events.filter(e => e.eventType === 'birthday'),
          anniversaries: events.filter(e => e.eventType === 'anniversary')
        }
      };
    } catch (error) {
      console.error('Error fetching events by date range:', error);
      return { success: false, data: { events: [] } };
    }
  },

  // Get holidays for a specific year
  getHolidays: async (year) => {
    try {
      const holidays = [];
      const targetYear = year || new Date().getFullYear();

      // Get holidays from all months of the year
      for (let month = 1; month <= 12; month++) {
        try {
          const monthlyData = await employeeCalendarService.getMonthlyCalendar(targetYear, month);
          
          if (monthlyData.success && monthlyData.calendar) {
            Object.values(monthlyData.calendar).forEach(day => {
              if (day.holidays && day.holidays.length > 0) {
                day.holidays.forEach(holiday => {
                  holidays.push({
                    ...holiday,
                    date: day.date,
                    name: holiday.name,
                    type: 'holiday'
                  });
                });
              }
            });
          }
        } catch (monthError) {
          console.warn(`Failed to fetch holidays for ${targetYear}-${month}:`, monthError);
        }
      }

      return {
        success: true,
        data: {
          data: {
            holidays: holidays
          }
        }
      };
    } catch (error) {
      console.error('Error fetching holidays:', error);
      return { success: false, data: { data: { holidays: [] } } };
    }
  },

  // Get upcoming events (next 30 days)
  getUpcomingEvents: async (limit = 10) => {
    try {
      const now = new Date();
      const futureDate = new Date(now.getTime() + (30 * 24 * 60 * 60 * 1000)); // 30 days from now

      const eventsData = await employeeCalendarService.getEventsByDateRange(
        now.toISOString().split('T')[0],
        futureDate.toISOString().split('T')[0]
      );

      if (eventsData.success) {
        // Filter future events and sort by date
        const futureEvents = eventsData.data.events
          .filter(event => new Date(event.startDate) >= now)
          .sort((a, b) => new Date(a.startDate) - new Date(b.startDate))
          .slice(0, limit);

        return {
          success: true,
          data: futureEvents
        };
      }

      return { success: false, data: [] };
    } catch (error) {
      console.error('Error fetching upcoming events:', error);
      return { success: false, data: [] };
    }
  },

  // ✅ ENHANCED: Get upcoming birthdays (next 6 months to ensure we show multiple birthdays)
  getUpcomingBirthdays: async (limit = 10) => {
    try {
      const now = new Date();
      const sixMonthsLater = new Date(now.getFullYear(), now.getMonth() + 6, now.getDate());
      
      console.log('🎂 [CALENDAR SERVICE] Fetching upcoming birthdays (next 6 months)...');
      
      const birthdays = [];
      
      // Fetch 6 months to ensure we get multiple birthdays
      const monthsToFetch = [];
      for (let i = 0; i < 6; i++) {
        const targetDate = new Date(now.getFullYear(), now.getMonth() + i, 1);
        monthsToFetch.push({
          year: targetDate.getFullYear(),
          month: targetDate.getMonth() + 1
        });
      }
      
      
      console.log('🎂 [CALENDAR SERVICE] Fetching months:', monthsToFetch);
      
      for (const { year, month } of monthsToFetch) {
        try {
          const monthlyData = await employeeCalendarService.getMonthlyCalendar(year, month);
          
          if (monthlyData.success && monthlyData.calendar) {
            Object.values(monthlyData.calendar).forEach(day => {
              if (day.birthdays && day.birthdays.length > 0) {
                day.birthdays.forEach(birthday => {
                  const birthdayDate = new Date(day.date);
                  // Only include future birthdays (including today)
                  if (birthdayDate >= new Date(now.getFullYear(), now.getMonth(), now.getDate())) {
                    birthdays.push({
                      ...birthday,
                      date: day.date,
                      employeeName: birthday.employeeName,
                      title: birthday.title,
                      department: birthday.department || birthday.departmentName || null
                    });
                  }
                });
              }
            });
          }
        } catch (monthError) {
          console.warn(`Failed to fetch birthdays for ${year}-${month}:`, monthError);
        }
      }
      
      // Sort by date and limit results
      const sortedBirthdays = birthdays
        .sort((a, b) => new Date(a.date) - new Date(b.date))
        .slice(0, limit);

      console.log('🎂 [CALENDAR SERVICE] Found birthdays:', sortedBirthdays.length);
      sortedBirthdays.forEach(b => {
        console.log(`   - ${b.employeeName}: ${b.date}`);
      });

      return {
        success: true,
        data: sortedBirthdays
      };
    } catch (error) {
      console.error('Error fetching upcoming birthdays:', error);
      return { success: false, data: [] };
    }
  },

  // ✅ DEPRECATED: Keep for backward compatibility but mark as deprecated
  getAllBirthdays: async (year) => {
    console.warn('⚠️ getAllBirthdays is deprecated and makes 12 API calls. Use getUpcomingBirthdays instead.');
    // For backward compatibility, just return current month
    const now = new Date();
    const currentMonth = now.getMonth() + 1;
    const targetYear = year || now.getFullYear();
    
    try {
      const monthlyData = await employeeCalendarService.getMonthlyCalendar(targetYear, currentMonth);
      
      if (monthlyData.success && monthlyData.calendar) {
        const birthdays = [];
        Object.values(monthlyData.calendar).forEach(day => {
          if (day.birthdays && day.birthdays.length > 0) {
            day.birthdays.forEach(birthday => {
              birthdays.push({
                ...birthday,
                date: day.date,
                employeeName: birthday.employeeName,
                title: birthday.title
              });
            });
          }
        });
        
        return { success: true, data: birthdays };
      }
      
      return { success: false, data: [] };
    } catch (error) {
      console.error('Error fetching birthdays:', error);
      return { success: false, data: [] };
    }
  },

  // ✅ DEPRECATED: Keep for backward compatibility but mark as deprecated  
  getAllAnniversaries: async (year) => {
    console.warn('⚠️ getAllAnniversaries is deprecated and makes 12 API calls. Use getUpcomingAnniversaries instead.');
    // For backward compatibility, just return current month
    const now = new Date();
    const currentMonth = now.getMonth() + 1;
    const targetYear = year || now.getFullYear();
    
    try {
      const monthlyData = await employeeCalendarService.getMonthlyCalendar(targetYear, currentMonth);
      
      if (monthlyData.success && monthlyData.calendar) {
        const anniversaries = [];
        Object.values(monthlyData.calendar).forEach(day => {
          if (day.anniversaries && day.anniversaries.length > 0) {
            day.anniversaries.forEach(anniversary => {
              anniversaries.push({
                ...anniversary,
                date: day.date,
                employeeName: anniversary.employeeName,
                title: anniversary.title,
                years: anniversary.years
              });
            });
          }
        });
        
        return { success: true, data: anniversaries };
      }
      
      return { success: false, data: [] };
    } catch (error) {
      console.error('Error fetching anniversaries:', error);
      return { success: false, data: [] };
    }
  }
};

export default employeeCalendarService;