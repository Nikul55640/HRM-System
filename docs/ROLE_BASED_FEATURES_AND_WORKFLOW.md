
# HRM System - Role-Based Features & Workflow Documentation

## 📋 Table of Contents
- [System Overview](#system-overview)
- [User Roles & Permissions](#user-roles--permissions)
- [Employee Features & Workflow](#employee-features--workflow)
- [HR Features & Workflow](#hr-features--workflow)
- [SuperAdmin Features & Workflow](#superadmin-features--workflow)
- [Manager Features & Workflow](#manager-features--workflow)
- [Attendance System Workflow](#attendance-system-workflow)
- [Leave Management Workflow](#leave-management-workflow)
- [Data Access & Visibility](#data-access--visibility)
- [Notification System](#notification-system)
- [Security & Audit](#security--audit)

---

## 🎯 System Overview

The HRM System is a comprehensive Human Resource Management platform with role-based access control, designed to handle employee management, attendance tracking, leave management, and administrative tasks.

### Core Modules
- **Authentication & Authorization**
- **Employee Self-Service (ESS)**
- **Attendance Management**
- **Leave Management**
- **Employee Management**
- **Calendar & Events**
- **Lead Management**
- **Shift Management**
- **Reporting & Analytics**
- **System Administration**

---

## 👥 User Roles & Permissions

### 🔵 Employee
**Primary Role**: Self-service and personal data management
**Access Level**: Own data only
**Login**: Employee portal

### 🟢 HR (Human Resources)
**Primary Role**: Employee management and HR operations
**Access Level**: All employee data (view/edit)
**Login**: Admin portal

### 🔵 HR_Manager
**Primary Role**: Senior HR operations and team management
**Access Level**: All employee data + advanced HR features
**Login**: Admin portal

### 🟣 SuperAdmin
**Primary Role**: System administration and full control
**Access Level**: Complete system access
**Login**: Admin portal

### 🟠 Manager
**Primary Role**: Team management and oversight
**Access Level**: Team members' data
**Login**: Employee portal (with manager features)

---

## 👤 Employee Features & Workflow

### 🏠 Dashboard Access
- **Route**: `/dashboard`
- **Features**: Personal overview, quick stats, notifications
- **Data Visible**: Own attendance, leave balance, upcoming events

### 👤 Profile Management
- **Route**: `/employee/profile`
- **Features**:
  - View/edit personal information
  - Upload profile photo
  - Update contact details
  - View employment details (read-only)
- **Workflow**:
  1. Employee logs in
  2. Navigates to profile
  3. Updates personal information
  4. Changes are saved and audited

### 🏦 Bank Details Management
- **Route**: `/employee/bank-details`
- **Features**:
  - Add/update bank account information
  - Upload bank documents
  - View verification status
- **Workflow**:
  1. Employee adds bank details
  2. HR receives notification for verification
  3. HR verifies and approves/rejects
  4. Employee receives notification of status

### ⏰ Attendance Management
- **Route**: `/employee/attendance`
- **Features**:
  - **Clock In/Out**: Real-time attendance tracking
  - **Break Management**: Start/end breaks
  - **Session History**: View daily attendance records
  - **Monthly Calendar**: Visual attendance overview
  - **Attendance Summary**: Statistics and insights
- **Clock In/Out Workflow**:
  1. Employee arrives at work
  2. Clicks "Clock In" button
  3. System records timestamp and location (if enabled)
  4. Employee works and takes breaks as needed
  5. At end of day, clicks "Clock Out"
  6. System calculates work hours and overtime
- **Data Visible**: Own attendance records only

### 🔧 Attendance Corrections
- **Route**: `/employee/attendance/corrections`
- **Features**:
  - Request corrections for missed clock-in/out
  - View correction request status
  - Add explanations for attendance issues
- **Workflow**:
  1. Employee notices attendance discrepancy
  2. Submits correction request with explanation
  3. HR receives notification
  4. HR reviews and approves/rejects
  5. Employee receives notification of decision

### 🏖️ Leave Management
- **Route**: `/employee/leave`
- **Features**:
  - Apply for leave (Casual, Sick, Paid)
  - View leave history
  - Check leave balance
  - Cancel pending requests
- **Leave Application Workflow**:
  1. Employee checks leave balance
  2. Selects leave type and dates
  3. Adds reason and uploads documents (if needed)
  4. Submits application
  5. HR receives notification
  6. HR approves/rejects with comments
  7. Employee receives email notification
- **Leave Types Available**:
  - **Casual Leave**: General time off
  - **Sick Leave**: Medical reasons
  - **Paid Leave**: Vacation time

### 📅 Calendar & Events
- **Route**: `/employee/calendar`
- **Features**:
  - View personal calendar
  - See company holidays
  - View team events
  - Check leave schedules
- **Data Visible**: Own events, company-wide holidays, approved team leaves

### 👥 Lead Management (if applicable)
- **Route**: `/employee/leads`
- **Features**:
  - View assigned leads
  - Update lead status
  - Add lead activities
- **Data Visible**: Only assigned leads

### ⏰ Shift Information
- **Route**: `/employee/shifts`
- **Features**:
  - View current shift schedule
  - See shift changes
  - Receive shift notifications
- **Data Visible**: Own shift assignments only

### ⚙️ Settings & Preferences
- **Routes**: `/employee/settings/*`
- **Features**:
  - Profile settings
  - Security settings (password change)
  - Emergency contacts
  - Notification preferences

---

## 🟢 HR Features & Workflow

### 🏠 HR Dashboard
- **Route**: `/dashboard`
- **Features**: Company-wide overview, pending approvals, HR metrics
- **Data Visible**: All employees' aggregated data

### 👥 Employee Management
- **Route**: `/admin/employees`
- **Features**:
  - **View All Employees**: Complete employee directory
  - **Add New Employee**: Create employee profiles
  - **Edit Employee Data**: Update employee information
  - **Employee Profiles**: Detailed employee views
- **Workflow**:
  1. HR accesses employee list
  2. Can search, filter, and sort employees
  3. View detailed profiles with all information
  4. Edit employee data as needed
  5. All changes are audited
- **Data Visible**: All employee records

### 🏢 Department & Designation Management
- **Routes**: `/admin/departments`, `/admin/designations`
- **Features**:
  - Create/edit departments
  - Manage designations
  - Assign employees to departments
- **Workflow**:
  1. HR creates organizational structure
  2. Assigns employees to departments
  3. Sets up reporting hierarchies

### ⏰ Attendance Management (HR View)
- **Routes**: 
  - `/admin/attendance` - Main attendance management
  - `/admin/attendance/live` - Real-time attendance dashboard
  - `/admin/attendance/corrections` - Review correction requests
- **Features**:
  - **Live Dashboard**: See who's currently in/out
  - **Attendance Records**: View all employee attendance
  - **Correction Approvals**: Review and approve/reject corrections
  - **Manual Adjustments**: Mark absent, add holidays
  - **Attendance Reports**: Generate attendance reports
- **HR Attendance Workflow**:
  1. Monitor live attendance dashboard
  2. Review daily attendance records
  3. Process correction requests
  4. Handle attendance discrepancies
  5. Generate reports for management
- **Data Visible**: All employees' attendance records

### 🏖️ Leave Management (HR View)
- **Routes**:
  - `/admin/leave` - Leave approvals and management
  - `/admin/leave-balances` - Manage leave balances
- **Features**:
  - **Leave Approvals**: Approve/reject leave requests
  - **Leave Balance Management**: Adjust leave balances
  - **Leave Reports**: Generate leave reports
  - **Leave Policies**: Manage leave rules
- **HR Leave Workflow**:
  1. Receive leave applications
  2. Review leave requests and employee history
  3. Approve/reject with comments
  4. Monitor leave balances
  5. Handle leave policy exceptions
- **Data Visible**: All employees' leave records and balances

### 👥 Lead Management (HR View)
- **Route**: `/admin/leads`
- **Features**:
  - View all company leads
  - Assign leads to employees
  - Monitor lead progress
  - Generate lead reports
- **Data Visible**: All company leads and assignments

### ⏰ Shift Management
- **Route**: `/admin/shifts`
- **Features**:
  - Create shift schedules
  - Assign employees to shifts
  - Manage shift changes
  - Handle shift conflicts
- **Shift Management Workflow**:
  1. Create shift templates
  2. Assign employees to shifts
  3. Handle shift change requests
  4. Monitor shift compliance

### 📅 Calendar Management
- **Routes**:
  - `/admin/calendar/management` - General calendar management
  - `/admin/calendar/smart` - Smart calendar features
  - `/admin/calendar/calendarific` - Holiday management
- **Features**:
  - Manage company holidays
  - Create company events
  - Import holidays from external sources
  - Manage calendar policies

### 🏦 Bank Verification
- **Route**: `/admin/bank-verification`
- **Features**:
  - Review employee bank details
  - Verify bank documents
  - Approve/reject bank information
- **Workflow**:
  1. Employee submits bank details
  2. HR reviews documents
  3. Verifies information
  4. Approves or requests corrections

### 📢 Announcements
- **Route**: `/admin/announcements`
- **Features**:
  - Create company announcements
  - Schedule announcements
  - Target specific groups
  - Track announcement engagement

### 📋 Company Policies & Documents
- **Routes**: `/admin/policies`, `/admin/documents`
- **Features**:
  - Manage company policies
  - Upload and organize documents
  - Control document access
  - Track document versions

---

## 🟣 SuperAdmin Features & Workflow

### All HR Features PLUS:

### 👥 User Management
- **Route**: `/admin/users`
- **Features**:
  - Create system users
  - Assign roles and permissions
  - Manage user accounts
  - Reset passwords
- **Workflow**:
  1. Create user accounts for new employees
  2. Assign appropriate roles
  3. Manage user permissions
  4. Handle account issues

### 🏖️ Leave Balance Rollover
- **Route**: `/admin/leave-balance-rollover`
- **Features**:
  - Annual leave balance rollover
  - Bulk leave balance adjustments
  - Leave policy changes
- **Workflow**:
  1. Review annual leave balances
  2. Apply rollover policies
  3. Make bulk adjustments
  4. Communicate changes to employees

### ⚙️ System Settings
- **Route**: `/admin/settings`
- **Features**:
  - Configure system parameters
  - Manage integrations
  - Set up email configurations
  - Configure attendance rules

### 🏛️ System Policies
- **Route**: `/admin/system-policies`
- **Features**:
  - Configure system-wide policies
  - Set up working rules
  - Manage system parameters
  - Configure business rules

### 📊 Audit Logs
- **Route**: `/admin/audit-logs`
- **Features**:
  - View all system activities
  - Track user actions
  - Monitor security events
  - Generate audit reports
- **Data Visible**: Complete system audit trail

### 📧 Email Testing
- **Route**: `/admin/email-testing`
- **Features**:
  - Test email configurations
  - Send test emails
  - Monitor email delivery
  - Debug email issues

---

## 🟠 Manager Features & Workflow

### Hybrid Access (Employee + Team Management):

### 👤 Personal Features
- All employee features for their own data

### 👥 Team Management
- **Routes**: `/manager/*`
- **Features**:
  - View team member profiles
  - Monitor team attendance
  - Approve team leave requests
  - Manage team schedules
- **Data Visible**: Direct reports' data only

---

## ⏰ Attendance System Workflow

### Daily Attendance Flow:
1. **Employee Arrival**:
   - Employee clocks in via web interface
   - System records timestamp and location
   - Status changes to "In Progress"

2. **During Work Hours**:
   - Employee can start/end breaks
   - System tracks break duration
   - Real-time status updates

3. **End of Day**:
   - Employee clocks out
   - System calculates total work hours
   - Overtime calculations applied
   - Status changes to "Completed"

### Automated Processes:
1. **Auto Clock-Out**: System automatically clocks out employees 30 minutes after shift end
2. **Absent Marking**: Employees not clocked in by shift start + grace period marked absent
3. **Half-Day Detection**: Employees working less than required hours marked as half-day
4. **Notifications**: Automated emails for attendance issues

### Correction Workflow:
1. **Employee Request**: Submit correction with explanation
2. **HR Review**: HR reviews request and supporting documents
3. **Decision**: HR approves/rejects with comments
4. **Notification**: Employee notified of decision
5. **Record Update**: Approved corrections update attendance records

---

## 🏖️ Leave Management Workflow

### Leave Application Process:
1. **Employee Initiates**:
   - Checks leave balance
   - Selects leave type and dates
   - Provides reason and documents
   - Submits application

2. **HR Processing**:
   - Receives notification
   - Reviews application and employee history
   - Checks leave balance and policies
   - Makes decision with comments

3. **Notification & Updates**:
   - Employee receives email notification
   - Leave balance updated if approved
   - Calendar updated with leave dates
   - Team notified of approved leave

### Leave Types & Rules:
- **Casual Leave**: 12 days per year, can be taken in advance
- **Sick Leave**: 6 days per year, requires medical certificate for >2 days
- **Paid Leave**: 18 days per year, requires advance approval

---

## 👁️ Data Access & Visibility

### Employee Level:
- **Own Data Only**: Profile, attendance, leaves, shifts
- **Company Data**: Holidays, announcements, policies
- **Team Data**: Team calendar events (limited)

### HR Level:
- **All Employee Data**: Complete access to all employee records
- **Attendance Data**: All employees' attendance records
- **Leave Data**: All leave requests and balances
- **Reports**: Company-wide reports and analytics

### SuperAdmin Level:
- **Complete System Access**: All data and configurations
- **User Management**: All user accounts and permissions
- **System Logs**: Complete audit trail
- **System Configuration**: All system settings

### Manager Level:
- **Own Data**: Same as employee
- **Team Data**: Direct reports' attendance, leaves, profiles
- **Limited HR Functions**: Team-specific approvals

---

## 🔔 Notification System

### Real-Time Notifications:
- **SSE (Server-Sent Events)**: Real-time browser notifications
- **Email Notifications**: Important updates via email
- **In-App Notifications**: Notification bell with unread count

### Notification Types:
1. **Attendance Alerts**: Late clock-in, missed clock-out, absent marking
2. **Leave Notifications**: Application status, approvals, rejections
3. **System Notifications**: Account changes, policy updates
4. **HR Notifications**: Pending approvals, correction requests
5. **Shift Notifications**: Schedule changes, shift assignments

### Email Templates:
- **Attendance Absent**: Automated absent marking notification
- **Attendance Incomplete**: Missing clock-out notification
- **Correction Required**: Attendance correction needed
- **Leave Approved**: Leave request approved notification

---

## 🔒 Security & Audit

### Authentication:
- **Role-Based Access Control (RBAC)**
- **JWT Token Authentication**
- **Session Management**
- **Password Policies**

### Authorization:
- **Route-Level Protection**
- **Component-Level Guards**
- **API Endpoint Security**
- **Data Access Controls**

### Audit Trail:
- **User Actions**: All user activities logged
- **Data Changes**: Complete change history
- **System Events**: Login/logout, failures, errors
- **Security Events**: Failed logins, permission changes

### Data Protection:
- **Encryption**: Sensitive data encrypted
- **Input Validation**: All inputs validated and sanitized
- **SQL Injection Protection**: Parameterized queries
- **XSS Protection**: Output encoding and CSP headers

---

## 📊 Reporting & Analytics

### Employee Reports:
- **Attendance Reports**: Daily, weekly, monthly attendance
- **Leave Reports**: Leave history and balance reports
- **Performance Reports**: Basic performance metrics

### HR Reports:
- **Department Reports**: Department-wise analytics
- **Attendance Analytics**: Company-wide attendance trends
- **Leave Analytics**: Leave patterns and utilization
- **Employee Reports**: Comprehensive employee reports

### SuperAdmin Reports:
- **System Reports**: System usage and performance
- **Audit Reports**: Security and compliance reports
- **User Activity Reports**: User behavior analytics
- **Custom Reports**: Configurable report generation

---

## 🔄 System Integration

### External Integrations:
- **Calendarific API**: Holiday data integration
- **Email Services**: SMTP, Resend, Mailtrap
- **File Storage**: Document and image storage
- **Backup Systems**: Automated data backups

### Internal Integrations:
- **Real-Time Updates**: SSE for live data
- **Automated Jobs**: Cron jobs for maintenance
- **Notification System**: Multi-channel notifications
- **Audit System**: Comprehensive logging

---

This documentation provides a complete overview of the HRM system's role-based features and workflows. Each role has specific permissions and access levels designed to maintain data security while providing necessary functionality for their responsibilities.