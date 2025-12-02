// Global test setup
const mongoose = require('mongoose');

// Increase timeout for all tests
jest.setTimeout(60000);

// Mock console methods to reduce noise during tests
global.console = {
  ...console,
  log: jest.fn(),
  debug: jest.fn(),
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
};

// Global test teardown
afterAll(async () => {
  // Close any remaining database connections
  if (mongoose.connection.readyState !== 0) {
    await mongoose.connection.close();
  }
});