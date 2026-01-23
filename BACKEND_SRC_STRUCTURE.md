# Backend Source Structure

## Overview
This document outlines the complete structure of the HRM System backend source code, organized by functionality and following Node.js/Express.js best practices.

```
backend/src/
├── app.js                          # Express app configuration
├── server.js                       # Server entry point
├── config/                         # Configuration files
│   ├── index.js                   # Main config exports
│   ├── rolePermissions.js         # RBAC permissions configuration
│   └── sequelize.js               # Database configuration
├── constants/                      # Application constants
│   ├── festivalKeywords.js        # Festival keyword definitions
│   └── notifications.js           # Notification type constants
├── controllers/                    # Request handlers
│   ├── auth.controller.js         # Authentication endpoints
│   ├── config.controller.js       # System configuration endpoints
│   ├── admin/                     # Admin-specific controllers
│   │   ├── adminConfig.controller.js
│   │   ├── adminDashboard.controller.js
│   │   ├── attendance.controller.js
│   │   ├── attendanceCorrection.controller.js
│   │   ├── attendanceFinalization.controller.js
│   │   ├── auditLog.controller.js
│   │   ├── calendarific.controller.js
│   │   ├── companyEvent.controller.js
│   │   ├── department.controller.js
│   │   ├── employee.controller.js
│   │   ├── employeeManagement.controller.js
│   │   ├── employeeShift.controller.js
│   │   ├── holiday.controller.js
│   │   ├── holidaySelectionTemplate.controller.js  # ✅ NEW: Holiday template system
│   │   ├── lead.controller.js
│   │   ├── leaveBalance.controller.js
│   │   ├── leaveBalanceRollover.controller.js
│   │   ├── leaveRequest.controller.js
│   │   ├── liveAttendance.controller.js
│   │   ├── settings.controller.js
│   │   ├── shift.controller.js
│   │   ├── systemPolicy.controller.js
│   │   ├── user.controller.js
│   │   └── workingRules.controller.js
│   ├── calendar/                  # Calendar-specific controllers
│   │   ├── calendarView.controller.js
│   │   └── smartCalendar.controller.js
│   └── employee/                  # Employee-specific controllers
│       ├── attendance.controller.js
│       ├── attendanceCorrectionRequests.controller.js
│       ├── bankDetails.controller.js
│       ├── companyStatus.controller.js
│       ├── dashboard.controller.js
│       ├── emergencyContacts.controller.js
│       ├── employeeCalendar.controller.js
│       ├── leave.controller.js
│       ├── leaveRequest.controller.js
│       ├── notifications.controller.js
│       ├── profile.controller.js
│       ├── recentActivity.controller.js
│       └── shift.controller.js
├── jobs/                          # Background jobs and cron tasks
│   ├── attendanceAutoCorrection.js
│   ├── attendanceFinalization.js
│   └── notificationCleanup.js
├── middleware/                    # Express middleware
│   ├── attendanceValidation.js   # Attendance-specific validation
│   ├── auth.middleware.js        # Authentication middleware
│   ├── authenticate.js           # JWT authentication
│   ├── authorize.js              # Authorization middleware
│   ├── checkPermission.js        # Permission checking
│   ├── errorHandler.js           # Global error handling
│   ├── rateLimiter.js            # Rate limiting
│   ├── requireRoles.js           # Role-based access control
│   └── upload.js                 # File upload handling
├── migrations/                    # Database migrations
│   ├── 2024-12-24-hrm-model-restructure.js
│   ├── add-backward-compatible-roles.js
│   ├── add-calendarific-fields-to-holidays.js
│   ├── add-employee-personal-fields.js
│   ├── add-half-day-type-to-attendance.js
│   ├── add-incomplete-status-to-attendance.js
│   ├── add-model-improvements.js
│   ├── add-unique-daily-attendance-index.js
│   ├── add-unique-pending-correction-index.js
│   ├── add-work-mode-to-attendance.js
│   ├── cleanup-user-employee-relationship.js
│   ├── create-attendance-correction-requests.js
│   ├── create-emergency-contacts.js
│   ├── create-holiday-selection-templates.js  # ✅ NEW: Holiday template migration
│   ├── create-lead-tables.js
│   ├── create-notifications.js
│   ├── create-working-rules.js
│   ├── fix-address-object-object.js
│   ├── fix-lead-created-by-constraint.js
│   ├── fix-user-employee-relationship.js
│   ├── update-holidays-table.js
│   └── update-user-model-production.js
├── models/                        # Database models
│   ├── index.js                  # Model exports
│   └── sequelize/                # Sequelize models
│       ├── index.js
│       ├── AttendanceCorrectionRequest.js
│       ├── AttendanceRecord.js
│       ├── AuditLog.js
│       ├── CompanyEvent.js
│       ├── Department.js
│       ├── Designation.js
│       ├── EmergencyContact.js
│       ├── Employee.js
│       ├── EmployeeShift.js
│       ├── Holiday.js
│       ├── HolidaySelectionTemplate.js  # ✅ NEW: Holiday template model
│       ├── Lead.js
│       ├── LeaveBalance.js
│       ├── LeaveRequest.js
│       ├── Notification.js
│       ├── Shift.js
│       ├── SystemPolicy.js
│       ├── User.js
│       └── WorkingRule.js
├── routes/                        # API route definitions
│   ├── auth.routes.js            # Authentication routes
│   ├── calendar.routes.js        # Calendar routes
│   ├── config.routes.js          # Configuration routes
│   ├── settings.routes.js        # Settings routes
│   ├── user.routes.js            # User routes
│   ├── admin/                    # Admin routes
│   │   ├── adminAttendance.routes.js
│   │   ├── adminConfig.routes.js
│   │   ├── adminDashboard.routes.js
│   │   ├── attendanceCorrection.routes.js
│   │   ├── attendanceFinalization.routes.js
│   │   ├── attendanceStatus.routes.js
│   │   ├── auditLog.routes.js
│   │   ├── bankVerification.routes.js
│   │   ├── calendarific.routes.js
│   │   ├── companyEvent.routes.js
│   │   ├── department.routes.js
│   │   ├── designation.routes.js
│   │   ├── employee.routes.js
│   │   ├── employeeManagement.routes.js
│   │   ├── eventTypes.routes.js
│   │   ├── helpSupport.routes.js
│   │   ├── holiday.routes.js
│   │   ├── holidaySelectionTemplate.routes.js  # ✅ NEW: Holiday template routes
│   │   ├── lead.routes.js
│   │   ├── leaveBalance.routes.js
│   │   ├── leaveBalanceRollover.routes.js
│   │   ├── leaveRequest.routes.js
│   │   ├── shift.routes.js
│   │   ├── systemPolicy.routes.js
│   │   ├── workingRules.routes.js
│   │   └── workLocations.routes.js
│   ├── calendar/                 # Calendar-specific routes
│   │   ├── calendarView.routes.js
│   │   └── smartCalendar.routes.js
│   └── employee/                 # Employee routes
│       ├── index.js
│       ├── attendance.routes.js
│       ├── attendanceCorrectionRequests.routes.js
│       ├── bankDetails.routes.js
│       ├── companyStatus.routes.js
│       ├── dashboard.routes.js
│       ├── emergencyContacts.routes.js
│       ├── employeeCalendar.routes.js
│       ├── leave.routes.js
│       ├── notifications.routes.js
│       ├── payslips.routes.js
│       ├── profile.routes.js
│       ├── recentActivity.routes.js
│       └── shift.routes.js
├── scripts/                       # Database and utility scripts
│   └── initialize-database.js
├── services/                      # Business logic services
│   ├── index.js                  # Service exports
│   ├── ip.service.js             # IP address utilities
│   ├── notificationService.js    # Notification handling
│   ├── user.service.js           # User management
│   ├── admin/                    # Admin services
│   │   ├── adminDashboard.service.js
│   │   ├── attendance.service.js
│   │   ├── defaultLeaveBalance.service.js
│   │   ├── department.service.js
│   │   ├── designation.service.js
│   │   ├── employee.service.js
│   │   ├── holiday.service.js
│   │   ├── holidaySelectionTemplate.service.js  # ✅ NEW: Holiday template service
│   │   ├── lead.service.js
│   │   ├── leaveBalance.service.js
│   │   ├── leaveRequest.service.js
│   │   ├── shift.service.js
│   │   └── systemPolicy.service.js
│   ├── attendance/               # Attendance services
│   │   └── attendancePolicy.service.js
│   ├── audit/                    # Audit services
│   │   └── audit.service.js
│   ├── calendar/                 # Calendar services
│   │   └── calendarDayStatus.service.js
│   ├── core/                     # Core services
│   │   ├── attendanceCalculation.service.js
│   │   ├── calendarDataFetcher.service.js
│   │   ├── dateCalculation.service.js
│   │   └── leaveCalculation.service.js
│   ├── cron/                     # Cron job services
│   │   └── leaveBalanceRollover.service.js
│   ├── employee/                 # Employee services
│   │   ├── dashboard.service.js
│   │   ├── leave.service.js
│   │   ├── profile.service.js
│   │   └── recentActivity.service.js
│   └── external/                 # External API services
│       ├── calendarific.service.js
│       └── optimizedCalendarific.service.js  # ✅ NEW: Optimized Calendarific service
├── utils/                         # Utility functions
│   ├── auditLogger.js            # Audit logging utilities
│   ├── calendarEventNormalizer.js # Calendar event processing
│   ├── dateUtils.js              # Date manipulation utilities
│   ├── dayUtils.js               # Day calculation utilities
│   ├── encryption.js             # Encryption utilities
│   ├── jwt.js                    # JWT token utilities
│   ├── logger.js                 # Application logging
│   ├── ResponseFormatter.js      # Response formatting utilities
│   └── sseManager.js             # Server-sent events manager
└── validators/                    # Input validation schemas
    ├── authValidator.js          # Authentication validation
    ├── bankDetailsValidator.js   # Bank details validation
    ├── emergencyContactValidator.js # Emergency contact validation
    ├── employeeValidator.js      # Employee data validation
    ├── holidayValidator.js       # Holiday validation
    └── profileValidator.js       # Profile validation
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
- **Holiday Selection Templates** ✅ NEW
- **Optimized External API Integration** ✅ NEW

## Recent Updates

### New Features Added
- **Holiday Selection Template System**: Complete CRUD operations for holiday templates
- **Optimized Calendarific Service**: Enhanced external API integration with caching
- **Festival Keywords**: Added festival keyword definitions for better categorization

### New Migrations Added
- `create-holiday-selection-templates.js` - Holiday template system database schema
- Enhanced existing migrations for better data integrity

### Enhanced Services
- **Holiday Template Service**: Full business logic for template management
- **Optimized Calendarific Service**: Improved performance and error handling
- **Enhanced Calendar Data Fetcher**: Better data processing and normalization

### Updated Routes
- **Holiday Selection Template Routes**: Complete REST API for template management
- **Enhanced Admin Routes**: Improved route organization and middleware

### Enhanced Models
- **HolidaySelectionTemplate Model**: New model for template system
- **Enhanced Holiday Model**: Better integration with template system

### Enhanced Utilities
- **Festival Keywords**: Better holiday categorization
- **Enhanced Calendar Event Normalizer**: Improved event processing