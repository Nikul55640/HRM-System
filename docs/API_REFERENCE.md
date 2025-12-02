# API Reference

## Base URL
```
Development: http://localhost:4001/api
Production: https://your-domain.com/api
```

## Authentication

All protected endpoints require a JWT token in the Authorization header:
```
Authorization: Bearer <your_jwt_token>
```

## Response Format

### Success Response
```json
{
  "success": true,
  "data": { ... },
  "message": "Operation successful"
}
```

### Error Response
```json
{
  "success": false,
  "message": "Error description",
  "error": "Detailed error information"
}
```

## Authentication Endpoints

### POST /auth/register
Register a new user account.

**Access:** Public (but typically restricted to admin users in production)

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "SecurePass123!",
  "firstName": "John",
  "lastName": "Doe",
  "role": "Employee"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "user_id",
      "email": "user@example.com",
      "role": "Employee"
    },
    "accessToken": "jwt_access_token",
    "refreshToken": "jwt_refresh_token"
  }
}
```

### POST /auth/login
Authenticate user and receive tokens.

**Access:** Public

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "SecurePass123!"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "user_id",
      "email": "user@example.com",
      "role": "Employee",
      "employeeId": "emp_id"
    },
    "accessToken": "jwt_access_token",
    "refreshToken": "jwt_refresh_token"
  }
}
```

### POST /auth/refresh
Refresh access token using refresh token.

**Access:** Public

**Request Body:**
```json
{
  "refreshToken": "jwt_refresh_token"
}
```

### POST /auth/logout
Logout user and invalidate refresh token.

**Access:** Protected

### POST /auth/change-password
Change user password.

**Access:** Protected

**Request Body:**
```json
{
  "currentPassword": "OldPass123!",
  "newPassword": "NewPass123!"
}
```

### GET /auth/me
Get current user profile.

**Access:** Protected

## Employee Management

### GET /employees
Get all employees with pagination and filtering.

**Access:** HR Admin, HR Manager, SuperAdmin

**Query Parameters:**
- `page` (number): Page number (default: 1)
- `limit` (number): Items per page (default: 10)
- `search` (string): Search by name or email
- `department` (string): Filter by department ID
- `status` (string): Filter by status (active/inactive)

### POST /employees
Create new employee.

**Access:** HR Admin, SuperAdmin

**Request Body:**
```json
{
  "personalInfo": {
    "firstName": "John",
    "lastName": "Doe",
    "email": "john.doe@company.com",
    "phone": "+1234567890",
    "dateOfBirth": "1990-01-01",
    "gender": "male"
  },
  "jobInfo": {
    "title": "Software Engineer",
    "department": "dept_id",
    "joiningDate": "2024-01-01",
    "employmentType": "full-time"
  }
}
```

### GET /employees/:id
Get employee by ID.

**Access:** HR Admin, HR Manager (department scope), Employee (own profile)

### PUT /employees/:id
Update employee information.

**Access:** HR Admin, SuperAdmin

### DELETE /employees/:id
Soft delete employee.

**Access:** HR Admin, SuperAdmin

## Employee Self-Service

### GET /employee/profile
Get current employee's profile.

**Access:** Employee

### PUT /employee/profile
Update current employee's profile (limited fields).

**Access:** Employee

**Request Body:**
```json
{
  "personalInfo": {
    "phone": "+1234567890",
    "address": {
      "street": "123 Main St",
      "city": "City",
      "state": "State",
      "zipCode": "12345"
    }
  }
}
```

### GET /employee/payslips
Get employee's payslips.

**Access:** Employee

### GET /employee/leave-balance
Get employee's leave balance.

**Access:** Employee

### POST /employee/leave-requests
Submit leave request.

**Access:** Employee

**Request Body:**
```json
{
  "leaveType": "annual",
  "startDate": "2024-06-01",
  "endDate": "2024-06-05",
  "reason": "Vacation"
}
```

### GET /employee/leave-requests
Get employee's leave requests.

**Access:** Employee

### GET /employee/attendance
Get employee's attendance records.

**Access:** Employee

**Query Parameters:**
- `startDate` (date): Filter from date
- `endDate` (date): Filter to date

### POST /employee/attendance/check-in
Clock in for the day.

**Access:** Employee

**Request Body:**
```json
{
  "location": {
    "latitude": 40.7128,
    "longitude": -74.0060
  }
}
```

### POST /employee/attendance/check-out
Clock out for the day.

**Access:** Employee

## Admin Endpoints

### GET /admin/leave-requests
Get all leave requests.

**Access:** HR Admin, HR Manager, SuperAdmin

**Query Parameters:**
- `status` (string): Filter by status (pending/approved/rejected)
- `employeeId` (string): Filter by employee

### PUT /admin/leave-requests/:id/approve
Approve leave request.

**Access:** HR Admin, HR Manager, SuperAdmin

### PUT /admin/leave-requests/:id/reject
Reject leave request.

**Access:** HR Admin, HR Manager, SuperAdmin

**Request Body:**
```json
{
  "reason": "Insufficient leave balance"
}
```

## Document Management

### POST /employees/:id/documents
Upload document for employee.

**Access:** HR Admin, SuperAdmin

**Request:** multipart/form-data
- `document` (file): The file to upload
- `documentType` (string): Type of document

### GET /employees/:id/documents
Get employee's documents.

**Access:** HR Admin, HR Manager (department scope), Employee (own documents)

### GET /documents/:documentId
Download document.

**Access:** HR Admin, HR Manager (department scope), Employee (own documents)

### DELETE /documents/:documentId
Delete document.

**Access:** HR Admin, SuperAdmin

## Company Calendar

### GET /calendar/events
Get calendar events.

**Access:** All authenticated users

**Query Parameters:**
- `startDate` (date): Filter from date
- `endDate` (date): Filter to date
- `type` (string): Filter by event type

### POST /calendar/events
Create calendar event.

**Access:** HR Admin, SuperAdmin

**Request Body:**
```json
{
  "title": "Company Holiday",
  "description": "New Year's Day",
  "eventType": "holiday",
  "startDate": "2024-01-01",
  "endDate": "2024-01-01",
  "isAllDay": true
}
```

### POST /calendar/sync
Sync employee birthdays and anniversaries.

**Access:** HR Admin, SuperAdmin

## Notifications

### GET /employee/notifications
Get employee's notifications.

**Access:** Employee

### PUT /employee/notifications/:id/read
Mark notification as read.

**Access:** Employee

### PUT /employee/notifications/read-all
Mark all notifications as read.

**Access:** Employee

## Error Codes

| Code | Status | Description |
|------|--------|-------------|
| UNAUTHORIZED | 401 | Authentication required |
| FORBIDDEN | 403 | Insufficient permissions |
| NOT_FOUND | 404 | Resource not found |
| VALIDATION_ERROR | 400 | Invalid input data |
| DUPLICATE_EMAIL | 400 | Email already exists |
| INVALID_CREDENTIALS | 401 | Invalid email or password |
| TOKEN_EXPIRED | 401 | JWT token expired |
| INTERNAL_ERROR | 500 | Server error |

## Rate Limiting

API endpoints are rate limited to:
- 100 requests per 15 minutes per IP address
- 5 login attempts per 15 minutes per IP address

## Pagination

List endpoints support pagination with the following parameters:
- `page`: Page number (default: 1)
- `limit`: Items per page (default: 10, max: 100)

Response includes pagination metadata:
```json
{
  "success": true,
  "data": [...],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 50,
    "pages": 5
  }
}
```
