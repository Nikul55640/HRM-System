/**
 * Debug UTC detection logic
 */

const utcTime = new Date('2026-01-21T12:31:00.000Z');

console.log('🔍 Debugging UTC Detection Logic\n');

console.log('UTC Time Analysis:');
console.log(`ISO String: ${utcTime.toISOString()}`);
console.log(`Local String: ${utcTime.toLocaleString()}`);
console.log(`UTC Hour: ${utcTime.getUTCHours()}`);
console.log(`Local Hour: ${utcTime.getHours()}`);
console.log(`Ends with Z: ${utcTime.toISOString().endsWith('Z')}`);
console.log('');

// Check the detection logic
const isoString = utcTime.toISOString();
const utcHour = utcTime.getUTCHours();
const localHour = utcTime.getHours();

console.log('Detection Logic:');
console.log(`UTC hour in business hours (6-20): ${utcHour >= 6 && utcHour <= 20}`);
console.log(`Local hour outside business hours: ${localHour < 6 || localHour > 20}`);
console.log(`Should convert: ${utcHour >= 6 && utcHour <= 20 && (localHour < 6 || localHour > 20)}`);
console.log('');

// Test the conversion
if (utcHour >= 6 && utcHour <= 20 && (localHour < 6 || localHour > 20)) {
    const [datePart, timePart] = isoString.split('T');
    const timeOnly = timePart.split('.')[0]; // Remove milliseconds and Z
    const converted = new Date(`${datePart}T${timeOnly}`);
    
    console.log('Conversion Result:');
    console.log(`Original: ${utcTime.toLocaleString()}`);
    console.log(`Converted: ${converted.toLocaleString()}`);
    console.log(`Converted ISO: ${converted.toISOString()}`);
} else {
    console.log('❌ Detection logic failed - no conversion applied');
    
    // Let's try a simpler approach
    console.log('\n🔧 Trying simpler approach:');
    const [datePart, timePart] = isoString.split('T');
    const timeOnly = timePart.split('.')[0]; // Remove milliseconds and Z
    const simpleConvert = new Date(`${datePart}T${timeOnly}`);
    
    console.log(`Simple conversion: ${simpleConvert.toLocaleString()}`);
    console.log(`Simple ISO: ${simpleConvert.toISOString()}`);
}