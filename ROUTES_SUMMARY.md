# Routes Summary

## Route Structure Overview

### Dashboard Routes
- **Path**: `/dashboard`
- **Component**: `Dashboard.jsx` (Smart Router)
  - Shows `AdminDashboard` for SuperAdmin, HR Manager, HR Administrator
  - Shows `EmployeeDashboard` for regular employees
- **Access**: All authenticated users

### Employee Self-Service Routes (ESS)
All ESS routes are at the root level (no `/ess/` prefix):

| Route | Component | Description |
|-------|-----------|-------------|
| `/profile` | ProfilePage | Employee profile management |
| `/bank-details` | BankDetailsPage | Bank account information |
| `/payslips` | PayslipsPage | View and download payslips |
| `/leave` | LeavePage | Leave applications and history |
| `/attendance` | AttendancePage | Attendance records |
| `/documents` | DocumentsPage | Personal documents |
| `/requests` | RequestsPage | All requests history |

### Employee Management Routes (Admin/HR)
| Route | Component | Roles |
|-------|-----------|-------|
| `/employees` | EmployeeList | HR Administrator, HR Manager, SuperAdmin |
| `/employees/new` | EmployeeForm | HR Administrator, HR Manager, SuperAdmin |
| `/employees/:id` | EmployeeProfile | HR Administrator, HR Manager, SuperAdmin |
| `/employees/:id/edit` | EmployeeForm | HR Administrator, HR Manager, SuperAdmin |
| `/directory` | EmployeeDirectory | HR Administrator, HR Manager, SuperAdmin |

### Manager Routes
| Route | Component | Description |
|-------|-----------|-------------|
| `/manager/approvals` | Approvals | Approve team leave/attendance |
| `/manager/team` | Team | View team members |
| `/manager/reports` | Reports | Team reports |

### Admin Routes
| Route | Component | Roles |
|-------|-----------|-------|
| `/announcements` | AnnouncementsPage | SuperAdmin |
| `/admin/logs` | AuditLogsPage | SuperAdmin |
| `/attendance-settings` | AttendanceSettings | SuperAdmin, Admin, HR, HR Manager |
| `/attendance/live` | LiveAttendanceDashboard | SuperAdmin, Admin, HR, HR Manager |
| `/users` | UserManagement | SuperAdmin |
| `/settings` | SystemConfig | SuperAdmin |

## Navigation Flow

### Login Redirect
- After login, users are redirected to `/dashboard`
- Dashboard component determines which view to show based on role

### Role-Based Dashboard Views
1. **SuperAdmin / HR Manager / HR Administrator**
   - See AdminDashboard with system-wide statistics
   - Quick actions for employee management, leave approvals, etc.

2. **Regular Employees**
   - See EmployeeDashboard with personal information
   - Quick actions to navigate to profile, leave, payslips
   - Attendance clock in/out functionality
   - Personal stats and team information

## Fixed Issues

### 1. Missing Service File
- **Created**: `frontend/src/services/employeeDashboardService.js`
- **Purpose**: Fetch and aggregate employee dashboard data
- **Methods**:
  - `getDashboardData()` - Main dashboard data aggregation
  - `getProfileSummary()` - Employee profile
  - `getAttendanceSummary()` - Attendance statistics
  - `getLeaveBalance()` - Leave balance information

### 2. Incorrect Import Path
- **Fixed**: Import path in EmployeeDashboard.jsx
- **From**: `"../../../services/employeeDashboardService"`
- **To**: `"../../../../services/employeeDashboardService"`

### 3. Navigation Path Updates
- **Fixed**: Navigation paths in EmployeeDashboard.jsx
- **Changed**: `/ess/leave`, `/ess/payslips`, `/ess/profile`
- **To**: `/leave`, `/payslips`, `/profile`

### 4. UserSwitcher Route
- **Fixed**: UserSwitcher redirect after role switch
- **Changed**: `/ess/profile` → `/profile`
- **Changed**: `/admin/dashboard` → `/dashboard`

## Route Configuration

All routes are configured in `frontend/src/routes/` and applied in `App.jsx` using the `applyRoutes` helper function which wraps each route with `ProtectedRoute` for role-based access control.

### Route Files
- `dashboardRoutes.jsx` - Dashboard routing
- `essRoutes.jsx` - Employee self-service
- `employeeRoutes.jsx` - Employee management (admin)
- `adminRoutes.jsx` - Admin-specific features
- `managerRoutes.jsx` - Manager tools
- `hrRoutes.jsx` - HR-specific features
- `payrollRoutes.jsx` - Payroll management
- `calendarRoutes.jsx` - Calendar views
- `organizationRoutes.jsx` - Organization structure

## Sidebar Navigation

The sidebar dynamically shows navigation items based on:
1. User role
2. User permissions (via `usePermissions` hook)
3. Whether user has an employeeId

Navigation sections:
- **General**: Dashboard, Directory (all users)
- **My Self Service**: Personal employee features (employees only)
- **Calendar**: Calendar views (with permission)
- **Manager Tools**: Team management (managers only)
- **HR Management**: Employee/leave/payroll management (HR only)
- **Admin**: System configuration (admins only)
