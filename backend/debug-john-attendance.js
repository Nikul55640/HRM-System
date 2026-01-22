/**
 * Debug script to check john@hrm.com attendance data and late calculation
 */

import { AttendanceRecord, Employee, User, Shift, EmployeeShift } from './src/models/index.js';
import AttendanceCalculationService from './src/services/core/attendanceCalculation.service.js';
import { getLocalDateString } from './src/utils/dateUtils.js';

console.log('🔍 Debugging john@hrm.com attendance data\n');

async function debugJohnAttendance() {
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

        console.log('👤 User Found:');
        console.log(`   Email: ${user.email}`);
        console.log(`   Employee ID: ${employee.id}`);
        console.log(`   Employee Name: ${employee.firstName} ${employee.lastName}`);

        // Get John's current shift assignment
        const today = getLocalDateString();
        console.log(`\n📅 Checking for date: ${today}`);

        // Get John's current shift assignment
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

        console.log('\n🕐 Shift Information:');
        console.log(`   Shift Name: ${shift.shiftName}`);
        console.log(`   Start Time: ${shift.shiftStartTime}`);
        console.log(`   End Time: ${shift.shiftEndTime}`);
        console.log(`   Grace Period: ${shift.gracePeriodMinutes} minutes`);

        // Get John's recent attendance records
        const attendanceRecords = await AttendanceRecord.findAll({
            where: {
                employeeId: employee.id
            },
            order: [['date', 'DESC']],
            limit: 5
        });

        console.log(`\n📊 Recent Attendance Records (${attendanceRecords.length}):`);
        
        for (const record of attendanceRecords) {
            console.log(`\n📋 Record for ${record.date}:`);
            console.log(`   Clock In: ${record.clockIn ? new Date(record.clockIn).toLocaleString() : 'Not clocked in'}`);
            console.log(`   Clock Out: ${record.clockOut ? new Date(record.clockOut).toLocaleString() : 'Not clocked out'}`);
            console.log(`   Status: ${record.status}`);
            console.log(`   Is Late: ${record.isLate}`);
            console.log(`   Late Minutes: ${record.lateMinutes}`);
            console.log(`   Work Hours: ${record.workHours}`);
            console.log(`   Total Worked Minutes: ${record.totalWorkedMinutes}`);

            // If there's a clock-in, test the late calculation
            if (record.clockIn) {
                console.log('\n🧪 Testing Late Calculation:');
                
                // Test with our fixed service
                const serviceResult = AttendanceCalculationService.calculateLateStatus(
                    record.clockIn,
                    shift,
                    record.date
                );

                console.log('   Service Calculation:');
                console.log(`     Is Late: ${serviceResult.isLate}`);
                console.log(`     Late Minutes: ${serviceResult.lateMinutes}`);
                console.log(`     Shift Start Time: ${serviceResult.shiftStartTime?.toLocaleString()}`);
                console.log(`     Late Threshold: ${serviceResult.lateThreshold?.toLocaleString()}`);

                // Compare with stored values
                console.log('\n   Stored vs Calculated:');
                console.log(`     Stored Late: ${record.isLate} | Calculated Late: ${serviceResult.isLate}`);
                console.log(`     Stored Minutes: ${record.lateMinutes} | Calculated Minutes: ${serviceResult.lateMinutes}`);

                if (record.isLate !== serviceResult.isLate || record.lateMinutes !== serviceResult.lateMinutes) {
                    console.log('   🚨 MISMATCH DETECTED! Stored values differ from calculated values');
                }

                // Debug the time calculation
                console.log('\n   Time Analysis:');
                console.log(`     Clock-in Time: ${new Date(record.clockIn).toISOString()}`);
                console.log(`     Clock-in Local: ${new Date(record.clockIn).toLocaleString()}`);
                console.log(`     Attendance Date: ${record.date}`);
                console.log(`     Shift Start: ${shift.shiftStartTime}`);
                
                // Manual calculation for comparison
                const clockInTime = new Date(record.clockIn);
                const clockInHour = clockInTime.getHours();
                const clockInMinute = clockInTime.getMinutes();
                
                const [shiftHour, shiftMinute] = shift.shiftStartTime.split(':').map(Number);
                
                console.log(`     Clock-in: ${clockInHour}:${clockInMinute.toString().padStart(2, '0')}`);
                console.log(`     Shift: ${shiftHour}:${shiftMinute.toString().padStart(2, '0')}`);
                
                const clockInMinutes = clockInHour * 60 + clockInMinute;
                const shiftMinutes = shiftHour * 60 + shiftMinute;
                const diffMinutes = clockInMinutes - shiftMinutes;
                
                console.log(`     Time Difference: ${diffMinutes} minutes`);
                
                if (diffMinutes > 0) {
                    console.log(`     Should be late by: ${diffMinutes - (shift.gracePeriodMinutes || 0)} minutes`);
                } else {
                    console.log(`     Should be early by: ${Math.abs(diffMinutes)} minutes`);
                }
            }
        }

        // Test specific scenario: 4:08 PM clock-in with 9 AM shift
        console.log('\n🎯 Testing Specific Scenario: 4:08 PM clock-in with 9 AM shift');
        
        const testClockIn = new Date();
        testClockIn.setHours(16, 8, 0, 0); // 4:08 PM
        
        const testResult = AttendanceCalculationService.calculateLateStatus(
            testClockIn,
            shift,
            today
        );

        console.log('   Test Results:');
        console.log(`     Clock-in: ${testClockIn.toLocaleString()}`);
        console.log(`     Is Late: ${testResult.isLate}`);
        console.log(`     Late Minutes: ${testResult.lateMinutes}`);
        console.log(`     Expected: Should be late by ~430 minutes (7+ hours)`);
        
        if (testResult.lateMinutes < 400) {
            console.log('   🚨 POTENTIAL BUG: Late minutes seem too low for this scenario');
        }

    } catch (error) {
        console.error('❌ Error debugging attendance:', error);
    }
}

// Import Op for database queries
import { Op } from 'sequelize';

// Run the debug
debugJohnAttendance().then(() => {
    console.log('\n✅ Debug complete');
    process.exit(0);
}).catch(error => {
    console.error('❌ Debug failed:', error);
    process.exit(1);
});