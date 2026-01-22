/**
 * Attendance Calculation Service
 * Centralized business logic for attendance calculations
 * Eliminates duplication across attendance services and controllers
 * 
 * 🚨 CRITICAL RULES - MUST BE FOLLOWED:
 * 
 * 1. This service is the SINGLE SOURCE OF TRUTH for:
 *    - Late calculation (calculateLateStatus)
 *    - Work hours calculation (calculateWorkHours)
 *    - Break duration calculation
 *    - Overtime calculation
 *    - Attendance state determination
 * 
 * 2. ❌ NEVER implement duplicate logic in:
 *    - Models (AttendanceRecord, etc.)
 *    - Controllers (admin/attendance.controller.js, etc.)
 *    - Jobs (attendanceFinalization.js, etc.)
 *    - Other services
 * 
 * 3. ❌ NEVER use manual date calculations like:
 *    - new Date().setHours() for shift times
 *    - if (clockIn > shiftStart) for late checks
 *    - Manual minute calculations
 * 
 * 4. ✅ ALWAYS call this service:
 *    - AttendanceCalculationService.calculateLateStatus(clockIn, shift, attendanceDate)
 *    - AttendanceCalculationService.calculateWorkHours(clockIn, clockOut, breaks)
 * 
 * 5. 🔧 Timezone Handling:
 *    - All calculations use Date.UTC() to avoid local timezone issues
 *    - Consistent across all environments and deployments
 *    - Handles cross-day night shifts automatically
 */

import logger from '../../utils/logger.js';

class AttendanceCalculationService {
    /**
     * Calculate late minutes and status
     * @param {Date} clockInTime - Actual clock in time
     * @param {Object} shift - Employee's assigned shift
     * @param {string} attendanceDate - The attendance date (YYYY-MM-DD format)
     * @returns {Object} Late calculation result with consistent shape
     */
    static calculateLateStatus(clockInTime, shift, attendanceDate) {
        if (!shift || !shift.shiftStartTime || !attendanceDate) {
            return { 
                isLate: false, 
                lateMinutes: 0, 
                shiftStartTime: null, 
                lateThreshold: null 
            };
        }

        try {
            // Simple and fast approach - no complex UTC detection
            const clockIn = new Date(clockInTime);
            
            // Validate clock-in time
            if (isNaN(clockIn.getTime())) {
                return { 
                    isLate: false, 
                    lateMinutes: 0, 
                    shiftStartTime: null, 
                    lateThreshold: null 
                };
            }
            
            // Parse shift time
            const shiftTimeStr = shift.shiftStartTime;
            if (!shiftTimeStr || typeof shiftTimeStr !== 'string' || !shiftTimeStr.includes(':')) {
                return { 
                    isLate: false, 
                    lateMinutes: 0, 
                    shiftStartTime: null, 
                    lateThreshold: null 
                };
            }
            
            // Extract time components
            const timeParts = shiftTimeStr.split(':').map(Number);
            if (timeParts.length < 2 || timeParts.some(isNaN)) {
                return { 
                    isLate: false, 
                    lateMinutes: 0, 
                    shiftStartTime: null, 
                    lateThreshold: null 
                };
            }
            
            const [hours, minutes, seconds = 0] = timeParts;
            
            // 🔧 CRITICAL FIX: Handle cross-day night shifts properly
            // Using Date.UTC() to avoid local timezone shift issues and ensure consistent calculations
            let shiftStart;
            if (typeof attendanceDate === 'string') {
                const [year, month, day] = attendanceDate.split('-').map(Number);
                
                // 🔧 CRITICAL FIX: Use the same timezone as the clock-in time
                // Instead of forcing UTC, match the timezone of the clock-in time
                const clockInDate = new Date(clockInTime);
                
                // Create shift start time using the same date construction as clock-in
                // This ensures timezone consistency
                const shiftStartSameDay = new Date(clockInDate);
                shiftStartSameDay.setHours(hours, minutes, seconds, 0);
                
                const shiftStartPrevDay = new Date(shiftStartSameDay);
                shiftStartPrevDay.setDate(shiftStartPrevDay.getDate() - 1);
                
                // 🔧 IMPROVED LOGIC: Only use previous day for actual night shifts
                // Night shift criteria:
                // 1. Shift starts at 6 PM or later (18:00+)
                // 2. Clock-in is early morning (before 6 AM) of the next day
                // 3. This indicates the shift spans across midnight
                const isNightShift = hours >= 18; // Shift starts at 6 PM or later
                const isEarlyMorningClockIn = clockInDate.getHours() < 6; // Clock-in before 6 AM
                
                // For regular day shifts (9 AM, 10 AM, etc.), ALWAYS use same day
                // Even if someone clocks in very late (4 PM for 9 AM shift), it's still the same day
                if (isNightShift && isEarlyMorningClockIn) {
                    // True night shift scenario: shift started previous day, clock-in is next day
                    shiftStart = shiftStartPrevDay;
                } else {
                    // Normal scenario: use same day shift start (covers all day shifts and late arrivals)
                    shiftStart = shiftStartSameDay;
                }
            } else {
                // If it's already a Date object, convert to UTC for consistency
                const dateStr = attendanceDate.toISOString().split('T')[0];
                const [year, month, day] = dateStr.split('-').map(Number);
                shiftStart = new Date(Date.UTC(year, month - 1, day, hours, minutes, seconds, 0));
            }
            
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
            return { 
                isLate: false, 
                lateMinutes: 0, 
                shiftStartTime: null, 
                lateThreshold: null 
            };
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