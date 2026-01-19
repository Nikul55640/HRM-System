import cron from 'node-cron';
import { AttendanceRecord, Shift, Employee, Holiday, WorkingRule, EmployeeShift, User } from '../models/index.js';
import logger from '../utils/logger.js';
import { Op } from 'sequelize';
import { getLocalDateString } from '../utils/dateUtils.js';

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
 * Each employee is finalized only after their shift ends (shift-aware finalization).
 * 
 * Features:
 * 1. Auto-mark as leave for employees who forgot to clock in/out
 * 2. Calculate final status (present/half_day/leave)
 * 3. Handle all edge cases
 * 4. Support multiple shifts (7-4, 9-6, 2-11, night shifts, etc.)
 * 5. Skip employees whose shift is not finished yet
 * 
 * Without this job, attendance rules will NOT work properly!
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

    // Get all active employees with their shifts
    const employees = await Employee.findAll({
      where: { 
        isActive: true,
        status: 'Active'
      },
      include: [
        { 
          model: EmployeeShift, 
          as: 'shiftAssignments',
          where: {
            isActive: true,
            [Op.or]: [
              { effectiveTo: null },
              { effectiveTo: { [Op.gte]: dateString } }
            ]
          },
          required: false, // Some employees might not have shifts assigned yet
          include: [
            {
              model: Shift,
              as: 'shift'
            }
          ],
          limit: 1,
          order: [['effectiveFrom', 'DESC']]
        }
      ]
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
      errors: 0
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
 */
async function finalizeEmployeeAttendance(employee, dateString, stats) {
  // Get the employee's current shift
  const shiftAssignment = employee.shiftAssignments && employee.shiftAssignments[0];
  const shift = shiftAssignment?.shift;

  const now = new Date();

  // ⏰ SHIFT-AWARE CHECK: Skip if shift is not finished yet
  if (shift) {
    const shiftEndTime = new Date(`${dateString} ${shift.shiftEndTime}`);
    
    // Handle night shifts (shift ends next day)
    const shiftStartTime = new Date(`${dateString} ${shift.shiftStartTime}`);
    if (shiftEndTime < shiftStartTime) {
      // Night shift: ends next day
      shiftEndTime.setDate(shiftEndTime.getDate() + 1);
    }
    
    // Add grace period of 15 minutes after shift end before finalizing
    const gracePeriodMs = 15 * 60 * 1000; // 15 minutes
    const finalizationTime = new Date(shiftEndTime.getTime() + gracePeriodMs);
    
    // Skip if shift is not over yet
    if (now < finalizationTime) {
      logger.debug(
        `Skipping employee ${employee.id} - shift not finished yet (ends at ${shift.shiftEndTime})`
      );
      stats.skipped++;
      return;
    }
  }

  // Find or create attendance record
  let record = await AttendanceRecord.findOne({
    where: { 
      employeeId: employee.id, 
      date: dateString 
    }
  });

  // ⛔ IDEMPOTENT CHECK: Skip if already finalized
  if (record && record.status !== 'incomplete') {
    logger.debug(`Employee ${employee.id}: Already finalized (status: ${record.status})`);
    stats.skipped++;
    return;
  }

  // ❌ CASE 1: No attendance record at all → ABSENT (not leave)
  if (!record) {
    await AttendanceRecord.create({
      employeeId: employee.id,
      shiftId: shift?.id || null,
      date: dateString,
      status: 'absent',
      statusReason: 'Auto marked absent (no clock-in)',
      clockIn: null,
      clockOut: null,
      workHours: 0,
      totalWorkedMinutes: 0
    });
    stats.absent = (stats.absent || 0) + 1;
    logger.debug(`Employee ${employee.id}: Marked as absent (no clock-in)`);
    
    // Send notification
    await sendAbsentNotification(employee, dateString, 'No clock-in recorded');
    return;
  }

  // ⏰ CASE 2: Clocked in but never clocked out → PENDING CORRECTION
  if (record.clockIn && !record.clockOut) {
    record.status = 'pending_correction';
    record.correctionRequested = true;
    record.statusReason = 'Missed clock-out - requires correction';
    await record.save();
    
    // Create correction request
    const { AttendanceCorrectionRequest } = await import('../models/index.js');
    await AttendanceCorrectionRequest.create({
      employeeId: employee.id,
      attendanceRecordId: record.id,
      date: dateString,
      issueType: 'missed_punch',
      reason: 'Auto-detected missed clock-out',
      status: 'pending'
    });
    
    stats.pendingCorrection = (stats.pendingCorrection || 0) + 1;
    logger.debug(`Employee ${employee.id}: Marked as pending correction (no clock-out)`);
    
    // Send notification
    await sendCorrectionNotification(employee, dateString, 'Clock-out missing');
    return;
  }

  // ❌ CASE 3: No clock-in but has clock-out (data error) → ABSENT
  if (!record.clockIn && record.clockOut) {
    record.status = 'absent';
    record.statusReason = 'Invalid record: clock-out without clock-in';
    record.clockOut = null; // Clear invalid clock-out
    await record.save();
    stats.absent = (stats.absent || 0) + 1;
    logger.debug(`Employee ${employee.id}: Marked as absent (invalid record)`);
    return;
  }

  // ✅ CASE 4: Has both clock-in and clock-out → Calculate final status
  if (record.clockIn && record.clockOut && shift) {
    // Recalculate working hours
    record.calculateWorkingHours();

    const workedHours = record.workHours || 0;
    const fullDayHours = shift.fullDayHours || 8;
    const halfDayHours = shift.halfDayHours || 4;

    // Determine final status based on worked hours
    if (workedHours >= fullDayHours) {
      record.status = 'present';
      record.halfDayType = 'full_day';
      stats.present++;
      logger.debug(`Employee ${employee.id}: Present (${workedHours}h)`);
    } else if (workedHours >= halfDayHours) {
      record.status = 'half_day';
      record.halfDayType = record.determineHalfDayType(shift);
      stats.halfDay++;
      logger.debug(`Employee ${employee.id}: Half day (${workedHours}h, ${record.halfDayType})`);
    } else {
      // Less than half day → ABSENT (insufficient hours)
      record.status = 'absent';
      record.statusReason = `Insufficient hours: ${workedHours.toFixed(2)}/${halfDayHours} minimum required`;
      stats.absent = (stats.absent || 0) + 1;
      logger.debug(`Employee ${employee.id}: Absent (${workedHours}h)`);
    }

    await record.save();
  }
}

/**
 * Schedule the daily attendance finalization job
 * Runs every 15 minutes to support multiple shifts with different timings
 * 
 * Why every 15 minutes?
 * - Supports multiple shifts (7-4, 9-6, 2-11, night shifts, etc.)
 * - Each employee finalized only after their shift ends
 * - No need for fixed time - shift-aware finalization
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

    // Get all active employees
    const employees = await Employee.findAll({
      where: { 
        isActive: true,
        status: 'Active'
      },
      include: [
        { 
          model: EmployeeShift, 
          as: 'shiftAssignments',
          where: {
            isActive: true,
            [Op.or]: [
              { effectiveTo: null },
              { effectiveTo: { [Op.gte]: dateString } }
            ]
          },
          required: false,
          include: [{ model: Shift, as: 'shift' }],
          limit: 1,
          order: [['effectiveFrom', 'DESC']]
        }
      ]
    });

    const results = [];

    for (const employee of employees) {
      // Skip if on approved leave
      const isOnLeave = await isEmployeeOnApprovedLeave(employee.id, dateString);
      if (isOnLeave) continue;

      // Check if attendance record exists
      const attendance = await AttendanceRecord.findOne({
        where: { employeeId: employee.id, date: dateString }
      });

      if (!attendance) {
        results.push({
          employeeName: `${employee.firstName} ${employee.lastName}`,
          employeeId: employee.employeeId,
          action: 'NOT_CLOCKED_IN',
          reason: 'No clock-in yet'
        });
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
    const { LeaveRequest } = await import('../models/index.js');
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