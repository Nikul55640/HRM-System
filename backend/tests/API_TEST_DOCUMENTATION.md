# API Test Suite Documentation

## Overview
Comprehensive API testing suite for the HRM System backend. Tests all major endpoints across 18 different modules.

## Files Created

### 1. `api-test-suite.js`
Main test file containing all test cases organized by module:
- **Authentication & Health**: Login, token verification, health checks
- **Admin Dashboard**: Stats and recent activity
- **Employee Management**: CRUD operations for employees
- **Departments & Designations**: Organization structure
- **Attendance**: Admin and employee attendance tracking
- **Leave Management**: Leave requests and balances
- **Shift Management**: Shift schedules and assignments
- **Calendar**: Holidays, events, smart calendar, working rules
- **Profile & Settings**: User profiles and system configuration
- **Notifications**: Notification system
- **Leads**: Lead management
- **Audit Logs**: System audit trails
- **System Policies**: Policy management
- **Work Locations**: Location tracking
- **Bank Verification**: Bank account verification
- **Help & Support**: Support ticket system
- **Payslips**: Payroll documents
- **Employee Dashboard**: Employee-specific dashboard data

### 2. `.env.test`
Environment configuration for tests:
- API URL configuration
- Test user credentials for different roles
- Customizable test parameters

### 3. `test-config.js`
Centralized configuration file:
- Base URL and timeout settings
- Multiple user role credentials
- Test options (verbose, save report, etc.)
- Endpoint definitions for organized testing

### 4. `README.md`
Comprehensive documentation including:
- Setup instructions
- Test coverage details
- Configuration options
- Usage examples

### 5. `QUICK_START.md`
Quick reference guide for:
- Running tests immediately
- Troubleshooting common issues
- Understanding test output

## Test Statistics

**Total Test Categories**: 18
**Estimated Test Cases**: 50+
**Coverage**: All major backend endpoints

## Features

### ✅ Comprehensive Coverage
- Tests all authentication flows
- Covers admin and employee endpoints
- Validates all major modules

### ✅ Color-Coded Output
- Green for passed tests
- Red for failed tests
- Yellow for skipped tests

### ✅ Detailed Reporting
- Test summary with statistics
- Success rate calculation
- Failed test details
- Execution time tracking

### ✅ Smart Authentication
- Automatic login and token management
- Token reuse across tests
- Graceful handling of auth failures

### ✅ Non-Destructive
- Read-only operations
- Safe to run on production data
- No data modification

## Usage

### Basic Usage
```bash
npm run test:api
```

### With Custom Configuration
```bash
API_URL=http://localhost:3000/api TEST_EMAIL=admin@test.com npm run test:api
```

### Prerequisites
1. Backend server running
2. Database with test data
3. Valid test credentials

## Test Flow

1. **Health Check**: Verify server is running
2. **Authentication**: Login and obtain token
3. **Module Tests**: Run all endpoint tests
4. **Summary**: Display results and statistics

## Interpreting Results

### Success Indicators
- High pass rate (>90%)
- No critical endpoint failures
- Fast execution time (<10s)

### Warning Signs
- Authentication failures
- Multiple endpoint failures
- Slow response times

### Common Issues
- **Connection Refused**: Server not running
- **401 Unauthorized**: Invalid credentials
- **404 Not Found**: Endpoint path incorrect
- **500 Server Error**: Backend issue

## Extending Tests

To add new tests:

1. Create a new test function:
```javascript
async function testNewModule() {
  console.log(`\n${colors.cyan}=== NEW MODULE ===${colors.reset}`);
  
  const result = await apiRequest('GET', '/api/new-endpoint');
  logTest('Test Name', result.success ? 'PASS' : 'FAIL');
}
```

2. Add to main runner:
```javascript
await testNewModule();
```

## Best Practices

1. **Keep Tests Independent**: Each test should work standalone
2. **Use Descriptive Names**: Clear test names for easy debugging
3. **Handle Errors Gracefully**: Don't let one failure stop all tests
4. **Update Regularly**: Keep tests in sync with API changes
5. **Document Changes**: Update docs when adding new tests

## Integration with CI/CD

The test suite can be integrated into CI/CD pipelines:

```yaml
# Example GitHub Actions
- name: Run API Tests
  run: |
    npm run dev &
    sleep 5
    npm run test:api
```

## Performance Benchmarks

Expected execution times:
- **Fast**: <5 seconds (minimal data)
- **Normal**: 5-10 seconds (typical data)
- **Slow**: >10 seconds (large dataset or slow network)

## Security Considerations

- Test credentials should be different from production
- Use environment variables for sensitive data
- Never commit credentials to version control
- Rotate test credentials regularly

## Maintenance

Regular maintenance tasks:
1. Update test cases when API changes
2. Review and fix failing tests
3. Add tests for new endpoints
4. Update documentation
5. Monitor test execution times

## Support

For issues or questions:
1. Check QUICK_START.md for common solutions
2. Review test output for error details
3. Verify backend server logs
4. Check database connectivity

## Version History

- **v1.0.0**: Initial comprehensive test suite
  - 18 test modules
  - 50+ test cases
  - Full endpoint coverage
