/**
 * Check attendance records for nikl@hrm.com to identify any issues
 */

import { User, Employee, AttendanceRecord, Shift, EmployeeShift } from './src/models/index.js';
import AttendanceCalculationService from './src/services/core/attendanceCalculation.service.js';

async function checkNiklAttendance() {
    try {
        console.log('🔍 Checking attendance records for nikl@hrm.com\n');

        // Step 1: Find the user and employee
        const user = await User.findOne({
            where: { email: 'nikl@hrm.com' }
        });

        if (!user) {
            console.log('❌ User nikl@hrm.com not found');
            return;
        }

        // Get the employee separately
        const employee = await Employee.findOne({
            where: { userId: user.id },
            attributes: ['id', 'employeeId', 'firstName', 'lastName']
        });

        console.log('👤 User found:');
        console.log(`   ID: ${user.id}`);
        console.log(`   Email: ${user.email}`);
        console.log(`   Role: ${user.role}`);
        console.log(`   Employee ID: ${employee?.employeeId}`);
        console.log(`   Name: ${employee?.firstName} ${employee?.lastName}`);

        if (!employee) {
            console.log('❌ Employee record not found for this user');
            return;
        }

        // Step 2: Get their current shift
        const currentShift = await EmployeeShift.findOne({
            where: {
                employeeId: employee.id,
                isActive: true
            },
            order: [['effectiveDate', 'DESC']]
        });

        let shift = null;
        if (currentShift) {
            shift = await Shift.findByPk(currentShift.shiftId, {
                attributes: ['id', 'shiftName', 'shiftStartTime', 'shiftEndTime', 'gracePeriodMinutes']
            });
        }

        if (shift) {
            console.log('\n⏰ Current Shift:');
            console.log(`   Shift: ${shift.shiftName}`);
            console.log(`   Start Time: ${shift.shiftStartTime}`);
            console.log(`   End Time: ${shift.shiftEndTime}`);
            console.log(`   Grace Period: ${shift.gracePeriodMinutes} minutes`);
        } else {
            console.log('\n⚠️  No active shift found');
        }

        // Step 3: Get recent attendance records
        const attendanceRecords = await AttendanceRecord.findAll({
            where: { employeeId: employee.id },
            order: [['date', 'DESC']],
            limit: 10
        });

        console.log(`\n📊 Recent Attendance Records (${attendanceRecords.length} found):`);
        console.log('─'.repeat(100));
        console.log('Date       | Clock-In    | Clock-Out   | Late Min | Status    | Work Hours');
        console.log('─'.repeat(100));

        const problematicRecords = [];

        for (const record of attendanceRecords) {
            const clockInStr = record.clockIn ? new Date(record.clockIn).toLocaleTimeString() : 'None';
            const clockOutStr = record.clockOut ? new Date(record.clockOut).toLocaleTimeString() : 'None';
            const lateMinStr = record.lateMinutes ? record.lateMinutes.toString().padStart(8) : '0'.padStart(8);
            const statusStr = record.status.padEnd(9);
            const workHoursStr = record.workHours ? record.workHours.toString() : '0';

            console.log(`${record.date} | ${clockInStr.padEnd(11)} | ${clockOutStr.padEnd(11)} | ${lateMinStr} | ${statusStr} | ${workHoursStr}`);

            // Check for problematic records
            if (record.lateMinutes > 300) {
                problematicRecords.push(record);
            }

            // If there's a clock-in and shift, recalculate to compare
            if (record.clockIn && shift) {
                const recalculated = AttendanceCalculationService.calculateLateStatus(
                    new Date(record.clockIn),
                    shift
                );

                if (Math.abs(record.lateMinutes - recalculated.lateMinutes) > 5) {
                    console.log(`   🔧 Recalculated: ${recalculated.lateMinutes} minutes (difference: ${record.lateMinutes - recalculated.lateMinutes})`);
                }
            }
        }

        console.log('─'.repeat(100));

        // Step 4: Analyze problematic records
        if (problematicRecords.length > 0) {
            console.log(`\n🚨 Found ${problematicRecords.length} problematic records (>300 minutes late):`);
            
            for (const record of problematicRecords) {
                console.log(`\n📋 Record ${record.id} (${record.date}):`);
                console.log(`   Clock-in: ${record.clockIn ? new Date(record.clockIn).toLocaleString() : 'None'}`);
                console.log(`   Late minutes: ${record.lateMinutes}`);
                console.log(`   Status: ${record.status}`);

                if (record.clockIn && shift) {
                    console.log(`   Shift start: ${shift.shiftStartTime}`);
                    
                    // Show the exact calculation
                    const clockInTime = new Date(record.clockIn);
                    
                    console.log(`   Clock-in timestamp: ${clockInTime.getTime()}`);
                    console.log(`   Clock-in ISO: ${clockInTime.toISOString()}`);
                    console.log(`   Clock-in local: ${clockInTime.toLocaleString()}`);

                    // Manual calculation
                    const shiftStart = new Date(clockInTime);
                    const [hours, minutes, seconds = 0] = shift.shiftStartTime.split(':').map(Number);
                    shiftStart.setHours(hours, minutes, seconds, 0);

                    const timeDiff = clockInTime.getTime() - shiftStart.getTime();
                    const diffMinutes = Math.floor(timeDiff / (1000 * 60));

                    console.log(`   Shift start constructed: ${shiftStart.toLocaleString()}`);
                    console.log(`   Time difference: ${diffMinutes} minutes`);
                    console.log(`   Grace period: ${shift.gracePeriodMinutes} minutes`);

                    const gracePeriodMs = (shift.gracePeriodMinutes || 0) * 60 * 1000;
                    const lateThreshold = new Date(shiftStart.getTime() + gracePeriodMs);
                    console.log(`   Late threshold: ${lateThreshold.toLocaleString()}`);

                    if (clockInTime > lateThreshold) {
                        const correctLateMinutes = Math.floor((clockInTime - lateThreshold) / (1000 * 60));
                        console.log(`   ✅ Correct late minutes: ${correctLateMinutes}`);
                        
                        if (correctLateMinutes !== record.lateMinutes) {
                            console.log(`   🔥 BUG DETECTED: Database shows ${record.lateMinutes}, should be ${correctLateMinutes}`);
                        }
                    } else {
                        console.log(`   ✅ Should be on time (0 minutes late)`);
                        if (record.lateMinutes > 0) {
                            console.log(`   🔥 BUG DETECTED: Database shows ${record.lateMinutes}, should be 0`);
                        }
                    }
                }
            }
        } else {
            console.log('\n✅ No problematic records found (all late minutes < 300)');
        }

        // Step 5: Summary
        const totalRecords = attendanceRecords.length;
        const lateRecords = attendanceRecords.filter(r => r.lateMinutes > 0).length;
        const avgLateMinutes = attendanceRecords.length > 0 
            ? Math.round(attendanceRecords.reduce((sum, r) => sum + (r.lateMinutes || 0), 0) / attendanceRecords.length)
            : 0;

        console.log('\n📈 Summary:');
        console.log(`   Total records: ${totalRecords}`);
        console.log(`   Late records: ${lateRecords}`);
        console.log(`   Problematic records (>300 min): ${problematicRecords.length}`);
        console.log(`   Average late minutes: ${avgLateMinutes}`);

        if (problematicRecords.length > 0) {
            console.log('\n🔧 Recommendation: Run the data cleanup script to fix these records');
            console.log('   Command: node fix-691-minute-bug-data.js');
        }

    } catch (error) {
        console.error('❌ Error checking attendance:', error);
    }
}

// Run the check
checkNiklAttendance()
    .then(() => {
        console.log('\n✅ Attendance check completed');
        process.exit(0);
    })
    .catch((error) => {
        console.error('💥 Script error:', error);
        process.exit(1);
    });