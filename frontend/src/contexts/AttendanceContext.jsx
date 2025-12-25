import React, { createContext, useContext, useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import api from '../core/services/api';

const AttendanceContext = createContext();

export const useAttendanceContext = () => {
  const context = useContext(AttendanceContext);
  if (!context) {
    throw new Error('useAttendanceContext must be used within AttendanceProvider');
  }
  return context;
};

export const AttendanceProvider = ({ children }) => {
  const [attendanceState, setAttendanceState] = useState({
    todayRecord: null,
    isLoading: false,
    lastUpdated: null,
  });

  // Fetch today's attendance record
  const fetchTodayRecord = async (silent = false) => {
    try {
      if (!silent) {
        setAttendanceState(prev => ({ ...prev, isLoading: true }));
      }

      const today = new Date();
      const startDate = today.toISOString().split('T')[0];
      const endDate = startDate;
      
      const response = await api.get('/employee/attendance', {
        params: {
          startDate,
          endDate,
          limit: 1,
        },
      });

      if (response.data.success && response.data.data.length > 0) {
        const record = response.data.data[0];
        const recordDate = new Date(record.date);
        const isToday = recordDate.toDateString() === today.toDateString();

        if (isToday) {
          setAttendanceState(prev => ({
            ...prev,
            todayRecord: record,
            lastUpdated: new Date(),
            isLoading: false,
          }));
        } else {
          setAttendanceState(prev => ({
            ...prev,
            todayRecord: null,
            lastUpdated: new Date(),
            isLoading: false,
          }));
        }
      } else {
        setAttendanceState(prev => ({
          ...prev,
          todayRecord: null,
          lastUpdated: new Date(),
          isLoading: false,
        }));
      }
    } catch (error) {
      console.error('Error fetching attendance:', error);
      setAttendanceState(prev => ({
        ...prev,
        isLoading: false,
      }));
    }
  };

  // Clock in function
  const clockIn = async (locationData) => {
    try {
      setAttendanceState(prev => ({ ...prev, isLoading: true }));
      
      const response = await api.post('/employee/attendance/session/start', locationData);
      
      if (response.data.success) {
        // Refresh the attendance data
        await fetchTodayRecord(true);
        return { success: true, data: response.data };
      }
      
      return { success: false, error: 'Clock in failed' };
    } catch (error) {
      setAttendanceState(prev => ({ ...prev, isLoading: false }));
      return { success: false, error: error.response?.data?.message || 'Clock in failed' };
    }
  };

  // Clock out function
  const clockOut = async () => {
    try {
      setAttendanceState(prev => ({ ...prev, isLoading: true }));
      
      // Determine which endpoint to use based on current record
      const hasLegacyClockIn = attendanceState.todayRecord?.checkIn && 
                              !attendanceState.todayRecord?.checkOut && 
                              (!attendanceState.todayRecord?.sessions || attendanceState.todayRecord.sessions.length === 0);
      
      const endpoint = hasLegacyClockIn ? '/employee/attendance/check-out' : '/employee/attendance/session/end';
      
      const response = await api.post(endpoint);
      
      if (response.data.success) {
        // Refresh the attendance data
        await fetchTodayRecord(true);
        return { success: true, data: response.data };
      }
      
      return { success: false, error: 'Clock out failed' };
    } catch (error) {
      setAttendanceState(prev => ({ ...prev, isLoading: false }));
      return { success: false, error: error.response?.data?.message || 'Clock out failed' };
    }
  };

  // Start break function
  const startBreak = async () => {
    try {
      setAttendanceState(prev => ({ ...prev, isLoading: true }));
      
      const response = await api.post('/employee/attendance/break/start');
      
      if (response.data.success) {
        await fetchTodayRecord(true);
        return { success: true, data: response.data };
      }
      
      return { success: false, error: 'Start break failed' };
    } catch (error) {
      setAttendanceState(prev => ({ ...prev, isLoading: false }));
      return { success: false, error: error.response?.data?.message || 'Start break failed' };
    }
  };

  // End break function
  const endBreak = async () => {
    try {
      setAttendanceState(prev => ({ ...prev, isLoading: true }));
      
      const response = await api.post('/employee/attendance/break/end');
      
      if (response.data.success) {
        await fetchTodayRecord(true);
        return { success: true, data: response.data };
      }
      
      return { success: false, error: 'End break failed' };
    } catch (error) {
      setAttendanceState(prev => ({ ...prev, isLoading: false }));
      return { success: false, error: error.response?.data?.message || 'End break failed' };
    }
  };

  // Get current attendance status
  const getAttendanceStatus = () => {
    const { todayRecord } = attendanceState;
    
    if (!todayRecord) {
      return {
        isClockedIn: false,
        isOnBreak: false,
        hasLegacyClockIn: false,
        activeSession: null,
        hasCompletedSessions: false,
      };
    }

    const activeSession = todayRecord.sessions?.find(
      (s) => s.status === 'active' || s.status === 'on_break'
    );

    const hasLegacyClockIn = todayRecord.checkIn && 
                            !todayRecord.checkOut && 
                            (!todayRecord.sessions || todayRecord.sessions.length === 0);

    const isClockedIn = activeSession?.status === 'active' || hasLegacyClockIn;
    const isOnBreak = activeSession?.status === 'on_break';
    const hasCompletedSessions = todayRecord.sessions?.some((s) => s.status === 'completed');

    return {
      isClockedIn,
      isOnBreak,
      hasLegacyClockIn,
      activeSession,
      hasCompletedSessions,
      todayRecord,
    };
  };

  // Initialize on mount
  useEffect(() => {
    fetchTodayRecord();
  }, []);

  const value = {
    ...attendanceState,
    fetchTodayRecord,
    clockIn,
    clockOut,
    startBreak,
    endBreak,
    getAttendanceStatus,
  };

  return (
    <AttendanceContext.Provider value={value}>
      {children}
    </AttendanceContext.Provider>
  );
};

AttendanceProvider.propTypes = {
  children: PropTypes.node.isRequired,
};