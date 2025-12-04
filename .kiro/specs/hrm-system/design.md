# Design Document - HRM System

## Overview

The HRM System is a full-stack web application built using the MERN stack (MongoDB, Express, React, Node.js) with Redux for state management. The system implements a role-based access control architecture with four distinct user roles, providing comprehensive HR management capabilities including employee lifecycle management, attendance tracking, leave management, payroll processing, and audit logging.

### Technology Stack

**Backend:**
- Node.js v16+ with Express.js framework
- MongoDB with Mongoose ODM
- JWT for authentication
- bcrypt for password hashing
- Winston for logging
- Multer for file uploads
- PDFKit for PDF generation

**Frontend:**
- React 18 with functional components and hooks
- Redux Toolkit for state management
- React Router v6 for routing
- Tailwind CSS for styling
- Radix UI components
- Framer Motion for animations
- Axios for HTTP requests

**Infrastructure:**
- Docker and Docker Compose for containerization
- Redis for caching (configured)
- Nginx for reverse proxy (optional)

## Architecture

### System Architecture Pattern

The system follows a **three-tier architecture**:

1. **Presentation Layer** (Frontend)
   - React components organized by features
   - Redux store for centralized state management
   - Service layer for API communication

2. **Application Layer** (Backend)
   - RESTful API endpoints
   - Controller-Service pattern for business logic
   - Middleware for authentication, authorization, and validation

3. **Data Layer** (Database)
   - MongoDB for persistent storage
   - Mongoose schemas with validation and hooks
   - Indexes for query optimization

### Authentication Flow

```
Client Request → CORS Middleware → Helmet Security Headers
    ↓
JWT Verification Middleware → Role Authorization Middleware
    ↓
Input Validation → Controller → Service Layer
    ↓
Database Operations → Audit Logging → Response
```

### Request/Response Flow

```
Frontend Component
    ↓
Redux Thunk Action
    ↓
API Service (Axios)
    ↓
Backend Route Handler
    ↓
Authentication Middleware
    ↓
Authorization Middleware
    ↓
Controller
    ↓
Service Layer (Business Logic)
    ↓
Mongoose Model
    ↓
MongoDB Database
```

## Components and Interfaces

### Backend Components

#### 1. Authentication Module
**Location:** `backend/src/controllers/authController.js`

**Responsibilities:**
- User login with JWT token generation
- Token refresh mechanism
- Password hashing and verification
- Session management

**Key Methods:**
- `login(req, res)` - Authenticates user and returns tokens
- `logout(req, res)` - Invalidates user session
- `refreshToken(req, res)` - Issues new access token
- `changePassword(req, res)` - Updates user password

#### 2. Employee Management Module
**Location:** `backend/src/controllers/employeeController.js`

**Responsibilities:**
- CRUD operations for employee records
- Auto-generation of employee IDs
- Department and manager assignment
- Employee status management

**Key Methods:**
- `createEmployee(req, res)` - Creates new employee with auto-generated ID
- `getEmployees(req, res)` - Lists employees with pagination and filters
- `getEmployeeById(req, res)` - Retrieves single employee details
- `updateEmployee(req, res)` - Updates employee information
- `deleteEmployee(req, res)` - Soft deletes employee record

#### 3. Attendance Module
**Location:** `backend/src/controllers/employee/attendanceController.js`

**Responsibilities:**
- Clock-in/clock-out processing
- Work hours calculation
- Late arrival and early departure detection
- Overtime calculation
- Monthly attendance summaries

**Key Methods:**
- `clockIn(req, res)` - Records employee clock-in with timestamp and location
- `clockOut(req, res)` - Records clock-out and calculates work hours
- `getAttendanceRecords(req, res)` - Retrieves attendance history
- `getMonthlySummary(req, res)` - Aggregates monthly attendance statistics

#### 4. Leave Management Module
**Location:** `backend/src/controllers/admin/leaveRequestController.js`

**Responsibilities:**
- Leave request submission and validation
- Overlap detection
- Approval/rejection workflow
- Leave balance management

**Key Methods:**
- `createLeaveRequest(req, res)` - Submits new leave request
- `getLeaveRequests(req, res)` - Lists leave requests with filters
- `approveLeaveRequest(req, res)` - Approves leave and updates balance
- `rejectLeaveRequest(req, res)` - Rejects leave with reason

#### 5. Payroll Module
**Location:** `backend/src/controllers/admin/payrollController.js`

**Responsibilities:**
- Payslip generation with salary calculations
- Deduction calculations (tax, PF, insurance)
- PDF payslip generation
- Bulk payslip processing

**Key Methods:**
- `generatePayslips(req, res)` - Bulk generates payslips for month
- `getPayslipById(req, res)` - Retrieves single payslip
- `deletePayslip(req, res)` - Removes payslip record
- `getPayrollDashboard(req, res)` - Returns payroll statistics

#### 6. Audit Logging Module
**Location:** `backend/src/services/auditService.js`

**Responsibilities:**
- Logging all system actions
- Tracking user activities
- Compliance record keeping

**Key Methods:**
- `logAction(userId, action, resource, details)` - Creates audit log entry
- `getAuditLogs(filters)` - Retrieves filtered audit logs
- `exportAuditLogs(format)` - Exports logs in JSON/CSV

### Frontend Components

#### 1. Authentication Components
**Location:** `frontend/src/features/auth/`

**Components:**
- `Login.jsx` - Login form with validation
- `ProtectedRoute.jsx` - Route guard for authenticated access

#### 2. Dashboard Components
**Location:** `frontend/src/features/dashboard/`

**Components:**
- `DashboardHome.jsx` - Main dashboard container
- `EmployeeDashboard.jsx` - Employee-specific dashboard
- `ManagerDashboard.jsx` - Manager-specific dashboard
- `AdminDashboard.jsx` - Admin-specific dashboard

#### 3. Employee Management Components
**Location:** `frontend/src/features/employees/`

**Components:**
- `EmployeeDirectory.jsx` - Employee listing with search/filter
- `EmployeeProfile.jsx` - Detailed employee view
- `EmployeeForm.jsx` - Create/edit employee form

#### 4. Attendance Components
**Location:** `frontend/src/features/ess/attendance/`

**Components:**
- `AttendanceTracker.jsx` - Clock-in/out interface
- `AttendanceCalendar.jsx` - Calendar view of attendance
- `AttendanceSummary.jsx` - Monthly summary display

#### 5. Leave Management Components
**Location:** `frontend/src/features/ess/leave/`

**Components:**
- `LeaveRequestForm.jsx` - Leave request submission
- `LeaveHistory.jsx` - Leave request history
- `LeaveBalance.jsx` - Leave balance display

### API Interfaces

#### Authentication Endpoints

```
POST /api/auth/login
Request: { email: string, password: string }
Response: { 
  success: boolean,
  data: {
    user: User,
    accessToken: string,
    refreshToken: string
  }
}

POST /api/auth/refresh
Request: { refreshToken: string }
Response: { 
  success: boolean,
  data: { accessToken: string }
}
```

#### Employee Endpoints

```
GET /api/employees?page=1&limit=10&search=&department=
Response: {
  success: boolean,
  data: Employee[],
  pagination: { total, page, pages }
}

POST /api/employees
Request: {
  personalInfo: { firstName, lastName, ... },
  contactInfo: { email, phoneNumber, ... },
  jobInfo: { jobTitle, department, hireDate, ... }
}
Response: { success: boolean, data: Employee }
```

#### Attendance Endpoints

```
POST /api/attendance/clock-in
Request: { location?: { lat, lng } }
Response: { success: boolean, data: AttendanceRecord }

POST /api/attendance/clock-out
Request: { attendanceId: string, location?: { lat, lng } }
Response: { success: boolean, data: AttendanceRecord }

GET /api/attendance/summary?month=11&year=2025
Response: {
  success: boolean,
  data: {
    totalDays, presentDays, absentDays, halfDays,
    totalWorkHours, totalOvertimeHours, ...
  }
}
```

## Data Models

### User Model

```javascript
{
  _id: ObjectId,
  email: String (unique, required),
  password: String (hashed, required),
  role: Enum ['SuperAdmin', 'HR Manager', 'HR Administrator', 'Employee'],
  employeeId: ObjectId (ref: Employee),
  assignedDepartments: [ObjectId],
  isActive: Boolean,
  lastLogin: Date,
  passwordChangedAt: Date,
  refreshToken: String,
  createdBy: ObjectId (ref: User),
  createdAt: Date,
  updatedAt: Date
}
```

**Indexes:**
- `email` (unique)
- `role`
- `isActive`

### Employee Model

```javascript
{
  _id: ObjectId,
  employeeId: String (auto-generated: EMP-YYYYMMDD-NNNN),
  personalInfo: {
    firstName: String (required),
    lastName: String (required),
    dateOfBirth: Date,
    gender: String,
    maritalStatus: String,
    nationality: String,
    profilePhoto: String
  },
  contactInfo: {
    email: String (required, unique),
    phoneNumber: String,
    alternatePhone: String,
    currentAddress: {
      street, city, state, zipCode, country
    }
  },
  jobInfo: {
    jobTitle: String (required),
    department: ObjectId (ref: Department, required),
    manager: ObjectId (ref: Employee),
    hireDate: Date (required),
    employmentType: String (required),
    workLocation: String
  },
  userId: ObjectId (ref: User, required),
  status: Enum ['Active', 'Inactive', 'On Leave', 'Terminated'],
  customFields: Map,
  createdBy: ObjectId (ref: User),
  updatedBy: ObjectId (ref: User),
  createdAt: Date,
  updatedAt: Date
}
```

**Indexes:**
- `employeeId` (unique)
- `contactInfo.email` (unique)
- `jobInfo.department`
- `status`

**Hooks:**
- Pre-save: Auto-generates employeeId if not present
- Post-save: Creates EmployeeProfile entry

### AttendanceRecord Model

```javascript
{
  _id: ObjectId,
  employeeId: ObjectId (ref: Employee, required),
  date: Date (required),
  checkIn: Date,
  checkOut: Date,
  workedMinutes: Number (calculated),
  workHours: Number (calculated),
  status: Enum ['present', 'absent', 'half_day', 'leave', 'holiday'],
  statusReason: String,
  isLate: Boolean,
  isEarlyDeparture: Boolean,
  lateMinutes: Number,
  earlyExitMinutes: Number,
  overtimeMinutes: Number,
  overtimeHours: Number,
  remarks: String,
  remarksHistory: [{
    note: String,
    addedBy: ObjectId (ref: User),
    addedAt: Date
  }],
  location: {
    checkIn: { lat: Number, lng: Number },
    checkOut: { lat: Number, lng: Number }
  },
  breakTime: Number (minutes),
  shiftStart: String (format: "HH:MM"),
  shiftEnd: String (format: "HH:MM"),
  approvalStatus: Enum ['auto', 'pending', 'approved', 'rejected'],
  approvedBy: ObjectId (ref: User),
  approvedAt: Date,
  createdBy: ObjectId (ref: User),
  updatedBy: ObjectId (ref: User),
  source: Enum ['self', 'manual', 'system'],
  deviceInfo: {
    deviceType: String,
    userAgent: String,
    ipAddress: String
  },
  createdAt: Date,
  updatedAt: Date
}
```

**Indexes:**
- `{ employeeId, date }` (unique compound)
- `{ employeeId, date }` (descending)
- `{ date, status }`
- `approvalStatus`

**Hooks:**
- Pre-save: Calculates work hours, late minutes, overtime, and determines status

### LeaveRequest Model

```javascript
{
  _id: ObjectId,
  employeeId: ObjectId (ref: Employee, required),
  type: Enum ['annual', 'sick', 'personal', 'maternity', 'paternity', 'emergency'],
  startDate: Date (required),
  endDate: Date (required),
  days: Number (required, min: 0.5),
  reason: String (required, max: 500),
  isHalfDay: Boolean,
  halfDayPeriod: Enum ['morning', 'afternoon'],
  status: Enum ['pending', 'approved', 'rejected', 'cancelled'],
  appliedAt: Date,
  reviewedBy: ObjectId (ref: User),
  reviewedAt: Date,
  rejectionReason: String (max: 500),
  cancelledAt: Date,
  attachments: [{
    fileName: String,
    fileUrl: String,
    uploadedAt: Date
  }],
  createdAt: Date,
  updatedAt: Date
}
```

**Indexes:**
- `{ employeeId, status }`
- `{ startDate, endDate }`
- `appliedAt` (descending)

**Hooks:**
- Pre-save: Validates dates and checks for overlapping leave requests

### Payslip Model

```javascript
{
  _id: ObjectId,
  employeeId: ObjectId (ref: Employee, required),
  month: Number (1-12, required),
  year: Number (2000-2100, required),
  earnings: {
    basic: Number (required),
    hra: Number,
    allowances: [{ name: String, amount: Number }],
    bonus: Number,
    overtime: Number,
    total: Number (calculated)
  },
  deductions: {
    tax: Number,
    providentFund: Number,
    insurance: Number,
    loan: Number,
    other: [{ name: String, amount: Number }],
    total: Number (calculated)
  },
  netPay: Number (calculated),
  pdfUrl: String,
  generatedAt: Date,
  status: Enum ['draft', 'published'],
  generatedBy: ObjectId (ref: User),
  createdAt: Date,
  updatedAt: Date
}
```

**Indexes:**
- `{ employeeId, year, month }` (descending)
- `{ employeeId, year, month }` (unique compound)
- `status`
- `generatedAt` (descending)

**Hooks:**
- Pre-save: Calculates earnings total, deductions total, and net pay

### AuditLog Model

```javascript
{
  _id: ObjectId,
  userId: ObjectId (ref: User, required),
  action: String (required),
  resource: String (required),
  resourceId: ObjectId,
  details: Mixed,
  ipAddress: String,
  userAgent: String,
  timestamp: Date (required),
  createdAt: Date
}
```

**Indexes:**
- `{ userId, timestamp }` (descending)
- `{ resource, timestamp }` (descending)
- `timestamp` (descending)

## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system-essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

### Property 1: Authentication Token Validity

*For any* valid user credentials, when authentication succeeds, the generated JWT access token should contain the user's ID, email, role, and employeeId, and should be verifiable using the JWT secret.

**Validates: Requirements 1.1, 1.3**

### Property 2: Employee ID Uniqueness

*For any* newly created employee, the auto-generated employee ID should be unique across all employees and follow the format EMP-YYYYMMDD-NNNN where NNNN is a sequential number for that date.

**Validates: Requirements 2.1**

### Property 3: Attendance Work Hours Calculation

*For any* attendance record with both clock-in and clock-out times, the calculated work hours should equal (clock-out time - clock-in time - break time) converted to hours, rounded to 2 decimal places.

**Validates: Requirements 3.3**

### Property 4: Late Arrival Detection

*For any* attendance record where clock-in time is after the configured shift start time, the system should mark isLate as true and calculate lateMinutes as the difference between clock-in and shift start.

**Validates: Requirements 3.4**

### Property 5: Leave Request Overlap Prevention

*For any* leave request submission, if there exists an approved or pending leave request for the same employee with overlapping dates, the new request should be rejected with an overlap error.

**Validates: Requirements 4.5**

### Property 6: Leave Balance Deduction

*For any* approved leave request, the employee's leave balance for that leave type should be decremented by the number of days in the request.

**Validates: Requirements 4.3**

### Property 7: Payslip Calculation Correctness

*For any* generated payslip, the net pay should equal (earnings.total - deductions.total), where earnings.total is the sum of all earning components and deductions.total is the sum of all deduction components.

**Validates: Requirements 5.1, 5.3**

### Property 8: Payslip Duplicate Prevention

*For any* payslip generation request, if a payslip already exists for the same employee, month, and year combination, the system should prevent creation and return an error.

**Validates: Requirements 5.5**

### Property 9: Document Access Authorization

*For any* document download request, the system should verify that the requesting user has permission to access that document based on their role and relationship to the document owner.

**Validates: Requirements 8.5**

### Property 10: Malware Scanning Enforcement

*For any* document upload, the file should be scanned for malware before storage, and if malware is detected, the upload should be rejected.

**Validates: Requirements 8.2**

### Property 11: Audit Log Completeness

*For any* create, update, or delete operation on a resource, an audit log entry should be created containing the user ID, action type, resource type, resource ID, and timestamp.

**Validates: Requirements 10.1**

### Property 12: Role-Based Dashboard Content

*For any* user accessing the dashboard, the displayed statistics and widgets should match the user's role permissions, with SuperAdmin seeing all statistics, HR Manager seeing team statistics, and Employee seeing only personal statistics.

**Validates: Requirements 11.1, 11.2, 11.3, 11.4**

### Property 13: Notification Creation on Leave Action

*For any* leave request approval or rejection, a notification should be created for the requesting employee with the appropriate status and details.

**Validates: Requirements 12.2**

### Property 14: Password Hashing Enforcement

*For any* user creation or password update, the password should be hashed using bcrypt before storage, and the plain text password should never be stored.

**Validates: Requirements 1.5**

### Property 15: Department Assignment Validation

*For any* employee update that changes the department, the new department ID should reference an existing department in the system.

**Validates: Requirements 2.3**

## Error Handling

### Error Response Format

All API errors follow a standardized format:

```javascript
{
  success: false,
  message: "Human-readable error message",
  error: "ERROR_CODE",
  details: {} // Optional additional details
}
```

### Error Categories

1. **Authentication Errors (401)**
   - Invalid credentials
   - Expired token
   - Missing token

2. **Authorization Errors (403)**
   - Insufficient permissions
   - Role-based access denied

3. **Validation Errors (400)**
   - Missing required fields
   - Invalid data format
   - Business rule violations

4. **Not Found Errors (404)**
   - Resource not found
   - Invalid ID

5. **Conflict Errors (409)**
   - Duplicate entry
   - Overlapping leave requests
   - Concurrent modification

6. **Server Errors (500)**
   - Database errors
   - Unexpected exceptions

### Global Error Handler

**Location:** `backend/src/middleware/errorHandler.js`

The global error handler catches all errors, logs them using Winston, and returns standardized error responses to clients.

## Testing Strategy

### Unit Testing

**Framework:** Jest for both backend and frontend

**Backend Unit Tests:**
- Controller methods with mocked services
- Service layer business logic
- Utility functions
- Middleware functions
- Model validation and hooks

**Frontend Unit Tests:**
- Component rendering
- User interactions
- Redux actions and reducers
- Utility functions
- Custom hooks

**Example Test Structure:**
```javascript
describe('AttendanceController', () => {
  describe('clockIn', () => {
    it('should create attendance record with timestamp', async () => {
      // Test implementation
    });
    
    it('should reject if already clocked in today', async () => {
      // Test implementation
    });
  });
});
```

### Property-Based Testing

**Framework:** fast-check (JavaScript property-based testing library)

**Configuration:** Each property-based test should run a minimum of 100 iterations to ensure comprehensive coverage across random inputs.

**Test Tagging:** Each property-based test must include a comment explicitly referencing the correctness property from this design document using the format:

```javascript
/**
 * Feature: hrm-system, Property 3: Attendance Work Hours Calculation
 * Validates: Requirements 3.3
 */
test('work hours calculation property', () => {
  fc.assert(
    fc.property(
      fc.date(), // clock-in
      fc.date(), // clock-out
      fc.integer({ min: 0, max: 120 }), // break time
      (clockIn, clockOut, breakTime) => {
        // Property test implementation
      }
    ),
    { numRuns: 100 }
  );
});
```

**Property Tests to Implement:**

1. **Property 3: Work Hours Calculation**
   - Generate random clock-in/clock-out times and break times
   - Verify calculated work hours match expected formula

2. **Property 5: Leave Overlap Prevention**
   - Generate random leave requests with varying date ranges
   - Verify overlap detection works correctly

3. **Property 7: Payslip Calculation**
   - Generate random earnings and deductions
   - Verify net pay calculation is correct

4. **Property 8: Payslip Duplicate Prevention**
   - Generate payslips for same employee/month/year
   - Verify duplicate prevention works

5. **Property 14: Password Hashing**
   - Generate random passwords
   - Verify all are hashed and none stored in plain text

### Integration Testing

**Framework:** Supertest for API testing

**Coverage:**
- Complete API endpoint flows
- Authentication and authorization
- Database operations
- File upload/download
- Error handling

**Example:**
```javascript
describe('POST /api/attendance/clock-in', () => {
  it('should create attendance record for authenticated employee', async () => {
    const response = await request(app)
      .post('/api/attendance/clock-in')
      .set('Authorization', `Bearer ${token}`)
      .send({ location: { lat: 40.7128, lng: -74.0060 } })
      .expect(201);
    
    expect(response.body.success).toBe(true);
    expect(response.body.data.checkIn).toBeDefined();
  });
});
```

### End-to-End Testing

**Framework:** Cypress or Playwright

**Critical User Flows:**
1. User login → Dashboard → Clock in → Clock out
2. Employee → Submit leave request → Manager approves
3. SuperAdmin → Generate payslips → Employee views payslip
4. HR Admin → Create employee → Assign to department

### Test Coverage Goals

- **Unit Tests:** 80% code coverage
- **Integration Tests:** All API endpoints
- **Property Tests:** All correctness properties
- **E2E Tests:** Critical user flows

## Security Considerations

### Authentication Security

- JWT tokens with short expiration (15 minutes for access, 7 days for refresh)
- Passwords hashed with bcrypt (10 rounds)
- Token verification on every protected request
- Refresh token rotation

### Authorization Security

- Role-based access control enforced at middleware level
- Department-based data isolation for HR Managers
- Employee data access restricted to self and authorized roles

### Input Validation

- All inputs sanitized to prevent MongoDB injection
- File upload validation (type, size, malware)
- Request body validation using Joi schemas

### Security Headers

- Helmet.js for security headers
- CORS configuration for allowed origins
- Rate limiting (100 requests per 15 minutes)
- HPP (HTTP Parameter Pollution) protection

### Data Protection

- Sensitive data encrypted at rest
- Documents encrypted before storage
- Audit logging for compliance
- 7-year retention policy for audit logs

## Performance Considerations

### Database Optimization

- Compound indexes on frequently queried fields
- Pagination for large result sets
- Aggregation pipelines for complex queries
- Connection pooling

### Caching Strategy

- Redis configured for session management
- API response caching for static data
- Client-side caching with Redux

### Frontend Optimization

- Code splitting with React.lazy
- Lazy loading of routes
- Memoization of expensive computations
- Debouncing of search inputs

## Deployment Architecture

### Production Environment

```
Load Balancer (Nginx)
    ↓
Frontend (React) - Static files served by Nginx
    ↓
Backend API (Node.js) - Multiple instances
    ↓
MongoDB Cluster - Replica set for high availability
    ↓
Redis Cache - Session and data caching
```

### Docker Configuration

- Multi-stage builds for optimized images
- Separate containers for frontend, backend, database, and cache
- Docker Compose for local development
- Environment-specific configurations

### Monitoring and Logging

- Winston for application logging
- Log aggregation (ELK stack recommended)
- Performance monitoring (New Relic or similar)
- Error tracking (Sentry recommended)

## Future Enhancements

1. **Real-time Features**
   - WebSocket integration for live notifications
   - Real-time dashboard updates

2. **Advanced Reporting**
   - Custom report builder
   - Scheduled report generation
   - Export to multiple formats (Excel, PDF)

3. **Mobile Application**
   - React Native mobile app
   - Offline capability
   - Push notifications

4. **Integration APIs**
   - Third-party integrations (Slack, Teams)
   - SSO (Single Sign-On)
   - LDAP/Active Directory integration

5. **AI/ML Features**
   - Predictive analytics for attrition
   - Automated leave approval suggestions
   - Anomaly detection in attendance

---

**Design Version:** 1.0  
**Last Updated:** December 3, 2025  
**Status:** Complete and Ready for Implementation
