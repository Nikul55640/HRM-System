/**
 * Test script to verify attendance status determination logic
 * Tests the "if work hours < 4 then half day" logic
 */

import { AttendanceRecord, Employee, User, Shift, EmployeeShift } from './src/models/index.js';

console.log('🧪 Testing Attendance Status Determination Logic\n');

async function testStatusDetermination() {
    try {
        // Find John's user account for testing
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

        console.log(`👤 Testing with: ${employee.firstName} ${employee.lastName}`);
        console.log(`🕐 Shift: ${shift.shiftName}`);
        console.log(`   Full Day Hours: ${shift.fullDayHours}`);
        console.log(`   Half Day Hours: ${shift.halfDayHours}`);
        console.log(`   Start: ${shift.shiftStartTime}, End: ${shift.shiftEndTime}\n`);

        // Test scenarios
        const testScenarios = [
            {
                name: 'Less than 4 hours (3.5h)',
                clockIn: '2026-01-22T09:00:00.000Z',
                clockOut: '2026-01-22T12:30:00.000Z',
                expectedStatus: 'half_day',
                expectedHours: 3.5
            },
            {
                name: 'Exactly 4 hours',
                clockIn: '2026-01-22T09:00:00.000Z',
                clockOut: '2026-01-22T13:00:00.000Z',
                expectedStatus: 'half_day',
                expectedHours: 4.0
            },
            {
                name: 'Between 4-8 hours (6h)',
                clockIn: '2026-01-22T09:00:00.000Z',
                clockOut: '2026-01-22T15:00:00.000Z',
                expectedStatus: 'half_day',
                expectedHours: 6.0
            },
            {
                name: 'Exactly 8 hours',
                clockIn: '2026-01-22T09:00:00.000Z',
                clockOut: '2026-01-22T17:00:00.000Z',
                expectedStatus: 'present',
                expectedHours: 8.0
            },
            {
                name: 'More than 8 hours (9h)',
                clockIn: '2026-01-22T09:00:00.000Z',
                clockOut: '2026-01-22T18:00:00.000Z',
                expectedStatus: 'present',
                expectedHours: 9.0
            }
        ];

        console.log('🧪 Running Test Scenarios:\n');

        for (const scenario of testScenarios) {
            console.log(`📋 Test: ${scenario.name}`);
            console.log(`   Clock-in: ${new Date(scenario.clockIn).toLocaleString()}`);
            console.log(`   Clock-out: ${new Date(scenario.clockOut).toLocaleString()}`);

            // Create a test attendance record
            const testRecord = AttendanceRecord.build({
                employeeId: employee.id,
                shiftId: shift.id,
                date: '2026-01-22',
                clockIn: scenario.clockIn,
                clockOut: scenario.clockOut,
                breakSessions: [], // No breaks for simplicity
                status: 'incomplete'
            });

            // Test the finalizeWithShift method
            await testRecord.finalizeWithShift(shift);

            console.log(`   Calculated Hours: ${testRecord.workHours}`);
            console.log(`   Calculated Status: ${testRecord.status}`);
            console.log(`   Half Day Type: ${testRecord.halfDayType}`);
            console.log(`   Status Reason: ${testRecord.statusReason}`);

            // Verify results
            const hoursMatch = Math.abs(testRecord.workHours - scenario.expectedHours) < 0.1;
            const statusMatch = testRecord.status === scenario.expectedStatus;

            if (hoursMatch && statusMatch) {
                console.log('   ✅ PASS: Results match expected values');
            } else {
                console.log('   ❌ FAIL: Results do not match expected values');
                console.log(`      Expected: ${scenario.expectedHours}h, ${scenario.expectedStatus}`);
                console.log(`      Got: ${testRecord.workHours}h, ${testRecord.status}`);
            }
            console.log('');
        }

        console.log('🎯 Key Logic Summary:');
        console.log(`   • Work Hours < ${shift.halfDayHours} → HALF DAY (minimum attendance)`);
        console.log(`   • Work Hours ≥ ${shift.halfDayHours} and < ${shift.fullDayHours} → HALF DAY`);
        console.log(`   • Work Hours ≥ ${shift.fullDayHours} → PRESENT (full day)`);

    } catch (error) {
        console.error('❌ Error testing status determination:', error);
    }
}

// Run the test
testStatusDetermination().then(() => {
    console.log('\n✅ Status determination test complete');
    process.exit(0);
}).catch(error => {
    console.error('❌ Test failed:', error);
    process.exit(1);
});