/**
 * Property-Based Testing Generators
 * Smart generators for common data types used in attendance system
 */

import fc from 'fast-check';
import { v4 as uuidv4 } from 'uuid';

/**
 * Generate valid UUID strings
 */
export const uuidGen = fc.constant(uuidv4());

/**
 * Generate valid employee IDs (integers)
 */
export const employeeIdGen = fc.integer({ min: 1, max: 999999 });

/**
 * Generate timestamps within a reasonable range
 * Default: 2024-01-01 to 2025-12-31
 */
export const timestampGen = (options = {}) => {
  const min = options.min || new Date('2024-01-01');
  const max = options.max || new Date('2025-12-31');
  return fc.date({ min, max });
};

/**
 * Generate work location values
 */
export const workLocationGen = fc.constantFrom('office', 'wfh', 'client_site');

/**
 * Generate IPv4 addresses
 */
export const ipAddressGen = fc.ipV4();

/**
 * Generate valid time strings in HH:MM format
 */
export const timeStringGen = fc
  .tuple(fc.integer({ min: 0, max: 23 }), fc.integer({ min: 0, max: 59 }))
  .map(([hour, minute]) => {
    const h = hour.toString().padStart(2, '0');
    const m = minute.toString().padStart(2, '0');
    return `${h}:${m}`;
  });

/**
 * Generate location details for client sites
 */
export const locationDetailsGen = fc.string({
  minLength: 5,
  maxLength: 200,
});

/**
 * Generate valid break objects
 * Ensures endTime > startTime
 */
export const validBreakGen = fc
  .tuple(timestampGen(), fc.integer({ min: 5, max: 120 }))
  .map(([startTime, durationMinutes]) => {
    const endTime = new Date(startTime.getTime() + durationMinutes * 60 * 1000);
    return {
      breakId: uuidv4(),
      startTime,
      endTime,
      durationMinutes,
    };
  });

/**
 * Generate valid session objects
 * Ensures checkOut > checkIn
 */
export const validSessionGen = fc
  .tuple(
    timestampGen(),
    fc.integer({ min: 60, max: 600 }), // 1-10 hours in minutes
    workLocationGen,
    fc.option(locationDetailsGen, { nil: null })
  )
  .map(([checkIn, durationMinutes, workLocation, locationDetails]) => {
    const checkOut = new Date(checkIn.getTime() + durationMinutes * 60 * 1000);
    return {
      sessionId: uuidv4(),
      checkIn,
      checkOut,
      workLocation,
      locationDetails:
        workLocation === 'client_site' ? locationDetails || 'Client Office' : null,
      ipAddressCheckIn: fc.sample(ipAddressGen, 1)[0],
      ipAddressCheckOut: fc.sample(ipAddressGen, 1)[0],
      breaks: [],
      totalBreakMinutes: 0,
      workedMinutes: durationMinutes,
      status: 'completed',
    };
  });

/**
 * Generate active session (no checkOut)
 */
export const activeSessionGen = fc
  .tuple(timestampGen(), workLocationGen, fc.option(locationDetailsGen, { nil: null }))
  .map(([checkIn, workLocation, locationDetails]) => ({
    sessionId: uuidv4(),
    checkIn,
    checkOut: null,
    workLocation,
    locationDetails:
      workLocation === 'client_site' ? locationDetails || 'Client Office' : null,
    ipAddressCheckIn: fc.sample(ipAddressGen, 1)[0],
    ipAddressCheckOut: null,
    breaks: [],
    totalBreakMinutes: 0,
    workedMinutes: 0,
    status: 'active',
  }));

/**
 * Generate session with breaks
 * Ensures breaks are within session time and don't overlap
 */
export const sessionWithBreaksGen = fc
  .tuple(
    timestampGen(),
    fc.integer({ min: 240, max: 600 }), // 4-10 hours for sessions with breaks
    workLocationGen,
    fc.integer({ min: 1, max: 3 }) // 1-3 breaks
  )
  .map(([checkIn, durationMinutes, workLocation, breakCount]) => {
    const checkOut = new Date(checkIn.getTime() + durationMinutes * 60 * 1000);
    const sessionDuration = durationMinutes * 60 * 1000; // in ms

    // Generate breaks within the session
    const breaks = [];
    let totalBreakMinutes = 0;
    const breakDuration = 15; // 15 minutes per break

    for (let i = 0; i < breakCount; i++) {
      // Space breaks evenly within the session
      const breakStartOffset = ((i + 1) * sessionDuration) / (breakCount + 1);
      const breakStart = new Date(checkIn.getTime() + breakStartOffset);
      const breakEnd = new Date(breakStart.getTime() + breakDuration * 60 * 1000);

      breaks.push({
        breakId: uuidv4(),
        startTime: breakStart,
        endTime: breakEnd,
        durationMinutes: breakDuration,
      });

      totalBreakMinutes += breakDuration;
    }

    return {
      sessionId: uuidv4(),
      checkIn,
      checkOut,
      workLocation,
      locationDetails: null,
      ipAddressCheckIn: fc.sample(ipAddressGen, 1)[0],
      ipAddressCheckOut: fc.sample(ipAddressGen, 1)[0],
      breaks,
      totalBreakMinutes,
      workedMinutes: durationMinutes - totalBreakMinutes,
      status: 'completed',
    };
  });

/**
 * Generate date-only (no time component)
 */
export const dateOnlyGen = timestampGen().map((date) => {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
});

/**
 * Generate employee data
 */
export const employeeDataGen = fc.record({
  employeeId: employeeIdGen,
  fullName: fc.string({ minLength: 3, maxLength: 50 }),
  email: fc.emailAddress(),
  department: fc.constantFrom('Engineering', 'HR', 'Sales', 'Marketing', 'Finance'),
});

/**
 * Configuration for property tests
 * Ensures minimum 100 iterations
 */
export const propertyTestConfig = {
  numRuns: 100,
  verbose: false,
};

/**
 * Helper to run property tests with standard config
 */
export const runPropertyTest = (property) => {
  return fc.assert(property, propertyTestConfig);
};