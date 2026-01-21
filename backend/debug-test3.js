/**
 * Debug Test 3 issue
 */

const testTime = new Date('2026-01-21T13:25:00'); // 1:25 PM - should be late

console.log('🔍 Debugging Test 3 Issue\n');

console.log('Test Time Analysis:');
console.log(`Original: new Date('2026-01-21T13:25:00')`);
console.log(`ISO String: ${testTime.toISOString()}`);
console.log(`Local String: ${testTime.toLocaleString()}`);
console.log(`Ends with Z: ${testTime.toISOString().endsWith('Z')}`);
console.log('');

// Check if this is being treated as UTC
const isoString = testTime.toISOString();
console.log('UTC Conversion Check:');
console.log(`ISO ends with Z: ${isoString.endsWith('Z')}`);

if (isoString.endsWith('Z')) {
    console.log('❌ This is being treated as UTC when it should be local!');
    
    // Show what the conversion would do
    const [datePart, timePart] = isoString.split('T');
    const timeOnly = timePart.split('.')[0];
    const converted = new Date(`${datePart}T${timeOnly}`);
    
    console.log(`Would convert to: ${converted.toLocaleString()}`);
} else {
    console.log('✅ This is correctly treated as local time');
}

// Test shift comparison
const shiftStart = new Date(testTime);
shiftStart.setHours(13, 0, 0, 0); // 1:00 PM

console.log('\nShift Comparison:');
console.log(`Clock-in: ${testTime.toLocaleString()}`);
console.log(`Shift start: ${shiftStart.toLocaleString()}`);
console.log(`Clock-in > Shift start: ${testTime > shiftStart}`);
console.log(`Time difference: ${Math.floor((testTime - shiftStart) / (1000 * 60))} minutes`);

// Test with grace period
const gracePeriod = 10 * 60 * 1000; // 10 minutes in ms
const lateThreshold = new Date(shiftStart.getTime() + gracePeriod);

console.log(`Late threshold: ${lateThreshold.toLocaleString()}`);
console.log(`Clock-in > Late threshold: ${testTime > lateThreshold}`);
console.log(`Should be late: ${testTime > lateThreshold}`);

if (testTime > lateThreshold) {
    const lateMinutes = Math.floor((testTime - lateThreshold) / (1000 * 60));
    console.log(`Late by: ${lateMinutes} minutes`);
} else {
    console.log('Should be on time');
}