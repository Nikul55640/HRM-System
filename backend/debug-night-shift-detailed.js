/**
 * Detailed debug of night shift with step-by-step service logic
 */

const clockInTime = new Date('2026-01-21T22:30:00'); // 10:30 PM
const shift = { shiftStartTime: '22:00:00', gracePeriodMinutes: 10 }; // 10:00 PM

console.log('🔍 Step-by-Step Service Logic Debug\n');

console.log('1. Initial Input:');
console.log(`   clockInTime: ${clockInTime.toLocaleString()}`);
console.log(`   shift: ${JSON.stringify(shift)}`);
console.log('');

// Step 1: Check if shift exists
if (!shift || !shift.shiftStartTime) {
    console.log('❌ Early return: No shift or shift start time');
} else {
    console.log('✅ Shift validation passed');
}

// Step 2: Initialize clockIn
let clockIn = new Date(clockInTime);
let wasUTCConverted = false;

console.log('\n2. Clock-in Processing:');
console.log(`   Initial clockIn: ${clockIn.toLocaleString()}`);

// Step 3: Check for UTC string conversion
if (typeof clockInTime === 'string' && clockInTime.includes('Z')) {
    console.log('   UTC string detected - would convert');
    wasUTCConverted = true;
} else {
    console.log('   Not a UTC string');
}

// Step 4: Check for UTC Date object conversion
if (!wasUTCConverted && clockInTime && typeof clockInTime === 'object') {
    console.log('   Checking Date object for UTC conversion...');
    const testInput = clockInTime.toString();
    console.log(`   toString(): ${testInput}`);
    console.log(`   toISOString(): ${clockInTime.toISOString()}`);
    console.log(`   Ends with Z: ${clockInTime.toISOString().endsWith('Z')}`);
    
    if (testInput && clockInTime.toISOString().endsWith('Z')) {
        const utcHour = clockInTime.getUTCHours();
        const localHour = clockInTime.getHours();
        
        console.log(`   UTC hour: ${utcHour}`);
        console.log(`   Local hour: ${localHour}`);
        console.log(`   Timezone offset: ${Math.abs(utcHour - localHour)}`);
        console.log(`   UTC hour in business hours (8-18): ${utcHour >= 8 && utcHour <= 18}`);
        console.log(`   Significant offset (>=5): ${Math.abs(utcHour - localHour) >= 5}`);
        
        if (Math.abs(utcHour - localHour) >= 5 && utcHour >= 8 && utcHour <= 18) {
            console.log('   ✅ Would convert UTC to local');
            const isoString = clockInTime.toISOString();
            const [datePart, timePart] = isoString.split('T');
            const timeOnly = timePart.split('.')[0];
            clockIn = new Date(`${datePart}T${timeOnly}`);
            wasUTCConverted = true;
            console.log(`   Converted clockIn: ${clockIn.toLocaleString()}`);
        } else {
            console.log('   ❌ No conversion - outside business hours or insufficient offset');
        }
    } else {
        console.log('   ❌ No conversion needed');
    }
} else {
    console.log('   Skipping Date object check (already converted or not an object)');
}

console.log(`\n3. Final clockIn: ${clockIn.toLocaleString()}`);
console.log(`   wasUTCConverted: ${wasUTCConverted}`);

// Step 5: Parse shift time
let shiftTimeStr = shift.shiftStartTime;
console.log(`\n4. Shift Time Parsing:`);
console.log(`   Original: ${shiftTimeStr}`);

if (!shiftTimeStr || typeof shiftTimeStr !== 'string') {
    console.log('   ❌ Invalid shift time');
} else if (!shiftTimeStr.includes(':')) {
    console.log('   ❌ Invalid format - no colon');
} else {
    if (shiftTimeStr.split(':').length === 2) {
        shiftTimeStr += ':00';
        console.log(`   Added seconds: ${shiftTimeStr}`);
    }
    console.log(`   ✅ Valid format: ${shiftTimeStr}`);
}

// Step 6: Create shift start time
const [hours, minutes, seconds] = shiftTimeStr.split(':').map(Number);
const shiftStart = new Date(clockIn);
shiftStart.setHours(hours, minutes, seconds || 0, 0);

console.log(`\n5. Shift Start Time Creation:`);
console.log(`   Hours: ${hours}, Minutes: ${minutes}, Seconds: ${seconds}`);
console.log(`   Shift start: ${shiftStart.toLocaleString()}`);

// Step 7: Calculate grace period
const gracePeriodMs = (shift.gracePeriodMinutes || 0) * 60 * 1000;
const lateThreshold = new Date(shiftStart.getTime() + gracePeriodMs);

console.log(`\n6. Grace Period Calculation:`);
console.log(`   Grace period: ${shift.gracePeriodMinutes} minutes`);
console.log(`   Grace period ms: ${gracePeriodMs}`);
console.log(`   Late threshold: ${lateThreshold.toLocaleString()}`);

// Step 8: Late calculation
let lateMinutes = 0;
let isLate = false;

console.log(`\n7. Late Calculation:`);
console.log(`   clockIn > lateThreshold: ${clockIn > lateThreshold}`);

if (clockIn > lateThreshold) {
    lateMinutes = Math.floor((clockIn - lateThreshold) / (1000 * 60));
    isLate = true;
    console.log(`   ✅ Employee is late by ${lateMinutes} minutes`);
} else {
    console.log(`   ❌ Employee is on time (this seems wrong!)`);
}

console.log(`\n8. Final Result:`);
console.log(`   isLate: ${isLate}`);
console.log(`   lateMinutes: ${lateMinutes}`);

// Debug timestamps
console.log(`\n9. Timestamp Debug:`);
console.log(`   clockIn timestamp: ${clockIn.getTime()}`);
console.log(`   lateThreshold timestamp: ${lateThreshold.getTime()}`);
console.log(`   Difference: ${clockIn.getTime() - lateThreshold.getTime()} ms`);
console.log(`   Difference in minutes: ${Math.floor((clockIn.getTime() - lateThreshold.getTime()) / (1000 * 60))}`);

if (clockIn.getTime() > lateThreshold.getTime()) {
    console.log('   🚨 Timestamps show employee should be late!');
} else {
    console.log('   ✅ Timestamps show employee is on time');
}