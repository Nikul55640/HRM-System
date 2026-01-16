# HRM System API Test Suite

Comprehensive API testing suite for all backend endpoints.

## Setup

1. Install dependencies (already done if you ran `npm install` in backend):
```bash
npm install
```

2. Configure test environment:
   - Copy `.env.test` and update with your test credentials
   - Ensure your backend server is running on the configured port

3. Make sure the backend server is running:
```bash
npm run dev
```

## Running Tests

Run the complete test suite:
```bash
npm run test:api
```

## Test Coverage

The test suite covers the following modules:

### Authentication & Health
- Health check endpoint
- User login
- Token verification
- Get current user

### Admin Dashboard
- Dashboard statistics
- Recent activity

### Employee Management
- List all employees
- Get employee details
- Employee management operations

### Departments & Designations
- List departments
- List designations

### Attendance Management
- Admin attendance records
- Live attendance tracking
- Attendance statistics
- Employee attendance records
- Attendance corrections
- Attendance status types

### Leave Management
- Admin leave requests
- Leave balances
- Leave rollover settings
- Employee leave requests
- Employee leave balance

### Shift Management
- Admin shift management
- Employee shift schedules
- Current shift information

### Calendar Management
- Holidays
- Company events
- Event types
- Smart calendar integration
- Working rules
- Calendarific integration
- Employee calendar view

### Profile & Settings
- Employee profile
- Emergency contacts
- Bank details
- User management
- System configuration

### Notifications
- Get notifications
- Unread count

### Leads Management
- Lead tracking and management

### Audit Logs
- System audit logs

### System Policies
- Policy management

### Work Locations
- Location management

### Bank Verification
- Bank account verification

### Help & Support
- Support ticket management

### Payslips
- Employee payslip access

### Employee Dashboard
- Dashboard data
- Recent activity

## Test Results

The test suite provides:
- Color-coded output (Pass/Fail/Skip)
- Detailed test summary
- Success rate calculation
- Failed test details
- Execution time

## Configuration

Edit `.env.test` to configure:
- `API_URL`: Backend API base URL
- `TEST_EMAIL`: Admin user email for authentication
- `TEST_PASSWORD`: Admin user password
- Additional test user credentials for different roles

## Notes

- Tests require a running backend server
- Some tests may be skipped if no data exists
- Authentication token is obtained once and reused
- Tests are non-destructive (read-only operations)
