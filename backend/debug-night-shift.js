/**
 * Debug night shift calculation
 */

import AttendanceCalculationService from './src/services/core/attendanceCalculation.service.js';

const clockIn = new Date('2026-01-21T22:30:00'); // 10:30 PM
const shift = { shiftStartTime: '22:00:00', gracePeriodMinutes: 10 }; // 10:00 PM

console.log('🔍 Debugging Night Shift Calculation\n');

console.log('Input Data:');
console.log(`Clock-in: ${clockIn.toLocaleString()}`);
console.log(`Shift start: ${shift.shiftStartTime}`);
console.log(`Grace period: ${shift.gracePeriodMinutes} minutes`);
console.log('');

// Manual calculation
const shiftStart = new Date(clockIn);
const [hours, minutes, seconds] = shift.shiftStartTime.split(':').map(Number);
shiftStart.setHours(hours, minutes, seconds || 0, 0);

console.log('Manual Calculation:');
console.log(`Clock-in time: ${clockIn.toLocaleString()}`);
console.log(`Shift start time: ${shiftStart.toLocaleString()}`);
console.log(`Clock-in > Shift start: ${clockIn > shiftStart}`);

const timeDiff = clockIn.getTime() - shiftStart.getTime();
const diffMinutes = Math.floor(timeDiff / (1000 * 60));
console.log(`Time difference: ${diffMinutes} minutes`);

const gracePeriodMs = shift.gracePeriodMinutes * 60 * 1000;
const lateThreshold = new Date(shiftStart.getTime() + gracePeriodMs);
console.log(`Late threshold: ${lateThreshold.toLocaleString()}`);
console.log(`Clock-in > Late threshold: ${clockIn > lateThreshold}`);

if (clockIn > lateThreshold) {
    const lateMinutes = Math.floor((clockIn - lateThreshold) / (1000 * 60));
    console.log(`Should be late by: ${lateMinutes} minutes`);
} else {
    console.log('Should be on time');
}

console.log('');

// Test with the service
const result = AttendanceCalculationService.calculateLateStatus(clockIn, shift);
console.log('Service Result:');
console.log(`Is Late: ${result.isLate}`);
console.log(`Late Minutes: ${result.lateMinutes}`);
console.log(`Shift Start (parsed): ${result.shiftStartTime.toLocaleString()}`);
console.log(`Late Threshold: ${result.lateThreshold.toLocaleString()}`);

// Check if there's a timezone issue
console.log('\nTimezone Analysis:');
console.log(`Clock-in timestamp: ${clockIn.getTime()}`);
console.log(`Service shift start timestamp: ${result.shiftStartTime.getTime()}`);
console.log(`Service late threshold timestamp: ${result.lateThreshold.getTime()}`);

const serviceDiff = clockIn.getTime() - result.shiftStartTime.getTime();
const serviceDiffMinutes = Math.floor(serviceDiff / (1000 * 60));
console.log(`Service time difference: ${serviceDiffMinutes} minutes`);

if (serviceDiffMinutes !== diffMinutes) {
    console.log('❌ Timezone issue detected! Service calculation differs from manual calculation.');
} else {
    console.log('✅ No timezone issue - calculations match.');
}