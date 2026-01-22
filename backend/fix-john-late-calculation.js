/**
 * Fix John's attendance late calculation data
 * Updates stored late minutes to match the corrected calculation service
 */

import { AttendanceRecord, Employee, User, Shift, EmployeeShift } from './src/models/index.js';
import AttendanceCalculationService from './src/services/core/attendanceCalculation.service.js';

console.log('🔧 Fixing John\'s attendance late calculation data\n');

async function fixJohnAttendanceData() {
    try {
        // Find John's user account
        const user = await User.findOne({
            where: { email: 'john@hrm.com' }
        });

        if (!user) {
            console.log('❌ User john@hrm.com not found');
            return;
        }

        // Find John's employee record
        const employee = await Employee.findOne({
            where: { userId: user.id }
        });

        if (!employee) {
            console.log('❌ No employee profile found for john@hrm.com');
            return;
        }

        // Get John's shift
        const employeeShift = await EmployeeShift.findOne({
            where: {
                employeeId: employee.id,
                isActive: true
            }
        });

        let shift = null;
        if (employeeShift) {
            shift = await Shift.findByPk(employeeShift.shiftId);
        }

        if (!shift) {
            console.log('❌ No active shift found for John');
            return;
        }

        console.log(`👤 Fixing attendance for: ${employee.firstName} ${employee.lastName}`);
        console.log(`🕐 Shift: ${shift.shiftName} (${shift.shiftStartTime} - ${shift.shiftEndTime})`);

        // Get all John's attendance records with clock-in data
        const attendanceRecords = await AttendanceRecord.findAll({
            where: {
                employeeId: employee.id,
                clockIn: { [AttendanceRecord.sequelize.Sequelize.Op.not]: null }
            },
            order: [['date', 'DESC']]
        });

        console.log(`\n📊 Found ${attendanceRecords.length} attendance records with clock-in data`);

        let fixedCount = 0;
        
        for (const record of attendanceRecords) {
            console.log(`\n📋 Processing record for ${record.date}:`);
            console.log(`   Current: Late=${record.isLate}, Minutes=${record.lateMinutes}`);
            
            // Recalculate using the fixed service
            const lateCalculation = AttendanceCalculationService.calculateLateStatus(
                record.clockIn,
                shift,
                record.date
            );

            console.log(`   Calculated: Late=${lateCalculation.isLate}, Minutes=${lateCalculation.lateMinutes}`);

            // Check if update is needed
            if (record.isLate !== lateCalculation.isLate || record.lateMinutes !== lateCalculation.lateMinutes) {
                console.log('   🔧 Updating record...');
                
                await record.update({
                    isLate: lateCalculation.isLate,
                    lateMinutes: lateCalculation.lateMinutes,
                    updatedBy: user.id
                });

                fixedCount++;
                console.log('   ✅ Record updated successfully');
            } else {
                console.log('   ✅ Record already correct');
            }
        }

        console.log(`\n🎉 Fix complete! Updated ${fixedCount} out of ${attendanceRecords.length} records`);

        // Verify the fix by checking today's record
        const todayRecord = attendanceRecords.find(r => r.date === '2026-01-22');
        if (todayRecord) {
            console.log('\n🔍 Verification - Today\'s record:');
            await todayRecord.reload();
            console.log(`   Date: ${todayRecord.date}`);
            console.log(`   Clock-in: ${new Date(todayRecord.clockIn).toLocaleString()}`);
            console.log(`   Is Late: ${todayRecord.isLate}`);
            console.log(`   Late Minutes: ${todayRecord.lateMinutes}`);
            
            if (todayRecord.lateMinutes === 418) {
                console.log('   ✅ VERIFICATION PASSED: Late calculation is now correct!');
            } else {
                console.log('   ❌ VERIFICATION FAILED: Late calculation still incorrect');
            }
        }

    } catch (error) {
        console.error('❌ Error fixing attendance data:', error);
    }
}

// Run the fix
fixJohnAttendanceData().then(() => {
    console.log('\n✅ Fix script complete');
    process.exit(0);
}).catch(error => {
    console.error('❌ Fix script failed:', error);
    process.exit(1);
});