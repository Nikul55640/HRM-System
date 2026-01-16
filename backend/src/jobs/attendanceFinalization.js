import cron from 'node-cron';
import { AttendanceRecord, Shift, Employee, Holiday, WorkingRule, EmployeeShift, User } from '../models/index.js';
import logger from '../utils/logger.js';
import { Op } from 'sequelize';
import { getLocalDateString } from '../utils/dateUtils.js';

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
      leave: 0,
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

  // ❌ CASE 1: No attendance record at all → LEAVE (not absent)
  if (!record) {
    await AttendanceRecord.create({
      employeeId: employee.id,
      shiftId: shift?.id || null,
      date: dateString,
      status: 'leave',
      statusReason: 'No clock-in recorded (auto-marked at end of day)',
      clockIn: null,
      clockOut: null,
      workHours: 0,
      totalWorkedMinutes: 0
    });
    stats.leave++;
    logger.debug(`Employee ${employee.id}: Marked as leave (no clock-in)`);
    
    // Send notification
    await sendLeaveNotification(employee, dateString, 'No clock-in recorded');
    return;
  }

  // ⏰ CASE 2: Clocked in but never clocked out → Mark as LEAVE (per requirement)
  if (record.clockIn && !record.clockOut) {
    record.status = 'leave';
    record.statusReason = 'Clock-out missing, attendance auto-marked as leave';
    await record.save();
    stats.leave++;
    logger.debug(`Employee ${employee.id}: Marked as leave (no clock-out)`);
    
    // Send notification
    await sendLeaveNotification(employee, dateString, 'Clock-out missing');
    return;
  }

  // ❌ CASE 3: No clock-in but has clock-out (data error) → LEAVE
  if (!record.clockIn && record.clockOut) {
    record.status = 'leave';
    record.statusReason = 'Invalid record: clock-out without clock-in';
    record.clockOut = null; // Clear invalid clock-out
    await record.save();
    stats.leave++;
    logger.debug(`Employee ${employee.id}: Marked as leave (invalid record)`);
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
      // Less than half day → Leave/Absent
      record.status = 'leave';
      record.statusReason = `Insufficient working hours: ${workedHours.toFixed(2)}h (minimum ${halfDayHours}h required)`;
      stats.leave++;
      logger.debug(`Employee ${employee.id}: Leave (${workedHours}h)`);
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

export default {
  finalizeDailyAttendance,
  scheduleAttendanceFinalization,
  manualFinalizeAttendance
};
