/**
 * 🔥 CRITICAL: Fix 691-minute late bug in existing attendance records
 * 
 * This script cleans up bad data caused by the timezone/date parsing bug
 * and recalculates late status correctly for affected records.
 */

import { AttendanceRecord, Shift, Employee, User } from './src/models/index.js';
import AttendanceCalculationService from './src/services/core/attendanceCalculation.service.js';
import logger from './src/utils/logger.js';

console.log('🔧 Starting 691-Minute Late Bug Data Fix\n');

async function fixBadAttendanceData() {
    try {
        // Step 1: Find all records with suspiciously high late minutes
        console.log('📊 Step 1: Finding affected records...');
        
        const affectedRecords = await AttendanceRecord.findAll({
            where: {
                lateMinutes: {
                    [AttendanceRecord.sequelize.Sequelize.Op.gt]: 300 // More than 5 hours late
                }
            },
            include: [
                {
                    model: Employee,
                    as: 'employee',
                    include: [
                        {
                            model: User,
                            as: 'user',
                            attributes: ['firstName', 'lastName']
                        }
                    ]
                }
            ],
            order: [['date', 'DESC'], ['lateMinutes', 'DESC']]
        });

        console.log(`Found ${affectedRecords.length} records with suspicious late minutes\n`);

        if (affectedRecords.length === 0) {
            console.log('✅ No affected records found. System is clean!');
            return;
        }

        // Show the worst cases
        console.log('🚨 Top 10 Worst Cases:');
        affectedRecords.slice(0, 10).forEach((record, index) => {
            const employeeName = record.employee?.user ? 
                `${record.employee.user.firstName} ${record.employee.user.lastName}` : 
                'Unknown Employee';
            
            console.log(`${index + 1}. ${employeeName} - ${record.date} - ${record.lateMinutes} minutes late`);
        });

        console.log('\n📋 Step 2: Backing up affected records...');
        
        // Create backup of affected records
        const backupData = affectedRecords.map(record => ({
            id: record.id,
            employeeId: record.employeeId,
            date: record.date,
            originalLateMinutes: record.lateMinutes,
            originalIsLate: record.isLate,
            clockIn: record.clockIn,
            clockOut: record.clockOut,
            status: record.status
        }));

        // Save backup to file
        const fs = await import('fs');
        const backupFile = `attendance-backup-${new Date().toISOString().split('T')[0]}.json`;
        fs.writeFileSync(backupFile, JSON.stringify(backupData, null, 2));
        console.log(`✅ Backup saved to: ${backupFile}`);

        console.log('\n🔧 Step 3: Recalculating late status for affected records...');
        
        let fixedCount = 0;
        let errorCount = 0;

        for (const record of affectedRecords) {
            try {
                // Get the employee's shift for this date
                const shift = await Shift.findOne({
                    include: [{
                        model: Employee,
                        as: 'employees',
                        where: { id: record.employeeId },
                        through: { 
                            where: {
                                effectiveDate: {
                                    [AttendanceRecord.sequelize.Sequelize.Op.lte]: record.date
                                }
                            }
                        },
                        required: true
                    }],
                    order: [[{ model: Employee, as: 'employees' }, 'EmployeeShift', 'effectiveDate', 'DESC']]
                });

                if (!shift || !record.clockIn) {
                    console.log(`⚠️  Skipping record ${record.id} - no shift or clock-in time`);
                    continue;
                }

                // Recalculate late status using the fixed service
                const lateCalculation = AttendanceCalculationService.calculateLateStatus(
                    new Date(record.clockIn), 
                    shift
                );

                // Update the record with correct values
                await record.update({
                    lateMinutes: lateCalculation.lateMinutes,
                    isLate: lateCalculation.isLate,
                    updatedAt: new Date()
                });

                const employeeName = record.employee?.user ? 
                    `${record.employee.user.firstName} ${record.employee.user.lastName}` : 
                    'Unknown';

                console.log(`✅ Fixed: ${employeeName} (${record.date}) - ${record.lateMinutes} → ${lateCalculation.lateMinutes} minutes`);
                fixedCount++;

            } catch (error) {
                console.error(`❌ Error fixing record ${record.id}:`, error.message);
                errorCount++;
            }
        }

        console.log('\n📊 Step 4: Summary');
        console.log(`✅ Records fixed: ${fixedCount}`);
        console.log(`❌ Errors: ${errorCount}`);
        console.log(`📁 Backup file: ${backupFile}`);

        // Step 4: Verify the fix
        console.log('\n🔍 Step 5: Verification...');
        
        const remainingBadRecords = await AttendanceRecord.count({
            where: {
                lateMinutes: {
                    [AttendanceRecord.sequelize.Sequelize.Op.gt]: 300
                }
            }
        });

        if (remainingBadRecords === 0) {
            console.log('🎉 SUCCESS! All suspicious late records have been fixed!');
        } else {
            console.log(`⚠️  ${remainingBadRecords} records still have high late minutes. Manual review needed.`);
        }

        // Show some statistics
        const totalLateRecords = await AttendanceRecord.count({
            where: { isLate: true }
        });

        const averageLateMinutes = await AttendanceRecord.findOne({
            attributes: [
                [AttendanceRecord.sequelize.fn('AVG', AttendanceRecord.sequelize.col('lateMinutes')), 'avgLate']
            ],
            where: { isLate: true },
            raw: true
        });

        console.log('\n📈 Current Statistics:');
        console.log(`Total late records: ${totalLateRecords}`);
        console.log(`Average late minutes: ${Math.round(averageLateMinutes?.avgLate || 0)} minutes`);

    } catch (error) {
        console.error('❌ Critical error during data fix:', error);
        throw error;
    }
}

// Run the fix
fixBadAttendanceData()
    .then(() => {
        console.log('\n✅ Data fix completed successfully!');
        process.exit(0);
    })
    .catch((error) => {
        console.error('\n❌ Data fix failed:', error);
        process.exit(1);
    });