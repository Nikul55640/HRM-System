/**
 * Leave Balance Rollover Cron Service
 * Handles automatic year-end rollover of leave balances
 */

import cron from 'node-cron';
import DefaultLeaveBalanceService from '../admin/defaultLeaveBalance.service.js';
import logger from '../../utils/logger.js';

class LeaveBalanceRolloverService {
  static isInitialized = false;
  static cronJob = null;

  /**
   * Initialize the cron job for automatic year-end rollover
   * Runs on January 1st at 00:01 AM every year
   */
  static initialize() {
    if (this.isInitialized) {
      logger.warn('Leave balance rollover cron job already initialized');
      return;
    }

    try {
      // Schedule for January 1st at 00:01 AM every year
      // Cron format: minute hour day month day-of-week
      // '1 0 1 1 *' = 00:01 on January 1st every year
      this.cronJob = cron.schedule('1 0 1 1 *', async () => {
        await this.performAutomaticRollover();
      }, {
        scheduled: true,
        timezone: 'UTC' // Use UTC to avoid timezone issues
      });

      this.isInitialized = true;
      logger.info('✅ Leave balance rollover cron job initialized - will run on January 1st at 00:01 AM every year');

      // Also check if we need to perform rollover for current year on startup
      this.checkAndPerformStartupRollover();

    } catch (error) {
      logger.error('Failed to initialize leave balance rollover cron job:', error);
    }
  }

  /**
   * Check if rollover is needed for current year on application startup
   */
  static async checkAndPerformStartupRollover() {
    try {
      const currentYear = new Date().getFullYear();
      const currentMonth = new Date().getMonth() + 1; // getMonth() returns 0-11
      
      // Only check if we're in January (month 1) to avoid unnecessary checks
      if (currentMonth === 1) {
        logger.info(`Checking if year-end rollover is needed for ${currentYear}...`);
        
        const employeesWithoutBalances = await DefaultLeaveBalanceService.getEmployeesWithoutLeaveBalances(currentYear);
        
        if (employeesWithoutBalances.length > 0) {
          logger.info(`Found ${employeesWithoutBalances.length} employees without leave balances for ${currentYear}. Performing rollover...`);
          await this.performAutomaticRollover();
        } else {
          logger.info(`All employees already have leave balances for ${currentYear}. No rollover needed.`);
        }
      }
    } catch (error) {
      logger.error('Error checking startup rollover:', error);
    }
  }

  /**
   * Perform the automatic year-end rollover
   */
  static async performAutomaticRollover() {
    try {
      const currentYear = new Date().getFullYear();
      logger.info(`🔄 Starting automatic year-end rollover for ${currentYear}`);

      const result = await DefaultLeaveBalanceService.performYearEndRollover(currentYear, 1); // System user ID = 1

      if (result.success) {
        if (result.alreadyPerformed) {
          logger.info(`✅ Year-end rollover already completed for ${currentYear}`);
        } else {
          logger.info(`✅ Automatic year-end rollover completed successfully for ${currentYear}:`);
          logger.info(`   📊 Employees processed: ${result.processedEmployees}`);
          logger.info(`   ✅ Leave balances created: ${result.totalCreated}`);
          logger.info(`   ⏭️  Leave balances skipped: ${result.totalSkipped}`);
          
          if (result.errors && result.errors.length > 0) {
            logger.warn(`   ⚠️  Errors encountered: ${result.errors.length}`);
            result.errors.forEach(error => {
              logger.warn(`     - ${error.employeeName} (ID: ${error.employeeId}): ${error.error}`);
            });
          }
        }
      } else {
        logger.error(`❌ Automatic year-end rollover failed for ${currentYear}:`, result.error);
      }

    } catch (error) {
      logger.error('Error in automatic year-end rollover:', error);
    }
  }

  /**
   * Manually trigger rollover (for testing or manual execution)
   * @param {number} year - Year to perform rollover for
   * @param {number} userId - User ID performing the rollover
   */
  static async manualRollover(year = null, userId = 1) {
    try {
      const targetYear = year || new Date().getFullYear();
      logger.info(`🔄 Starting manual year-end rollover for ${targetYear}`);

      const result = await DefaultLeaveBalanceService.performYearEndRollover(targetYear, userId);

      if (result.success) {
        logger.info(`✅ Manual year-end rollover completed for ${targetYear}`);
      } else {
        logger.error(`❌ Manual year-end rollover failed for ${targetYear}:`, result.error);
      }

      return result;
    } catch (error) {
      logger.error('Error in manual year-end rollover:', error);
      return {
        success: false,
        error: error.message,
        message: 'Failed to perform manual rollover'
      };
    }
  }

  /**
   * Stop the cron job
   */
  static stop() {
    if (this.cronJob) {
      this.cronJob.stop();
      this.isInitialized = false;
      logger.info('Leave balance rollover cron job stopped');
    }
  }

  /**
   * Get cron job status
   */
  static getStatus() {
    return {
      initialized: this.isInitialized,
      running: this.cronJob ? this.cronJob.running : false,
      nextRun: this.cronJob ? 'January 1st, 00:01 AM UTC' : null
    };
  }
}

export default LeaveBalanceRolloverService;