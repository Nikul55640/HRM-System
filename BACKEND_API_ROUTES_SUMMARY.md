# Backend API Routes Summary

## Base URL: `http://localhost:4001/api`

## 🔐 Authentication Routes (`/auth`)
- `POST /auth/register` - Register new user (initial setup)
- `POST /auth/login` - User login
- `POST /auth/refresh` - Refresh access token
- `POST /auth/logout` - User logout (requires auth)
- `POST /auth/forgot-password` - Request password reset
- `POST /auth/reset-password` - Reset password with token
- `POST /auth/change-password` - Change password (requires auth)
- `GET /auth/me` - Get current user profile (requires auth)

## 👥 Employee Management Routes (`/employees`)
- `POST /employees` - Create employee (HR only)
- `GET /employees` - List employees (role-based filtering)
- `GET /employees/search` - Search employees
- `GET /employees/directory` - Employee directory
- `GET /employees/me` - Get current employee profile
- `GET /employees/:id` - Get employee by ID
- `PATCH /employees/:id/self-update` - Self-update employee
- `PUT /employees/:id` - Update employee (HR/Admin)
- `DELETE /employees/:id` - Delete employee (soft delete)

## 📊 Dashboard Routes (`/dashboard`)
- `GET /dashboard` - Complete dashboard data
- `GET /dashboard/profile` - Profile summary
- `GET /dashboard/leave` - Leave balance
- `GET /dashboard/attendance` - Attendance records
- `GET /dashboard/activity` - Recent activity feed

## 🕐 Attendance Routes (`/employee/attendance` & `/admin/attendance`)

### Employee Attendance
- `GET /employee/attendance` - Get own attendance records
- `GET /employee/attendance/summary` - Monthly summary
- `GET /employee/attendance/export` - Export attendance report
- `POST /employee/attendance/check-in` - Check in
- `POST /employee/attendance/check-out` - Check out
- `POST /employee/attendance/session/start` - Start work session
- `POST /employee/attendance/session/end` - End work session
- `GET /employee/attendance/sessions` - Get sessions
- `POST /employee/attendance/break/start` - Start break
- `POST /employee/attendance/break/end` - End break
- `GET /employee/attendance/live` - Live attendance (admin/manager)
- `GET /employee/attendance/live/:employeeId` - Employee live status
- `PUT /employee/attendance/:recordId` - Manual update (HR only)

### Admin Attendance
- `GET /admin/attendance` - All attendance records
- `GET /admin/attendance/statistics` - Attendance statistics
- `GET /admin/attendance/:employeeId` - Employee attendance
- `POST /admin/attendance/manual` - Create manual entry
- `PUT /admin/attendance/:id` - Update record
- `DELETE /admin/attendance/:id` - Delete record

## 🏖️ Leave Management Routes (`/admin/leave`)
- `GET /admin/leave/balances` - All leave balances
- `POST /admin/leave/assign/:employeeId` - Assign leave balance
- `GET /admin/leave/leave-requests` - All leave requests
- `GET /admin/leave/leave-requests/statistics` - Leave statistics
- `GET /admin/leave/leave-requests/:id` - Specific leave request
- `PUT /admin/leave/leave-requests/:id/approve` - Approve leave
- `PUT /admin/leave/leave-requests/:id/reject` - Reject leave

## 👨‍💼 Manager Routes (`/manager`)
- `GET /manager/team` - Get team members
- `GET /manager/approvals` - Get pending approvals
- `PUT /manager/leave/:id/approve` - Approve team leave
- `PUT /manager/leave/:id/reject` - Reject team leave
- `GET /manager/reports` - Team reports

## ⚙️ Configuration Routes (`/config`)
- `GET /config/departments/hierarchy` - Department hierarchy
- `GET /config/departments` - All departments
- `POST /config/departments` - Create department
- `GET /config/departments/:id` - Department by ID
- `PUT /config/departments/:id` - Update department
- `DELETE /config/departments/:id` - Delete department
- `GET /config/custom-fields` - Custom fields
- `POST /config/custom-fields/employee` - Set employee fields
- `POST /config/custom-fields/document` - Set document categories
- `GET /config/system` - System configurations
- `POST /config/system` - Set system config

## 📋 Admin Dashboard Routes (`/admin/dashboard`)
- `GET /admin/dashboard` - Admin dashboard stats (protected)
- `GET /admin/dashboard/test` - Admin dashboard stats (public test)

## 👤 Employee Self-Service Routes (`/employee`)
Available routes include:
- `/employee/attendance.js` - Employee attendance management
- `/employee/bankDetails.js` - Bank details management
- `/employee/employeeCalendar.js` - Employee calendar
- `/employee/leave.js` - Leave requests
- `/employee/notifications.js` - Notifications
- `/employee/payslips.js` - Payslip access
- `/employee/profile.js` - Profile management
- `/employee/requests.js` - Various requests

## 📄 Document Routes (`/document`)
- Document management endpoints (specific routes need to be checked)

## 👤 User Routes (`/users`)
- User management endpoints (specific routes need to be checked)

## 📅 Calendar Routes (`/calendar`)
- Company calendar endpoints (specific routes need to be checked)

## 🔍 Health Check
- `GET /health` - Server health check

## 🚫 404 Handler
- All undefined routes return structured 404 error with suggestions

## 🔒 Security Features
- Helmet security headers
- CORS configuration
- Rate limiting (production only)
- MongoDB sanitization
- HPP protection
- Request compression
- Body parser with size limits

## 📝 Notes
1. All routes except `/health`, `/auth/register`, `/auth/login`, `/auth/refresh`, `/auth/forgot-password`, `/auth/reset-password` require authentication
2. Most routes have role-based permissions using RBAC system
3. Rate limiting is disabled in development mode
4. All responses follow consistent JSON structure with `success`, `data`, `message` fields
5. Error handling is centralized with structured error responses
6. Logging is implemented for all requests and errors

## ⚠️ Missing/Incomplete Routes
Based on frontend service calls, these routes may need implementation:
- `/manager/leave-requests/:id/approve` - Manager leave approval
- `/manager/leave-requests/:id/reject` - Manager leave rejection
- `/attendance/records` - General attendance records endpoint
- `/attendance/export` - Attendance export endpoint
- `/attendance/summary` - Attendance summary endpoint

## 🔧 Backend Status
- ✅ Authentication system complete
- ✅ Employee management complete
- ✅ Basic attendance system implemented
- ✅ Leave management system implemented
- ✅ Manager approval system implemented
- ✅ Configuration system implemented
- ✅ Dashboard system implemented
- ⚠️ Some frontend service methods may need corresponding backend endpoints
- ⚠️ Manager approvals endpoint has database query issues (find method on undefined)