/**
 * Fix nikl@hrm.com's shift assignment and recalculate attendance
 */

import { User, Employee, EmployeeShift, Shift, AttendanceRecord } from './src/models/index.js';
import AttendanceCalculationService from './src/services/core/attendanceCalculation.service.js';

async function fixNiklShiftAssignment() {
    try {
        console.log('🔧 Fixing nikl@hrm.com Shift Assignment\n');

        // Step 1: Find nikl's user and employee
        const user = await User.findOne({ where: { email: 'nikl@hrm.com' } });
        const employee = await Employee.findOne({ where: { userId: user.id } });

        console.log(`👤 Employee: ${employee.firstName} ${employee.lastName} (${employee.employeeId})`);

        // Step 2: Get current shift assignment
        const currentShiftAssignment = await EmployeeShift.findOne({
            where: { employeeId: employee.id, isActive: true }
        });

        const currentShift = await Shift.findByPk(currentShiftAssignment.shiftId);
        console.log(`📋 Current Shift: ${currentShift.shiftName} (${currentShift.shiftStartTime} - ${currentShift.shiftEndTime})`);

        // Step 3: Get the correct day shift
        const dayShift = await Shift.findOne({
            where: { shiftName: 'Regular Day Shift', isActive: true }
        });

        if (!dayShift) {
            console.log('❌ Day shift not found');
            return;
        }

        console.log(`✅ Target Shift: ${dayShift.shiftName} (${dayShift.shiftStartTime} - ${dayShift.shiftEndTime})`);

        // Step 4: Update shift assignment
        console.log('\n🔄 Updating shift assignment...');
        
        await currentShiftAssignment.update({
            shiftId: dayShift.id,
            updatedAt: new Date()
        });

        console.log('✅ Shift assignment updated');

        // Step 5: Recalculate attendance records
        console.log('\n🔄 Recalculating attendance records...');
        
        const attendanceRecords = await AttendanceRecord.findAll({
            where: { employeeId: employee.id },
            order: [['date', 'DESC']],
            limit: 10
        });

        console.log(`Found ${attendanceRecords.length} records to recalculate`);
        console.log('\nBefore vs After:');
        console.log('─'.repeat(80));
        console.log('Date       | Clock-In    | Old Late | New Late | Difference');
        console.log('─'.repeat(80));

        let totalFixed = 0;

        for (const record of attendanceRecords) {
            if (record.clockIn) {
                const oldLateMinutes = record.lateMinutes;
                
                // Recalculate with new shift
                const lateCalculation = AttendanceCalculationService.calculateLateStatus(
                    new Date(record.clockIn),
                    dayShift
                );

                // Update the record
                await record.update({
                    lateMinutes: lateCalculation.lateMinutes,
                    isLate: lateCalculation.isLate
                });

                const clockInStr = new Date(record.clockIn).toLocaleTimeString();
                const difference = oldLateMinutes - lateCalculation.lateMinutes;
                const diffStr = difference > 0 ? `-${difference}` : `+${Math.abs(difference)}`;

                console.log(`${record.date} | ${clockInStr.padEnd(11)} | ${oldLateMinutes.toString().padStart(8)} | ${lateCalculation.lateMinutes.toString().padStart(8)} | ${diffStr.padStart(10)}`);

                if (difference !== 0) {
                    totalFixed++;
                }
            }
        }

        console.log('─'.repeat(80));
        console.log(`✅ Fixed ${totalFixed} records`);

        // Step 6: Show the improvement
        console.log('\n📊 Summary of Changes:');
        
        const updatedRecords = await AttendanceRecord.findAll({
            where: { employeeId: employee.id },
            order: [['date', 'DESC']],
            limit: 3
        });

        updatedRecords.forEach(record => {
            const clockInStr = record.clockIn ? new Date(record.clockIn).toLocaleTimeString() : 'None';
            const status = record.lateMinutes > 0 ? `${record.lateMinutes} min late` : 'On time';
            console.log(`   ${record.date}: ${clockInStr} → ${status}`);
        });

        console.log('\n🎉 nikl@hrm.com has been successfully reassigned to the correct shift!');
        console.log('   Their attendance records now show realistic late calculations.');

    } catch (error) {
        console.error('❌ Error fixing shift assignment:', error);
    }
}

// Run the fix
fixNiklShiftAssignment()
    .then(() => {
        console.log('\n✅ Shift assignment fix completed');
        process.exit(0);
    })
    .catch((error) => {
        console.error('💥 Script error:', error);
        process.exit(1);
    });