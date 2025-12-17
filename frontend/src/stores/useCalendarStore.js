import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import calendarViewService from '../modules/calendar/services/calendarViewService';

const useCalendarStore = create(
  devtools(
    (set, get) => ({
      // State
      currentDate: new Date(),
      selectedDate: new Date(),
      calendarData: null,
      loading: false,
      error: null,
      viewType: 'month', // month, week, day

      // Actions
      setCurrentDate: (date) => set({ currentDate: date }),
      setSelectedDate: (date) => set({ selectedDate: date }),
      setViewType: (viewType) => set({ viewType }),
      setLoading: (loading) => set({ loading }),
      setError: (error) => set({ error }),

      // Async actions
      fetchCalendarData: async (params = {}) => {
        const { currentDate } = get();
        set({ loading: true, error: null });
        
        try {
          const year = params.year || currentDate.getFullYear();
          const month = params.month || (currentDate.getMonth() + 1);
          
          const data = await calendarViewService.getMonthlyCalendarData({
            year,
            month,
            ...params
          });
          
          set({ calendarData: data, loading: false });
          return data;
        } catch (error) {
          console.error('Failed to fetch calendar data:', error);
          set({ 
            error: error.message || 'Failed to load calendar data', 
            loading: false 
          });
          throw error;
        }
      },

      // Navigation helpers
      goToPreviousMonth: () => {
        const { currentDate, fetchCalendarData } = get();
        const newDate = new Date(currentDate);
        newDate.setMonth(newDate.getMonth() - 1);
        set({ currentDate: newDate });
        fetchCalendarData();
      },

      goToNextMonth: () => {
        const { currentDate, fetchCalendarData } = get();
        const newDate = new Date(currentDate);
        newDate.setMonth(newDate.getMonth() + 1);
        set({ currentDate: newDate });
        fetchCalendarData();
      },

      goToToday: () => {
        const today = new Date();
        set({ currentDate: today, selectedDate: today });
        get().fetchCalendarData();
      },

      // Data helpers
      getEventsForDate: (date) => {
        const { calendarData } = get();
        if (!calendarData) return [];
        
        const dateStr = date.toISOString().split('T')[0];
        const events = [];
        
        // Add holidays
        calendarData.holidays?.forEach(holiday => {
          const holidayDate = new Date(holiday.startDate).toISOString().split('T')[0];
          if (holidayDate === dateStr) {
            events.push({ ...holiday, type: 'holiday' });
          }
        });
        
        // Add events
        calendarData.events?.forEach(event => {
          const eventDate = new Date(event.startDate).toISOString().split('T')[0];
          if (eventDate === dateStr) {
            events.push({ ...event, type: 'event' });
          }
        });
        
        // Add leaves
        calendarData.leaves?.forEach(leave => {
          const leaveStartDate = new Date(leave.startDate).toISOString().split('T')[0];
          const leaveEndDate = new Date(leave.endDate).toISOString().split('T')[0];
          
          if (dateStr >= leaveStartDate && dateStr <= leaveEndDate) {
            events.push({ ...leave, type: 'leave' });
          }
        });
        
        // Add birthdays
        calendarData.birthdays?.forEach(birthday => {
          const birthdayDate = new Date(birthday.date).toISOString().split('T')[0];
          if (birthdayDate === dateStr) {
            events.push({ ...birthday, type: 'birthday' });
          }
        });
        
        // Add anniversaries
        calendarData.anniversaries?.forEach(anniversary => {
          const anniversaryDate = new Date(anniversary.date).toISOString().split('T')[0];
          if (anniversaryDate === dateStr) {
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
      reset: () => set({
        currentDate: new Date(),
        selectedDate: new Date(),
        calendarData: null,
        loading: false,
        error: null,
        viewType: 'month'
      })
    }),
    {
      name: 'calendar-store'
    }
  )
);

export default useCalendarStore;