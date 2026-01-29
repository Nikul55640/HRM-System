import { finalizeDailyAttendance, manualFinalizeAttendance } from '../../jobs/attendanceFinalization.js';
import { AttendanceRecord, Employee, EmployeeShift, Shift } from '../../models/index.js';
import logger from '../../utils/logger.js';
import { Op } from 'sequelize';
import { getLocalDateString } from '../../utils/dateUtils.js';

/**
 * Get finalization status for an employee on a specific date
 * Used by frontend to show accurate status without time-based assumptions
 */
export const getEmployeeFinalizationStatus = async (req, res) => {
  try {
    const { employeeId, date } = req.query;
    
    if (!employeeId || !date) {
      return res.status(400).json({
        success: false,
        message: 'employeeId and date are required'
      });
    }

    // ✅ FIX: Use local timezone
    const dateString = getLocalDateString(new Date(date));

    // Get attendance record
    const record = await AttendanceRecord.findOne({
      where: { 
        employeeId: parseInt(employeeId), 
        date: dateString 
      }
    });

    // Get employee's shift info
    const employee = await Employee.findByPk(employeeId, {
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

    const shift = employee?.shiftAssignments?.[0]?.shift;

    // No record yet
    if (!record) {
      return res.status(200).json({
        success: true,
        message: 'No attendance record yet',
        data: {
          status: 'not_started',
          finalized: false,
          shiftEndTime: shift?.shiftEndTime || null,
          canClockIn: true,
          canClockOut: false
        }
      });
    }

    // Check if shift is finished
    let shiftFinished = false;
    if (shift) {
      const now = new Date();
      
      // 🔥 CRITICAL FIX: Use proper timezone-aware date construction
      // Create shift times using current date to avoid timezone issues
      const shiftEnd = new Date(now);
      const shiftStart = new Date(now);
      
      // Parse shift times properly
      const [startHours, startMinutes, startSeconds] = shift.shiftStartTime.split(':').map(Number);
      const [endHours, endMinutes, endSeconds] = shift.shiftEndTime.split(':').map(Number);
      
      shiftStart.setHours(startHours, startMinutes, startSeconds || 0, 0);
      shiftEnd.setHours(endHours, endMinutes, endSeconds || 0, 0);
      
      // Handle night shifts
      if (shiftEnd < shiftStart) {
        shiftEnd.setDate(shiftEnd.getDate() + 1);
      }
      
      // Add grace period
      const gracePeriodMs = 15 * 60 * 1000;
      const finalizationTime = new Date(shiftEnd.getTime() + gracePeriodMs);
      
      shiftFinished = now >= finalizationTime;
    }

    res.status(200).json({
      success: true,
      message: 'Finalization status retrieved',
      data: {
        status: record.status,
        statusReason: record.statusReason,
        finalized: record.status !== 'incomplete',
        shiftFinished,
        shiftEndTime: shift?.shiftEndTime || null,
        canClockIn: !record.clockIn,
        canClockOut: record.clockIn && !record.clockOut,
        clockIn: record.clockIn,
        clockOut: record.clockOut,
        workHours: record.workHours
      }
    });
  } catch (error) {
    logger.error('Error getting finalization status:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get finalization status',
      error: error.message
    });
  }
};

/**
 * Manual trigger for attendance finalization
 * Useful for:
 * - Testing the finalization logic
 * - Finalizing past dates that were missed
 * - Admin control over attendance processing
 */
export const triggerFinalization = async (req, res) => {
  try {
    const { date, employeeId } = req.body; // Optional: YYYY-MM-DD format and specific employee

    logger.info(`Manual attendance finalization triggered by user ${req.user.id}`, { date, employeeId });

    if (employeeId) {
      // Finalize specific employee's attendance
      const result = await finalizeSpecificEmployeeAttendance(employeeId, date);
      res.status(200).json({
        success: true,
        message: 'Employee attendance finalization completed successfully',
        data: result
      });
    } else {
      // Finalize all employees for the date
      const result = await manualFinalizeAttendance(date);
      res.status(200).json({
        success: true,
        message: 'Attendance finalization completed successfully',
        data: result
      });
    }
  } catch (error) {
    logger.error('Error in manual finalization:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to finalize attendance',
      error: error.message
    });
  }
};

/**
 * Finalize attendance for a specific employee
 */
export const finalizeSpecificEmployeeAttendance = async (employeeId, dateString) => {
  try {
    const date = dateString ? new Date(dateString) : new Date();
    const localDateString = getLocalDateString(date);
    
    logger.info(`Finalizing attendance for employee ${employeeId} on ${localDateString}`);

    // Get the attendance record
    const record = await AttendanceRecord.findOne({
      where: {
        employeeId: parseInt(employeeId),
        date: localDateString
      }
    });

    if (!record) {
      return {
        success: false,
        message: 'No attendance record found for this employee and date'
      };
    }

    // Get employee's shift
    const employeeShift = await EmployeeShift.findOne({
      where: {
        employeeId: parseInt(employeeId),
        isActive: true,
        effectiveDate: { [Op.lte]: localDateString },
        [Op.or]: [
          { endDate: null },
          { endDate: { [Op.gte]: localDateString } }
        ]
      }
    });

    if (!employeeShift) {
      return {
        success: false,
        message: 'No active shift found for this employee'
      };
    }

    const shift = await Shift.findByPk(employeeShift.shiftId);
    if (!shift) {
      return {
        success: false,
        message: 'Shift details not found'
      };
    }

    // If record has both clock-in and clock-out, finalize it
    if (record.clockIn && record.clockOut) {
      await record.finalizeWithShift(shift);
      await record.save();
      
      return {
        success: true,
        message: 'Attendance record finalized successfully',
        data: {
          employeeId: record.employeeId,
          date: record.date,
          status: record.status,
          workHours: record.workHours,
          statusReason: record.statusReason
        }
      };
    } else {
      return {
        success: false,
        message: 'Record is incomplete - missing clock-in or clock-out'
      };
    }

  } catch (error) {
    logger.error(`Error finalizing attendance for employee ${employeeId}:`, error);
    throw error;
  }
};

/**
 * Get finalization status for a date
 */
export const getFinalizationStatus = async (req, res) => {
  try {
    const { date } = req.query; // YYYY-MM-DD format
    const checkDate = date ? new Date(date) : new Date();
    // ✅ FIX: Use local timezone
    const dateString = getLocalDateString(checkDate);

    const { AttendanceRecord, Holiday, WorkingRule } = await import('../../models/index.js');

    // Check if it's a holiday or weekend
    const isHoliday = await Holiday.isHoliday(dateString);
    const isWorkingDay = await WorkingRule.isWorkingDay(dateString);

    if (isHoliday || !isWorkingDay) {
      return res.status(200).json({
        success: true,
        data: {
          date: dateString,
          needsFinalization: false,
          reason: isHoliday ? 'holiday' : 'weekend'
        }
      });
    }

    // Count incomplete records
    const incompleteCount = await AttendanceRecord.count({
      where: {
        date: dateString,
        status: 'incomplete'
      }
    });

    // Count records with clock-in but no clock-out
    const { Op } = await import('sequelize');
    const pendingClockOutCount = await AttendanceRecord.count({
      where: {
        date: dateString,
        clockIn: { [Op.ne]: null },
        clockOut: null
      }
    });

    res.status(200).json({
      success: true,
      data: {
        date: dateString,
        needsFinalization: incompleteCount > 0 || pendingClockOutCount > 0,
        incompleteRecords: incompleteCount,
        pendingClockOut: pendingClockOutCount
      }
    });
  } catch (error) {
    logger.error('Error checking finalization status:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to check finalization status',
      error: error.message
    });
  }
};

export default {
  triggerFinalization,
  getFinalizationStatus,
  getEmployeeFinalizationStatus
};
