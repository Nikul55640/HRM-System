import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import calendarViewService from '../modules/calendar/services/calendarViewService';

const useCalendarStore = create(
  devtools(
    (set, get) => ({
      // State
      currentDate: new Date(),
      selectedDate: null,
      viewMode: 'month', // 'month', 'week', 'day'
      calendarData: null,
      dailyData: null,
      loading: false,
      error: null,
      filters: {
        departmentId: null,
        employeeId: null,
        includeAttendance: false,
        eventTypes: []
      },

      // Actions
      setCurrentDate: (date) => {
        set({ currentDate: new Date(date) });
      },

      setSelectedDate: (date) => {
        set({ selectedDate: date });
      },

      setViewMode: (mode) => {
        set({ viewMode: mode });
      },

      setFilters: (filters) => {
        set((state) => ({
          filters: { ...state.filters, ...filters }
        }));
      },

      clearFilters: () => {
        set({
          filters: {
            departmentId: null,
            employeeId: null,
            includeAttendance: false,
            eventTypes: []
          }
        });
      },

      // Fetch monthly calendar data
      fetchMonthlyData: async (year, month) => {
        const { filters } = get();
        set({ loading: true, error: null });
        
        try {
          const params = {
            year,
            month,
            ...filters
          };
          
          const response = await calendarViewService.getMonthlyCalendarData(params);
          
          set({ 
            calendarData: response.data,
            loading: false 
          });
          
          return response.data;
        } catch (error) {
          set({ 
            error: error.message,
            loading: false 
          });
          throw error;
        }
      },

      // Fetch daily calendar data
      fetchDailyData: async (date, employeeId = null) => {
        set({ loading: true, error: null });
        
        try {
          const params = {
            date: date.toISOString().split('T')[0],
            ...(employeeId && { employeeId })
          };
          
          const response = await calendarViewService.getDailyCalendarData(params);
          
          set({ 
            dailyData: response.data,
            loading: false 
          });
          
          return response.data;
        } catch (error) {
          set({ 
            error: error.message,
            loading: false 
          });
          throw error;
        }
      },

      // Apply for leave from calendar
      applyLeave: async (leaveData) => {
        set({ loading: true, error: null });
        
        try {
          const response = await calendarViewService.applyLeaveFromCalendar(leaveData);
          
          // Refresh calendar data after successful leave application
          const { currentDate } = get();
          await get().fetchMonthlyData(currentDate.getFullYear(), currentDate.getMonth() + 1);
          
          set({ loading: false });
          return response.data;
        } catch (error) {
          set({ 
            error: error.message,
            loading: false 
          });
          throw error;
        }
      },

      // Export calendar data
      exportCalendar: async (format = 'xlsx') => {
        const { currentDate, filters } = get();
        set({ loading: true, error: null });
        
        try {
          const params = {
            year: currentDate.getFullYear(),
            month: currentDate.getMonth() + 1,
            format,
            ...filters
          };
          
          await calendarViewService.exportCalendarData(params);
          set({ loading: false });
        } catch (error) {
          set({ 
            error: error.message,
            loading: false 
          });
          throw error;
        }
      },

      // Navigate to previous month
      goToPreviousMonth: () => {
        const { currentDate } = get();
        const newDate = new Date(currentDate);
        newDate.setMonth(newDate.getMonth() - 1);
        set({ currentDate: newDate });
        
        // Auto-fetch data for new month
        get().fetchMonthlyData(newDate.getFullYear(), newDate.getMonth() + 1);
      },

      // Navigate to next month
      goToNextMonth: () => {
        const { currentDate } = get();
        const newDate = new Date(currentDate);
        newDate.setMonth(newDate.getMonth() + 1);
        set({ currentDate: newDate });
        
        // Auto-fetch data for new month
        get().fetchMonthlyData(newDate.getFullYear(), newDate.getMonth() + 1);
      },

      // Go to today
      goToToday: () => {
        const today = new Date();
        set({ currentDate: today, selectedDate: today });
        
        // Auto-fetch data for current month
        get().fetchMonthlyData(today.getFullYear(), today.getMonth() + 1);
      },

      // Helper methods
      getEventsForDate: (date) => {
        const { calendarData } = get();
        if (!calendarData) return [];
        
        const dateStr = date.toISOString().split('T')[0];
        
        const events = [];
        
        // Add regular events
        calendarData.events?.forEach(event => {
          const eventStart = new Date(event.startDate).toISOString().split('T')[0];
          const eventEnd = new Date(event.endDate).toISOString().split('T')[0];
          
          if (dateStr >= eventStart && dateStr <= eventEnd) {
            events.push({ ...event, type: 'event' });
          }
        });
        
        // Add holidays
        calendarData.holidays?.forEach(holiday => {
          const holidayStart = new Date(holiday.startDate).toISOString().split('T')[0];
          const holidayEnd = new Date(holiday.endDate).toISOString().split('T')[0];
          
          if (dateStr >= holidayStart && dateStr <= holidayEnd) {
            events.push({ ...holiday, type: 'holiday' });
          }
        });
        
        // Add leaves
        calendarData.leaves?.forEach(leave => {
          const leaveStart = new Date(leave.startDate).toISOString().split('T')[0];
          const leaveEnd = new Date(leave.endDate).toISOString().split('T')[0];
          
          if (dateStr >= leaveStart && dateStr <= leaveEnd) {
            events.push({ ...leave, type: 'leave' });
          }
        });
        
        // Add birthdays
        calendarData.birthdays?.forEach(birthday => {
          const birthdayDate = new Date(birthday.date).toISOString().split('T')[0];
          
          if (dateStr === birthdayDate) {
            events.push({ ...birthday, type: 'birthday' });
          }
        });
        
        // Add anniversaries
        calendarData.anniversaries?.forEach(anniversary => {
          const anniversaryDate = new Date(anniversary.date).toISOString().split('T')[0];
          
          if (dateStr === anniversaryDate) {
            events.push({ ...anniversary, type: 'anniversary' });
          }
        });
        
        return events;
      },

      getAttendanceForDate: (date) => {
        const { calendarData } = get();
        if (!calendarData?.attendance) return [];
        
        const dateStr = date.toISOString().split('T')[0];
        
        return calendarData.attendance.filter(record => {
          const recordDate = new Date(record.date).toISOString().split('T')[0];
          return recordDate === dateStr;
        });
      },

      // Reset store
      reset: () => {
        set({
          currentDate: new Date(),
          selectedDate: null,
          viewMode: 'month',
          calendarData: null,
          dailyData: null,
          loading: false,
          error: null,
          filters: {
            departmentId: null,
            employeeId: null,
            includeAttendance: false,
            eventTypes: []
          }
        });
      }
    }),
    {
      name: 'calendar-store'
    }
  )
);

export default useCalendarStore;