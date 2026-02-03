# HRM System - Project Structure Documentation

## 📋 Table of Contents
- [Overview](#overview)
- [Technology Stack](#technology-stack)
- [Project Architecture](#project-architecture)
- [Backend Structure](#backend-structure)
- [Frontend Structure](#frontend-structure)
- [Database Schema](#database-schema)
- [API Structure](#api-structure)
- [Authentication & Authorization](#authentication--authorization)
- [File Organization](#file-organization)
- [Development Workflow](#development-workflow)

---

## 🎯 Overview

HRM System is a full-stack Human Resource Management application built with modern web technologies, featuring role-based access control, real-time notifications, and comprehensive employee management capabilities.

### Key Features
- **Role-Based Access Control (RBAC)**
- **Real-Time Attendance Tracking**
- **Leave Management System**
- **Employee Self-Service Portal**
- **HR Administration Dashboard**
- **Automated Notifications**
- **Audit Logging**
- **Multi-Provider Email System**

---

## 🛠️ Technology Stack

### Backend
- **Runtime**: Node.js (v18+)
- **Framework**: Express.js
- **Database**: PostgreSQL with Sequelize ORM
- **Authentication**: JWT (JSON Web Tokens)
- **Email**: Multi-provider (SMTP, Resend, Mailtrap)
- **Real-time**: Server-Sent Events (SSE)
- **File Upload**: Multer
- **Validation**: Express Validator
- **Logging**: Winston
- **Process Management**: PM2

### Frontend
- **Framework**: React 18 with Vite
- **Routing**: React Router v6
- **State Management**: Zustand
- **UI Components**: Custom components with Tailwind CSS
- **Icons**: Lucide React
- **HTTP Client**: Axios
- **Forms**: React Hook Form
- **Notifications**: React Toastify
- **Date Handling**: Date-fns

### DevOps & Deployment
- **Containerization**: Docker & Docker Compose
- **Web Server**: Nginx (production)
- **Environment**: Multi-environment support
- **Database Migrations**: Sequelize CLI
- **Process Management**: PM2

---

## 🏗️ Project Architecture

```
HRM-System/
├── backend/                 # Node.js/Express API
├── frontend/               # React/Vite Application
├── nginx/                  # Nginx configuration
├── docs/                   # Documentation
├── docker-compose.yml      # Docker orchestration
└── package.json           # Root package configuration
```

### Architecture Pattern
- **MVC Pattern**: Model-View-Controller separation
- **Service Layer**: Business logic abstraction
- **Repository Pattern**: Data access abstraction
- **Middleware Pattern**: Request/response processing
- **Component-Based**: Modular frontend architecture

---

## 🔧 Backend Structure

```
backend/
├── src/
│   ├── app.js                    # Express app configuration
│   ├── server.js                 # Server entry point
│   ├── config/                   # Configuration files
│   │   ├── index.js             # Environment configuration
│   │   ├── sequelize.js         # Database configuration
│   │   └── rolePermissions.js   # RBAC configuration
│   ├── controllers/             # Request handlers
│   │   ├── admin/               # Admin-specific controllers
│   │   │   ├── employee.controller.js
│   │   │   ├── attendance.controller.js
│   │   │   ├── leave.controller.js
│   │   │   └── ...
│   │   ├── employee/            # Employee-specific controllers
│   │   │   ├── profile.controller.js
│   │   │   ├── attendance.controller.js
│   │   │   └── ...
│   │   ├── auth.controller.js   # Authentication
│   │   └── calendar/            # Calendar controllers
│   ├── middleware/              # Express middleware
│   │   ├── auth.middleware.js   # Authentication middleware
│   │   ├── authorize.js         # Authorization middleware
│   │   ├── errorHandler.js      # Error handling
│   │   ├── rateLimiter.js       # Rate limiting
│   │   └── upload.js            # File upload handling
│   ├── models/                  # Database models
│   │   ├── index.js             # Model exports
│   │   └── sequelize/           # Sequelize models
│   │       ├── User.js
│   │       ├── Employee.js
│   │       ├── AttendanceRecord.js
│   │       ├── LeaveRequest.js
│   │       └── ...
│   ├── routes/                  # API routes
│   │   ├── admin/               # Admin routes
│   │   │   ├── employee.routes.js
│   │   │   ├── attendance.routes.js
│   │   │   └── ...
│   │   ├── employee/            # Employee routes
│   │   │   ├── profile.routes.js
│   │   │   ├── attendance.routes.js
│   │   │   └── ...
│   │   └── auth.routes.js       # Authentication routes
│   ├── services/                # Business logic
│   │   ├── admin/               # Admin services
│   │   ├── employee/            # Employee services
│   │   ├── core/                # Core services
│   │   │   ├── BaseService.js
│   │   │   ├── attendanceCalculation.service.js
│   │   │   └── dateCalculation.service.js
│   │   ├── email/               # Email services
│   │   │   ├── email.service.js
│   │   │   ├── smtp.service.js
│   │   │   └── mailtrap.service.js
│   │   └── notificationService.js
│   ├── utils/                   # Utility functions
│   │   ├── logger.js            # Winston logger
│   │   ├── jwt.js               # JWT utilities
│   │   ├── encryption.js        # Encryption utilities
│   │   ├── dateUtils.js         # Date utilities
│   │   └── auditLogger.js       # Audit logging
│   ├── validators/              # Input validation
│   │   ├── authValidator.js
│   │   ├── employeeValidator.js
│   │   └── ...
│   ├── emails/                  # Email templates
│   │   ├── components/          # Reusable components
│   │   └── templates/           # Email templates
│   │       ├── AttendanceAbsent.js
│   │       ├── LeaveApproved.js
│   │       └── ...
│   ├── jobs/                    # Background jobs
│   │   ├── attendanceFinalization.js
│   │   ├── notificationCleanup.js
│   │   └── ...
│   └── migrations/              # Database migrations
├── logs/                        # Application logs
├── uploads/                     # File uploads
├── tests/                       # Test files
├── scripts/                     # Utility scripts
├── seeds/                       # Database seeders
├── package.json                 # Dependencies
└── Dockerfile                   # Docker configuration
```

### Backend Key Components

#### Controllers
- **Admin Controllers**: Handle admin-specific operations
- **Employee Controllers**: Handle employee self-service operations
- **Auth Controller**: Authentication and authorization
- **Calendar Controllers**: Calendar and event management

#### Services
- **Business Logic Layer**: Core business operations
- **Email Services**: Multi-provider email handling
- **Notification Service**: Real-time notifications
- **Calculation Services**: Attendance and leave calculations

#### Models
- **Sequelize Models**: Database entity definitions
- **Associations**: Model relationships and constraints
- **Validations**: Data validation rules

#### Middleware
- **Authentication**: JWT token validation
- **Authorization**: Role-based access control
- **Error Handling**: Centralized error management
- **Rate Limiting**: API rate limiting
- **File Upload**: Multer configuration

---

## ⚛️ Frontend Structure

```
frontend/
├── src/
│   ├── main.jsx                 # Application entry point
│   ├── App.jsx                  # Root component
│   ├── index.css                # Global styles
│   ├── core/                    # Core application logic
│   │   ├── guards/              # Route protection
│   │   │   ├── ProtectedRoute.jsx
│   │   │   ├── RoleGate.jsx
│   │   │   └── PermissionGate.jsx
│   │   ├── hooks/               # Custom hooks
│   │   │   ├── useAuth.js
│   │   │   ├── usePermissions.js
│   │   │   └── use-toast.js
│   │   ├── layout/              # Layout components
│   │   │   ├── MainLayout.jsx
│   │   │   ├── Header.jsx
│   │   │   ├── Sidebar.jsx
│   │   │   └── Footer.jsx
│   │   └── utils/               # Core utilities
│   │       ├── errorHandler.js
│   │       └── rolePermissions.js
│   ├── modules/                 # Feature modules
│   │   ├── auth/                # Authentication module
│   │   │   └── pages/
│   │   │       ├── AdminLogin.jsx
│   │   │       └── EmployeeLogin.jsx
│   │   ├── employee/            # Employee module
│   │   │   ├── pages/
│   │   │   │   ├── Dashboard/
│   │   │   │   └── ...
│   │   │   ├── profile/
│   │   │   └── settings/
│   │   ├── attendance/          # Attendance module
│   │   │   ├── admin/           # Admin attendance views
│   │   │   │   ├── LiveAttendanceDashboard.jsx
│   │   │   │   ├── AttendanceCorrections.jsx
│   │   │   │   └── ManageAttendance.jsx
│   │   │   ├── employee/        # Employee attendance views
│   │   │   │   ├── AttendancePage.jsx
│   │   │   │   ├── EnhancedClockInOut.jsx
│   │   │   │   ├── SessionHistoryView.jsx
│   │   │   │   └── MonthlyAttendanceCalendar.jsx
│   │   │   └── components/      # Shared components
│   │   ├── leave/               # Leave management module
│   │   │   ├── Admin/           # Admin leave views
│   │   │   ├── employee/        # Employee leave views
│   │   │   ├── hr/              # HR leave views
│   │   │   └── components/      # Shared components
│   │   ├── employees/           # Employee management module
│   │   │   ├── pages/
│   │   │   ├── components/
│   │   │   └── form-steps/
│   │   ├── calendar/            # Calendar module
│   │   │   ├── admin/           # Admin calendar views
│   │   │   ├── employee/        # Employee calendar views
│   │   │   └── components/
│   │   ├── leads/               # Lead management module
│   │   ├── organization/        # Organization module
│   │   └── admin/               # Admin-specific modules
│   │       └── pages/
│   │           ├── AccountSettings/
│   │           ├── Auditlogs/
│   │           └── ...
│   ├── shared/                  # Shared components and utilities
│   │   ├── components/          # Reusable components
│   │   │   ├── ErrorBoundary.jsx
│   │   │   ├── LoadingSpinner.jsx
│   │   │   ├── NotificationManager.jsx
│   │   │   └── ...
│   │   └── ui/                  # UI components
│   │       ├── button.jsx
│   │       ├── card.jsx
│   │       ├── dialog.jsx
│   │       ├── input.jsx
│   │       ├── table.jsx
│   │       └── ...
│   ├── services/                # API services
│   │   ├── api.js               # Axios configuration
│   │   ├── authService.js       # Authentication API
│   │   ├── employeeService.js   # Employee API
│   │   ├── attendanceService.js # Attendance API
│   │   ├── leaveService.js      # Leave API
│   │   └── ...
│   ├── stores/                  # State management
│   │   ├── useAuthStore.js      # Authentication state
│   │   ├── useEmployeeStore.js  # Employee state
│   │   ├── useAttendanceStore.js # Attendance state
│   │   └── ...
│   ├── routes/                  # Route definitions
│   │   ├── adminRoutes.jsx      # Admin routes
│   │   ├── essRoutes.jsx        # Employee self-service routes
│   │   ├── dashboardRoutes.jsx  # Dashboard routes
│   │   └── ...
│   ├── hooks/                   # Custom hooks
│   │   ├── useDebounce.js
│   │   ├── useNotifications.js
│   │   └── ...
│   ├── lib/                     # Library utilities
│   │   ├── utils.js             # General utilities
│   │   └── date-utils.js        # Date utilities
│   ├── styles/                  # Styling
│   │   ├── compact.css
│   │   └── responsive.css
│   └── utils/                   # Utility functions
│       ├── attendanceCalculations.js
│       ├── roleMapper.js
│       └── ...
├── public/                      # Static assets
├── dist/                        # Build output
├── package.json                 # Dependencies
├── vite.config.js              # Vite configuration
├── tailwind.config.js          # Tailwind configuration
└── Dockerfile                  # Docker configuration
```

### Frontend Key Components

#### Core Architecture
- **Guards**: Route and component-level protection
- **Hooks**: Custom React hooks for common functionality
- **Layout**: Consistent layout components
- **Utils**: Core utility functions

#### Modules
- **Feature-Based**: Each module contains related functionality
- **Role-Specific**: Separate views for different user roles
- **Shared Components**: Reusable UI components

#### State Management
- **Zustand Stores**: Lightweight state management
- **Local State**: Component-level state with hooks
- **API State**: Server state management with React Query patterns

#### Services
- **API Layer**: Centralized API communication
- **Authentication**: JWT token management
- **Error Handling**: Consistent error management

---

## 🗄️ Database Schema

### Core Tables

#### Users & Authentication
```sql
Users
├── id (Primary Key)
├── email (Unique)
├── password (Hashed)
├── role (SuperAdmin, HR_Manager, HR, Manager, Employee)
├── isActive
├── lastLogin
└── timestamps

Employees
├── id (Primary Key)
├── userId (Foreign Key -> Users.id)
├── employeeId (Unique)
├── firstName, lastName
├── email, phone
├── dateOfBirth, gender
├── address (JSON)
├── departmentId (Foreign Key)
├── designationId (Foreign Key)
├── joiningDate
├── salary, bankDetails (JSON)
└── timestamps
```

#### Attendance System
```sql
AttendanceRecords
├── id (Primary Key)
├── employeeId (Foreign Key)
├── date
├── clockIn, clockOut
├── breakMinutes
├── workHours, overtimeMinutes
├── status (present, absent, half_day, holiday)
├── halfDayType (first_half, second_half)
├── isWeekend, workMode
└── timestamps

AttendanceCorrectionRequests
├── id (Primary Key)
├── employeeId (Foreign Key)
├── attendanceId (Foreign Key)
├── requestType (missing_clockin, missing_clockout, incorrect_time)
├── originalValues (JSON)
├── requestedValues (JSON)
├── reason, adminComments
├── status (pending, approved, rejected)
└── timestamps
```

#### Leave Management
```sql
LeaveRequests
├── id (Primary Key)
├── employeeId (Foreign Key)
├── leaveType (Casual, Sick, Paid)
├── startDate, endDate
├── duration, reason
├── status (pending, approved, rejected)
├── adminComments
└── timestamps

LeaveBalances
├── id (Primary Key)
├── employeeId (Foreign Key)
├── leaveType
├── totalDays, usedDays, remainingDays
├── year
└── timestamps
```

#### Organization Structure
```sql
Departments
├── id (Primary Key)
├── name, description
├── isActive
└── timestamps

Designations
├── id (Primary Key)
├── title, description
├── departmentId (Foreign Key)
├── isActive
└── timestamps

Shifts
├── id (Primary Key)
├── name, shiftStartTime, shiftEndTime
├── isDefault, isActive
└── timestamps

EmployeeShifts
├── id (Primary Key)
├── employeeId (Foreign Key)
├── shiftId (Foreign Key)
├── effectiveDate, endDate
├── isActive
└── timestamps
```

### Relationships
- **One-to-One**: User ↔ Employee
- **One-to-Many**: Department → Employees, Employee → AttendanceRecords
- **Many-to-Many**: Employee ↔ Shifts (through EmployeeShifts)

---

## 🔌 API Structure

### Authentication Endpoints
```
POST /api/auth/login          # User login
POST /api/auth/logout         # User logout
POST /api/auth/refresh        # Token refresh
POST /api/auth/forgot-password # Password reset
```

### Employee Endpoints
```
GET    /api/employee/profile           # Get profile
PUT    /api/employee/profile           # Update profile
GET    /api/employee/attendance        # Get attendance
POST   /api/employee/attendance/clockin # Clock in
POST   /api/employee/attendance/clockout # Clock out
GET    /api/employee/leaves            # Get leaves
POST   /api/employee/leaves            # Apply leave
```

### Admin Endpoints
```
GET    /api/admin/employees            # Get all employees
POST   /api/admin/employees            # Create employee
PUT    /api/admin/employees/:id        # Update employee
GET    /api/admin/attendance           # Get all attendance
PUT    /api/admin/attendance/:id       # Update attendance
GET    /api/admin/leaves               # Get all leaves
PUT    /api/admin/leaves/:id           # Approve/reject leave
```

### Real-Time Endpoints
```
GET    /api/sse/notifications         # SSE notifications
GET    /api/admin/attendance/live     # Live attendance
```

---

## 🔐 Authentication & Authorization

### JWT Implementation
- **Access Tokens**: Short-lived (15 minutes)
- **Refresh Tokens**: Long-lived (7 days)
- **Token Storage**: HTTP-only cookies (secure)
- **Token Validation**: Middleware-based

### Role-Based Access Control
```javascript
Roles: {
  SuperAdmin: ['*'],           // Full access
  HR_Manager: ['hr:*', 'employee:read'],
  HR: ['employee:*', 'attendance:*', 'leave:*'],
  Manager: ['team:*', 'employee:read'],
  Employee: ['self:*']
}
```

### Route Protection
- **Backend**: Middleware-based authorization
- **Frontend**: Route guards and component gates
- **API**: Endpoint-level permission checks

---

## 📁 File Organization

### Naming Conventions
- **Files**: camelCase for JS/JSX, kebab-case for CSS
- **Components**: PascalCase
- **Services**: camelCase with .service.js suffix
- **Routes**: kebab-case with .routes.js suffix

### Import/Export Patterns
- **Named Exports**: For utilities and services
- **Default Exports**: For components and main modules
- **Index Files**: For module exports and re-exports

### Code Organization
- **Feature-Based**: Group by business functionality
- **Layer-Based**: Separate by technical concerns
- **Shared Resources**: Common utilities and components

---

## 🔄 Development Workflow

### Environment Setup
```bash
# Clone repository
git clone <repository-url>

# Install dependencies
npm install

# Setup environment
cp .env.example .env

# Start development
npm run dev
```

### Database Setup
```bash
# Run migrations
npm run migrate

# Seed database
npm run seed

# Reset database
npm run db:reset
```

### Docker Development
```bash
# Start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

### Testing
```bash
# Run tests
npm test

# Run specific test
npm test -- --grep "attendance"

# Coverage report
npm run test:coverage
```

### Build & Deployment
```bash
# Build frontend
npm run build

# Start production
npm start

# PM2 deployment
pm2 start ecosystem.config.js
```

---

## 📊 Performance Considerations

### Backend Optimization
- **Database Indexing**: Optimized queries
- **Caching**: Redis for session storage
- **Connection Pooling**: Database connection management
- **Rate Limiting**: API protection

### Frontend Optimization
- **Code Splitting**: Route-based splitting
- **Lazy Loading**: Component lazy loading
- **Bundle Optimization**: Vite optimization
- **Image Optimization**: Compressed assets

### Monitoring
- **Logging**: Winston with log rotation
- **Error Tracking**: Centralized error handling
- **Performance Metrics**: Response time monitoring
- **Health Checks**: Service health endpoints

---

This comprehensive project structure documentation provides a complete overview of the HRM system's architecture, organization, and development workflow. It serves as a reference for developers working on the project and helps maintain consistency across the codebase.