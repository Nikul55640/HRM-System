#!/usr/bin/env node

/**
 * 🧹 ONE-TIME DATA CLEANUP SCRIPT
 * 
 * This script fixes existing wrong attendance data that was created
 * before implementing the correct HR logic.
 * 
 * FIXES:
 * 1. Records with no clock-in marked as 'present' → Change to 'absent'
 * 2. Records with no clock-in marked as 'incomplete' → Change to 'absent'
 * 3. Records with clock-in but no clock-out marked as 'present' → Change to 'pending_correction'
 * 
 * Usage: node scripts/fix-attendance-data-final.js
 */

import { AttendanceRecord, AttendanceCorrectionRequest } from '../src/models/index.js';
import logger from '../src/utils/logger.js';
import { Op } from 'sequelize';

async function fixAttendanceData() {
    try {
        logger.info('🧹 Starting attendance data cleanup...');
        
        let totalFixed = 0;
        
        // FIX 1: Present/Incomplete without clock-in → ABSENT
        logger.info('📋 Fix 1: Correcting records without clock-in...');
        const [fixedNoClockIn] = await AttendanceRecord.update(
            { 
                status: 'absent',
                statusReason: 'Auto corrected: No clock-in recorded'
            },
            {
                where: {
                    clockIn: null,
                    status: { [Op.in]: ['present', 'incomplete'] }
                }
            }
        );
        
        logger.info(`✅ Fixed ${fixedNoClockIn} records without clock-in`);
        totalFixed += fixedNoClockIn;
        
        // FIX 2: Present with clock-in but no clock-out → PENDING_CORRECTION
        logger.info('📋 Fix 2: Correcting records with missing clock-out...');
        
        // First, find records that need correction requests
        const recordsNeedingCorrection = await AttendanceRecord.findAll({
            where: {
                clockIn: { [Op.not]: null },
                clockOut: null,
                status: 'present'
            }
        });
        
        // Update their status
        const [fixedMissingClockOut] = await AttendanceRecord.update(
            { 
                status: 'pending_correction',
                correctionRequested: true,
                statusReason: 'Auto corrected: Missing clock-out'
            },
            {
                where: {
                    clockIn: { [Op.not]: null },
                    clockOut: null,
                    status: 'present'
                }
            }
        );
        
        // Create correction requests for these records
        let correctionRequestsCreated = 0;
        for (const record of recordsNeedingCorrection) {
            try {
                await AttendanceCorrectionRequest.create({
                    employeeId: record.employeeId,
                    attendanceRecordId: record.id,
                    date: record.date,
                    issueType: 'missed_punch',
                    reason: 'Auto-detected missing clock-out during data cleanup',
                    status: 'pending'
                });
                correctionRequestsCreated++;
            } catch (error) {
                // Skip if correction request already exists
                if (!error.message.includes('duplicate')) {
                    logger.warn(`Failed to create correction request for record ${record.id}:`, error.message);
                }
            }
        }
        
        logger.info(`✅ Fixed ${fixedMissingClockOut} records with missing clock-out`);
        logger.info(`✅ Created ${correctionRequestsCreated} correction requests`);
        totalFixed += fixedMissingClockOut;
        
        // FIX 3: Clean up invalid work hours for absent records
        logger.info('📋 Fix 3: Cleaning up work hours for absent records...');
        const [fixedWorkHours] = await AttendanceRecord.update(
            { 
                workHours: 0,
                totalWorkedMinutes: 0,
                totalBreakMinutes: 0
            },
            {
                where: {
                    status: 'absent',
                    [Op.or]: [
                        { workHours: { [Op.gt]: 0 } },
                        { totalWorkedMinutes: { [Op.gt]: 0 } }
                    ]
                }
            }
        );
        
        logger.info(`✅ Cleaned up work hours for ${fixedWorkHours} absent records`);
        
        // SUMMARY
        logger.info('🎉 Data cleanup completed successfully!');
        logger.info(`📊 Summary:`);
        logger.info(`   - Fixed records without clock-in: ${fixedNoClockIn}`);
        logger.info(`   - Fixed records with missing clock-out: ${fixedMissingClockOut}`);
        logger.info(`   - Created correction requests: ${correctionRequestsCreated}`);
        logger.info(`   - Cleaned up work hours: ${fixedWorkHours}`);
        logger.info(`   - Total records fixed: ${totalFixed}`);
        
        if (totalFixed === 0) {
            logger.info('✨ No data issues found - your attendance data is already clean!');
        } else {
            logger.info('✨ Your attendance data is now consistent with HR business rules');
        }
        
        process.exit(0);
        
    } catch (error) {
        logger.error('❌ Error during data cleanup:', error);
        process.exit(1);
    }
}

// Run the cleanup
fixAttendanceData();