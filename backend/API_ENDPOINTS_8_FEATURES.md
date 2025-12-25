# HRM System API Endpoints - 8 Core Features

## Authentication
```
POST /api/auth/login
POST /api/auth/logout
POST /api/auth/refresh
```

## 1. Profile & Bank Details Management

### Admin (SuperAdmin, HR)
```
GET    /api/employees                    # Get all employees
GET    /api/employees/:id                # Get employee by ID
POST   /api/employees                    # Create employee
PUT    /api/employees/:id                # Update employee
DELETE /api/employees/:id                # Delete employee
```

### Employee
```
GET    /api/employee/profile             # Get my profile
PUT    /api/employee/profile             # Update my profile
GET    /api/employee/bank-details        # Get my bank details
PUT    /api/employee/bank-details        # Update my bank details
POST   /api/employee/profile/photo       # Upload profile photo
```

## 2. Attendance Management (Clock In/Out with Break & Late Tracking)

### Admin (SuperAdmin, HR)
```
GET    /api/admin/attendance             # Get all attendance records
GET    /api/admin/attendance/:id         # Get attendance by ID
PUT    /api/admin/attendance/:id         # Edit attendance record
GET    /api/admin/attendance-corrections # Get correction requests
PUT    /api/admin/attendance-corrections/:id/approve # Approve correction
PUT    /api/admin/attendance-corrections/:id/reject  # Reject correction
```

### Employee
```
POST   /api/employee/attendance/clock-in     # Clock in
POST   /api/employee/attendance/clock-out    # Clock out
POST   /api/employee/attendance/break-in     # Start break
POST   /api/employee/attendance/break-out    # End break
GET    /api/employee/attendance              # Get my attendance
POST   /api/employee/attendance/correction   # Request correction
```

## 3. Leave Management (Apply, Assign, Approve & Cancel)

### Admin (SuperAdmin, HR)
```
GET    /api/admin/leave                  # Get all leave requests
PUT    /api/admin/leave/:id/approve      # Approve leave
PUT    /api/admin/leave/:id/reject       # Reject leave
GET    /api/admin/leave-balances         # Get all leave balances
POST   /api/admin/leave-balances         # Assign leave balance
PUT    /api/admin/leave-balances/:id     # Update leave balance
```

### Employee
```
POST   /api/employee/leave               # Apply for leave
GET    /api/employee/leave               # Get my leave requests
PUT    /api/employee/leave/:id/cancel    # Cancel leave request
GET    /api/employee/leave/balance       # Get my leave balance
```

## 4. Employee Management

### Admin (SuperAdmin, HR)
```
GET    /api/employees                    # Get all employees
POST   /api/employees                    # Create employee
PUT    /api/employees/:id                # Update employee
DELETE /api/employees/:id                # Delete employee
PUT    /api/employees/:id/activate       # Activate employee
PUT    /api/employees/:id/deactivate     # Deactivate employee
GET    /api/admin/departments            # Get departments
POST   /api/admin/departments            # Create department
```

## 5. Lead Management

### Admin (SuperAdmin, HR)
```
GET    /api/admin/leads                  # Get all leads
POST   /api/admin/leads                  # Create lead
PUT    /api/admin/leads/:id              # Update lead
DELETE /api/admin/leads/:id              # Delete lead
PUT    /api/admin/leads/:id/assign       # Assign lead to employee
```

### Employee
```
GET    /api/admin/leads?assignedTo=me    # Get my assigned leads
PUT    /api/admin/leads/:id              # Update lead status
POST   /api/admin/leads/:id/notes        # Add follow-up note
```

## 6. Shift Management (With Late Arrival & Break Rules)

### Admin (SuperAdmin, HR)
```
GET    /api/admin/shifts                 # Get all shifts
POST   /api/admin/shifts                 # Create shift
PUT    /api/admin/shifts/:id             # Update shift
DELETE /api/admin/shifts/:id             # Delete shift
POST   /api/admin/shifts/assign          # Assign shift to employee
```

### Employee
```
GET    /api/employee/shifts/my-shifts    # Get my shift assignments
GET    /api/employee/shifts/current      # Get current active shift
GET    /api/employee/shifts/schedule     # Get shift schedule
POST   /api/employee/shifts/change-request # Request shift change
```

## 7. Calendar, Event & Holiday Management

### Admin (SuperAdmin, HR)
```
GET    /api/admin/holidays               # Get all holidays
POST   /api/admin/holidays               # Create holiday
PUT    /api/admin/holidays/:id           # Update holiday
DELETE /api/admin/holidays/:id           # Delete holiday
GET    /api/admin/events                 # Get all events
POST   /api/admin/events                 # Create event
PUT    /api/admin/events/:id             # Update event
DELETE /api/admin/events/:id             # Delete event
```

### Employee
```
GET    /api/employee/calendar            # Get calendar view
GET    /api/employee/calendar/holidays   # Get holidays
GET    /api/employee/calendar/events     # Get events
```

## 8. Audit Log Management

### Admin (SuperAdmin only)
```
GET    /api/admin/audit-logs             # Get audit logs
GET    /api/admin/audit-logs/filter      # Filter audit logs
GET    /api/admin/audit-logs/export      # Export audit logs
```

## System Configuration

### Admin (SuperAdmin only)
```
GET    /api/admin/system-policies        # Get system policies
PUT    /api/admin/system-policies/:key   # Update policy
```

## Dashboard

### Admin
```
GET    /api/admin/dashboard              # Get admin dashboard data
```

### Employee
```
GET    /api/employee/dashboard           # Get employee dashboard data
```

## Role-Based Access Control

### SuperAdmin
- Full access to all endpoints
- Can manage system policies
- Can view audit logs
- Can manage all employees and roles

### HR
- Can manage employees (except SuperAdmin)
- Can approve/reject leave and attendance corrections
- Can assign shifts and leave balances
- Can manage leads and events
- Limited audit log access (optional)

### Employee
- Can only access own data
- Can apply for leave and request corrections
- Can view assigned shifts and leads
- Can update own profile and bank details
- No access to admin functions or audit logs