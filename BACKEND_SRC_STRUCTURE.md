# Backend Source Structure

## Overview
This document outlines the complete structure of the HRM System backend source code, organized by functionality and following Node.js/Express.js best practices.

```
backend/src/
├── app.js                          # Express app configuration (220 lines)
├── server.js                       # Server entry point (66 lines)
├── config/                         # Configuration files
│   ├── index.js                   # Main config exports (118 lines)
│   ├── rolePermissions.js         # RBAC permissions configuration (484 lines)
│   └── sequelize.js               # Database configuration (93 lines)
├── constants/                      # Application constants
│   └── notifications.js           # Notification type constants (35 lines)
├── controllers/                    # Request handlers
│   ├── auth.controller.js         # Authentication endpoints (708 lines)
│   ├── config.controller.js       # System configuration endpoints (95 lines)
│   ├── admin/                     # Admin-specific controllers
│   │   ├── adminConfig.controller.js (382 lines)
│   │   ├── adminDashboard.controller.js (33 lines)
│   │   ├── attendance.controller.js (403 lines)
│   │   ├── attendanceCorrection.controller.js (696 lines)
│   │   ├── attendanceFinalization.controller.js (229 lines)
│   │   ├── auditLog.controller.js (143 lines)
│   │   ├── calendarific.controller.js (438 lines)
│   │   ├── companyEvent.controller.js (340 lines)
│   │   ├── department.controller.js (206 lines)
│   │   ├── employee.controller.js (477 lines)
│   │   ├── employeeManagement.controller.js (719 lines)
│   │   ├── employeeShift.controller.js (483 lines)
│   │   ├── holiday.controller.js (333 lines)
│   │   ├── lead.controller.js (279 lines)
│   │   ├── leaveBalance.controller.js (319 lines)
│   │   ├── leaveBalanceRollover.controller.js (184 lines)
│   │   ├── leaveRequest.controller.js (352 lines)
│   │   ├── liveAttendance.controller.js (394 lines)
│   │   ├── settings.controller.js (113 lines)
│   │   ├── shift.controller.js (242 lines)
│   │   ├── systemPolicy.controller.js (273 lines)
│   │   ├── user.controller.js (469 lines)
│   │   └── workingRules.controller.js (551 lines)
│   ├── calendar/                  # Calendar-specific controllers
│   │   ├── calendarView.controller.js (873 lines)
│   │   └── smartCalendar.controller.js (534 lines)
│   └── employee/                  # Employee-specific controllers
│       ├── attendance.controller.js (352 lines)
│       ├── attendanceCorrectionRequests.controller.js (364 lines)
│       ├── bankDetails.controller.js (482 lines)
│       ├── companyStatus.controller.js (211 lines)
│       ├── dashboard.controller.js (163 lines)
│       ├── emergencyContacts.controller.js (324 lines)
│       ├── employeeCalendar.controller.js (487 lines)
│       ├── leave.controller.js (393 lines)
│       ├── leaveRequest.controller.js (458 lines)
│       ├── notifications.controller.js (294 lines)
│       ├── profile.controller.js (356 lines)
│       ├── recentActivity.controller.js (141 lines)
│       └── shift.controller.js (268 lines)
├── jobs/                          # Background jobs and cron tasks
│   ├── attendanceAutoCorrection.js (133 lines)
│   ├── attendanceFinalization.js (581 lines)
│   └── notificationCleanup.js (27 lines)
├── middleware/                    # Express middleware
│   ├── attendanceValidation.js   # Attendance-specific validation (306 lines)
│   ├── auth.middleware.js        # Authentication middleware (46 lines)
│   ├── authenticate.js           # JWT authentication (236 lines)
│   ├── authorize.js              # Authorization middleware (250 lines)
│   ├── checkPermission.js        # Permission checking (120 lines)
│   ├── errorHandler.js           # Global error handling (87 lines)
│   ├── rateLimiter.js            # Rate limiting (63 lines)
│   ├── requireRoles.js           # Role-based access control (132 lines)
│   └── upload.js                 # File upload handling (149 lines)
├── migrations/                    # Database migrations
│   ├── 2024-12-24-hrm-model-restructure.js (438 lines)
│   ├── add-backward-compatible-roles.js (53 lines)
│   ├── add-calendarific-fields-to-holidays.js (78 lines)
│   ├── add-employee-personal-fields.js (55 lines)
│   ├── add-half-day-type-to-attendance.js (23 lines)
│   ├── add-incomplete-status-to-attendance.js (56 lines)
│   ├── add-model-improvements.js (180 lines)
│   ├── add-unique-daily-attendance-index.js (32 lines)
│   ├── add-unique-pending-correction-index.js (31 lines)
│   ├── add-work-mode-to-attendance.js (63 lines)
│   ├── cleanup-user-employee-relationship.js (58 lines)
│   ├── create-attendance-correction-requests.js (126 lines)
│   ├── create-emergency-contacts.js (89 lines)
│   ├── create-lead-tables.js (287 lines)
│   ├── create-notifications.js (63 lines)
│   ├── create-working-rules.js (106 lines)
│   ├── fix-address-object-object.js (51 lines)
│   ├── fix-lead-created-by-constraint.js (41 lines)
│   ├── fix-user-employee-relationship.js (105 lines)
│   ├── update-holidays-table.js (111 lines)
│   └── update-user-model-production.js (140 lines)
├── models/                        # Database models
│   ├── index.js                  # Model exports (67 lines)
│   └── sequelize/                # Sequelize models
│       ├── index.js (169 lines)
│       ├── AttendanceCorrectionRequest.js (114 lines)
│       ├── AttendanceRecord.js (785 lines)
│       ├── AuditLog.js (262 lines)
│       ├── CompanyEvent.js (227 lines)
│       ├── Department.js (97 lines)
│       ├── Designation.js (123 lines)
│       ├── EmergencyContact.js (190 lines)
│       ├── Employee.js (268 lines)
│       ├── EmployeeShift.js (126 lines)
│       ├── Holiday.js (281 lines)
│       ├── Lead.js (167 lines)
│       ├── LeaveBalance.js (222 lines)
│       ├── LeaveRequest.js (139 lines)
│       ├── Notification.js (70 lines)
│       ├── Shift.js (161 lines)
│       ├── SystemPolicy.js (219 lines)
│       ├── User.js (163 lines)
│       └── WorkingRule.js (189 lines)
├── routes/                        # API route definitions
│   ├── auth.routes.js            # Authentication routes (73 lines)
│   ├── calendar.routes.js        # Calendar routes (74 lines)
│   ├── config.routes.js          # Configuration routes (62 lines)
│   ├── settings.routes.js        # Settings routes (19 lines)
│   ├── user.routes.js            # User routes (112 lines)
│   ├── admin/                    # Admin routes
│   │   ├── adminAttendance.routes.js (254 lines)
│   │   ├── adminConfig.routes.js (41 lines)
│   │   ├── adminDashboard.routes.js (19 lines)
│   │   ├── attendanceCorrection.routes.js (36 lines)
│   │   ├── attendanceFinalization.routes.js (37 lines)
│   │   ├── attendanceStatus.routes.js (86 lines)
│   │   ├── auditLog.routes.js (26 lines)
│   │   ├── bankVerification.routes.js (24 lines)
│   │   ├── calendarific.routes.js (161 lines)
│   │   ├── companyEvent.routes.js (35 lines)
│   │   ├── department.routes.js (117 lines)
│   │   ├── designation.routes.js (55 lines)
│   │   ├── employee.routes.js (214 lines)
│   │   ├── employeeManagement.routes.js (56 lines)
│   │   ├── eventTypes.routes.js (65 lines)
│   │   ├── helpSupport.routes.js (241 lines)
│   │   ├── holiday.routes.js (36 lines)
│   │   ├── lead.routes.js (145 lines)
│   │   ├── leaveBalance.routes.js (121 lines)
│   │   ├── leaveBalanceRollover.routes.js (70 lines)
│   │   ├── leaveRequest.routes.js (90 lines)
│   │   ├── shift.routes.js (32 lines)
│   │   ├── systemPolicy.routes.js (114 lines)
│   │   ├── workingRules.routes.js (33 lines)
│   │   └── workLocations.routes.js (51 lines)
│   ├── calendar/                 # Calendar-specific routes
│   │   ├── calendarView.routes.js (50 lines)
│   │   └── smartCalendar.routes.js (57 lines)
│   └── employee/                 # Employee routes
│       ├── index.js (35 lines)
│       ├── attendance.routes.js (82 lines)
│       ├── attendanceCorrectionRequests.routes.js (102 lines)
│       ├── bankDetails.routes.js (32 lines)
│       ├── companyStatus.routes.js (67 lines)
│       ├── dashboard.routes.js (91 lines)
│       ├── emergencyContacts.routes.js (28 lines)
│       ├── employeeCalendar.routes.js (30 lines)
│       ├── leave.routes.js (62 lines)
│       ├── notifications.routes.js (27 lines)
│       ├── payslips.routes.js (65 lines)
│       ├── profile.routes.js (29 lines)
│       ├── recentActivity.routes.js (28 lines)
│       └── shift.routes.js (50 lines)
├── scripts/                       # Database and utility scripts
│   └── initialize-database.js (0 lines)
├── services/                      # Business logic services
│   ├── index.js                  # Service exports (68 lines)
│   ├── ip.service.js             # IP address utilities (165 lines)
│   ├── notificationService.js    # Notification handling (552 lines)
│   ├── user.service.js           # User management (507 lines)
│   ├── admin/                    # Admin services
│   │   ├── adminDashboard.service.js (101 lines)
│   │   ├── attendance.service.js (1417 lines)
│   │   ├── defaultLeaveBalance.service.js (259 lines)
│   │   ├── department.service.js (415 lines)
│   │   ├── designation.service.js (579 lines)
│   │   ├── employee.service.js (1061 lines)
│   │   ├── holiday.service.js (836 lines)
│   │   ├── lead.service.js (640 lines)
│   │   ├── leaveBalance.service.js (491 lines)
│   │   ├── leaveRequest.service.js (755 lines)
│   │   ├── shift.service.js (560 lines)
│   │   └── systemPolicy.service.js (488 lines)
│   ├── attendance/               # Attendance services
│   │   └── attendancePolicy.service.js (263 lines)
│   ├── audit/                    # Audit services
│   │   └── audit.service.js (318 lines)
│   ├── calendar/                 # Calendar services
│   │   └── calendarDayStatus.service.js (282 lines)
│   ├── core/                     # Core services
│   │   ├── attendanceCalculation.service.js (188 lines)
│   │   ├── calendarDataFetcher.service.js (376 lines)
│   │   ├── dateCalculation.service.js (220 lines)
│   │   └── leaveCalculation.service.js (346 lines)
│   ├── cron/                     # Cron job services
│   │   └── leaveBalanceRollover.service.js (159 lines)
│   ├── employee/                 # Employee services
│   │   ├── dashboard.service.js (240 lines)
│   │   ├── leave.service.js (148 lines)
│   │   ├── profile.service.js (116 lines)
│   │   └── recentActivity.service.js (424 lines)
│   └── external/                 # External API services
│       └── calendarific.service.js (531 lines)
├── utils/                         # Utility functions
│   ├── auditLogger.js            # Audit logging utilities (242 lines)
│   ├── calendarEventNormalizer.js # Calendar event processing (552 lines)
│   ├── dateUtils.js              # Date manipulation utilities (188 lines)
│   ├── dayUtils.js               # Day calculation utilities (35 lines)
│   ├── encryption.js             # Encryption utilities (270 lines)
│   ├── jwt.js                    # JWT token utilities (148 lines)
│   ├── logger.js                 # Application logging (30 lines)
│   ├── ResponseFormatter.js      # Response formatting utilities (203 lines)
│   └── sseManager.js             # Server-sent events manager (200 lines)
└── validators/                    # Input validation schemas
    ├── authValidator.js          # Authentication validation (167 lines)
    ├── bankDetailsValidator.js   # Bank details validation (129 lines)
    ├── emergencyContactValidator.js # Emergency contact validation (64 lines)
    ├── employeeValidator.js      # Employee data validation (617 lines)
    ├── holidayValidator.js       # Holiday validation (113 lines)
    └── profileValidator.js       # Profile validation (163 lines)
```

## Key Architecture Patterns

### 1. **MVC Pattern**
- **Models**: Database entities and relationships
- **Views**: JSON API responses
- **Controllers**: Request handling and business logic coordination

### 2. **Service Layer Pattern**
- Business logic separated from controllers
- Reusable service functions
- Domain-specific service organization

### 3. **Middleware Pattern**
- Authentication and authorization
- Request validation
- Error handling
- Rate limiting

### 4. **Repository Pattern**
- Database access abstraction through Sequelize models
- Consistent data access patterns

## Directory Responsibilities

### `/config`
- Database connection configuration
- Environment-specific settings
- Role-based access control definitions

### `/controllers`
- HTTP request/response handling
- Input validation coordination
- Service layer orchestration
- Error response formatting

### `/middleware`
- Cross-cutting concerns
- Request preprocessing
- Authentication/authorization
- Security measures

### `/models`
- Database schema definitions
- Model relationships
- Data validation rules
- Query methods

### `/routes`
- API endpoint definitions
- Route-specific middleware
- Parameter validation
- Documentation

### `/services`
- Core business logic
- Data processing
- External API integration
- Complex calculations

### `/utils`
- Helper functions
- Common utilities
- Formatting functions
- Logging utilities

### `/validators`
- Input validation schemas
- Data sanitization
- Business rule validation

## Technology Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: PostgreSQL with Sequelize ORM
- **Authentication**: JWT tokens
- **Validation**: Joi/Yup schemas
- **Logging**: Winston
- **File Upload**: Multer
- **Security**: Helmet, CORS, Rate limiting

## Key Features

- **Role-Based Access Control (RBAC)**
- **Attendance Management**
- **Leave Management**
- **Employee Self-Service**
- **Calendar Integration**
- **Audit Logging**
- **Real-time Notifications**
- **File Upload Management**
- **Smart Calendar System**
- **Working Rules Engine**

## Recent Updates

### New Migrations Added
- `add-unique-daily-attendance-index.js` - Ensures unique daily attendance records
- `add-unique-pending-correction-index.js` - Prevents duplicate correction requests

### Enhanced Services
- **Core Services**: Added `calendarDataFetcher.service.js` and `leaveCalculation.service.js`
- **Attendance Calculation**: Enhanced with more robust calculation logic
- **Response Formatting**: Added `ResponseFormatter.js` utility

### Updated Routes
- **Admin Routes**: Added `adminAttendance.routes.js` for dedicated admin attendance management
- **Work Locations**: Added `workLocations.routes.js` for location management
- **Help Support**: Added `helpSupport.routes.js` for support ticket management

### Enhanced Utilities
- **SSE Manager**: Added real-time server-sent events support
- **Response Formatter**: Standardized API response formatting
- **Calendar Event Normalizer**: Enhanced calendar event processing