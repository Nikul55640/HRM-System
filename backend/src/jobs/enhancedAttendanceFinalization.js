import cron from 'node-cron';
import { AttendanceRecord, Shift, Employee, Holiday, WorkingRule, EmployeeShift, User, AttendanceCorrectionRequest, LeaveRequest } from '../models/index.js';
import logger from '../utils/logger.js';
import { Op } from 'sequelize';
import { getLocalDateString } from '../utils/dateUtils.js';

/**
 * 🔥 ENHANCED ATTENDANCE FINALIZATION JOB
 * 
 * Key Changes:
 * 1. ✅ Creates records for ALL dates (working days, weekends, holidays)
 * 2. ✅ Uses appropriate status: 'absent', 'holiday', 'weekend'
 * 3. ✅ Ensures complete attendance calendar coverage
 * 4. ✅ Maintains all existing functionality for working days
 * 
 * Status Mapping:
 * - Working Day + No Clock-in = 'absent'
 * - Holiday = 'holiday' 
 * - Weekend = 'weekend' (new status - needs to be added to enum)
 * - Working Day + Clock-in = 'present', 'half_day', etc. (existing logic)
 */

/**
 * Helper: Get employee's active shift for a specific date
 */
async function getEmployeeShiftForDate(employeeId, dateString) {
  try {
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
 */
function hasShiftEnded(shiftEndTime, dateString, bufferMinutes = 30) {
  try {
    const now = new Date();
    const currentDateString = getLocalDateString(now);
    if (currentDateString > dateString) {
      return true;
    }
    if (currentDateString < dateString) {
      return false;
    }
    const [hours, minutes, seconds] = shiftEndTime.split(':').map(Number);
    const shiftEndDateTime = new Date();
    shiftEndDateTime.setHours(hours, minutes, seconds, 0);
    shiftEndDateTime.setMinutes(shiftEndDateTime.getMinutes() + bufferMinutes);
    return now >= shiftEndDateTime;
  } catch (error) {
    logger.error(`Error checking shift end time:`, error);
    return false;
  }
}

/**
 * Helper: Check if employee is on approved leave
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

/**
 * 🔥 NEW: Create holiday records for all employees
 */
async function createHolidayRecords(dateString, holidayInfo) {
  try {
    const employees = await Employee.findAll({
      where: { 
        isActive: true,
        status: 'Active'
      }
    });

    let createdCount = 0;
    
    for (const employee of employees) {
      try {
        // Check if record already exists
        const existingRecord = await AttendanceRecord.findOne({
          where: { 
            employeeId: employee.id, 
            date: dateString 
          }
        });

        if (!existingRecord) {
          await AttendanceRecord.create({
            employeeId: employee.id,
            shiftId: null,
            date: dateString,
            status: 'holiday',
            statusReason: `Holiday: ${holidayInfo?.name || 'Public Holiday'}`,
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
          createdCount++;
        }
      } catch (error) {
        logger.error(`Error creating holiday record for employee ${employee.id}:`, error);
      }
    }

    logger.info(`✅ Created ${createdCount} holiday records for ${dateString}`);
    return { created: createdCount };
  } catch (error) {
    logger.error('Error creating holiday records:', error);
    return { created: 0, error: error.message };
  }
}

/**
 * 🔥 NEW: Create weekend records for all employees
 * Note: This requires adding 'weekend' to the status enum in AttendanceRecord model
 */
async function createWeekendRecords(dateString) {
  try {
    const employees = await Employee.findAll({
      where: { 
        isActive: true,
        status: 'Active'
      }
    });

    let createdCount = 0;
    const date = new Date(dateString);
    const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const dayName = dayNames[date.getDay()];
    
    for (const employee of employees) {
      try {
        // Check if record already exists
        const existingRecord = await AttendanceRecord.findOne({
          where: { 
            employeeId: employee.id, 
            date: dateString 
          }
        });

        if (!existingRecord) {
          await AttendanceRecord.create({
            employeeId: employee.id,
            shiftId: null,
            date: dateString,
            status: 'weekend', // 🔥 NEW: Using proper weekend status
            statusReason: `Weekend: ${dayName}`,
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
          createdCount++;
        }
      } catch (error) {
        logger.error(`Error creating weekend record for employee ${employee.id}:`, error);
      }
    }

    logger.info(`✅ Created ${createdCount} weekend records for ${dateString} (${dayName})`);
    return { created: createdCount };
  } catch (error) {
    logger.error('Error creating weekend records:', error);
    return { created: 0, error: error.message };
  }
}

/**
 * 🔥 ENHANCED: Daily Attendance Finalization Job
 * 
 * NEW BEHAVIOR:
 * 1. ✅ Working Days: Create absent/present/half_day records (existing logic)
 * 2. ✅ Holidays: Create 'holiday' records for all employees
 * 3. ✅ Weekends: Create 'weekend' records for all employees
 * 4. ✅ Complete calendar coverage - no empty dates
 */
export const enhancedFinalizeDailyAttendance = async (date = new Date()) => {
  const dateString = getLocalDateString(date);
  logger.info(`🔥 Starting ENHANCED attendance finalization for ${dateString}...`);

  try {
    // Get day type information
    const isHoliday = await Holiday.isHoliday(dateString);
    const isWorkingDay = await WorkingRule.isWorkingDay(dateString);
    const isWeekend = !isWorkingDay && !isHoliday;

    let stats = {
      date: dateString,
      dayType: isHoliday ? 'HOLIDAY' : isWeekend ? 'WEEKEND' : 'WORKING_DAY',
      processed: 0,
      created: 0,
      skipped: 0,
      errors: 0
    };

    // 🔥 NEW: Handle holidays - create holiday records
    if (isHoliday) {
      logger.info(`${dateString} is a holiday. Creating holiday records...`);
      const holidayInfo = await Holiday.findOne({
        where: { 
          date: dateString,
          isActive: true 
        }
      });
      
      const result = await createHolidayRecords(dateString, holidayInfo);
      stats.created = result.created;
      stats.processed = result.created;
      
      logger.info(`✅ Holiday finalization completed for ${dateString}:`, stats);
      return stats;
    }

    // 🔥 NEW: Handle weekends - create weekend records
    if (isWeekend) {
      logger.info(`${dateString} is a weekend. Creating weekend records...`);
      const result = await createWeekendRecords(dateString);
      stats.created = result.created;
      stats.processed = result.created;
      
      logger.info(`✅ Weekend finalization completed for ${dateString}:`, stats);
      return stats;
    }

    // ✅ EXISTING: Handle working days (keep all existing logic)
    logger.info(`${dateString} is a working day. Processing attendance...`);
    
    // Import and use existing finalization logic for working days
    const { finalizeDailyAttendance } = await import('./attendanceFinalization.js');
    const workingDayResult = await finalizeDailyAttendance(date);
    
    // Merge results
    stats = {
      ...stats,
      ...workingDayResult,
      dayType: 'WORKING_DAY'
    };

    logger.info(`✅ Working day finalization completed for ${dateString}:`, stats);
    return stats;

  } catch (error) {
    logger.error(`❌ Error in enhanced attendance finalization for ${dateString}:`, error);
    stats.errors = 1;
    stats.error = error.message;
    return stats;
  }
};

/**
 * 🔥 NEW: Enhanced scheduling - runs for ALL dates
 */
export const scheduleEnhancedAttendanceFinalization = () => {
  // Run every 15 minutes (same as original)
  cron.schedule('*/15 * * * *', async () => {
    try {
      await enhancedFinalizeDailyAttendance();
    } catch (error) {
      logger.error('Error in scheduled enhanced attendance finalization:', error);
    }
  });

  logger.info('✅ Enhanced attendance finalization job scheduled (every 15 minutes, ALL dates)');
};

/**
 * Manual trigger for enhanced finalization
 */
export const manualEnhancedFinalizeAttendance = async (dateString) => {
  const date = dateString ? new Date(dateString) : new Date();
  logger.info(`🔥 Manual enhanced attendance finalization triggered for ${getLocalDateString(date)}`);
  return await enhancedFinalizeDailyAttendance(date);
};

/**
 * 🔥 NEW: Bulk finalize multiple dates (useful for fixing historical data)
 */
export const bulkEnhancedFinalize = async (startDate, endDate) => {
  try {
    logger.info(`🔥 Starting bulk enhanced finalization from ${startDate} to ${endDate}`);
    
    const start = new Date(startDate);
    const end = new Date(endDate);
    const results = [];
    
    for (let date = new Date(start); date <= end; date.setDate(date.getDate() + 1)) {
      const dateString = getLocalDateString(date);
      logger.info(`Processing ${dateString}...`);
      
      const result = await enhancedFinalizeDailyAttendance(new Date(date));
      results.push(result);
      
      // Small delay to prevent overwhelming the database
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    
    logger.info(`✅ Bulk finalization completed. Processed ${results.length} dates.`);
    return results;
    
  } catch (error) {
    logger.error('❌ Error in bulk enhanced finalization:', error);
    throw error;
  }
};

export default {
  enhancedFinalizeDailyAttendance,
  scheduleEnhancedAttendanceFinalization,
  manualEnhancedFinalizeAttendance,
  bulkEnhancedFinalize
};