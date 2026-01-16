# Complete Testing Guide

## 🎯 Overview

This comprehensive API test suite validates all backend endpoints of your HRM System.

## 📊 Test Architecture

```
┌─────────────────────────────────────────────────────────┐
│                   API Test Suite                        │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐ │
│  │ Health Check │  │     Auth     │  │   Dashboard  │ │
│  │   (1 test)   │  │  (4 tests)   │  │  (2 tests)   │ │
│  └──────────────┘  └──────────────┘  └──────────────┘ │
│                                                         │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐ │
│  │  Employees   │  │  Attendance  │  │    Leave     │ │
│  │  (3 tests)   │  │  (8 tests)   │  │  (5 tests)   │ │
│  └──────────────┘  └──────────────┘  └──────────────┘ │
│                                                         │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐ │
│  │   Shifts     │  │   Calendar   │  │   Profile    │ │
│  │  (3 tests)   │  │  (7 tests)   │  │  (5 tests)   │ │
│  └──────────────┘  └──────────────┘  └──────────────┘ │
│                                                         │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐ │
│  │Notifications │  │    Leads     │  │  Audit Logs  │ │
│  │  (2 tests)   │  │  (1 test)    │  │  (1 test)    │ │
│  └──────────────┘  └──────────────┘  └──────────────┘ │
│                                                         │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐ │
│  │   Policies   │  │  Locations   │  │Bank Verify   │ │
│  │  (1 test)    │  │  (1 test)    │  │  (1 test)    │ │
│  └──────────────┘  └──────────────┘  └──────────────┘ │
│                                                         │
│  ┌──────────────┐  ┌──────────────┐                   │
│  │   Support    │  │   Payslips   │                   │
│  │  (1 test)    │  │  (1 test)    │                   │
│  └──────────────┘  └──────────────┘                   │
│                                                         │
└─────────────────────────────────────────────────────────┘
         Total: 50+ Tests across 18 Modules
```

## 🚦 Test Flow

```
START
  │
  ├─► 1. Health Check
  │     └─► Verify server is running
  │
  ├─► 2. Authentication
  │     ├─► Login with credentials
  │     ├─► Receive JWT token
  │     └─► Store token for subsequent requests
  │
  ├─► 3. Run Module Tests (in parallel)
  │     ├─► Admin endpoints
  │     ├─► Employee endpoints
  │     └─► System endpoints
  │
  ├─► 4. Collect Results
  │     ├─► Count passed tests
  │     ├─► Count failed tests
  │     └─► Count skipped tests
  │
  └─► 5. Generate Report
        ├─► Display summary
        ├─► Show failed tests
        └─► Calculate success rate
END
```

## 🔑 Authentication Flow

```
┌──────────────┐
│   Test Run   │
└──────┬───────┘
       │
       ▼
┌──────────────────────┐
│  POST /auth/login    │
│  {email, password}   │
└──────┬───────────────┘
       │
       ▼
┌──────────────────────┐
│  Receive JWT Token   │
└──────┬───────────────┘
       │
       ▼
┌──────────────────────┐
│ Store in authToken   │
└──────┬───────────────┘
       │
       ▼
┌──────────────────────┐
│  Use in all requests │
│  Authorization:      │
│  Bearer <token>      │
└──────────────────────┘
```

## 📋 Test Categories

### 1. Core System Tests
- Health check
- Authentication
- Configuration

### 2. Admin Tests
- Dashboard statistics
- Employee management
- Attendance management
- Leave management
- System administration

### 3. Employee Tests
- Personal dashboard
- Attendance tracking
- Leave requests
- Profile management
- Shift schedules

### 4. Integration Tests
- Calendar integration
- Notification system
- Bank verification
- Audit logging

## 🎨 Output Color Coding

```
🟢 [PASS]  - Test passed successfully
🔴 [FAIL]  - Test failed (needs attention)
🟡 [SKIP]  - Test skipped (usually no data)
```

## 📈 Success Metrics

| Metric | Good | Warning | Critical |
|--------|------|---------|----------|
| Pass Rate | >95% | 85-95% | <85% |
| Failed Tests | 0-2 | 3-5 | >5 |
| Response Time | <5s | 5-10s | >10s |

## 🔍 Test Details by Module

### Authentication (4 tests)
- ✓ Health check endpoint
- ✓ User login
- ✓ Token verification
- ✓ Get current user

### Admin Dashboard (2 tests)
- ✓ Dashboard statistics
- ✓ Recent activity feed

### Employee Management (3 tests)
- ✓ List all employees
- ✓ Get employee details
- ✓ Employee management operations

### Attendance (8 tests)
- ✓ Admin attendance records
- ✓ Live attendance tracking
- ✓ Attendance statistics
- ✓ Employee attendance
- ✓ Today's attendance
- ✓ Attendance corrections
- ✓ Correction requests
- ✓ Attendance status types

### Leave Management (5 tests)
- ✓ Admin leave requests
- ✓ Leave balances
- ✓ Rollover settings
- ✓ Employee leave requests
- ✓ Employee leave balance

### Shift Management (3 tests)
- ✓ All shifts
- ✓ Employee shifts
- ✓ Current shift

### Calendar (7 tests)
- ✓ Holidays
- ✓ Company events
- ✓ Event types
- ✓ Smart calendar
- ✓ Working rules
- ✓ Calendarific integration
- ✓ Employee calendar

### Profile & Settings (5 tests)
- ✓ Employee profile
- ✓ Emergency contacts
- ✓ Bank details
- ✓ User management
- ✓ System configuration

### Additional Modules (9 tests)
- ✓ Notifications (2)
- ✓ Leads (1)
- ✓ Audit logs (1)
- ✓ System policies (1)
- ✓ Work locations (1)
- ✓ Bank verification (1)
- ✓ Help & support (1)
- ✓ Payslips (1)

## 🛠️ Customization

### Adding New Tests

```javascript
async function testNewFeature() {
  console.log(`\n${colors.cyan}=== NEW FEATURE ===${colors.reset}`);
  
  const result = await apiRequest('GET', '/api/new-endpoint');
  logTest('New Feature Test', result.success ? 'PASS' : 'FAIL');
}
```

### Modifying Credentials

Edit `tests/.env.test`:
```env
TEST_EMAIL=your-admin@example.com
TEST_PASSWORD=your-password
```

### Changing Base URL

```env
API_URL=http://your-server:port/api
```

## 📊 Sample Test Report

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

=== EMPLOYEE MANAGEMENT ===
[PASS] Get All Employees
[PASS] Get Employee List (Admin)
[PASS] Get Employee Details

... (more tests)

╔════════════════════════════════════════════════════╗
║                   TEST SUMMARY                     ║
╚════════════════════════════════════════════════════╝
✓ Passed:  48
✗ Failed:  0
⊘ Skipped: 2
Total:     50
Duration:  4.52s
Success Rate: 96.00%
```

## 🚨 Common Issues & Solutions

### Issue: "ECONNREFUSED"
**Solution**: Start backend server
```bash
npm run dev
```

### Issue: "401 Unauthorized"
**Solution**: Check credentials in `.env.test`

### Issue: "404 Not Found"
**Solution**: Verify endpoint paths in test file

### Issue: "Timeout"
**Solution**: Increase timeout in test-config.js

## 🎓 Best Practices

1. **Run tests regularly** - After every major change
2. **Keep credentials secure** - Use environment variables
3. **Update tests** - When API changes
4. **Review failures** - Don't ignore failed tests
5. **Document changes** - Update docs when adding tests

## 📚 Additional Resources

- **README.md** - Setup and configuration
- **QUICK_START.md** - Quick reference
- **API_TEST_DOCUMENTATION.md** - Technical details
- **TEST_SUITE_SUMMARY.md** - Overview

---

**Happy Testing! 🚀**
