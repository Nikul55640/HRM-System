/**
 * Mock Data Generator for Tests
 * Provides utilities for generating random test data
 */

import * as fc from 'fast-check';

/**
 * Generate random user data
 * @param {Object} overrides - Override default values
 * @returns {Object} User data
 */
export const generateUserData = (overrides = {}) => {
  return {
    email: `test${Date.now()}${Math.random()}@example.com`,
    password: 'Test@123456',
    role: 'Employee',
    isActive: true,
    ...overrides,
  };
};

/**
 * Generate random employee data
 * @param {Object} overrides - Override default values
 * @returns {Object} Employee data
 */
export const generateEmployeeData = (overrides = {}) => {
  return {
    personalInfo: {
      firstName: `FirstName${Math.random().toString(36).substring(7)}`,
      lastName: `LastName${Math.random().toString(36).substring(7)}`,
      dateOfBirth: new Date(1990, 0, 1),
      gender: 'Male',
    },
    contactInfo: {
      email: `employee${Date.now()}${Math.random()}@example.com`,
      phoneNumber: '1234567890',
    },
    jobInfo: {
      jobTitle: 'Software Engineer',
      hireDate: new Date(),
      employmentType: 'Full-time',
    },
    status: 'Active',
    ...overrides,
  };
};

/**
 * Generate random attendance record data
 * @param {Object} overrides - Override default values
 * @returns {Object} Attendance record data
 */
export const generateAttendanceData = (overrides = {}) => {
  const date = new Date();
  date.setHours(0, 0, 0, 0);

  const checkIn = new Date(date);
  checkIn.setHours(9, 0, 0, 0);

  const checkOut = new Date(date);
  checkOut.setHours(17, 0, 0, 0);

  return {
    date,
    checkIn,
    checkOut,
    breakTime: 60,
    shiftStart: '09:00',
    shiftEnd: '17:00',
    status: 'present',
    source: 'self',
    ...overrides,
  };
};

/**
 * Generate random leave request data
 * @param {Object} overrides - Override default values
 * @returns {Object} Leave request data
 */
export const generateLeaveRequestData = (overrides = {}) => {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() + 7); // 7 days from now

  const endDate = new Date(startDate);
  endDate.setDate(endDate.getDate() + 2); // 3 days leave

  return {
    type: 'annual',
    startDate,
    endDate,
    days: 3,
    reason: 'Personal reasons',
    status: 'pending',
    isHalfDay: false,
    ...overrides,
  };
};

/**
 * Generate random payslip data
 * @param {Object} overrides - Override default values
 * @returns {Object} Payslip data
 */
export const generatePayslipData = (overrides = {}) => {
  const currentDate = new Date();

  return {
    month: currentDate.getMonth() + 1,
    year: currentDate.getFullYear(),
    earnings: {
      basic: 50000,
      hra: 10000,
      allowances: [
        { name: 'Transport', amount: 2000 },
        { name: 'Food', amount: 1000 },
      ],
      bonus: 5000,
      overtime: 0,
      total: 68000,
    },
    deductions: {
      tax: 5000,
      providentFund: 6000,
      insurance: 1000,
      loan: 0,
      other: [],
      total: 12000,
    },
    netPay: 56000,
    status: 'draft',
    ...overrides,
  };
};

/**
 * Fast-check arbitrary for generating random dates
 * @param {Date} minDate - Minimum date
 * @param {Date} maxDate - Maximum date
 * @returns {fc.Arbitrary<Date>} Date arbitrary
 */
export const arbitraryDate = (minDate = new Date(2020, 0, 1), maxDate = new Date()) => {
  return fc.integer({ min: minDate.getTime(), max: maxDate.getTime() }).map(timestamp => new Date(timestamp));
};

/**
 * Fast-check arbitrary for generating random time strings (HH:MM)
 * @returns {fc.Arbitrary<string>} Time string arbitrary
 */
export const arbitraryTimeString = () => {
  return fc.tuple(
    fc.integer({ min: 0, max: 23 }),
    fc.integer({ min: 0, max: 59 })
  ).map(([hours, minutes]) => {
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
  });
};

/**
 * Fast-check arbitrary for generating random email addresses
 * @returns {fc.Arbitrary<string>} Email arbitrary
 */
export const arbitraryEmail = () => {
  return fc.tuple(
    fc.stringOf(fc.constantFrom(...'abcdefghijklmnopqrstuvwxyz0123456789'), { minLength: 5, maxLength: 15 }),
    fc.constantFrom('example.com', 'test.com', 'demo.com')
  ).map(([username, domain]) => `${username}@${domain}`);
};

/**
 * Fast-check arbitrary for generating random passwords
 * @returns {fc.Arbitrary<string>} Password arbitrary
 */
export const arbitraryPassword = () => {
  return fc.string({ minLength: 8, maxLength: 20 });
};

/**
 * Fast-check arbitrary for generating random user roles
 * @returns {fc.Arbitrary<string>} Role arbitrary
 */
export const arbitraryUserRole = () => {
  return fc.constantFrom('SuperAdmin', 'HR Manager', 'HR Administrator', 'Employee');
};

/**
 * Fast-check arbitrary for generating random leave types
 * @returns {fc.Arbitrary<string>} Leave type arbitrary
 */
export const arbitraryLeaveType = () => {
  return fc.constantFrom('annual', 'sick', 'personal', 'maternity', 'paternity', 'emergency');
};

/**
 * Fast-check arbitrary for generating random attendance status
 * @returns {fc.Arbitrary<string>} Attendance status arbitrary
 */
export const arbitraryAttendanceStatus = () => {
  return fc.constantFrom('present', 'absent', 'half_day', 'leave', 'holiday');
};

/**
 * Generate array of random data
 * @param {Function} generator - Generator function
 * @param {number} count - Number of items to generate
 * @returns {Array} Array of generated data
 */
export const generateArray = (generator, count = 5) => {
  return Array.from({ length: count }, () => generator());
};
