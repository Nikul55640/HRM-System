/**
 * Fix Attendance Data Inconsistencies Script
 * 
 * This script identifies and fixes common attendance data issues:
 * - Late days > Present days
 * - Negative work hours
 * - Missing clock-out times
 * - Inconsistent status values
 * 
 * Usage: node scripts/fix-attendance-data-inconsistencies.js
 */

import { AttendanceRecord } from '../src/models/index.js';
import { Op } from 'sequelize';
import logger from '../src/utils/logger.js';

const fixAttendanceInconsistencies = async () => {
    try {
        console.log('🔍 Starting attendance data consistency check...\n');

        // 1. Find records where late days exceed present days (impossible scenario)
        console.log('1. Checking for impossible late day counts...');
        const inconsistentRecords = await AttendanceRecord.findAll({
            where: {
                isLate: true,
                status: { [Op.notIn]: ['present', 'half_day'] }
            }
        });

        if (inconsistentRecords.length > 0) {
            console.log(`   Found ${inconsistentRecords.length} records marked as late but not present`);
            
            // Fix: If marked as late, status should be present or half_day
            for (const record of inconsistentRecords) {
                if (record.clockIn && record.clockOut) {
                    record.status = 'present';
                } else if (record.clockIn) {
                    record.status = 'half_day';
                } else {
                    record.isLate = false; // Can't be late without clocking in
                    record.lateMinutes = 0;
                }
                await record.save();
                console.log(`   ✅ Fixed record for employee ${record.employeeId} on ${record.date}`);
            }
        } else {
            console.log('   ✅ No impossible late day counts found');
        }

        // 2. Find records with negative work hours
        console.log('\n2. Checking for negative work hours...');
        const negativeHours = await AttendanceRecord.findAll({
            where: {
                [Op.or]: [
                    { workHours: { [Op.lt]: 0 } },
                    { totalWorkedMinutes: { [Op.lt]: 0 } }
                ]
            }
        });

        if (negativeHours.length > 0) {
            console.log(`   Found ${negativeHours.length} records with negative work hours`);
            
            for (const record of negativeHours) {
                record.workHours = 0;
                record.totalWorkedMinutes = 0;
                record.status = 'incomplete';
                await record.save();
                console.log(`   ✅ Fixed negative hours for employee ${record.employeeId} on ${record.date}`);
            }
        } else {
            console.log('   ✅ No negative work hours found');
        }

        // 3. Find records with clock-in but marked as absent
        console.log('\n3. Checking for absent records with clock-in data...');
        const absentWithClockIn = await AttendanceRecord.findAll({
            where: {
                status: 'absent',
                clockIn: { [Op.not]: null }
            }
        });

        if (absentWithClockIn.length > 0) {
            console.log(`   Found ${absentWithClockIn.length} absent records with clock-in data`);
            
            for (const record of absentWithClockIn) {
                if (record.clockOut) {
                    record.status = 'present';
                } else {
                    record.status = 'incomplete';
                }
                await record.save();
                console.log(`   ✅ Fixed absent status for employee ${record.employeeId} on ${record.date}`);
            }
        } else {
            console.log('   ✅ No absent records with clock-in data found');
        }

        // 4. Find records with excessive late minutes (> 24 hours)
        console.log('\n4. Checking for excessive late minutes...');
        const excessiveLate = await AttendanceRecord.findAll({
            where: {
                lateMinutes: { [Op.gt]: 1440 } // More than 24 hours
            }
        });

        if (excessiveLate.length > 0) {
            console.log(`   Found ${excessiveLate.length} records with excessive late minutes`);
            
            for (const record of excessiveLate) {
                // Cap late minutes to a reasonable maximum (e.g., 8 hours = 480 minutes)
                record.lateMinutes = Math.min(record.lateMinutes, 480);
                await record.save();
                console.log(`   ✅ Capped late minutes for employee ${record.employeeId} on ${record.date}`);
            }
        } else {
            console.log('   ✅ No excessive late minutes found');
        }

        // 5. Summary report
        console.log('\n📊 Generating summary report...');
        const totalRecords = await AttendanceRecord.count();
        const presentRecords = await AttendanceRecord.count({ where: { status: 'present' } });
        const absentRecords = await AttendanceRecord.count({ where: { status: 'absent' } });
        const lateRecords = await AttendanceRecord.count({ where: { isLate: true } });
        const incompleteRecords = await AttendanceRecord.count({ where: { status: 'incomplete' } });

        console.log('\n📋 Current Database Summary:');
        console.log(`   Total Records: ${totalRecords}`);
        console.log(`   Present: ${presentRecords}`);
        console.log(`   Absent: ${absentRecords}`);
        console.log(`   Late: ${lateRecords}`);
        console.log(`   Incomplete: ${incompleteRecords}`);

        // Validation check
        if (lateRecords > presentRecords + incompleteRecords) {
            console.log('\n⚠️  WARNING: Still have more late records than present+incomplete records');
            console.log('   This suggests data integrity issues that need manual review');
        } else {
            console.log('\n✅ Data consistency checks passed');
        }

        console.log('\n🎉 Attendance data consistency fix completed!');

    } catch (error) {
        console.error('❌ Error fixing attendance inconsistencies:', error);
        throw error;
    }
};

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
    fixAttendanceInconsistencies()
        .then(() => {
            console.log('Attendance data fix completed successfully');
            process.exit(0);
        })
        .catch((error) => {
            console.error('Attendance data fix failed:', error);
            process.exit(1);
        });
}

export default fixAttendanceInconsistencies;