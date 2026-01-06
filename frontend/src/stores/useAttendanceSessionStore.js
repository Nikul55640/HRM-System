import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import api from '../services/api';

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
      initialized: false,

      // ===============================
      // INTERNAL HELPERS
      // ===============================
      setLoading: (isLoading) => set({ isLoading }),
      setError: (error) => set({ error }),

      // ===============================
      // INITIALIZATION
      // ===============================
      initialize: async () => {
        const { initialized } = get();
        if (!initialized) {
          set({ initialized: true });
          await get().fetchTodayRecord(true);
        }
      },

      // ===============================
      // FETCH TODAY RECORD
      // ===============================
      fetchTodayRecord: async (silent = false) => {
        try {
          if (!silent) {
            set({ isLoading: true });
          }

          // Use the dedicated today endpoint for better accuracy
          const response = await api.get('/employee/attendance/today');

          console.log('🔍 [STORE] Raw API response:', response.data);

          if (response.data?.success && response.data.data) {
            const todayRecord = response.data.data;
            console.log('🔍 [STORE] Today record received:', todayRecord);
            console.log('🔍 [STORE] Break sessions in record:', todayRecord.breakSessions);
            console.log('🔍 [STORE] Break sessions type:', typeof todayRecord.breakSessions);
            console.log('🔍 [STORE] Break sessions length:', todayRecord.breakSessions?.length);
            
            // 🔥 DEBUG: Test the getAttendanceStatus immediately after setting the record
            set({
              todayRecord: todayRecord,
              isLoading: false,
              lastUpdated: new Date(),
              error: null,
            });
            
            // Test the status calculation
            const status = get().getAttendanceStatus();
            console.log('🔍 [STORE] Calculated attendance status:', {
              isClockedIn: status.isClockedIn,
              isOnBreak: status.isOnBreak,
              hasLegacyClockIn: status.hasLegacyClockIn,
              activeSessionBreaks: status.activeSession?.breaks?.length || 0,
              activeSessionStatus: status.activeSession?.status
            });
          } else {
            console.warn('🔍 [STORE] No data in response or success=false');
            set({
              todayRecord: null,
              isLoading: false,
              lastUpdated: new Date(),
              error: null,
            });
          }
        } catch (error) {
          console.error('🔍 [STORE] Fetch error:', error);
          set({ 
            isLoading: false,
            error: error.response?.data?.message || 'Failed to fetch attendance data'
          });
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

          return { success: false, error: response.data?.message || 'Clock in failed' };
        } catch (error) {
          set({ isLoading: false });
          
          // Handle specific error cases
          if (error.response?.status === 400) {
            const errorMessage = error.response?.data?.message;
            
            // If already clocked in, refresh the data to sync the UI
            if (errorMessage?.includes('Already clocked in') || errorMessage?.includes('already clocked in')) {
              await get().fetchTodayRecord(true);
              return {
                success: false,
                error: 'already clocked in',
                message: 'You are already clocked in for today',
              };
            }
          }
          
          return {
            success: false,
            error: error.response?.data?.message || 'Clock in failed',
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

          console.log('🔍 [STORE] Starting break...');
          const response = await api.post('/employee/attendance/break-in');
          console.log('🔍 [STORE] Break-in response:', response.data);

          if (response.data?.success) {
            console.log('🔍 [STORE] Break started successfully, refreshing data...');
            // Add a small delay to ensure database update is complete
            await new Promise(resolve => setTimeout(resolve, 500));
            await get().fetchTodayRecord(true);
            
            // Check the updated state
            const updatedState = get();
            console.log('🔍 [STORE] Updated state after break start:', updatedState.todayRecord);
            console.log('🔍 [STORE] Break sessions after refresh:', updatedState.todayRecord?.breakSessions);
            
            return { success: true, data: response.data };
          }

          return { success: false, error: 'Start break failed' };
        } catch (error) {
          console.error('🔍 [STORE] Start break error:', error);
          set({ isLoading: false });
          return {
            success: false,
            error: error.response?.data?.message || 'Start break failed',
          };
        }
      },

      endBreak: async () => {
        try {
          set({ isLoading: true });

          console.log('🔍 [STORE] Ending break...');
          const response = await api.post('/employee/attendance/break-out');
          console.log('🔍 [STORE] Break-out response:', response.data);

          if (response.data?.success) {
            console.log('🔍 [STORE] Break ended successfully, refreshing data...');
            // Add a small delay to ensure database update is complete
            await new Promise(resolve => setTimeout(resolve, 500));
            await get().fetchTodayRecord(true);
            
            // Check the updated state
            const updatedState = get();
            console.log('🔍 [STORE] Updated state after break end:', updatedState.todayRecord);
            console.log('🔍 [STORE] Break sessions after refresh:', updatedState.todayRecord?.breakSessions);
            
            return { success: true, data: response.data };
          }

          return { success: false, error: 'End break failed' };
        } catch (error) {
          console.error('🔍 [STORE] End break error:', error);
          set({ isLoading: false });
          return {
            success: false,
            error: error.response?.data?.message || 'End break failed',
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

        // Check for new session format (if it exists)
        const activeSession = todayRecord.sessions?.find(
          (s) => s.status === 'active' || s.status === 'on_break'
        );

        // Check for legacy format (direct clockIn/clockOut on record)
        const hasLegacyClockIn =
          todayRecord.clockIn &&
          !todayRecord.clockOut &&
          (!todayRecord.sessions ||
            todayRecord.sessions.length === 0);

            // [DEBUG] FIX: Always read breaks from legacy breakSessions and convert to session format
        const legacyBreakSessions = todayRecord.breakSessions || [];
        
        // Convert legacy break sessions to session format
        const sessionBreaks = legacyBreakSessions.map(session => ({
          startTime: session.breakIn,
          endTime: session.breakOut,
          duration: session.duration || 0
        }));

        // Find active break session
        const activeBreakSession = legacyBreakSessions.find(
          session => session.breakIn && !session.breakOut
        );

        // Determine if clocked in (either new session format or legacy)
        const isClockedIn = 
          activeSession?.status === 'active' ||
          activeSession?.status === 'on_break' ||
          hasLegacyClockIn ||
          (todayRecord.clockIn && !todayRecord.clockOut);

        // 🔥 FIX: Determine if on break using legacy breakSessions
        const isOnBreak = 
          activeSession?.status === 'on_break' ||
          !!activeBreakSession;

        return {
          isClockedIn,
          isOnBreak,
          hasLegacyClockIn,
          activeSession: activeSession || (todayRecord.clockIn && !todayRecord.clockOut ? {
            checkIn: todayRecord.clockIn,
            workLocation: todayRecord.location || 'office',
            locationDetails: todayRecord.location,
            breaks: sessionBreaks, // 🔥 FIX: Use converted session breaks
            totalBreakMinutes: todayRecord.totalBreakMinutes || 0,
            workedMinutes: todayRecord.totalWorkedMinutes || 0,
            status: isOnBreak ? 'on_break' : 'active'
          } : null),
          hasCompletedSessions:
            todayRecord.sessions?.some(
              (s) => s.status === 'completed'
            ) || false,
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
