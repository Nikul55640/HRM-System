# Role-Based Functionality Matrix

## Complete Feature Access by Role

This document provides a comprehensive overview of which features are accessible to each role in the HRM System.

---

## 🟢 Employee Role

### Personal Workspace
| Feature | Access | Notes |
|---------|--------|-------|
| View Own Profile | ✅ | Can view personal information |
| Update Own Profile | ✅ | Can update personal details |
| View Bank Details | ✅ | Can view own bank information |
| Update Bank Details | ✅ | Can update own bank details |
| Emergency Contacts | ✅ | Can manage own emergency contacts |
| Security Settings | ✅ | Can change password and security settings |

### Attendance
| Feature | Access | Notes |
|---------|--------|-------|
| Clock In/Out | ✅ | Can mark attendance |
| View Own Attendance | ✅ | Can view personal attendance records |
| Request Correction | ✅ | Can request attendance corrections |
| View Attendance History | ✅ | Can view past attendance records |
| View Company Status | ✅ | Can see who is on leave/WFH (read-only) |

### Leave Management
| Feature | Access | Notes |
|---------|--------|-------|
| View Own Leave Balance | ✅ | Can check available leave balance |
| Apply for Leave | ✅ | Can submit leave requests |
| Cancel Own Leave | ✅ | Can cancel own leave requests |
| View Leave Calendar | ✅ | Can see leave calendar |
| View Leave History | ✅ | Can view past leave records |

### Other Features
| Feature | Access | Notes |
|---------|--------|-------|
| View Own Leads | ✅ | Can view assigned leads |
| Update Own Leads | ✅ | Can update lead information |
| View Own Shifts | ✅ | Can view assigned shifts |
| View Payslip | ✅ | Can view own payslips |
| Submit Expense | ✅ | Can submit expense reports |
| View Notifications | ✅ | Can view personal notifications |

### Admin Features
| Feature | Access | Notes |
|---------|--------|-------|
| Manage Employees | ❌ | Cannot manage other employees |
| Approve Requests | ❌ | Cannot approve requests |
| View All Attendance | ❌ | Cannot view other employees' attendance |
| System Settings | ❌ | Cannot access system settings |
| User Management | ❌ | Cannot manage users |

---

## 🟠 HR_Manager Role

### Personal Workspace (Inherited from Employee)
| Feature | Access | Notes |
|---------|--------|-------|
| View Own Profile | ✅ | Can view personal information |
| Update Own Profile | ✅ | Can update personal details |
| Clock In/Out | ✅ | Can mark own attendance |
| View Own Attendance | ✅ | Can view personal attendance records |
| Apply for Leave | ✅ | Can apply for own leave |

### Attendance Management
| Feature | Access | Notes |
|---------|--------|-------|
| View All Attendance | ✅ | Can view all employees' attendance |
| Edit Attendance | ✅ | Can manually edit attendance records |
| Approve Corrections | ✅ | Can approve attendance correction requests |
| View Analytics | ✅ | Can view attendance analytics |
| Manage Shifts | ✅ | Can create and manage shifts |
| Live Attendance | ✅ | Can view live attendance dashboard |

### Leave Management
| Feature | Access | Notes |
|---------|--------|-------|
| View All Leave | ✅ | Can view all employees' leave |
| Approve Leave | ✅ | Can approve/reject leave requests |
| Manage Leave Balances | ✅ | Can adjust leave balances |
| View Leave Calendar | ✅ | Can view company leave calendar |
| Manage Holiday Calendar | ✅ | Can manage holidays |
| Smart Calendar | ✅ | Can manage smart calendar settings |

### Employee Management
| Feature | Access | Notes |
|---------|--------|-------|
| View All Employees | ✅ | Can view all employee records |
| Create Employee | ✅ | Can create new employee records |
| Update Employee | ✅ | Can update employee information |
| Manage Documents | ✅ | Can manage employee documents |
| Onboard Employee | ✅ | Can onboard new employees |
| Offboard Employee | ✅ | Can offboard employees |
| View Departments | ✅ | Can view department information |
| View Designations | ✅ | Can view designations |

### Request Management
| Feature | Access | Notes |
|---------|--------|-------|
| View Correction Requests | ✅ | Can view attendance correction requests |
| Approve Corrections | ✅ | Can approve/reject corrections |
| View Leave Requests | ✅ | Can view leave requests |
| Approve Leave | ✅ | Can approve/reject leave |

### Organization Management
| Feature | Access | Notes |
|---------|--------|-------|
| View Policies | ✅ | Can view company policies |
| View Documents | ✅ | Can view company documents |
| View Announcements | ✅ | Can view announcements |
| Create Announcements | ✅ | Can create announcements |

### Lead Management
| Feature | Access | Notes |
|---------|--------|-------|
| View All Leads | ✅ | Can view all leads |
| Assign Leads | ✅ | Can assign leads to employees |
| Manage Leads | ✅ | Can manage lead information |

### System Features
| Feature | Access | Notes |
|---------|--------|-------|
| System Settings | ✅ | Can view and manage system settings |
| Audit Logs | ❌ | Cannot view audit logs |
| User Management | ❌ | Cannot manage users |

---

## 🔴 HR_Admin Role

### All HR_Manager Features (Inherited)
- ✅ All HR_Manager permissions
- ✅ All Employee permissions

### Additional HR_Admin Features

### Leave Management
| Feature | Access | Notes |
|---------|--------|-------|
| Manage Leave Policies | ✅ | Can create/edit leave policies |
| Leave Balance Rollover | ✅ | Can perform leave balance rollover |

### Employee Management
| Feature | Access | Notes |
|---------|--------|-------|
| Delete Employee | ✅ | Can delete employee records |
| Manage All Documents | ✅ | Can manage all employee documents |

### Department Management
| Feature | Access | Notes |
|---------|--------|-------|
| Create Department | ✅ | Can create new departments |
| Update Department | ✅ | Can update department information |
| Assign Employees | ✅ | Can assign employees to departments |

### User Management
| Feature | Access | Notes |
|---------|--------|-------|
| View Users | ✅ | Can view all users |
| Create User | ✅ | Can create new users |
| Update User | ✅ | Can update user information |

### System Management
| Feature | Access | Notes |
|---------|--------|-------|
| View Audit Logs | ✅ | Can view system audit logs |
| Manage System Settings | ✅ | Can manage system configuration |
| Manage Integrations | ❌ | Cannot manage integrations |
| Backup Data | ❌ | Cannot backup system data |

### Calendar Management
| Feature | Access | Notes |
|---------|--------|-------|
| Manage Holidays | ✅ | Can manage holiday calendar |
| Manage Working Rules | ✅ | Can manage working rules |
| Manage Smart Calendar | ✅ | Can manage smart calendar |

### Notification Management
| Feature | Access | Notes |
|---------|--------|-------|
| Manage Templates | ✅ | Can manage notification templates |

### Training Management
| Feature | Access | Notes |
|---------|--------|-------|
| Manage Programs | ✅ | Can manage training programs |
| Track Certifications | ✅ | Can track employee certifications |

---

## 🔵 SuperAdmin Role

### All Features (Complete Access)
- ✅ All HR_Admin permissions
- ✅ All HR_Manager permissions
- ✅ All Employee permissions

### SuperAdmin-Only Features

### User Management
| Feature | Access | Notes |
|---------|--------|-------|
| Delete User | ✅ | Can delete user accounts |
| Change User Role | ✅ | Can change user roles |
| Manage Permissions | ✅ | Can manage user permissions |

### System Management
| Feature | Access | Notes |
|---------|--------|-------|
| Manage Integrations | ✅ | Can manage system integrations |
| Backup Data | ✅ | Can backup system data |
| System Configuration | ✅ | Full system configuration access |

### Department Management
| Feature | Access | Notes |
|---------|--------|-------|
| Delete Department | ✅ | Can delete departments |

---

## Sidebar Navigation by Role

### Employee Sidebar
```
📊 Overview
  └─ Dashboard
  └─ Notifications

👤 My Workspace
  └─ Profile
  └─ Bank Details
  └─ Attendance
  └─ Attendance Corrections
  └─ Leave
  └─ Leads
  └─ Shifts
  └─ Calendar

⚙️ Settings
  └─ Profile
  └─ Security
  └─ Emergency Contacts
```

### HR_Manager Sidebar
```
📊 Overview
  └─ Dashboard
  └─ Notifications

📋 Requests & Approvals
  └─ Attendance Corrections
  └─ Leave Requests

⏰ Attendance & Time
  └─ Attendance Overview
  └─ Live Attendance
  └─ Shift Management

📅 Leave & Holidays
  └─ Leave Balances
  └─ Holiday Management
  └─ Smart Calendar
  └─ Holiday Sync

👥 People
  └─ Employees
  └─ Departments
  └─ Designations
  └─ Bank Verification
  └─ Lead Management

🏢 Organization
  └─ Policies
  └─ Documents
  └─ Announcements
```

### HR_Admin Sidebar
```
📊 Overview
  └─ Dashboard
  └─ Notifications

📋 Requests & Approvals
  └─ Attendance Corrections
  └─ Leave Requests

⏰ Attendance & Time
  └─ Attendance Overview
  └─ Live Attendance
  └─ Shift Management

📅 Leave & Holidays
  └─ Leave Balances
  └─ Rollover
  └─ Holiday Management
  └─ Smart Calendar
  └─ Holiday Sync

👥 People
  └─ Employees
  └─ Departments
  └─ Designations
  └─ Bank Verification
  └─ Lead Management

🏢 Organization
  └─ Policies
  └─ Documents
  └─ Announcements

🔒 System
  └─ Users & Roles
  └─ Admin Settings
  └─ System Policies
  └─ Audit Logs
```

### SuperAdmin Sidebar
```
📊 Overview
  └─ Dashboard
  └─ Notifications

📋 Requests & Approvals
  └─ Attendance Corrections
  └─ Leave Requests

⏰ Attendance & Time
  └─ Attendance Overview
  └─ Live Attendance
  └─ Shift Management

📅 Leave & Holidays
  └─ Leave Balances
  └─ Rollover
  └─ Holiday Management
  └─ Smart Calendar
  └─ Holiday Sync

👥 People
  └─ Employees
  └─ Departments
  └─ Designations
  └─ Bank Verification
  └─ Lead Management

🏢 Organization
  └─ Policies
  └─ Documents
  └─ Announcements

🔒 System
  └─ Users & Roles
  └─ Admin Settings
  └─ System Policies
  └─ Audit Logs
```

---

## Permission Inheritance Hierarchy

```
SuperAdmin (All Permissions)
    ↑
    └─ Inherits from HR_Admin
    
HR_Admin (HR Operations + Admin)
    ↑
    └─ Inherits from HR_Manager
    
HR_Manager (HR Operations)
    ↑
    └─ Inherits from Employee
    
Employee (Basic Self-Service)
```

---

## Key Design Principles

1. **Least Privilege**: Each role has minimum permissions needed
2. **Role Inheritance**: Higher roles inherit all lower role permissions
3. **Personal vs. Admin**: Personal sections only for Employee role
4. **Permission-Based**: Features controlled by permissions, not roles
5. **Audit Trail**: All actions logged for compliance

---

## Testing Credentials

| Role | Email | Password |
|------|-------|----------|
| Employee | john@hrm.com | john123 |
| HR_Manager | hr_manager@hrm.com | password123 |
| HR_Admin | hr_admin@hrm.com | password123 |
| SuperAdmin | admin@hrm.com | admin123 |

---

## Related Documentation

- RBAC Implementation: `docs/ROLE_BASED_ACCESS_CONTROL.md`
- RBAC Quick Reference: `docs/RBAC_QUICK_REFERENCE.md`
- Sidebar Fix Summary: `RBAC_SIDEBAR_FIX_SUMMARY.md`
- Testing Guide: `RBAC_TESTING_GUIDE.md`
