# HRM System - Corrected Role-Based Page Access Summary

This document outlines the **corrected** page access permissions based on the provided permission matrix.

## Role Definitions

- **SuperAdmin**: Full system access with all administrative privileges
- **HR**: HR Administrator role with HR management capabilities (but NO access to employee self-service features)
- **Employee**: Standard employee with self-service capabilities only

## Updated Page Access by Role

### 🔵 SuperAdmin Access (All Pages)

SuperAdmin has access to **ALL** pages in the system.

### 🟢 HR Role Access (Corrected)

Based on the permission matrix, HR role has the following access:

#### ✅ HR CAN Access:
**Attendance Management:**
- ✅ View all attendance (`/admin/attendance`)
- ✅ Edit attendance (`/admin/attendance`)
- ✅ Attendance corrections (`/admin/attendance/corrections`)
- ✅ Live attendance (`/admin/attendance/live`)
- ✅ Mark absent/holiday (through attendance management)

**Leave Management:**
- ✅ Approve/reject leave (`/admin/leave`)
- ✅ View leave balances (`/admin/leave-balances`)

**Calendar Management:**
- ✅ View company holidays (`/admin/calendar`)
- ✅ Add company events (`/admin/calendar/management`)
- ✅ Add public holidays (`/admin/calendar/management`)

**Shift Management:**
- ✅ Assign shifts (`/admin/shifts`)

**Employee Management:**
- ✅ View employees (`/admin/employees`)
- ✅ Edit employee info (`/admin/employees/:id/edit`)
- ✅ Add employees (`/admin/employees/new`)
- ✅ Departments (`/admin/departments`)
- ✅ Designations (`/admin/designations`)
- ✅ Bank verification (`/admin/bank-verification`)

**Organization:**
- ✅ Policies (`/admin/policies`)
- ✅ Company documents (`/admin/documents`)
- ✅ Lead management (`/admin/leads`)

**General:**
- ✅ Dashboard (`/dashboard`)
- ✅ Notifications (`/notifications`)
- ✅ Help (`/help`)

#### ❌ HR CANNOT Access:

**Employee Self-Service Features (Employee Only):**
- ❌ Clock in/out (Employee only)
- ❌ View own attendance (`/employee/attendance`)
- ❌ Apply leave (`/employee/leave`)
- ❌ View own leaves (`/employee/leave`)
- ❌ View own calendar (`/employee/calendar`)
- ❌ Request shift change (`/employee/shifts`)
- ❌ View assigned shift (`/employee/shifts`)
- ❌ View own profile (`/employee/profile`)
- ❌ Edit own profile (`/employee/profile`)
- ❌ Employee settings (`/employee/settings`)
- ❌ Change own password (`/employee/settings/security`)
- ❌ Bank details self-service (`/employee/bank-details`)

**Admin-Only Features:**
- ❌ Override leave (SuperAdmin only)
- ❌ Leave balance rollover (`/admin/leave-balance-rollover`)
- ❌ Delete holidays (SuperAdmin only)
- ❌ Create shift rules (`/admin/calendar/smart`)
- ❌ Delete employee (SuperAdmin only)
- ❌ User management (`/admin/users`)
- ❌ System policies (`/admin/system-policies`)
- ❌ Audit logs (`/admin/audit-logs`)

**Payroll Features (if implemented):**
- ❌ View payslip (Employee only)
- ❌ Process payroll (SuperAdmin only)
- ❌ Edit salary (SuperAdmin only)

---

### 🟡 Employee Role Access

Employee role has access to self-service features only:

#### ✅ Employee CAN Access:
**Self-Service Features:**
- ✅ Clock in/out (through attendance page)
- ✅ View own attendance (`/employee/attendance`)
- ✅ Apply leave (`/employee/leave`)
- ✅ View own leaves (`/employee/leave`)
- ✅ View own calendar (`/employee/calendar`)
- ✅ Request shift change (`/employee/shifts`)
- ✅ View assigned shift (`/employee/shifts`)
- ✅ View own profile (`/employee/profile`)
- ✅ Edit own profile (`/employee/profile`)
- ✅ Employee settings (`/employee/settings`)
- ✅ Change own password (`/employee/settings/security`)
- ✅ Bank details (`/employee/bank-details`)
- ✅ Emergency contacts (`/employee/settings/emergency-contacts`)
- ✅ My leads (`/employee/leads`)
- ✅ Attendance corrections (`/employee/attendance/corrections`)

**General:**
- ✅ Dashboard (`/dashboard`)
- ✅ Notifications (`/notifications`)
- ✅ Help (`/help`)

#### ❌ Employee CANNOT Access:
- ❌ All admin pages (`/admin/*`)
- ❌ All HR management features
- ❌ All system administration features

---

## Key Permission Matrix Implementation

| Feature | Employee | HR | Admin |
|---------|----------|----|----- |
| **🕐 Attendance Management** |
| Clock In / Out | ✅ | ❌ | ❌ |
| View own attendance | ✅ | ❌ | ❌ |
| View all attendance | ❌ | ✅ | ✅ |
| Edit attendance | ❌ | ✅ | ✅ |
| Approve corrections | ❌ | ✅ | ✅ |
| Mark absent / holiday | ❌ | ✅ | ✅ |
| **🌴 Leave Management** |
| Apply leave | ✅ | ❌ | ❌ |
| View own leaves | ✅ | ❌ | ❌ |
| Approve / reject leave | ❌ | ✅ | ✅ |
| Override leave | ❌ | ❌ | ✅ |
| Manage leave policies | ❌ | ❌ | ✅ |
| **📅 Calendar** |
| View own calendar | ✅ | ❌ | ❌ |
| View company holidays | ✅ | ✅ | ✅ |
| Add company events | ❌ | ✅ | ✅ |
| Add public holidays | ❌ | ✅ | ✅ |
| Delete holidays | ❌ | ❌ | ✅ |
| **⏱️ Shifts & Schedule** |
| View assigned shift | ✅ | ❌ | ❌ |
| Request shift change | ✅ | ❌ | ❌ |
| Assign shifts | ❌ | ✅ | ✅ |
| Create shift rules | ❌ | ❌ | ✅ |
| **👥 Employee Management** |
| View own profile | ✅ | ❌ | ❌ |
| Edit own profile | ✅ | ❌ | ❌ |
| View employees | ❌ | ✅ | ✅ |
| Edit employee info | ❌ | ✅ | ✅ |
| Delete employee | ❌ | ❌ | ✅ |
| **⚙️ System & Security** |
| Change own password | ✅ | ❌ | ❌ |
| Manage users | ❌ | ❌ | ✅ |
| Assign roles | ❌ | ❌ | ✅ |
| System settings | ❌ | ❌ | ✅ |
| Audit logs | ❌ | ❌ | ✅ |

## Route Changes Applied

1. **Admin Routes**: Restricted certain features to SuperAdmin only (leave rollover, smart calendar, etc.)
2. **ESS Routes**: Restricted all employee self-service routes to Employee role only
3. **Sidebar Navigation**: Updated to show/hide menu items based on corrected permissions
4. **Calendar Routes**: Maintained HR access to company calendar view

---

*Last Updated: January 7, 2026 - Corrected based on permission matrix*