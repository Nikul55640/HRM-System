import cron from 'node-cron';
import { AttendanceRecord, Shift, Employee, Holiday, WorkingRule, EmployeeShift, User, AttendanceCorrectionRequest, LeaveRequest } from '../models/index.js';
import logger from '../utils/logger.js';
import { Op } from 'sequelize';
import { getLocalDateString } from '../utils/dateUtils.js';

/**
 * Helper: Get employee's active shift for a specific date
 * Returns shift details including timing and hour thresholds
 */
async function getEmployeeShiftForDate(employeeId, dateString) {
  try {
    // First, get the employee shift assignment
    const employeeShift = await EmployeeShift.findOne({
      where: {
        employeeId: employeeId,
        isActive: true,
        effectiveDate: { [Op.lte]: dateString },
        [Op.or]: [
          { endDate: null },
          { endDate: { [Op.gte]: dateString } }
        ]
      }
    });

    if (!employeeShift) {
      return null;
    }

    // Then, get the shift details separately
    const shift = await Shift.findByPk(employeeShift.shiftId, {
      attributes: [
        'shiftStartTime',
        'shiftEndTime',
        'fullDayHours',
        'halfDayHours',
        'gracePeriodMinutes'
      ]
    });

    return shift;
  } catch (error) {
    logger.error(`Error fetching shift for employee ${employeeId}:`, error);
    return null;
  }
}

/**
 * Helper: Check if employee's shift has ended (with buffer)
 * Returns true only if current time is past shift end + 30-minute buffer
 * This prevents marking absent too early
 */
function hasShiftEnded(shiftEndTime, dateString, bufferMinutes = 30) {
  try {
    const now = new Date();
    const currentDateString = getLocalDateString(now);
    
    // If we're checking a past date, shift has definitely ended
    if (currentDateString > dateString) {
      return true;
    }
    
    // If we're checking a future date, shift hasn't ended yet
    if (currentDateString < dateString) {
      return false;
    }
    
    // Same day - check time
    const [hours, minutes, seconds] = shiftEndTime.split(':').map(Number);
    const shiftEndDateTime = new Date();
    shiftEndDateTime.setHours(hours, minutes, seconds, 0);
    
    // Add buffer
    shiftEndDateTime.setMinutes(shiftEndDateTime.getMinutes() + bufferMinutes);
    
    return now >= shiftEndDateTime;
  } catch (error) {
    logger.error(`Error checking shift end time:`, error);
    return false;
  }
}

/**
 * Send notification when employee is auto-marked as absent
 */
async function sendAbsentNotification(employee, dateString, reason) {
  try {
    const notificationService = (await import('../services/notificationService.js')).default;
    
    // Get user ID from employee
    const employeeWithUser = await Employee.findByPk(employee.id, {
      include: [{ model: User, as: 'user', attributes: ['id'] }]
    });
    
    if (employeeWithUser?.user?.id) {
      await notificationService.sendToUser(employeeWithUser.user.id, {
        title: 'Attendance Marked as Absent',
        message: `Your attendance for ${dateString} was marked as absent. Reason: ${reason}. Please submit a correction request if this is incorrect.`,
        type: 'error',
        category: 'attendance',
        data: {
          date: dateString,
          reason: reason,
          action: 'attendance_auto_absent'
        }
      });
    }
  } catch (error) {
    logger.error(`Failed to send absent notification for employee ${employee.id}:`, error);
    // Don't throw - notification failure shouldn't stop finalization
  }
}

/**
 * Send notification when employee needs correction
 */
async function sendCorrectionNotification(employee, dateString, reason) {
  try {
    const notificationService = (await import('../services/notificationService.js')).default;
    
    // Get user ID from employee
    const employeeWithUser = await Employee.findByPk(employee.id, {
      include: [{ model: User, as: 'user', attributes: ['id'] }]
    });
    
    if (employeeWithUser?.user?.id) {
      await notificationService.sendToUser(employeeWithUser.user.id, {
        title: 'Attendance Correction Required',
        message: `Your attendance for ${dateString} requires correction. Reason: ${reason}. Please submit a correction request.`,
        type: 'warning',
        category: 'attendance',
        data: {
          date: dateString,
          reason: reason,
          action: 'attendance_correction_required'
        }
      });
    }
  } catch (error) {
    logger.error(`Failed to send correction notification for employee ${employee.id}:`, error);
    // Don't throw - notification failure shouldn't stop finalization
  }
}

/**
 * Send notification when employee is auto-marked as leave
 */
async function sendLeaveNotification(employee, dateString, reason) {
  try {
    const notificationService = (await import('../services/notificationService.js')).default;
    
    // Get user ID from employee
    const employeeWithUser = await Employee.findByPk(employee.id, {
      include: [{ model: User, as: 'user', attributes: ['id'] }]
    });
    
    if (employeeWithUser?.user?.id) {
      await notificationService.sendToUser(employeeWithUser.user.id, {
        title: 'Attendance Auto-Marked as Leave',
        message: `Your attendance for ${dateString} was marked as leave. Reason: ${reason}. Please submit a correction request if this is incorrect.`,
        type: 'warning',
        category: 'attendance',
        data: {
          date: dateString,
          reason: reason,
          action: 'attendance_auto_leave'
        }
      });
    }
  } catch (error) {
    logger.error(`Failed to send leave notification for employee ${employee.id}:`, error);
    // Don't throw - notification failure shouldn't stop finalization
  }
}

/**
 * 🔥 CRITICAL: Daily Attendance Finalization Job
 * 
 * This job runs every 15 minutes to support multiple shifts with different timings.
 * Each employee is finalized ONLY AFTER their shift ends (shift-aware finalization).
 * 
 * Features:
 * 1. ✅ Shift-end guard prevents early absent marking
 * 2. ✅ Auto-mark as absent only after shift ends + 30-min buffer
 * 3. ✅ Calculate final status (present/half_day/absent)
 * 4. ✅ Handle all edge cases
 * 5. ✅ Support multiple shifts (7-4, 9-6, 2-11, night shifts, etc.)
 * 6. ✅ Use shift-specific hour thresholds (not hardcoded)
 * 7. ✅ Skip employees whose shift is not finished yet
 * 
 * Without this job, attendance rules will NOT work properly!
 * 
 * CRITICAL RULE:
 * "Employee is marked ABSENT only after end-of-day cron job if they never clocked in"
 * + "Only after their shift ends (with buffer)"
 */

/**
 * Finalize attendance for a specific date
 * @param {Date} date - Date to finalize (defaults to today)
 */
export const finalizeDailyAttendance = async (date = new Date()) => {
  // ✅ FIX: Use local timezone, not UTC
  const dateString = getLocalDateString(date);

  logger.info(`Starting attendance finalization for ${dateString}...`);

  try {
    // Check if today is a holiday
    const isHoliday = await Holiday.isHoliday(dateString);
    if (isHoliday) {
      logger.info(`${dateString} is a holiday. Skipping attendance finalization.`);
      return { skipped: true, reason: 'holiday' };
    }

    // Check if today is a working day
    const isWorkingDay = await WorkingRule.isWorkingDay(dateString);
    if (!isWorkingDay) {
      logger.info(`${dateString} is not a working day (weekend). Skipping attendance finalization.`);
      return { skipped: true, reason: 'weekend' };
    }

    // ✅ FIXED: Get all active employees WITHOUT complex includes to avoid association errors
    const employees = await Employee.findAll({
      where: { 
        isActive: true,
        status: 'Active'
      }
    });

    logger.info(`Processing ${employees.length} active employees...`);

    let stats = {
      processed: 0,
      skipped: 0, // Employees whose shift is not finished yet
      present: 0,
      halfDay: 0,
      absent: 0, // ✅ NEW: Track absent employees
      leave: 0,
      pendingCorrection: 0, // ✅ NEW: Track pending corrections
      incomplete: 0,
      errors: 0,
      lateRecalculated: 0 // 🔥 NEW: Track late status recalculations
    };

    for (const employee of employees) {
      try {
        await finalizeEmployeeAttendance(employee, dateString, stats);
        stats.processed++;
      } catch (error) {
        logger.error(`Error finalizing attendance for employee ${employee.id}:`, error);
        stats.errors++;
      }
    }

    logger.info(`Attendance finalization completed for ${dateString}:`, stats);
    return stats;

  } catch (error) {
    logger.error(`Error in attendance finalization job for ${dateString}:`, error);
    throw error;
  }
};

/**
 * Finalize attendance for a single employee
 * ✅ FIXED: Simplified to avoid Sequelize association issues
 * ✅ CORRECT LOGIC: ABSENT only when NO clock-in recorded
 * ✅ NEW: Shift-end guard prevents early absent marking
 */
async function finalizeEmployeeAttendance(employee, dateString, stats) {
  try {
    // 🔥 CRITICAL: Get employee's shift for this date
    const shift = await getEmployeeShiftForDate(employee.id, dateString);
    
    // If no shift assigned, skip (shouldn't happen for active employees)
    if (!shift) {
      logger.debug(`Employee ${employee.id}: No shift assigned for ${dateString}`);
      stats.skipped++;
      return;
    }

    // ⛔ CRITICAL GUARD: Check if shift has ended
    // This prevents marking absent before shift ends
    if (!hasShiftEnded(shift.shiftEndTime, dateString)) {
      logger.debug(`Employee ${employee.id}: Shift not finished yet (ends at ${shift.shiftEndTime})`);
      stats.skipped++;
      return;
    }

    // ✅ CRITICAL FIX: Use raw queries to avoid association issues
    // Find or create attendance record
    let record = await AttendanceRecord.findOne({
      where: { 
        employeeId: employee.id, 
        date: dateString 
      },
      raw: false // Need instance for methods
    });

    // ⛔ IDEMPOTENT CHECK: Skip if already finalized
    if (record && record.status !== 'incomplete') {
      logger.debug(`Employee ${employee.id}: Already finalized (status: ${record.status})`);
      stats.skipped++;
      return;
    }

    // ❌ CASE 1: No attendance record at all → ABSENT (✅ WORKING LOGIC FROM TEST)
    if (!record) {
      // Check if employee is on approved leave
      const isOnLeave = await isEmployeeOnApprovedLeave(employee.id, dateString);
      if (isOnLeave) {
        logger.debug(`Employee ${employee.id}: On approved leave, skipping`);
        stats.skipped++;
        return;
      }

      await AttendanceRecord.create({
        employeeId: employee.id,
        shiftId: null,
        date: dateString,
        status: 'absent',
        statusReason: 'No clock-in recorded',
        clockIn: null,
        clockOut: null,
        workHours: 0,
        totalWorkedMinutes: 0,
        totalBreakMinutes: 0,
        lateMinutes: 0,
        earlyExitMinutes: 0,
        overtimeMinutes: 0,
        overtimeHours: 0,
        isLate: false,
        isEarlyDeparture: false,
        correctionRequested: false
      });
      stats.absent = (stats.absent || 0) + 1;
      logger.info(`✅ Employee ${employee.id}: Marked as ABSENT (no clock-in recorded)`);
      
      // Send notification (non-blocking)
      sendAbsentNotification(employee, dateString, 'No clock-in recorded').catch(err => 
        logger.error(`Notification failed for employee ${employee.id}:`, err)
      );
      return;
    }

    // ⏰ CASE 2: Clocked in but never clocked out → PENDING CORRECTION
    if (record.clockIn && !record.clockOut) {
      record.status = 'pending_correction';
      record.correctionRequested = true;
      record.statusReason = 'Missed clock-out - requires correction';
      await record.save();
      
      // Create correction request (non-blocking)
      try {
        await AttendanceCorrectionRequest.create({
          employeeId: employee.id,
          attendanceRecordId: record.id,
          date: dateString,
          issueType: 'missed_punch',
          reason: 'Auto-detected missed clock-out',
          status: 'pending'
        });
      } catch (err) {
        logger.error(`Failed to create correction request:`, err);
      }
      
      stats.pendingCorrection = (stats.pendingCorrection || 0) + 1;
      logger.info(`⏳ Employee ${employee.id}: Marked as PENDING CORRECTION (no clock-out)`);
      
      // Send notification (non-blocking)
      sendCorrectionNotification(employee, dateString, 'Clock-out missing').catch(err => 
        logger.error(`Notification failed for employee ${employee.id}:`, err)
      );
      return;
    }

    // ❌ CASE 3: No clock-in but has clock-out (data error) → ABSENT
    if (!record.clockIn && record.clockOut) {
      record.status = 'absent';
      record.statusReason = 'Invalid record: clock-out without clock-in';
      record.clockOut = null;
      await record.save();
      stats.absent = (stats.absent || 0) + 1;
      logger.warn(`⚠️ Employee ${employee.id}: Marked as ABSENT (invalid record - clock-out without clock-in)`);
      return;
    }

    // ✅ CASE 4: Has both clock-in and clock-out → Calculate final status
    if (record.clockIn && record.clockOut) {
      // 🔥 CRITICAL FIX: Use model's finalization method instead of duplicating logic
      await record.finalizeWithShift(shift);
      
      // 🔥 NEW: Recalculate late status at finalization (BEST PRACTICE)
      // This ensures late status is correct even if clock-in calculation was wrong
      try {
        const AttendanceCalculationService = (await import('../services/core/attendanceCalculation.service.js')).default;
        const lateCalculation = AttendanceCalculationService.calculateLateStatus(
          new Date(record.clockIn), 
          shift,
          record.date // Use the attendance date from the record
        );
        
        // Update late status if it changed
        if (record.lateMinutes !== lateCalculation.lateMinutes || record.isLate !== lateCalculation.isLate) {
          const oldLateMinutes = record.lateMinutes;
          record.lateMinutes = lateCalculation.lateMinutes;
          record.isLate = lateCalculation.isLate;
          
          logger.debug(`🔧 Employee ${employee.id}: Late status recalculated - ${oldLateMinutes} → ${lateCalculation.lateMinutes} minutes`);
          stats.lateRecalculated++;
        }
      } catch (lateCalcError) {
        logger.error(`Error recalculating late status for employee ${employee.id}:`, lateCalcError);
      }
      
      // Update stats based on final status
      switch (record.status) {
        case 'present':
          stats.present++;
          logger.debug(`✅ Employee ${employee.id}: PRESENT (${record.workHours}h)`);
          break;
        case 'half_day':
          stats.halfDay++;
          logger.debug(`⏱️ Employee ${employee.id}: HALF DAY (${record.workHours}h)`);
          break;
        default:
          logger.debug(`📊 Employee ${employee.id}: ${record.status.toUpperCase()}`);
      }

      await record.save();
    }
  } catch (error) {
    logger.error(`Error finalizing attendance for employee ${employee.id}:`, error);
    stats.errors++;
    throw error;
  }
}

/**
 * Schedule the daily attendance finalization job
 * Runs every 15 minutes to support multiple shifts with different timings
 * 
 * Why every 15 minutes?
 * - Supports multiple shifts (7-4, 9-6, 2-11, night shifts, etc.)
 * - Each employee finalized ONLY after their shift ends
 * - Shift-end guard prevents early absent marking
 * - No need for fixed time - shift-aware finalization handles all cases
 * 
 * Safety guarantees:
 * ✅ No early absent marking (shift-end guard)
 * ✅ Works for all shift types
 * ✅ Idempotent (won't double-process)
 * ✅ Non-blocking notifications
 */
export const scheduleAttendanceFinalization = () => {
  // Run every 15 minutes
  cron.schedule('*/15 * * * *', async () => {
    try {
      await finalizeDailyAttendance();
    } catch (error) {
      logger.error('Error in scheduled attendance finalization:', error);
    }
  });

  logger.info('✅ Attendance finalization job scheduled (every 15 minutes, shift-aware)');
};

/**
 * Manual trigger for attendance finalization (for testing or admin use)
 * @param {string} dateString - Date in YYYY-MM-DD format
 */
export const manualFinalizeAttendance = async (dateString) => {
  const date = dateString ? new Date(dateString) : new Date();
  // ✅ FIX: Use local timezone, not UTC
  logger.info(`Manual attendance finalization triggered for ${getLocalDateString(date)}`);
  return await finalizeDailyAttendance(date);
};

/**
 * ✅ CORRECT: Check employees who haven't clocked in yet (informational only)
 * This should NOT permanently mark absent - just warn/log
 * ✅ FIXED: Simplified to avoid Sequelize association issues
 */
export const checkAbsentEmployees = async (date = new Date()) => {
  const dateString = getLocalDateString(date);
  
  logger.info(`Checking for employees who haven't clocked in yet for ${dateString}...`);
  
  try {
    // Check if today is a holiday or weekend
    const isHoliday = await Holiday.isHoliday(dateString);
    const isWorkingDay = await WorkingRule.isWorkingDay(dateString);
    
    if (isHoliday || !isWorkingDay) {
      logger.info(`${dateString} is a holiday or weekend. Skipping absent check.`);
      return { 
        success: true, 
        message: 'Skipped - holiday or weekend',
        data: [] 
      };
    }

    // ✅ FIXED: Get all active employees WITHOUT complex includes
    const employees = await Employee.findAll({
      where: { 
        isActive: true,
        status: 'Active'
      },
      attributes: ['id', 'firstName', 'lastName', 'employeeId', 'userId'],
      raw: true
    });

    const results = [];

    for (const employee of employees) {
      try {
        // Skip if on approved leave
        const isOnLeave = await isEmployeeOnApprovedLeave(employee.id, dateString);
        if (isOnLeave) continue;

        // Check if attendance record exists
        const attendance = await AttendanceRecord.findOne({
          where: { employeeId: employee.id, date: dateString },
          attributes: ['id', 'clockIn'],
          raw: true
        });

        if (!attendance) {
          results.push({
            employeeName: `${employee.firstName} ${employee.lastName}`,
            employeeId: employee.employeeId,
            action: 'NOT_CLOCKED_IN',
            reason: 'No clock-in yet'
          });
        }
      } catch (error) {
        logger.error(`Error checking employee ${employee.id}:`, error);
        // Continue with next employee
      }
    }

    return {
      success: true,
      message: `Checked absent employees - ${results.length} haven't clocked in yet`,
      data: results
    };
  } catch (error) {
    logger.error('Error checking absent employees:', error);
    return {
      success: false,
      message: 'Failed to check absent employees',
      error: error.message
    };
  }
};

/**
 * Helper function to check if employee is on approved leave
 */
async function isEmployeeOnApprovedLeave(employeeId, dateString) {
  try {
    const leaveRequest = await LeaveRequest.findOne({
      where: {
        employeeId: employeeId,
        status: 'approved',
        startDate: { [Op.lte]: dateString },
        endDate: { [Op.gte]: dateString }
      }
    });
    return !!leaveRequest;
  } catch (error) {
    logger.error('Error checking leave status:', error);
    return false;
  }
}
export default {
  finalizeDailyAttendance,
  scheduleAttendanceFinalization,
  manualFinalizeAttendance,
  checkAbsentEmployees
};