/**
 * Test script to verify the late calculation fix
 * This tests the critical bug where employees clocking in early were marked as late
 */

import AttendanceCalculationService from './src/services/core/attendanceCalculation.service.js';

console.log('🧪 Testing Late Calculation Fix - Final Verification\n');

// Test cases that were previously failing
const testCases = [
    {
        name: 'Early Clock-in (Night Shift)',
        clockIn: '2026-01-21T23:45:00.000Z', // Clock in at 11:45 PM
        attendanceDate: '2026-01-22', // Attendance date is next day
        shift: {
            shiftStartTime: '00:00:00', // Shift starts at midnight
            gracePeriodMinutes: 15
        },
        expectedResult: { isLate: false, lateMinutes: 0 }
    },
    {
        name: 'Early Clock-in (Day Shift)',
        clockIn: '2026-01-21T08:45:00.000Z', // Clock in at 8:45 AM
        attendanceDate: '2026-01-21', // Same day
        shift: {
            shiftStartTime: '09:00:00', // Shift starts at 9:00 AM
            gracePeriodMinutes: 10
        },
        expectedResult: { isLate: false, lateMinutes: 0 }
    },
    {
        name: 'Late Clock-in (Day Shift)',
        clockIn: '2026-01-21T09:25:00.000Z', // Clock in at 9:25 AM
        attendanceDate: '2026-01-21', // Same day
        shift: {
            shiftStartTime: '09:00:00', // Shift starts at 9:00 AM
            gracePeriodMinutes: 10 // Grace until 9:10 AM
        },
        expectedResult: { isLate: true, lateMinutes: 15 } // 15 minutes late
    },
    {
        name: 'Cross-day Night Shift (Early)',
        clockIn: '2026-01-21T21:30:00.000Z', // Clock in at 9:30 PM
        attendanceDate: '2026-01-22', // Attendance date is next day
        shift: {
            shiftStartTime: '22:00:00', // Shift starts at 10:00 PM
            gracePeriodMinutes: 15
        },
        expectedResult: { isLate: false, lateMinutes: 0 }
    },
    {
        name: 'Cross-day Night Shift (Late)',
        clockIn: '2026-01-21T22:30:00.000Z', // Clock in at 10:30 PM
        attendanceDate: '2026-01-22', // Attendance date is next day
        shift: {
            shiftStartTime: '22:00:00', // Shift starts at 10:00 PM
            gracePeriodMinutes: 15 // Grace until 10:15 PM
        },
        expectedResult: { isLate: true, lateMinutes: 15 } // 15 minutes late
    }
];

let passedTests = 0;
let totalTests = testCases.length;

console.log('🔍 Running Test Cases:\n');

for (const testCase of testCases) {
    console.log(`📋 Test: ${testCase.name}`);
    console.log(`   Clock-in: ${new Date(testCase.clockIn).toLocaleString()}`);
    console.log(`   Attendance Date: ${testCase.attendanceDate}`);
    console.log(`   Shift Start: ${testCase.shift.shiftStartTime}`);
    console.log(`   Grace Period: ${testCase.shift.gracePeriodMinutes} minutes`);
    
    const result = AttendanceCalculationService.calculateLateStatus(
        new Date(testCase.clockIn),
        testCase.shift,
        testCase.attendanceDate
    );
    
    console.log(`   Result: ${result.isLate ? 'LATE' : 'ON TIME'} - ${result.lateMinutes} minutes`);
    console.log(`   Expected: ${testCase.expectedResult.isLate ? 'LATE' : 'ON TIME'} - ${testCase.expectedResult.lateMinutes} minutes`);
    
    const isCorrect = (
        result.isLate === testCase.expectedResult.isLate &&
        result.lateMinutes === testCase.expectedResult.lateMinutes
    );
    
    if (isCorrect) {
        console.log(`   ✅ PASSED\n`);
        passedTests++;
    } else {
        console.log(`   ❌ FAILED\n`);
    }
}

console.log('📊 Test Results:');
console.log(`   Passed: ${passedTests}/${totalTests}`);
console.log(`   Success Rate: ${Math.round((passedTests / totalTests) * 100)}%`);

if (passedTests === totalTests) {
    console.log('\n🎉 ALL TESTS PASSED! The late calculation bug has been fixed!');
    console.log('\n✅ Key Fixes Applied:');
    console.log('   • Fixed shift start time calculation to use attendance date instead of clock-in date');
    console.log('   • Properly handles night shifts and cross-day scenarios');
    console.log('   • Eliminates false late markings for early clock-ins');
    console.log('   • Maintains accurate late calculations for actual late arrivals');
} else {
    console.log('\n❌ Some tests failed. Please review the implementation.');
}