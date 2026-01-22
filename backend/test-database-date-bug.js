/**
 * Test script to reproduce the 691 minutes late bug
 * Simulating how dates are stored and retrieved from database
 */

import AttendanceCalculationService from './src/services/core/attendanceCalculation.service.js';
import { getLocalDateString } from './src/utils/dateUtils.js';

console.log('🔍 Testing Database Date Retrieval Bug\n');

// Simulate how dates might be stored/retrieved from database
const testScenarios = [
    {
        name: 'Normal Date Object (current implementation)',
        clockIn: new Date('2026-01-21T12:31:00'),
        shift: { shiftStartTime: '13:00:00', gracePeriodMinutes: 10 }
    },
    {
        name: 'Date as ISO String (from database)',
        clockIn: new Date('2026-01-21T12:31:00.000Z'), // UTC from database
        shift: { shiftStartTime: '13:00:00', gracePeriodMinutes: 10 }
    },
    {
        name: 'Date with timezone offset',
        clockIn: new Date('2026-01-21T12:31:00+05:30'), // IST
        shift: { shiftStartTime: '13:00:00', gracePeriodMinutes: 10 }
    },
    {
        name: 'Sequelize DATE field simulation',
        clockIn: new Date('2026-01-21 12:31:00'), // How Sequelize might return it
        shift: { shiftStartTime: '13:00:00', gracePeriodMinutes: 10 }
    }
];

console.log('Testing different date formats that might come from database:\n');

testScenarios.forEach((scenario, index) => {
    console.log(`📊 Test ${index + 1}: ${scenario.name}`);
    console.log(`Clock-in: ${scenario.clockIn.toISOString()} (${scenario.clockIn.toLocaleString()})`);
    console.log(`Shift start: ${scenario.shift.shiftStartTime}`);
    
    // Test the calculation
    const result = AttendanceCalculationService.calculateLateStatus(scenario.clockIn, scenario.shift, '2026-01-21');
    
    console.log(`Result: ${result.isLate ? 'LATE' : 'ON TIME'} - ${result.lateMinutes} minutes`);
    
    // Debug the date construction
    const today = getLocalDateString(scenario.clockIn);
    const shiftStart = new Date(`${today} ${scenario.shift.shiftStartTime}`);
    const timeDiff = scenario.clockIn.getTime() - shiftStart.getTime();
    const diffMinutes = Math.floor(timeDiff / (1000 * 60));
    
    console.log(`Date string: "${today}"`);
    console.log(`Shift start parsed: ${shiftStart.toISOString()} (${shiftStart.toLocaleString()})`);
    console.log(`Time difference: ${diffMinutes} minutes`);
    
    if (Math.abs(result.lateMinutes) > 600) {
        console.log('🚨 POTENTIAL BUG: Large time difference detected!');
    }
    
    console.log('─'.repeat(70));
});

// Test the specific edge case that might cause 691 minutes
console.log('\n🔍 Testing Specific Edge Cases for 691-Minute Bug:\n');

// Edge case 1: What if the date string construction fails?
try {
    const clockIn = new Date('2026-01-21T12:31:00');
    const badShiftTime = null; // What if shift time is null?
    const result = AttendanceCalculationService.calculateLateStatus(clockIn, { shiftStartTime: badShiftTime }, '2026-01-21');
    console.log('Null shift time test:', result);
} catch (error) {
    console.log('Null shift time error:', error.message);
}

// Edge case 2: What if getLocalDateString returns unexpected format?
try {
    const clockIn = new Date('2026-01-21T12:31:00');
    const today = getLocalDateString(clockIn);
    console.log(`\ngetLocalDateString result: "${today}"`);
    
    // Test different shift time formats
    const shiftTimes = ['13:00:00', '13:00', '1:00 PM', '13:00:00.000'];
    
    shiftTimes.forEach(shiftTime => {
        try {
            const dateString = `${today} ${shiftTime}`;
            const parsed = new Date(dateString);
            console.log(`"${dateString}" -> ${parsed.toLocaleString()} (${parsed.getTime()})`);
            
            const diff = clockIn.getTime() - parsed.getTime();
            const diffMinutes = Math.floor(Math.abs(diff) / (1000 * 60));
            
            if (diffMinutes > 600) {
                console.log(`  🚨 FOUND POTENTIAL BUG: ${diffMinutes} minutes difference!`);
            }
        } catch (error) {
            console.log(`  ❌ Parse error for "${shiftTime}": ${error.message}`);
        }
    });
} catch (error) {
    console.log('Edge case test error:', error.message);
}

// Edge case 3: Test with actual problematic values that might cause 691 minutes
console.log('\n🎯 Testing Values That Could Produce ~691 Minutes:\n');

// 691 minutes = 11.52 hours
// This suggests the shift start time is being interpreted as ~11.5 hours earlier
const clockIn = new Date('2026-01-21T12:31:00'); // 12:31 PM
const clockInMs = clockIn.getTime();

// What timestamp would be 691 minutes earlier?
const targetDiff = 691 * 60 * 1000; // 691 minutes in milliseconds
const problematicShiftMs = clockInMs - targetDiff;
const problematicShift = new Date(problematicShiftMs);

console.log(`Clock-in: ${clockIn.toLocaleString()}`);
console.log(`691 minutes earlier would be: ${problematicShift.toLocaleString()}`);
console.log(`That's: ${problematicShift.toISOString()}`);

// This might happen if the date construction goes wrong
console.log('\nTesting potential date construction bugs:');

const testConstructions = [
    `2026-01-21 13:00:00`,
    `2026-01-20 13:00:00`, // Wrong date
    `1970-01-01 13:00:00`, // Epoch date
    `2026-01-21T13:00:00Z`, // UTC
];

testConstructions.forEach(dateStr => {
    const constructed = new Date(dateStr);
    const diff = clockIn.getTime() - constructed.getTime();
    const diffMinutes = Math.floor(Math.abs(diff) / (1000 * 60));
    
    console.log(`"${dateStr}" -> ${diffMinutes} minutes difference`);
    
    if (Math.abs(diffMinutes - 691) < 10) {
        console.log(`  🎯 CLOSE TO 691 MINUTES! This might be the bug!`);
    }
});