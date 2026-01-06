#!/usr/bin/env node

/**
 * Attendance Scheduler Script
 * 
 * This script handles automated attendance processing:
 * 1. Marks employees as absent if they don't clock in
 * 2. Marks attendance as incomplete if employees don't clock out
 * 
 * Usage:
 * - Run via cron job at end of day: node scripts/attendance-scheduler.js end-of-day
 * - Run via cron job during day: node scripts/attendance-scheduler.js check-absent
 * 
 * Cron examples:
 * # Check for absent employees every 2 hours during work day (9 AM to 6 PM)
 * 0 9,11,13,15,17 * * 1-5 cd /path/to/hrm && node scripts/attendance-scheduler.js check-absent
 * 
 * # Process end-of-day at 11 PM every weekday
 * 0 23 * * 1-5 cd /path/to/hrm && node scripts/attendance-scheduler.js end-of-day
 */

import attendanceService from '../src/services/admin/attendance.service.js';
import logger from '../src/utils/logger.js';

const command = process.argv[2];

async function runScheduledTask() {
    try {
        logger.info(`🕐 Starting scheduled attendance task: ${command}`);
        
        let result;
        
        switch (command) {
            case 'end-of-day':
                result = await attendanceService.processEndOfDayAttendance();
                break;
                
            case 'check-absent':
                result = await attendanceService.checkAbsentEmployees();
                break;
                
            default:
                logger.error('❌ Invalid command. Use: end-of-day or check-absent');
                process.exit(1);
        }
        
        if (result.success) {
            logger.info(`✅ ${command} completed successfully: ${result.message}`);
            if (result.data && result.data.length > 0) {
                logger.info(`📊 Processed ${result.data.length} records:`);
                result.data.forEach(record => {
                    logger.info(`   - ${record.employeeName} (${record.employeeId}): ${record.action} - ${record.reason}`);
                });
            } else {
                logger.info('📊 No records needed processing');
            }
        } else {
            logger.error(`❌ ${command} failed: ${result.message}`);
            process.exit(1);
        }
        
    } catch (error) {
        logger.error(`[ERROR] Scheduled task error:`, error);
        process.exit(1);
    }
}

// Run the task
runScheduledTask();