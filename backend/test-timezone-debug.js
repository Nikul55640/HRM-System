/**
 * Debug timezone issues in the attendance system
 */

console.log('🔍 Debugging Timezone Issues\n');

// Test the problematic UTC case
const utcClockIn = new Date('2026-01-21T12:31:00.000Z'); // UTC
const localClockIn = new Date('2026-01-21T12:31:00'); // Local

console.log('📊 Timezone Comparison:');
console.log(`UTC Clock-in:   ${utcClockIn.toISOString()} -> ${utcClockIn.toLocaleString()}`);
console.log(`Local Clock-in: ${localClockIn.toISOString()} -> ${localClockIn.toLocaleString()}`);
console.log('');

// The issue: UTC time is being interpreted as local time
console.log('🚨 The Problem:');
console.log('When the database stores clock-in as UTC, but the user expects it to be local time,');
console.log('we get a timezone offset issue.');
console.log('');

// Show the timezone offset
const timezoneOffset = new Date().getTimezoneOffset();
console.log(`Current timezone offset: ${timezoneOffset} minutes`);
console.log(`That's ${timezoneOffset / 60} hours`);
console.log('');

// Test different approaches to fix this
console.log('🔧 Testing Different Fix Approaches:\n');

// Approach 1: Convert UTC to local time interpretation
function convertUTCToLocalInterpretation(utcDate) {
    // If the date is in UTC but should be interpreted as local time
    const offset = utcDate.getTimezoneOffset() * 60000; // offset in milliseconds
    return new Date(utcDate.getTime() + offset);
}

const approach1 = convertUTCToLocalInterpretation(utcClockIn);
console.log('Approach 1 - UTC to Local Interpretation:');
console.log(`Original UTC: ${utcClockIn.toLocaleString()}`);
console.log(`Converted:    ${approach1.toLocaleString()}`);
console.log('');

// Approach 2: Extract time components and reconstruct in local timezone
function reconstructInLocalTimezone(dateTime) {
    // Extract the time components from the original date string
    const isoString = dateTime.toISOString();
    const [datePart, timePart] = isoString.split('T');
    const timeOnly = timePart.split('.')[0]; // Remove milliseconds and Z
    
    // Reconstruct as local time
    return new Date(`${datePart}T${timeOnly}`);
}

const approach2 = reconstructInLocalTimezone(utcClockIn);
console.log('Approach 2 - Reconstruct in Local Timezone:');
console.log(`Original UTC: ${utcClockIn.toLocaleString()}`);
console.log(`Reconstructed: ${approach2.toLocaleString()}`);
console.log('');

// Approach 3: Check if the time looks like it should be local
function smartTimezoneDetection(clockInTime) {
    const clockIn = new Date(clockInTime);
    
    // If the time is in UTC but the hour suggests it should be local time
    // (e.g., 12:31 PM UTC but user expects 12:31 PM local)
    if (clockInTime.toString().includes('Z') || clockInTime.toString().includes('+00:00')) {
        // This is UTC time, but might need to be interpreted as local
        const utcHour = clockIn.getUTCHours();
        const localHour = clockIn.getHours();
        
        console.log(`UTC hour: ${utcHour}, Local hour: ${localHour}`);
        
        // If the UTC hour is in business hours (8-18), it might be intended as local time
        if (utcHour >= 8 && utcHour <= 18) {
            console.log('This looks like it should be local time, not UTC');
            // Convert UTC components to local time
            const year = clockIn.getUTCFullYear();
            const month = clockIn.getUTCMonth();
            const date = clockIn.getUTCDate();
            const hours = clockIn.getUTCHours();
            const minutes = clockIn.getUTCMinutes();
            const seconds = clockIn.getUTCSeconds();
            
            return new Date(year, month, date, hours, minutes, seconds);
        }
    }
    
    return clockIn;
}

const approach3 = smartTimezoneDetection(utcClockIn);
console.log('Approach 3 - Smart Timezone Detection:');
console.log(`Original UTC: ${utcClockIn.toLocaleString()}`);
console.log(`Smart converted: ${approach3.toLocaleString()}`);
console.log('');

// Test which approach gives us 12:31 PM
console.log('🎯 Target: We want 12:31 PM local time');
console.log(`Approach 1 result: ${approach1.toLocaleTimeString()}`);
console.log(`Approach 2 result: ${approach2.toLocaleTimeString()}`);
console.log(`Approach 3 result: ${approach3.toLocaleTimeString()}`);

// The correct approach should give us 12:31 PM
const targetTime = '12:31:00 PM';
console.log(`\nTarget time: ${targetTime}`);

if (approach3.toLocaleTimeString().includes('12:31')) {
    console.log('✅ Approach 3 (Smart Timezone Detection) works best!');
} else if (approach2.toLocaleTimeString().includes('12:31')) {
    console.log('✅ Approach 2 (Reconstruct in Local) works best!');
} else if (approach1.toLocaleTimeString().includes('12:31')) {
    console.log('✅ Approach 1 (UTC to Local Interpretation) works best!');
} else {
    console.log('❌ None of the approaches work perfectly. Need a different solution.');
}