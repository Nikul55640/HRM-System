/**
 * Attendance Status Utilities
 * 
 * 🔥 CRITICAL RULES:
 * 1. LIVE states are set during the shift
 * 2. FINAL states are ONLY set by finalization cron
 * 3. UI must handle the transition intelligently
 */

import { getLocalDateString } from './dateUtils.js';

// 🟢 LIVE STATES (during shift)
export const LIVE_STATES = {
  IN_PROGRESS: 'in_progress',
  ON_BREAK: 'on_break', 
  COMPLETED: 'completed'
};

// 🔴 FINAL STATES (after shift end - cron only)
export const FINAL_STATES = {
  PRESENT: 'present',
  HALF_DAY: 'half_day',
  ABSENT: 'absent',
  LEAVE: 'leave',
  HOLIDAY: 'holiday',
  PENDING_CORRECTION: 'pending_correction'
};

export const ALL_STATES = { ...LIVE_STATES, ...FINAL_STATES };

/**
 * Check if employee's shift has ended (with buffer)
 * This is THE source of truth for when finalization can happen
 */
export const hasShiftEnded = (employee, now = new Date()) => {
  if (!employee.shift?.shiftEndTime) return false;
  
  const today = new Date(now);
  today.setHours(0, 0, 0, 0);
  
  const shiftEnd = parseTime(employee.shift.shiftEndTime, today);
  if (!shiftEnd) return false;
  
  // Add 30-minute buffer
  const finalizationTime = new Date(shiftEnd.getTime() + 30 * 60 * 1000);
  
  return now > finalizationTime;
};

/**
 * Parse time string (HH:MM:SS) into Date object for today
 */
export const parseTime = (timeString, baseDate = new Date()) => {
  if (!timeString || typeof timeString !== 'string') return null;
  
  const timeParts = timeString.split(':').map(Number);
  if (timeParts.length < 2 || timeParts.some(isNaN)) return null;
  
  const [hours, minutes, seconds = 0] = timeParts;
  const result = new Date(baseDate);
  result.setHours(hours, minutes, seconds, 0);
  
  return result;
};

/**
 * 🔥 CRITICAL: Determine what status to show in UI
 * This prevents premature "incomplete" display
 */
export const getDisplayStatus = (attendance, employee, now = new Date()) => {
  const status = attendance.status;
  
  // If it's already a final state, show it
  if (Object.values(FINAL_STATES).includes(status)) {
    return status;
  }
  
  // For live states, check if shift has ended
  if (status === LIVE_STATES.IN_PROGRESS) {
    if (hasShiftEnded(employee, now)) {
      // Shift ended but not finalized yet
      if (!attendance.clockOut) {
        return 'missing_clockout'; // UI-only state
      }
      return 'pending_finalization'; // UI-only state
    }
    return 'working'; // UI-friendly version
  }
  
  if (status === LIVE_STATES.ON_BREAK) {
    return 'on_break';
  }
  
  if (status === LIVE_STATES.COMPLETED) {
    if (hasShiftEnded(employee, now)) {
      return 'pending_finalization';
    }
    return 'completed';
  }
  
  return status;
};

/**
 * 🔒 VALIDATION: Only cron can set final states
 */
export const canSetFinalState = (context) => {
  return context === 'finalization_cron' || context === 'admin_correction';
};

/**
 * Get human-friendly status labels for UI
 */
export const getStatusLabel = (displayStatus) => {
  const labels = {
    // Live states (UI-friendly)
    'working': 'Working',
    'on_break': 'On Break',
    'completed': 'Completed',
    'pending_finalization': 'Pending Finalization',
    'missing_clockout': 'Missing Clock-out',
    
    // Final states
    'present': 'Present',
    'half_day': 'Half Day',
    'absent': 'Absent',
    'leave': 'On Leave',
    'holiday': 'Holiday',
    'pending_correction': 'Needs Correction'
  };
  
  return labels[displayStatus] || displayStatus;
};

/**
 * Get status color for UI
 */
export const getStatusColor = (displayStatus) => {
  const colors = {
    // Live states
    'working': '#22c55e',           // Green
    'on_break': '#f59e0b',          // Orange
    'completed': '#3b82f6',         // Blue
    'pending_finalization': '#6b7280', // Gray
    'missing_clockout': '#ef4444',   // Red
    
    // Final states
    'present': '#22c55e',           // Green
    'half_day': '#f59e0b',          // Orange
    'absent': '#ef4444',            // Red
    'leave': '#3b82f6',             // Blue
    'holiday': '#8b5cf6',           // Purple
    'pending_correction': '#f97316'  // Orange-red
  };
  
  return colors[displayStatus] || '#6b7280';
};

export default {
  LIVE_STATES,
  FINAL_STATES,
  ALL_STATES,
  hasShiftEnded,
  parseTime,
  getDisplayStatus,
  canSetFinalState,
  getStatusLabel,
  getStatusColor
};