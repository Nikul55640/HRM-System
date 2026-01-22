/**
 * Debug script to understand the late calculation issue
 */

import AttendanceCalculationService from './src/services/core/attendanceCalculation.service.js';

console.log('🔍 Debugging Late Calculation Issue - Cross-day Night Shift\n');

// Test the failing cross-day night shift case
const clockIn = new Date('2026-01-21T22:30:00.000Z'); // 10:30 PM UTC on Jan 21
const attendanceDate = '2026-01-22'; // Attendance date is Jan 22
const shift = {
    shiftStartTime: '22:00:00', // Shift starts at 10:00 PM
    gracePeriodMinutes: 15 // Grace until 10:15 PM
};

console.log('Input Data:');
console.log(`Clock-in: ${clockIn.toISOString()} (${clockIn.toLocaleString()})`);
console.log(`Attendance Date: ${attendanceDate}`);
console.log(`Shift Start: ${shift.shiftStartTime}`);
console.log(`Grace Period: ${shift.gracePeriodMinutes} minutes`);

const result = AttendanceCalculationService.calculateLateStatus(clockIn, shift, attendanceDate);

console.log('\nResult:');
console.log(`Is Late: ${result.isLate}`);
console.log(`Late Minutes: ${result.lateMinutes}`);
console.log(`Shift Start Time: ${result.shiftStartTime?.toISOString()} (${result.shiftStartTime?.toLocaleString()})`);
console.log(`Late Threshold: ${result.lateThreshold?.toISOString()} (${result.lateThreshold?.toLocaleString()})`);

// The issue: For night shifts, the shift start time should be on the PREVIOUS day
// when the attendance date is the next day
console.log('\n🔍 Analysis:');
console.log('For night shifts that span days:');
console.log('- Clock-in: 2026-01-21 22:30 UTC (Jan 21, 10:30 PM)');
console.log('- Attendance Date: 2026-01-22 (Jan 22)');
console.log('- Shift Start: 22:00:00 (10:00 PM)');
console.log('- Expected Shift Start: 2026-01-21 22:00 UTC (Jan 21, 10:00 PM)');
console.log('- Current Shift Start: 2026-01-22 22:00 UTC (Jan 22, 10:00 PM)');
console.log('\nThe shift start should be on Jan 21, not Jan 22!');