# Complete HRM System Menu Structure

## 📋 Full Navigation Map

```
HRM SYSTEM
│
├── 📊 GENERAL
│   └── Dashboard (/dashboard)
│
├── 👤 MY SELF SERVICE (Employee Only)
│   ├── My Profile (/employee/profile)
│   ├── Bank Details (/employee/bank-details)
│   ├── My Attendance (/employee/attendance)
│   ├── My Leave (/employee/leave)
│   ├── My Leads (/employee/leads)
│   ├── My Shifts (/employee/shifts)
│   └── Calendar & Events (/employee/calendar)
│
├── 🏢 HR ADMINISTRATION (HR/SuperAdmin)
│   ├── Employees (/admin/employees)
│   ├── Departments (/admin/departments)
│   ├── Attendance Management (/admin/attendance)
│   ├── Attendance Corrections (/admin/attendance/corrections) ✨ NEW
│   ├── Leave Requests (/admin/leave)
│   ├── Leave Balances (/admin/leave-balances)
│   ├── Lead Management (/admin/leads)
│   ├── Shift Management (/admin/shifts)
│   ├── Events (/admin/events)
│   └── Holidays (/admin/holidays) ✨ NEW
│
└── 🔐 SYSTEM ADMINISTRATION (SuperAdmin Only)
    ├── User Management (/admin/users)
    ├── System Policies (/admin/system-policies)
    └── Audit Logs (/admin/audit-logs)
```

## 📊 Statistics

| Category | Count | Pages |
|----------|-------|-------|
| General | 1 | Dashboard |
| Employee Self-Service | 7 | Profile, Bank, Attendance, Leave, Leads, Shifts, Calendar |
| HR Administration | 10 | Employees, Departments, Attendance (2), Leave (2), Leads, Shifts, Events, Holidays |
| System Administration | 3 | Users, Policies, Audit Logs |
| **TOTAL** | **21** | **All pages** |

## 🎯 Feature Mapping

### Feature 1: Profile & Bank Details Management
- **Employee:** My Profile, Bank Details
- **Admin:** (Managed via Employees page)

### Feature 2: Attendance Management
- **Employee:** My Attendance
- **Admin:** Attendance Management, Attendance Corrections

### Feature 3: Leave Management
- **Employee:** My Leave
- **Admin:** Leave Requests, Leave Balances, Holidays

### Feature 4: Employee Management
- **Admin:** Employees, Departments
- **SuperAdmin:** User Management

### Feature 5: Lead Management
- **Employee:** My Leads
- **Admin:** Lead Management

### Feature 6: Shift Management
- **Employee:** My Shifts
- **Admin:** Shift Management

### Feature 7: Calendar & Events
- **Employee:** Calendar & Events
- **Admin:** Events, Holidays

### Feature 8: Audit & System
- **SuperAdmin:** Audit Logs, System Policies

## 👥 Role-Based Access

### Employee Role
```
✅ Dashboard
✅ My Self Service (7 pages)
   - My Profile
   - Bank Details
   - My Attendance
   - My Leave
   - My Leads
   - My Shifts
   - Calendar & Events
❌ HR Administration
❌ System Administration
```

### HR Role
```
✅ Dashboard
✅ My Self Service (7 pages)
✅ HR Administration (10 pages)
   - Employees
   - Departments
   - Attendance Management
   - Attendance Corrections
   - Leave Requests
   - Leave Balances
   - Lead Management
   - Shift Management
   - Events
   - Holidays
❌ System Administration
```

### SuperAdmin Role
```
✅ Dashboard
✅ My Self Service (7 pages)
✅ HR Administration (10 pages)
✅ System Administration (3 pages)
   - User Management
   - System Policies
   - Audit Logs
```

## 🔐 Permission-Based Access

### Employee Permissions
- `MODULES.EMPLOYEE.VIEW_OWN` - View own profile
- `MODULES.ATTENDANCE.VIEW_OWN` - View own attendance
- `MODULES.LEAVE.VIEW_OWN` - View own leave
- `MODULES.LEAD.VIEW` - View leads
- `MODULES.CALENDAR.VIEW` - View calendar

### HR Permissions
- `MODULES.EMPLOYEE.VIEW_ALL` - View all employees
- `MODULES.ATTENDANCE.VIEW_ALL` - View all attendance
- `MODULES.ATTENDANCE.EDIT_ANY` - Edit attendance
- `MODULES.ATTENDANCE.MANAGE_SHIFTS` - Manage shifts
- `MODULES.LEAVE.VIEW_ALL` - View all leave
- `MODULES.LEAVE.APPROVE_ANY` - Approve leave
- `MODULES.LEAVE.MANAGE_BALANCE` - Manage leave balance
- `MODULES.LEAVE.MANAGE_POLICIES` - Manage holidays
- `MODULES.LEAD.CREATE` - Create leads
- `MODULES.LEAD.MANAGE_ALL` - Manage all leads
- `MODULES.CALENDAR.MANAGE` - Manage events
- `MODULES.DEPARTMENT.VIEW` - View departments
- `MODULES.DEPARTMENT.CREATE` - Create departments

### SuperAdmin Permissions
- All HR permissions
- `MODULES.USER.VIEW` - View users
- `MODULES.SYSTEM.VIEW_CONFIG` - View system config
- `MODULES.SYSTEM.MANAGE_CONFIG` - Manage system config
- `MODULES.SYSTEM.VIEW_AUDIT_LOGS` - View audit logs

## 🎨 Icon Reference

| Icon | Usage | Pages |
|------|-------|-------|
| LayoutDashboard | Dashboard | Dashboard |
| User | Profile | My Profile |
| Banknote | Bank | Bank Details |
| Clock | Attendance/Time | My Attendance, Attendance Management |
| CalendarDays | Leave | My Leave, Leave Requests |
| Target | Leads | My Leads, Lead Management |
| Calendar | Shifts/Events | My Shifts, Shift Management, Events |
| CalendarRange | Calendar | Calendar & Events |
| Users | Employees | Employees |
| Building2 | Departments | Departments |
| Clock4 | Attendance Admin | Attendance Management |
| ClipboardEdit | Corrections | Attendance Corrections |
| ClipboardCheck | Leave Requests | Leave Requests |
| Scale | Balances | Leave Balances |
| Settings | Configuration | System Policies |
| UserCog | User Management | User Management |
| ListChecks | Audit | Audit Logs |
| PartyPopper | Holidays | Holidays |
| Shield | System Admin | System Administration |
| Home | General | General |

## 🔄 Navigation Flow

### Employee Journey
```
Login → Dashboard → My Self Service
                  ├── Profile Management
                  ├── Attendance Tracking
                  ├── Leave Management
                  ├── Lead Management
                  ├── Shift Viewing
                  └── Calendar Viewing
```

### HR Journey
```
Login → Dashboard → HR Administration
                  ├── Employee Management
                  ├── Attendance Management
                  ├── Leave Management
                  ├── Lead Management
                  ├── Shift Management
                  └── Event Management
```

### SuperAdmin Journey
```
Login → Dashboard → HR Administration
                  ├── (All HR features)
                  └── System Administration
                     ├── User Management
                     ├── System Configuration
                     └── Audit Logs
```

## 📱 Responsive Behavior

- **Desktop (>1024px):** Full sidebar with text labels
- **Tablet (768px-1024px):** Sidebar expands on hover
- **Mobile (<768px):** Icon-only sidebar, expands on tap

## ✨ Recent Additions

1. **Attendance Corrections** - New page for HR to manage attendance corrections
2. **Holidays** - Moved from System Admin to HR Administration for easier access
3. **Collapsible Sections** - All sections now collapsible for better organization
4. **Improved Defaults** - General and My Self Service open by default

## 🚀 Quick Access

### Most Used Pages
1. Dashboard - `/dashboard`
2. My Attendance - `/employee/attendance`
3. My Leave - `/employee/leave`
4. Attendance Management - `/admin/attendance`
5. Leave Requests - `/admin/leave`

### Admin Quick Links
- Employees: `/admin/employees`
- Departments: `/admin/departments`
- Shifts: `/admin/shifts`
- Events: `/admin/events`

### System Quick Links
- Users: `/admin/users`
- Audit Logs: `/admin/audit-logs`
- System Policies: `/admin/system-policies`

## 📝 Notes

- All pages are fully functional and routed
- Permission checks are integrated
- Role-based visibility is automatic
- Sidebar updates in real-time based on user role
- No additional configuration needed

## 🔧 Customization

To customize the sidebar:
1. Edit `src/core/layout/Sidebar.jsx`
2. Modify the `allNavItems` array
3. Add/remove/hide pages as needed
4. See `SIDEBAR_CUSTOMIZATION_GUIDE.md` for details
