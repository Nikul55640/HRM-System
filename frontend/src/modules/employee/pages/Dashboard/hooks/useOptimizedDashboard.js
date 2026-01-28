import { useState, useEffect, useCallback, useMemo } from 'react';
import { toast } from 'react-toastify';

/**
 * Optimized Dashboard Hook with Performance Improvements
 * - Debounced API calls
 * - Memoized calculations
 * - Lazy loading of non-critical data
 * - Error boundaries
 */
export const useOptimizedDashboard = (user) => {
  const [dashboardData, setDashboardData] = useState({
    profile: null,
    attendance: null,
    leaves: null,
    notifications: null,
    loading: true,
    error: null
  });

  // Debounce function to prevent excessive API calls
  const debounce = useCallback((func, delay) => {
    let timeoutId;
    return (...args) => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => func.apply(null, args), delay);
    };
  }, []);

  // Load critical data first (profile, attendance)
  const loadCriticalData = useCallback(async () => {
    if (!user?.employee?.id) return;

    try {
      setDashboardData(prev => ({ ...prev, loading: true, error: null }));

      // Load only essential data first
      const criticalPromises = [
        fetch(`/api/employee/profile`).then(res => res.json()),
        fetch(`/api/employee/attendance/today`).then(res => res.json())
      ];

      const [profileRes, attendanceRes] = await Promise.all(criticalPromises);

      setDashboardData(prev => ({
        ...prev,
        profile: profileRes.success ? profileRes.data : null,
        attendance: attendanceRes.success ? attendanceRes.data : null,
        loading: false
      }));

      // Load non-critical data after a delay
      setTimeout(() => loadNonCriticalData(), 1000);

    } catch (error) {
      console.error('Error loading critical dashboard data:', error);
      setDashboardData(prev => ({
        ...prev,
        loading: false,
        error: 'Failed to load dashboard data'
      }));
      toast.error('Failed to load dashboard data');
    }
  }, [user?.employee?.id]);

  // Load non-critical data (leaves, notifications)
  const loadNonCriticalData = useCallback(async () => {
    if (!user?.employee?.id) return;

    try {
      const nonCriticalPromises = [
        fetch(`/api/employee/leave/balance`).then(res => res.json()),
        fetch(`/api/employee/notifications?limit=5`).then(res => res.json())
      ];

      const [leavesRes, notificationsRes] = await Promise.all(nonCriticalPromises);

      setDashboardData(prev => ({
        ...prev,
        leaves: leavesRes.success ? leavesRes.data : null,
        notifications: notificationsRes.success ? notificationsRes.data : null
      }));

    } catch (error) {
      console.error('Error loading non-critical dashboard data:', error);
      // Don't show error toast for non-critical data
    }
  }, [user?.employee?.id]);

  // Debounced refresh function
  const debouncedRefresh = useMemo(
    () => debounce(loadCriticalData, 300),
    [debounce, loadCriticalData]
  );

  // Initial load
  useEffect(() => {
    loadCriticalData();
  }, [loadCriticalData]);

  // Memoized computed values
  const computedData = useMemo(() => {
    const { profile, attendance, leaves } = dashboardData;

    return {
      displayName: profile?.fullName || user?.email || 'User',
      attendanceStatus: attendance?.status || 'unknown',
      totalLeaveBalance: leaves?.reduce((sum, leave) => sum + (leave.balance || 0), 0) || 0,
      isOnLeave: attendance?.status === 'on_leave',
      needsAttention: attendance?.status === 'incomplete' || attendance?.isLate
    };
  }, [dashboardData, user]);

  return {
    ...dashboardData,
    ...computedData,
    refresh: debouncedRefresh,
    loadNonCriticalData
  };
};

export default useOptimizedDashboard;