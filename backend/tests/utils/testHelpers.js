/**
 * Test Helper Utilities
 * Common functions for setting up and tearing down tests
 */

import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';

let mongoServer;

/**
 * Connect to in-memory MongoDB for testing
 */
export const connectTestDB = async () => {
  try {
    mongoServer = await MongoMemoryServer.create();
    const mongoUri = mongoServer.getUri();

    await mongoose.connect(mongoUri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log('Test database connected');
  } catch (error) {
    console.error('Test database connection error:', error);
    throw error;
  }
};

/**
 * Disconnect and stop in-memory MongoDB
 */
export const disconnectTestDB = async () => {
  try {
    await mongoose.disconnect();
    if (mongoServer) {
      await mongoServer.stop();
    }
    console.log('Test database disconnected');
  } catch (error) {
    console.error('Test database disconnection error:', error);
    throw error;
  }
};

/**
 * Clear all collections in the test database
 */
export const clearTestDB = async () => {
  const collections = mongoose.connection.collections;

  for (const key in collections) {
    const collection = collections[key];
    await collection.deleteMany({});
  }
};

/**
 * Create a mock request object
 */
export const mockRequest = (overrides = {}) => {
  return {
    body: {},
    params: {},
    query: {},
    headers: {},
    user: null,
    ip: '127.0.0.1',
    get: function (header) {
      return this.headers[header.toLowerCase()] || '';
    },
    ...overrides,
  };
};

/**
 * Create a mock response object
 */
export const mockResponse = () => {
  const res = {
    statusCode: 200,
    data: null,
    status: function (code) {
      this.statusCode = code;
      return this;
    },
    json: function (data) {
      this.data = data;
      return this;
    },
    send: function (data) {
      this.data = data;
      return this;
    },
  };
  return res;
};

/**
 * Create a mock user object for authentication
 */
export const mockUser = (overrides = {}) => {
  return {
    _id: new mongoose.Types.ObjectId(),
    id: new mongoose.Types.ObjectId(),
    employeeId: new mongoose.Types.ObjectId(),
    fullName: 'Test User',
    email: 'test@example.com',
    role: 'employee',
    ...overrides,
  };
};

/**
 * Create a mock HR admin user
 */
export const mockHRUser = (overrides = {}) => {
  return mockUser({
    role: 'hr',
    fullName: 'HR Admin',
    email: 'hr@example.com',
    ...overrides,
  });
};

/**
 * Wait for a specified time (for async operations)
 */
export const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Generate a date string in YYYY-MM-DD format
 */
export const formatDate = (date) => {
  return date.toISOString().split('T')[0];
};

/**
 * Create a date at start of day (00:00:00)
 */
export const startOfDay = (date = new Date()) => {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
};

/**
 * Create a date at end of day (23:59:59)
 */
export const endOfDay = (date = new Date()) => {
  const d = new Date(date);
  d.setHours(23, 59, 59, 999);
  return d;
};

/**
 * Add minutes to a date
 */
export const addMinutes = (date, minutes) => {
  return new Date(date.getTime() + minutes * 60 * 1000);
};

/**
 * Calculate difference in minutes between two dates
 */
export const diffInMinutes = (date1, date2) => {
  return Math.round((date2.getTime() - date1.getTime()) / (1000 * 60));
};

/**
 * Assert that two dates are approximately equal (within tolerance)
 */
export const assertDatesApproxEqual = (date1, date2, toleranceMs = 1000) => {
  const diff = Math.abs(date1.getTime() - date2.getTime());
  if (diff > toleranceMs) {
    throw new Error(
      `Dates not approximately equal: ${date1.toISOString()} vs ${date2.toISOString()} (diff: ${diff}ms)`
    );
  }
};

/**
 * Create test attendance record data
 */
export const createTestAttendanceData = (overrides = {}) => {
  const now = new Date();
  const today = startOfDay(now);

  return {
    employeeId: new mongoose.Types.ObjectId(),
    date: today,
    sessions: [],
    status: 'absent',
    source: 'self',
    ...overrides,
  };
};

/**
 * Create test session data
 */
export const createTestSessionData = (overrides = {}) => {
  const now = new Date();

  return {
    sessionId: new mongoose.Types.ObjectId().toString(),
    checkIn: now,
    checkOut: null,
    workLocation: 'office',
    locationDetails: null,
    ipAddressCheckIn: '192.168.1.1',
    ipAddressCheckOut: null,
    breaks: [],
    totalBreakMinutes: 0,
    workedMinutes: 0,
    status: 'active',
    ...overrides,
  };
};

/**
 * Create test break data
 */
export const createTestBreakData = (overrides = {}) => {
  const now = new Date();

  return {
    breakId: new mongoose.Types.ObjectId().toString(),
    startTime: now,
    endTime: null,
    durationMinutes: 0,
    ...overrides,
  };
};
