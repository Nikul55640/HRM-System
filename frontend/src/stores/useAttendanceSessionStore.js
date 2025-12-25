import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import api from '../core/services/api';

const useAttendanceSessionStore = create(
  devtools(
    (set, get) => ({
      // ===============================
      // STATE
      // ===============================
      todayRecord: null,
      isLoading: false,
      lastUpdated: null,
      error: null,

      // ===============================
      // INTERNAL HELPERS
      // ===============================
      setLoading: (isLoading) => set({ isLoading }),
      setError: (error) => set({ error }),

      // ===============================
      // FETCH TODAY RECORD
      // ===============================
      fetchTodayRecord: async (silent = false) => {
        try {
          if (!silent) {
            set({ isLoading: true });
          }

          const today = new Date();
          const date = today.toISOString().split('T')[0];

          const response = await api.get('/employee/attendance', {
            params: {
              startDate: date,
              endDate: date,
              limit: 1,
            },
          });

          if (response.data?.success && response.data.data?.length > 0) {
            const record = response.data.data[0];
            const recordDate = new Date(record.date);

            const isToday =
              recordDate.toDateString() === today.toDateString();

            set({
              todayRecord: isToday ? record : null,
              isLoading: false,
              lastUpdated: new Date(),
            });
          } else {
            set({
              todayRecord: null,
              isLoading: false,
              lastUpdated: new Date(),
            });
          }
        } catch (error) {
          console.error('Attendance fetch failed:', error);
          set({ isLoading: false });
        }
      },

      // ===============================
      // CLOCK IN
      // ===============================
      clockIn: async (locationData = {}) => {
        try {
          set({ isLoading: true });

          const response = await api.post(
            '/employee/attendance/clock-in',
            locationData
          );

          if (response.data?.success) {
            await get().fetchTodayRecord(true);
            return { success: true, data: response.data };
          }

          return { success: false, error: 'Clock in failed' };
        } catch (error) {
          set({ isLoading: false });
          return {
            success: false,
            error:
              error.response?.data?.message || 'Clock in failed',
          };
        }
      },

      // ===============================
      // CLOCK OUT
      // ===============================
      clockOut: async () => {
        try {
          set({ isLoading: true });

          const response = await api.post('/employee/attendance/clock-out');

          if (response.data?.success) {
            await get().fetchTodayRecord(true);
            return { success: true, data: response.data };
          }

          return { success: false, error: 'Clock out failed' };
        } catch (error) {
          set({ isLoading: false });
          return {
            success: false,
            error:
              error.response?.data?.message || 'Clock out failed',
          };
        }
      },

      // ===============================
      // BREAK MANAGEMENT
      // ===============================
      startBreak: async () => {
        try {
          set({ isLoading: true });

          const response = await api.post(
            '/employee/attendance/break-in'
          );

          if (response.data?.success) {
            await get().fetchTodayRecord(true);
            return { success: true, data: response.data };
          }

          return { success: false, error: 'Start break failed' };
        } catch (error) {
          set({ isLoading: false });
          return {
            success: false,
            error:
              error.response?.data?.message || 'Start break failed',
          };
        }
      },

      endBreak: async () => {
        try {
          set({ isLoading: true });

          const response = await api.post(
            '/employee/attendance/break-out'
          );

          if (response.data?.success) {
            await get().fetchTodayRecord(true);
            return { success: true, data: response.data };
          }

          return { success: false, error: 'End break failed' };
        } catch (error) {
          set({ isLoading: false });
          return {
            success: false,
            error:
              error.response?.data?.message || 'End break failed',
          };
        }
      },

      // ===============================
      // DERIVED STATUS (SYNC)
      // ===============================
      getAttendanceStatus: () => {
        const { todayRecord } = get();

        if (!todayRecord) {
          return {
            isClockedIn: false,
            isOnBreak: false,
            hasLegacyClockIn: false,
            activeSession: null,
            hasCompletedSessions: false,
            todayRecord: null,
          };
        }

        const activeSession = todayRecord.sessions?.find(
          (s) => s.status === 'active' || s.status === 'on_break'
        );

        const hasLegacyClockIn =
          todayRecord.checkIn &&
          !todayRecord.checkOut &&
          (!todayRecord.sessions ||
            todayRecord.sessions.length === 0);

        return {
          isClockedIn:
            activeSession?.status === 'active' ||
            hasLegacyClockIn,
          isOnBreak: activeSession?.status === 'on_break',
          hasLegacyClockIn,
          activeSession,
          hasCompletedSessions:
            todayRecord.sessions?.some(
              (s) => s.status === 'completed'
            ),
          todayRecord,
        };
      },

      // ===============================
      // RESET
      // ===============================
      reset: () =>
        set({
          todayRecord: null,
          isLoading: false,
          lastUpdated: null,
          error: null,
        }),
    }),
    {
      name: 'attendance-session-store',
    }
  )
);

export default useAttendanceSessionStore;
