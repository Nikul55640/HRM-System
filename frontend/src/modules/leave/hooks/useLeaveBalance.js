import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import employeeSelfService from '../../../services/employeeSelfService';

/**
 * Custom hook to fetch and manage leave balance data
 * @param {Object} options - Configuration options
 * @param {boolean} options.autoFetch - Whether to fetch data automatically on mount
 * @param {number} options.refreshInterval - Auto-refresh interval in milliseconds
 * @returns {Object} Leave balance data and methods
 */
export const useLeaveBalance = (options = {}) => {
  const { autoFetch = true, refreshInterval = null } = options;
  
  const [leaveBalance, setLeaveBalance] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [lastFetched, setLastFetched] = useState(null);

  const fetchLeaveBalance = async (showToast = false) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await employeeSelfService.leave.getBalance();
      
      if (response.success) {
        setLeaveBalance(response.data);
        setLastFetched(new Date());
        
        if (showToast) {
          toast.success('Leave balance updated');
        }
      } else {
        throw new Error(response.message || 'Failed to fetch leave balance');
      }
    } catch (err) {
      const errorMessage = err.message || 'Failed to load leave balance';
      setError(errorMessage);
      
      if (showToast) {
        toast.error(errorMessage);
      }
    } finally {
      setLoading(false);
    }
  };

  const refreshBalance = () => fetchLeaveBalance(true);

  // Auto-fetch on mount
  useEffect(() => {
    if (autoFetch) {
      fetchLeaveBalance();
    }
  }, [autoFetch]);

  // Auto-refresh interval
  useEffect(() => {
    if (refreshInterval && refreshInterval > 0) {
      const interval = setInterval(() => {
        fetchLeaveBalance();
      }, refreshInterval);

      return () => clearInterval(interval);
    }
  }, [refreshInterval]);

  // Calculate summary statistics
  const summary = leaveBalance?.leaveTypes ? {
    totalAllocated: leaveBalance.leaveTypes.reduce((sum, lt) => sum + lt.allocated, 0),
    totalUsed: leaveBalance.leaveTypes.reduce((sum, lt) => sum + lt.used, 0),
    totalPending: leaveBalance.leaveTypes.reduce((sum, lt) => sum + lt.pending, 0),
    totalAvailable: leaveBalance.leaveTypes.reduce((sum, lt) => sum + lt.available, 0),
  } : null;

  // Get specific leave type balance
  const getLeaveTypeBalance = (type) => {
    if (!leaveBalance?.leaveTypes) return null;
    return leaveBalance.leaveTypes.find(lt => lt.type === type) || null;
  };

  // Check if employee has sufficient balance for a request
  const hasBalance = (type, days) => {
    const balance = getLeaveTypeBalance(type);
    return balance ? balance.available >= days : false;
  };

  return {
    // Data
    leaveBalance,
    summary,
    loading,
    error,
    lastFetched,
    
    // Methods
    fetchLeaveBalance,
    refreshBalance,
    getLeaveTypeBalance,
    hasBalance,
    
    // Status
    isLoaded: !!leaveBalance,
    isEmpty: leaveBalance?.leaveTypes?.length === 0,
  };
};

export default useLeaveBalance;