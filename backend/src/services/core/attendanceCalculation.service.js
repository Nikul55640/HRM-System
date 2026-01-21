/**
 * Attendance Calculation Service
 * Centralized business logic for attendance calculations
 * Eliminates duplication across attendance services and controllers
 */

import { getLocalDateString } from '../../utils/dateUtils.js';
import logger from '../../utils/logger.js';

class AttendanceCalculationService {
    /**
     * Calculate late minutes and status
     * @param {Date} clockInTime - Actual clock in time
     * @param {Object} shift - Employee's assigned shift
     * @returns {Object} Late calculation result
     */
    static calculateLateStatus(clockInTime, shift) {
        if (!shift || !shift.shiftStartTime) {
            return { isLate: false, lateMinutes: 0 };
        }

        try {
            // Simple and fast approach - no complex UTC detection
            const clockIn = new Date(clockInTime);
            
            // Validate clock-in time
            if (isNaN(clockIn.getTime())) {
                return { isLate: false, lateMinutes: 0 };
            }
            
            // Parse shift time
            const shiftTimeStr = shift.shiftStartTime;
            if (!shiftTimeStr || typeof shiftTimeStr !== 'string' || !shiftTimeStr.includes(':')) {
                return { isLate: false, lateMinutes: 0 };
            }
            
            // Extract time components
            const timeParts = shiftTimeStr.split(':').map(Number);
            if (timeParts.length < 2 || timeParts.some(isNaN)) {
                return { isLate: false, lateMinutes: 0 };
            }
            
            const [hours, minutes, seconds = 0] = timeParts;
            
            // Create shift start time using clock-in's date
            const shiftStart = new Date(clockIn);
            shiftStart.setHours(hours, minutes, seconds, 0);
            
            // Calculate grace period threshold
            const gracePeriodMs = (shift.gracePeriodMinutes || 0) * 60 * 1000;
            const lateThreshold = new Date(shiftStart.getTime() + gracePeriodMs);

            // Calculate late status
            let lateMinutes = 0;
            let isLate = false;

            if (clockIn > lateThreshold) {
                lateMinutes = Math.floor((clockIn - lateThreshold) / (1000 * 60));
                isLate = true;
            }

            return { 
                isLate, 
                lateMinutes, 
                shiftStartTime: shiftStart, 
                lateThreshold 
            };
            
        } catch (error) {
            logger.error('Error in calculateLateStatus:', error);
            return { isLate: false, lateMinutes: 0 };
        }
    }

    /**
     * Calculate work hours between clock in and clock out
     * @param {Date} clockIn - Clock in time
     * @param {Date} clockOut - Clock out time
     * @param {Array} breakSessions - Array of break sessions
     * @returns {Object} Work time calculation in consistent units (minutes)
     */
    static calculateWorkHours(clockIn, clockOut, breakSessions = []) {
        if (!clockIn || !clockOut) {
            return { workMinutes: 0, breakMinutes: 0, totalWorkTimeMs: 0 };
        }

        // Calculate total time between clock in and out
        const totalTimeMs = clockOut.getTime() - clockIn.getTime();
        
        // Calculate total break duration
        let totalBreakMs = 0;
        if (Array.isArray(breakSessions)) {
            breakSessions.forEach(session => {
                if (session.breakIn && session.breakOut) {
                    const breakDuration = new Date(session.breakOut).getTime() - new Date(session.breakIn).getTime();
                    totalBreakMs += breakDuration;
                }
            });
        }

        // Calculate actual work time (guard against negative values)
        const workTimeMs = Math.max(0, totalTimeMs - totalBreakMs);
        const workMinutes = Math.floor(workTimeMs / (1000 * 60));
        const breakMinutes = Math.floor(totalBreakMs / (1000 * 60));

        return {
            workMinutes,
            breakMinutes,
            totalWorkTimeMs: workTimeMs
        };
    }

    /**
     * Normalize and validate break sessions array
     * @param {any} breakSessions - Break sessions data (could be string, array, or null)
     * @returns {Array} Normalized break sessions array
     */
    static normalizeBreakSessions(breakSessions) {
        if (!breakSessions) {
            return [];
        }

        // Handle string JSON
        if (typeof breakSessions === 'string') {
            try {
                breakSessions = JSON.parse(breakSessions);
            } catch (e) {
                logger.debug('Failed to parse break sessions JSON:', e);
                return [];
            }
        }

        // Ensure it's an array
        if (!Array.isArray(breakSessions)) {
            return [];
        }

        return breakSessions;
    }

    /**
     * Calculate break duration for a single session
     * @param {Object} breakSession - Break session with breakIn and breakOut
     * @returns {number} Duration in minutes
     */
    static calculateBreakDuration(breakSession) {
        if (!breakSession.breakIn || !breakSession.breakOut) {
            return 0;
        }

        const breakIn = new Date(breakSession.breakIn);
        const breakOut = new Date(breakSession.breakOut);
        const durationMs = breakOut.getTime() - breakIn.getTime();
        
        return Math.floor(durationMs / (1000 * 60));
    }

    /**
     * Calculate overtime minutes
     * @param {number} workMinutes - Total work minutes
     * @param {Object} shift - Employee's shift configuration
     * @returns {number} Overtime minutes
     */
    static calculateOvertime(workMinutes, shift) {
        if (!shift || !shift.fullDayHours) {
            return 0;
        }
        
        const fullDayMinutes = shift.fullDayHours * 60;
        return Math.max(0, workMinutes - fullDayMinutes);
    }

    /**
     * Determine current attendance state
     * @param {boolean} hasClockIn - Has clocked in
     * @param {boolean} hasClockOut - Has clocked out
     * @param {boolean} hasActiveBreak - Currently on break
     * @returns {string} Current state
     */
    static determineCurrentState(hasClockIn, hasClockOut, hasActiveBreak) {
        if (!hasClockIn) return 'not_clocked_in';
        if (hasClockOut) return 'clocked_out';
        if (hasActiveBreak) return 'on_break';
        return 'working';
    }
}

export default AttendanceCalculationService;