/**
 * 🔄 ATTENDANCE AUTO-CORRECTION JOB
 * Runs nightly to clean up attendance records and enforce HRMS rules
 * 
 * What it does:
 * 1. No clock-in → absent
 * 2. Clock-in but no clock-out → pending_correction (for HR approval)
 * 3. Ensures data integrity
 */

import cron from 'node-cron';
import AttendanceRecord from '../models/sequelize/AttendanceRecord.js';
import logger from '../utils/logger.js';

/**
 * Auto-correct attendance for a specific date
 */
async function autoCorrectAttendance(date) {
  try {
    logger.info(`🔄 Starting auto-correction for ${date}`);
    
    // 1️⃣ Mark records with no clock-in as ABSENT
    const absentCount = await AttendanceRecord.markAbsentForNoClockIn(date);
    
    // 2️⃣ Mark records with clock-in but no clock-out as PENDING CORRECTION
    const pendingCount = await AttendanceRecord.markMissedClockOuts(date);
    
    logger.info(`✅ Auto-correction completed for ${date}:`);
    logger.info(`   - ${absentCount} records marked as absent (no clock-in)`);
    logger.info(`   - ${pendingCount} records marked as pending correction (missed clock-out)`);
    
    return {
      date,
      absentCount,
      pendingCount,
      totalProcessed: absentCount + pendingCount
    };
    
  } catch (error) {
    logger.error(`❌ Auto-correction failed for ${date}:`, error);
    throw error;
  }
}

/**
 * Get yesterday's date in YYYY-MM-DD format
 */
function getYesterday() {
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  return yesterday.toISOString().split('T')[0];
}

/**
 * Manual trigger for auto-correction (for testing or manual runs)
 */
export async function runAutoCorrection(targetDate = null) {
  const date = targetDate || getYesterday();
  return await autoCorrectAttendance(date);
}

/**
 * Start the nightly cron job
 */
export function startAttendanceAutoCorrection() {
  // Run every night at 12:30 AM
  // This gives enough buffer after midnight for any late clock-outs
  const cronExpression = '30 0 * * *'; // 12:30 AM daily
  
  logger.info('🚀 Starting attendance auto-correction cron job...');
  logger.info(`⏰ Schedule: ${cronExpression} (12:30 AM daily)`);
  
  const job = cron.schedule(cronExpression, async () => {
    try {
      const yesterday = getYesterday();
      logger.info(`🌙 Nightly auto-correction starting for ${yesterday}`);
      
      const result = await autoCorrectAttendance(yesterday);
      
      logger.info(`🎉 Nightly auto-correction completed successfully`);
      logger.info(`📊 Summary: ${result.totalProcessed} records processed`);
      
    } catch (error) {
      logger.error('❌ Nightly auto-correction failed:', error);
      // Don't throw - let the cron continue for next day
    }
  }, {
    scheduled: true,
    timezone: process.env.TZ || 'Asia/Kolkata'
  });
  
  logger.info('✅ Attendance auto-correction cron job started');
  
  return job;
}

/**
 * Stop the cron job (for testing or shutdown)
 */
export function stopAttendanceAutoCorrection(job) {
  if (job) {
    job.stop();
    logger.info('🛑 Attendance auto-correction cron job stopped');
  }
}

// 🧹 ADDITIONAL UTILITY: One-time data cleanup
export async function runDataCleanup() {
  try {
    logger.info('🧹 Starting one-time attendance data cleanup...');
    
    const result = await AttendanceRecord.fixBadData();
    
    logger.info('✅ Data cleanup completed successfully');
    logger.info(`📊 Summary:`);
    logger.info(`   - Fixed ${result.fixedPresent} present records without clock-out`);
    logger.info(`   - Fixed ${result.fixedHalfDay} half-day records with full hours`);
    logger.info(`   - Fixed ${result.fixedLeave} leave records with clock data`);
    
    return result;
    
  } catch (error) {
    logger.error('❌ Data cleanup failed:', error);
    throw error;
  }
}

export default {
  startAttendanceAutoCorrection,
  stopAttendanceAutoCorrection,
  runAutoCorrection,
  runDataCleanup
};