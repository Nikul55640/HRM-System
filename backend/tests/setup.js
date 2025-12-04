/**
 * Jest Setup File
 * Runs before all tests
 */

// Set test environment variables
process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'test-jwt-secret-key-for-testing-only';
process.env.JWT_REFRESH_SECRET = 'test-refresh-secret-key-for-testing-only';
process.env.JWT_ACCESS_EXPIRY = '15m';
process.env.JWT_REFRESH_EXPIRY = '7d';

// Global test utilities
global.testUtils = {
  // Add global test utilities here
};

// Suppress console output during tests (optional)
// global.console = {
//   ...console,
//   log: () => {},
//   debug: () => {},
//   info: () => {},
//   warn: () => {},
//   error: () => {},
// };
