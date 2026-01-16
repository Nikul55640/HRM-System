# Quick Start Guide - API Testing

## Prerequisites
1. Backend server must be running
2. Database must be set up with test data

## Steps to Run Tests

### 1. Start the Backend Server
```bash
cd HRM-System/backend
npm run dev
```

### 2. Configure Test Credentials (Optional)
Edit `tests/.env.test` if you need different credentials:
```env
API_URL=http://localhost:5000/api
TEST_EMAIL=admin@example.com
TEST_PASSWORD=admin123
```

### 3. Run the Test Suite
In a new terminal:
```bash
cd HRM-System/backend
npm run test:api
```

## Expected Output

You'll see color-coded test results:
- 🟢 **[PASS]** - Test passed successfully
- 🔴 **[FAIL]** - Test failed (check error message)
- 🟡 **[SKIP]** - Test skipped (usually due to missing data)

## Example Output
```
╔════════════════════════════════════════════════════╗
║     HRM SYSTEM - COMPREHENSIVE API TEST SUITE     ║
╚════════════════════════════════════════════════════╝

Base URL: http://localhost:5000/api
Started at: 1/16/2026, 10:30:00 AM

=== HEALTH CHECK & AUTHENTICATION ===
[PASS] Health Check - Server is running
[PASS] Login - Token received
[PASS] Token Verification
[PASS] Get Current User

=== ADMIN DASHBOARD ===
[PASS] Get Dashboard Stats
[PASS] Get Recent Activity

...

╔════════════════════════════════════════════════════╗
║                   TEST SUMMARY                     ║
╚════════════════════════════════════════════════════╝
✓ Passed:  45
✗ Failed:  2
⊘ Skipped: 3
Total:     50
Duration:  5.23s
Success Rate: 90.00%
```

## Troubleshooting

### Authentication Failed
- Verify backend server is running
- Check credentials in `.env.test`
- Ensure test user exists in database

### Connection Refused
- Confirm backend server is running on correct port
- Check `API_URL` in `.env.test`

### Many Tests Failing
- Ensure database is seeded with test data
- Run migrations: `npm run migrate`
- Run seed: `npm run seed`

## Testing Individual Modules

To test specific functionality, you can modify the test file to run only certain test functions. Edit `tests/api-test-suite.js` and comment out test functions you don't want to run.

## Next Steps

After running tests:
1. Review failed tests in the summary
2. Check error messages for debugging
3. Fix issues in the backend code
4. Re-run tests to verify fixes
