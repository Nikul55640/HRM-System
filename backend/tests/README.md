# Testing Infrastructure

This directory contains the testing infrastructure for the HRMS backend, including unit tests, integration tests, and property-based tests.

## Directory Structure

```
tests/
├── property/          # Property-based tests using fast-check
├── unit/             # Unit tests for individual functions/classes
├── integration/      # Integration tests for API endpoints
├── models/           # Model-specific tests
├── utils/            # Test utilities and helpers
│   ├── generators.js    # Property-based test generators
│   └── testHelpers.js   # Common test helper functions
├── setup.js          # Jest setup file
└── README.md         # This file
```

## Test Types

### Unit Tests
Unit tests verify specific examples, edge cases, and error conditions for individual components.

**Location:** `tests/unit/` or co-located with source files as `*.test.js`

**Example:**
```javascript
describe('calculateDuration', () => {
  test('calculates duration between two timestamps', () => {
    const start = new Date('2024-01-01T09:00:00');
    const end = new Date('2024-01-01T17:00:00');
    expect(calculateDuration(start, end)).toBe(480); // 8 hours = 480 minutes
  });
});
```

### Property-Based Tests
Property-based tests verify universal properties that should hold across all valid inputs using fast-check.

**Location:** `tests/property/*.property.test.js`

**Configuration:** Each property test runs a minimum of 100 iterations.

**Example:**
```javascript
import fc from 'fast-check';
import { runPropertyTest, validSessionGen } from '../utils/generators.js';

// **Feature: enhanced-attendance-system, Property 1: Session creation on clock-in**
test('clock-in creates session with server timestamp', () => {
  runPropertyTest(
    fc.property(employeeIdGen, workLocationGen, (employeeId, location) => {
      const session = clockIn(employeeId, location);
      expect(session).toBeDefined();
      expect(session.checkIn).toBeInstanceOf(Date);
      expect(session.workLocation).toBe(location);
    })
  );
});
```

### Integration Tests
Integration tests verify component interactions, especially API endpoints.

**Location:** `tests/integration/`

**Example:**
```javascript
import request from 'supertest';
import app from '../../src/app.js';

describe('POST /employee/attendance/session/start', () => {
  test('creates new session with valid data', async () => {
    const response = await request(app)
      .post('/employee/attendance/session/start')
      .set('Authorization', `Bearer ${token}`)
      .send({ workLocation: 'office' });
    
    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
  });
});
```

## Test Utilities

### Generators (`utils/generators.js`)

Smart generators for property-based testing:

- `objectIdGen` - MongoDB ObjectId strings
- `employeeIdGen` - Employee IDs
- `timestampGen()` - Timestamps within range
- `workLocationGen` - Work location values
- `ipAddressGen` - IPv4 addresses
- `validSessionGen` - Valid session objects
- `activeSessionGen` - Active sessions (no checkOut)
- `sessionWithBreaksGen` - Sessions with breaks
- `validBreakGen` - Valid break objects

### Helpers (`utils/testHelpers.js`)

Common test helper functions:

- `connectTestDB()` - Connect to in-memory MongoDB
- `disconnectTestDB()` - Disconnect test database
- `clearTestDB()` - Clear all collections
- `mockRequest()` - Create mock Express request
- `mockResponse()` - Create mock Express response
- `mockUser()` - Create mock user object
- `mockHRUser()` - Create mock HR admin user
- `createTestAttendanceData()` - Create test attendance record
- `createTestSessionData()` - Create test session
- `createTestBreakData()` - Create test break

## Running Tests

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run with coverage
npm run test:coverage

# Run only unit tests
npm run test:unit

# Run only integration tests
npm run test:integration

# Run only property-based tests
npm run test:property
```

## Writing Property Tests

### 1. Tag Each Property Test

Each property-based test must include a comment tag referencing the design document:

```javascript
// **Feature: enhanced-attendance-system, Property 1: Session creation on clock-in**
// **Validates: Requirements 1.1**
test('property description', () => {
  // test implementation
});
```

### 2. Use Smart Generators

Use constrained generators that produce valid test data:

```javascript
import { validSessionGen, runPropertyTest } from '../utils/generators.js';

runPropertyTest(
  fc.property(validSessionGen, (session) => {
    // session is guaranteed to have checkOut > checkIn
    expect(session.checkOut.getTime()).toBeGreaterThan(
      session.checkIn.getTime()
    );
  })
);
```

### 3. Test One Property Per Test

Each test should verify a single property:

```javascript
// Good: Tests one property
test('break duration equals end time minus start time', () => {
  runPropertyTest(
    fc.property(validBreakGen, (breakData) => {
      const expected = Math.round(
        (breakData.endTime - breakData.startTime) / (1000 * 60)
      );
      expect(breakData.durationMinutes).toBe(expected);
    })
  );
});

// Bad: Tests multiple properties
test('break is valid', () => {
  // Tests duration, timestamps, and ID format
});
```

### 4. Use Minimum 100 Iterations

All property tests use the standard configuration with 100+ iterations:

```javascript
import { propertyTestConfig, runPropertyTest } from '../utils/generators.js';

// Using runPropertyTest helper (recommended)
runPropertyTest(fc.property(/* ... */));

// Or manually with config
fc.assert(fc.property(/* ... */), propertyTestConfig);
```

## Best Practices

1. **Isolate Tests**: Each test should be independent and not rely on other tests
2. **Clean Up**: Use `beforeEach` and `afterEach` to set up and tear down test data
3. **Mock External Dependencies**: Use mocks for external services (email, notifications)
4. **Test Edge Cases**: Include tests for boundary conditions and error cases
5. **Descriptive Names**: Use clear, descriptive test names that explain what is being tested
6. **Fast Tests**: Keep tests fast by using in-memory database and avoiding unnecessary delays

## Coverage Goals

- **Unit Test Coverage**: 80%+ for business logic
- **Property Tests**: All correctness properties from design document
- **Integration Tests**: All critical user flows
- **Edge Cases**: All error conditions and boundary cases

## Troubleshooting

### Tests Timing Out

Increase the timeout in jest.config.js or for specific tests:

```javascript
test('slow test', async () => {
  // test code
}, 60000); // 60 second timeout
```

### MongoDB Connection Issues

Ensure mongodb-memory-server is properly installed:

```bash
npm install --save-dev mongodb-memory-server
```

### Fast-check Failures

When a property test fails, fast-check provides a counterexample. Use it to debug:

```
Property failed after 42 tests
{ seed: 123456789, path: "42:0", endOnFailure: true }
Counterexample: [ObjectId("507f1f77bcf86cd799439011"), "office"]
```

Re-run with the seed to reproduce:

```javascript
fc.assert(property, { seed: 123456789, path: "42:0" });
```
