/**
 * Test script to reproduce the 691 minutes late bug
 * 
 * Expected: Employee clocks in at 12:31 PM for 1:00 PM shift = 0 minutes late (early arrival)
 * Actual: Shows 691 minutes late due to timezone parsing bug
 */

import AttendanceCalculationService from './src/services/core/attendanceCalculation.service.js';
import { getLocalDateString } from './src/utils/dateUtils.js';

console.log('🔍 Testing Late Calculation Bug Reproduction\n');

// Test multiple scenarios to reproduce the bug
const testCases = [
    {
        name: 'User Example - Early Clock-in',
        clockInTime: new Date('2026-01-21T12:31:00'), // 12:31 PM
        shift: { shiftStartTime: '13:00:00', gracePeriodMinutes: 10 }
    },
    {
        name: 'Different Date Format',
        clockInTime: new Date('2026-01-21 12:31:00'), // Different format
        shift: { shiftStartTime: '13:00:00', gracePeriodMinutes: 10 }
    },
    {
        name: 'Time Only Format (potential bug)',
        clockInTime: new Date('2026-01-21T12:31:00'), 
        shift: { shiftStartTime: '13:00', gracePeriodMinutes: 10 } // Without seconds
    },
    {
        name: 'UTC vs Local Time Issue',
        clockInTime: new Date('2026-01-21T12:31:00Z'), // UTC time
        shift: { shiftStartTime: '13:00:00', gracePeriodMinutes: 10 }
    }
];

testCases.forEach((testCase, index) => {
    console.log(`\n📊 Test Case ${index + 1}: ${testCase.name}`);
    console.log(`Clock-in time: ${testCase.clockInTime.toLocaleString()}`);
    console.log(`Shift start time: ${testCase.shift.shiftStartTime}`);
    console.log(`Grace period: ${testCase.shift.gracePeriodMinutes} minutes`);
    
    // Show how the date string is constructed
    const today = getLocalDateString(testCase.clockInTime);
    const constructedDateString = `${today} ${testCase.shift.shiftStartTime}`;
    console.log(`Constructed date string: "${constructedDateString}"`);
    
    // Test current implementation
    const result = AttendanceCalculationService.calculateLateStatus(testCase.clockInTime, testCase.shift, '2026-01-21');
    console.log(`\n🔍 Result:`);
    console.log(`Is Late: ${result.isLate}`);
    console.log(`Late Minutes: ${result.lateMinutes}`);
    console.log(`Shift Start Time (parsed): ${result.shiftStartTime}`);
    console.log(`Late Threshold: ${result.lateThreshold}`);
    
    // Debug the parsing
    const manualParsed = new Date(constructedDateString);
    console.log(`Manual parsed date: ${manualParsed}`);
    console.log(`Manual parsed timestamp: ${manualParsed.getTime()}`);
    console.log(`Clock-in timestamp: ${testCase.clockInTime.getTime()}`);
    
    const timeDiff = testCase.clockInTime.getTime() - manualParsed.getTime();
    const diffMinutes = Math.floor(timeDiff / (1000 * 60));
    console.log(`Time difference: ${diffMinutes} minutes`);
    
    if (result.lateMinutes > 0 && testCase.clockInTime < result.shiftStartTime) {
        console.log('❌ BUG CONFIRMED: Employee marked late when arriving early!');
    } else if (result.lateMinutes === 0 && testCase.clockInTime < result.shiftStartTime) {
        console.log('✅ Correct: Early arrival properly handled');
    }
    
    console.log('─'.repeat(60));
});

// Test the exact problematic scenario that might cause 691 minutes
console.log('\n🚨 Testing Specific 691-Minute Bug Scenario');
console.log('This tests potential timezone/parsing edge cases...\n');

// Simulate different ways the time might be stored/retrieved from database
const problematicScenarios = [
    {
        name: 'Database TIME field as string',
        clockIn: new Date('2026-01-21T12:31:00'),
        shiftTime: '13:00:00'
    },
    {
        name: 'Potential timezone mismatch',
        clockIn: new Date('2026-01-21T12:31:00+05:30'), // IST
        shiftTime: '13:00:00'
    },
    {
        name: 'Date construction edge case',
        clockIn: new Date('2026-01-21T12:31:00'),
        shiftTime: '1:00:00 PM' // Different format
    }
];

problematicScenarios.forEach(scenario => {
    console.log(`Testing: ${scenario.name}`);
    try {
        const today = getLocalDateString(scenario.clockIn);
        const shiftStart = new Date(`${today} ${scenario.shiftTime}`);
        const diff = scenario.clockIn.getTime() - shiftStart.getTime();
        const diffMinutes = Math.floor(Math.abs(diff) / (1000 * 60));
        
        console.log(`  Clock-in: ${scenario.clockIn}`);
        console.log(`  Shift start: ${shiftStart}`);
        console.log(`  Difference: ${diffMinutes} minutes`);
        
        if (diffMinutes > 600) {
            console.log(`  ❌ POTENTIAL BUG: ${diffMinutes} minutes difference!`);
        }
    } catch (error) {
        console.log(`  ❌ ERROR: ${error.message}`);
    }
    console.log('');
});