/**
 * Test script to verify the 691 minutes late bug fix
 */

import AttendanceCalculationService from './src/services/core/attendanceCalculation.service.js';

console.log('🔧 Testing Late Calculation Bug Fix\n');

// Test the exact scenarios that were causing issues
const testCases = [
    {
        name: '✅ User Example - Early Clock-in (should be 0 minutes late)',
        clockIn: new Date('2026-01-21T12:31:00'), // 12:31 PM local
        shift: { shiftStartTime: '13:00:00', gracePeriodMinutes: 10 }, // 1:00 PM
        expected: { isLate: false, lateMinutes: 0 }
    },
    {
        name: '🚨 UTC Database Issue (was showing 291 minutes late)',
        clockIn: new Date('2026-01-21T12:31:00.000Z'), // UTC from database
        shift: { shiftStartTime: '13:00:00', gracePeriodMinutes: 10 },
        expected: { isLate: false, lateMinutes: 0 } // Should be early, not late
    },
    {
        name: '✅ Actually Late Employee (should show late)',
        clockIn: new Date('2026-01-21T13:25:00'), // 1:25 PM - 15 minutes after grace period
        shift: { shiftStartTime: '13:00:00', gracePeriodMinutes: 10 },
        expected: { isLate: true, lateMinutes: 15 }
    },
    {
        name: '✅ Within Grace Period (should be on time)',
        clockIn: new Date('2026-01-21T13:05:00'), // 1:05 PM - within 10 min grace
        shift: { shiftStartTime: '13:00:00', gracePeriodMinutes: 10 },
        expected: { isLate: false, lateMinutes: 0 }
    },
    {
        name: '✅ Different Time Format (HH:MM without seconds)',
        clockIn: new Date('2026-01-21T12:31:00'),
        shift: { shiftStartTime: '13:00', gracePeriodMinutes: 10 }, // Without :00
        expected: { isLate: false, lateMinutes: 0 }
    }
];

console.log('Running comprehensive tests...\n');

let passedTests = 0;
let totalTests = testCases.length;

testCases.forEach((testCase, index) => {
    console.log(`📊 Test ${index + 1}: ${testCase.name}`);
    console.log(`Clock-in: ${testCase.clockIn.toLocaleString()}`);
    console.log(`Shift start: ${testCase.shift.shiftStartTime}`);
    console.log(`Grace period: ${testCase.shift.gracePeriodMinutes} minutes`);
    
    const result = AttendanceCalculationService.calculateLateStatus(testCase.clockIn, testCase.shift, '2026-01-21');
    
    console.log(`\n🔍 Result:`);
    console.log(`  Is Late: ${result.isLate}`);
    console.log(`  Late Minutes: ${result.lateMinutes}`);
    console.log(`  Shift Start (parsed): ${result.shiftStartTime.toLocaleString()}`);
    
    // Check if result matches expected
    const isCorrect = (
        result.isLate === testCase.expected.isLate &&
        result.lateMinutes === testCase.expected.lateMinutes
    );
    
    console.log(`\n✅ Expected: ${testCase.expected.isLate ? 'Late' : 'On Time'} - ${testCase.expected.lateMinutes} minutes`);
    console.log(`📋 Actual:   ${result.isLate ? 'Late' : 'On Time'} - ${result.lateMinutes} minutes`);
    
    if (isCorrect) {
        console.log(`✅ PASS: Test result matches expected outcome`);
        passedTests++;
    } else {
        console.log(`❌ FAIL: Test result does not match expected outcome`);
    }
    
    // Show time difference for debugging
    const timeDiff = testCase.clockIn.getTime() - result.shiftStartTime.getTime();
    const diffMinutes = Math.floor(timeDiff / (1000 * 60));
    console.log(`📏 Time difference: ${diffMinutes} minutes (${diffMinutes < 0 ? 'early' : 'late'})`);
    
    console.log('─'.repeat(80));
});

console.log(`\n📊 Test Summary:`);
console.log(`✅ Passed: ${passedTests}/${totalTests}`);
console.log(`❌ Failed: ${totalTests - passedTests}/${totalTests}`);

if (passedTests === totalTests) {
    console.log(`\n🎉 ALL TESTS PASSED! The 691-minute late bug has been fixed!`);
    console.log(`\n✅ Key Fixes Applied:`);
    console.log(`   • Fixed timezone mismatch between clock-in and shift start times`);
    console.log(`   • Used ISO format (YYYY-MM-DDTHH:MM:SS) for consistent parsing`);
    console.log(`   • Added proper validation for date construction`);
    console.log(`   • Enhanced error handling for invalid shift times`);
    console.log(`   • Added debug logging for troubleshooting`);
} else {
    console.log(`\n⚠️  Some tests failed. The fix may need additional adjustments.`);
}

// Test edge cases
console.log(`\n🔍 Testing Edge Cases:`);

const edgeCases = [
    {
        name: 'Null shift time',
        clockIn: new Date('2026-01-21T12:31:00'),
        shift: { shiftStartTime: null, gracePeriodMinutes: 10 }
    },
    {
        name: 'Invalid shift time format',
        clockIn: new Date('2026-01-21T12:31:00'),
        shift: { shiftStartTime: 'invalid', gracePeriodMinutes: 10 }
    },
    {
        name: 'Missing grace period',
        clockIn: new Date('2026-01-21T13:05:00'),
        shift: { shiftStartTime: '13:00:00' } // No gracePeriodMinutes
    }
];

edgeCases.forEach((edgeCase, index) => {
    console.log(`\nEdge Case ${index + 1}: ${edgeCase.name}`);
    try {
        const result = AttendanceCalculationService.calculateLateStatus(edgeCase.clockIn, edgeCase.shift, '2026-01-21');
        console.log(`  Result: ${result.isLate ? 'Late' : 'On Time'} - ${result.lateMinutes} minutes`);
        console.log(`  ✅ Handled gracefully`);
    } catch (error) {
        console.log(`  ❌ Error: ${error.message}`);
    }
});