import cron from 'node-cron';
import { AttendanceRecord, Shift, Employee, Holiday, WorkingRule, EmployeeShift, User, LeaveRequest } from '../models/index.js';
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
    const resendEmailService = (await import('../services/resendEmailService.js')).default;
    
    // Get user ID from employee
    const employeeWithUser = await Employee.findByPk(employee.id, {
      include: [{ model: User, as: 'user', attributes: ['id', 'email'] }]
    });
    
    if (employeeWithUser?.user?.id) {
      // Send notification with email
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
      }, {
        sendEmail: true,
        emailData: {
          date: dateString,
          reason: reason
        }
      });
      
      // 🔥 NEW: Also send email directly via Resend
      if (employeeWithUser.user.email) {
        await resendEmailService.sendAttendanceAbsentEmail(
          employeeWithUser,
          dateString,
          reason
        );
      }
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
    const resendEmailService = (await import('../services/resendEmailService.js')).default;
    
    // Get user ID from employee
    const employeeWithUser = await Employee.findByPk(employee.id, {
      include: [{ model: User, as: 'user', attributes: ['id', 'email'] }]
    });
    
    if (employeeWithUser?.user?.id) {
      // Send notification with email
      await notificationService.sendToUser(employeeWithUser.user.id, {
        title: 'Attendance Notice',
        message: `Your attendance for ${dateString} is incomplete. ${reason}. If you need to correct this, you can submit a correction request through the attendance portal.`,
        type: 'info',
        category: 'attendance',
        data: {
          date: dateString,
          reason: reason,
          action: 'attendance_incomplete_notice'
        }
      }, {
        sendEmail: true,
        emailData: {
          date: dateString,
          issue: reason
        }
      });
      
      // 🔥 NEW: Send friendly email notification via Resend
      if (employeeWithUser.user.email) {
        await resendEmailService.sendAttendanceIncompleteEmail(
          employeeWithUser,
          dateString,
          reason
        );
      }
    }
  } catch (error) {
    logger.error(`Failed to send correction notification for employee ${employee.id}:`, error);
    // Don't throw - notification failure shouldn't stop finalization
  }
}

/**
 * Send notification when employee is auto-marked as leave
 * (Currently not used - kept for future implementation)
 */
async function sendLeaveNotificationPlaceholder(employee, dateString, reason) {
  // Placeholder for future leave notification implementation
  logger.debug(`Leave notification placeholder for employee ${employee.id}`);
}

/**
 * 🔥 NEW: Auto-finalize missed clock-outs (Shift End + 30 minutes)
 * 
 * Rule: If employee did not clock out by Shift End + 30 minutes,
 * system automatically:
 * 1. Sets clockOut to shift end time
 * 2. Finalizes as FULL DAY
 * 3. Uses shift end time (not current time)
 * 
 * This ensures payroll is accurate and employees don't get stuck in "incomplete" status
 */
async function autoFinalizeMissedClockOuts(dateString) {
  try {
    const records = await AttendanceRecord.findAll({
      where: {
        date: dateString,
        clockIn: { [Op.not]: null },
        clockOut: null,
        status: 'incomplete'
      }
    });

    if (records.length === 0) {
      return { autoFinalized: 0 };
    }

    let autoFinalized = 0;

    for (const record of records) {
      try {
        // Get employee's shift
        const shift = await getEmployeeShiftForDate(record.employeeId, dateString);
        if (!shift || !shift.shiftEndTime) {
          logger.debug(`Employee ${record.employeeId}: No shift found, skipping auto-finalize`);
          continue;
        }

        // Parse shift end time
        const [h, m, s = 0] = shift.shiftEndTime.split(':').map(Number);
        
        // Create shift end time for the attendance date
        const shiftEnd = new Date(record.clockIn);
        shiftEnd.setHours(h, m, s, 0);
        
        // Handle overnight shift
        if (shiftEnd < record.clockIn) {
          shiftEnd.setDate(shiftEnd.getDate() + 1);
        }

        // ⏳ Auto-finalize time: Shift end + 30 minutes
        const autoFinalizeTime = new Date(shiftEnd.getTime() + 30 * 60 * 1000);
        const now = new Date();

        // Only auto-finalize if current time is past the threshold
        if (now >= autoFinalizeTime) {
          // 🔥 AUTO CLOCK-OUT: Use shift end time (not current time)
          record.clockOut = shiftEnd;
          record.statusReason = 'Auto clock-out at shift end (+30 min rule)';

          // 🔥 FINALIZE: Calculate final status
          await record.finalizeWithShift(shift);
          await record.save();

          autoFinalized++;
          logger.info(`✅ Auto-finalized attendance for employee ${record.employeeId} on ${dateString} (status: ${record.status})`);

          // 🔥 NEW: Send notification with email (non-blocking)
          try {
            const employee = await Employee.findByPk(record.employeeId);
            if (employee) {
              const notificationService = (await import('../services/notificationService.js')).default;
              await notificationService.notifyAutoFinalized(
                { ...record.toJSON(), employee }, 
                shift.shiftEndTime
              );
            }
          } catch (notifError) {
            logger.error(`Failed to send auto-finalize notification:`, notifError);
          }
        }
      } catch (error) {
        logger.error(`Error auto-finalizing attendance for employee ${record.employeeId}:`, error);
      }
    }

    return { autoFinalized };
  } catch (error) {
    logger.error('Error in autoFinalizeMissedClockOuts:', error);
    return { autoFinalized: 0, error: error.message };
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

    // 🔥 NEW: Auto-finalize missed clock-outs (Shift End + 30 min)
    const autoFinalizeResult = await autoFinalizeMissedClockOuts(dateString);
    logger.info(`Auto-finalize result: ${autoFinalizeResult.autoFinalized} records auto-finalized`);

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
      lateRecalculated: 0, // 🔥 NEW: Track late status recalculations
      autoFinalized: autoFinalizeResult.autoFinalized // 🔥 NEW: Track auto-finalized records
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
      
      // 🔥 NEW: Send notification with email (non-blocking)
      sendAbsentNotification({ ...employee.toJSON(), employee }, dateString, 'No clock-in recorded').catch(err => 
        logger.error(`Notification failed for employee ${employee.id}:`, err)
      );
      return;
    }

    // ⏰ CASE 2: Clocked in but never clocked out → INCOMPLETE (manual correction needed)
    if (record.clockIn && !record.clockOut) {
      record.status = 'incomplete';
      record.statusReason = 'Missing clock-out time - employee can submit correction request if needed';
      await record.save();
      
      stats.incomplete = (stats.incomplete || 0) + 1;
      logger.info(`⏳ Employee ${employee.id}: Marked as INCOMPLETE (missing clock-out) - manual correction available`);
      
      // Optional: Send notification to inform employee they can submit a correction request
      sendCorrectionNotification(employee, dateString, 'Missing clock-out time - you can submit a correction request if needed').catch(err => 
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
      // 🔧 RESCUE LOGIC: Fix any corrupted live states
      if (['in_progress', 'on_break', 'completed'].includes(record.status)) {
        logger.debug(`Employee ${employee.id}: Fixing corrupted live state '${record.status}' to final state`);
      }
      
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

