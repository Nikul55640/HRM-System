# Role-Based Access Control (RBAC) Documentation

## Overview

This HRM system implements a comprehensive Role-Based Access Control (RBAC) system that defines granular permissions for different user roles across all modules.

## User Roles

### 1. Employee (Basic User)
**Description**: Standard employee with self-service access

**Responsibilities**:
- Follow company policies
- Maintain updated personal information
- Manage own attendance, leave, and profile

**Key Permissions**:
- View and manage own attendance
- Clock in/out (Web, Mobile, Biometric)
- Apply for leave and view leave balance
- View own payslips
- Update personal profile (requires HR approval)
- Complete self-evaluations

---

### 2. Manager / Supervisor
**Description**: Team lead with approval authority

**Responsibilities**:
- Manage team members
- Approve team requests
- Monitor team performance

**Key Permissions**:
- All Employee permissions
- View team attendance and timesheets
- Approve/reject attendance corrections
- Approve/reject team leave requests
- Conduct performance evaluations
- Assign goals to team members
- View team reports

---

### 3. HR Manager
**Description**: HR professional managing specific departments

**Responsibilities**:
- Manage employees in assigned departments
- Handle recruitment and onboarding
- Oversee attendance and leave for departments

**Key Permissions**:
- View all employees in assigned departments
- Create and update employee records
- Manage attendance (corrections, overtime)
- Approve leave requests
- Manage recruitment process
- Configure shifts
- View HR analytics

**Department Scope**: Limited to assigned departments only

---

### 4. HR Administrator
**Description**: Senior HR role with full HR operations access

**Responsibilities**:
- Manage all HR operations
- Configure HR policies
- Handle compliance

**Key Permissions**:
- All HR Manager permissions
- Access all departments
- Manage leave policies
- Delete employee records
- Create/update departments
- Manage user accounts
- View audit logs
- Configure system settings

---

### 5. Payroll Officer
**Description**: Specialist handling payroll processing

**Responsibilities**:
- Process monthly payroll
- Ensure statutory compliance
- Manage compensation

**Key Permissions**:
- View all employee data (for payroll)
- View all attendance records
- Process payroll
- Calculate deductions and taxes
- Generate payslips
- Approve reimbursements
- Export payroll reports

---

### 6. SuperAdmin (System Administrator)
**Description**: Full system access for IT/system management

**Responsibilities**:
- Manage system security
- Configure integrations
- Maintain system

**Key Permissions**:
- All permissions from all roles
- Create/delete user accounts
- Assign user roles
- Manage system configuration
- Run backups
- Manage integrations
- View all audit logs

---

## Permission Modules

### Attendance Management
```javascript
MODULES.ATTENDANCE = {
  VIEW_OWN: 'attendance.view.own',
  VIEW_TEAM: 'attendance.view.team',
  VIEW_ALL: 'attendance.view.all',
  CLOCK_IN_OUT: 'attendance.clock',
  REQUEST_CORRECTION: 'attendance.correction.request',
  APPROVE_CORRECTION: 'attendance.correction.approve',
  EDIT_ANY: 'attendance.edit.any',
  MANAGE_SHIFTS: 'attendance.shifts.manage',
  VIEW_ANALYTICS: 'attendance.analytics.view',
  APPROVE_OVERTIME: 'attendance.overtime.approve',
}
```

### Leave Management
```javascript
MODULES.LEAVE = {
  VIEW_OWN: 'leave.view.own',
  VIEW_TEAM: 'leave.view.team',
  VIEW_ALL: 'leave.view.all',
  APPLY: 'leave.apply',
  CANCEL_OWN: 'leave.cancel.own',
  APPROVE_TEAM: 'leave.approve.team',
  APPROVE_ANY: 'leave.approve.any',
  MANAGE_POLICIES: 'leave.policies.manage',
  MANAGE_BALANCE: 'leave.balance.manage',
  VIEW_CALENDAR: 'leave.calendar.view',
}
```

### Payroll Management
```javascript
MODULES.PAYROLL = {
  VIEW_OWN: 'payroll.view.own',
  VIEW_ALL: 'payroll.view.all',
  PROCESS: 'payroll.process',
  APPROVE: 'payroll.approve',
  MANAGE_STRUCTURE: 'payroll.structure.manage',
  MANAGE_DEDUCTIONS: 'payroll.deductions.manage',
  GENERATE_REPORTS: 'payroll.reports.generate',
  MANAGE_REIMBURSEMENT: 'payroll.reimbursement.manage',
}
```

### Employee Management
```javascript
MODULES.EMPLOYEE = {
  VIEW_OWN: 'employee.view.own',
  VIEW_TEAM: 'employee.view.team',
  VIEW_ALL: 'employee.view.all',
  CREATE: 'employee.create',
  UPDATE_OWN: 'employee.update.own',
  UPDATE_ANY: 'employee.update.any',
  DELETE: 'employee.delete',
  MANAGE_DOCUMENTS: 'employee.documents.manage',
  VIEW_DOCUMENTS: 'employee.documents.view',
  ONBOARD: 'employee.onboard',
  OFFBOARD: 'employee.offboard',
}
```

## Backend Implementation

### Using Role-Based Authorization

```javascript
import { authenticate } from '../middleware/authenticate.js';
import { authorize } from '../middleware/authorize.js';
import { ROLES } from '../config/rolePermissions.js';

// Restrict to specific roles
router.get(
  '/employees',
  authenticate,
  authorize(ROLES.SUPER_ADMIN, ROLES.HR_ADMIN, ROLES.HR_MANAGER),
  employeeController.getEmployees
);
```

### Using Permission-Based Authorization

```javascript
import { authenticate } from '../middleware/authenticate.js';
import { checkPermission } from '../middleware/checkPermission.js';
import { MODULES } from '../config/rolePermissions.js';

// Check specific permission
router.post(
  '/employees',
  authenticate,
  checkPermission(MODULES.EMPLOYEE.CREATE),
  employeeController.createEmployee
);

// Check any permission
router.get(
  '/attendance',
  authenticate,
  checkAnyPermission([
    MODULES.ATTENDANCE.VIEW_OWN,
    MODULES.ATTENDANCE.VIEW_TEAM,
    MODULES.ATTENDANCE.VIEW_ALL,
  ]),
  attendanceController.getAttendance
);
```

### Department Scope Filtering

```javascript
import { applyDepartmentScope } from '../middleware/authorize.js';

// Automatically filter by department for HR Managers
router.get(
  '/employees',
  authenticate,
  authorize(ROLES.HR_MANAGER, ROLES.HR_ADMIN, ROLES.SUPER_ADMIN),
  applyDepartmentScope,
  employeeController.getEmployees
);
```

## Frontend Implementation

### Using PermissionGate Component

```jsx
import { PermissionGate } from '@/components/common';
import { MODULES } from '@/utils/rolePermissions';

function EmployeeList() {
  return (
    <div>
      <h1>Employees</h1>
      
      {/* Show create button only if user has permission */}
      <PermissionGate permission={MODULES.EMPLOYEE.CREATE}>
        <Button onClick={handleCreate}>Create Employee</Button>
      </PermissionGate>

      {/* Show edit button if user has any of these permissions */}
      <PermissionGate 
        anyPermissions={[
          MODULES.EMPLOYEE.UPDATE_OWN,
          MODULES.EMPLOYEE.UPDATE_ANY
        ]}
      >
        <Button onClick={handleEdit}>Edit</Button>
      </PermissionGate>
    </div>
  );
}
```

### Using RoleGate Component

```jsx
import { RoleGate } from '@/components/common';
import { ROLES } from '@/utils/rolePermissions';

function Dashboard() {
  return (
    <div>
      {/* Show admin panel only for admin roles */}
      <RoleGate roles={[ROLES.SUPER_ADMIN, ROLES.HR_ADMIN]}>
        <AdminPanel />
      </RoleGate>

      {/* Show manager dashboard for managers */}
      <RoleGate roles={ROLES.MANAGER}>
        <ManagerDashboard />
      </RoleGate>
    </div>
  );
}
```

### Using usePermissions Hook

```jsx
import { usePermissions } from '@/hooks';

function AttendanceView() {
  const { can, is, MODULES } = usePermissions();

  return (
    <div>
      {/* Conditional rendering based on permissions */}
      {can.do(MODULES.ATTENDANCE.VIEW_ALL) && (
        <AllEmployeesAttendance />
      )}

      {can.do(MODULES.ATTENDANCE.VIEW_TEAM) && (
        <TeamAttendance />
      )}

      {/* Check role */}
      {is.hrManager() && (
        <HRManagerTools />
      )}

      {/* Check multiple permissions */}
      {can.doAny([
        MODULES.ATTENDANCE.APPROVE_CORRECTION,
        MODULES.ATTENDANCE.APPROVE_OVERTIME
      ]) && (
        <ApprovalQueue />
      )}
    </div>
  );
}
```

### Using useAuth Hook

```jsx
import useAuth from '@/hooks/useAuth';

function ProfilePage() {
  const { user, hasRole, canAccessDepartment } = useAuth();

  const canEdit = hasRole(['SuperAdmin', 'HR Administrator']) || 
                  (hasRole('HR Manager') && canAccessDepartment(employee.department));

  return (
    <div>
      <h1>Profile: {user.email}</h1>
      <p>Role: {user.role}</p>
      
      {canEdit && (
        <Button>Edit Profile</Button>
      )}
    </div>
  );
}
```

## Permission Matrix

| Feature | Employee | Manager | HR Manager | HR Admin | Payroll Officer | SuperAdmin |
|---------|----------|---------|------------|----------|-----------------|------------|
| View Own Attendance | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| View Team Attendance | ❌ | ✅ | ✅ | ✅ | ✅ | ✅ |
| View All Attendance | ❌ | ❌ | ✅* | ✅ | ✅ | ✅ |
| Edit Attendance | ❌ | ❌ | ✅* | ✅ | ❌ | ✅ |
| Apply Leave | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Approve Team Leave | ❌ | ✅ | ✅* | ✅ | ❌ | ✅ |
| Manage Leave Policies | ❌ | ❌ | ❌ | ✅ | ❌ | ✅ |
| View Own Payslip | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Process Payroll | ❌ | ❌ | ❌ | ❌ | ✅ | ✅ |
| Create Employee | ❌ | ❌ | ✅* | ✅ | ❌ | ✅ |
| Delete Employee | ❌ | ❌ | ❌ | ✅ | ❌ | ✅ |
| Manage Users | ❌ | ❌ | ❌ | ✅ | ❌ | ✅ |
| System Config | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ |

*\* HR Manager: Limited to assigned departments only*

## Security Best Practices

1. **Always authenticate first**: Use `authenticate` middleware before any authorization
2. **Principle of least privilege**: Grant minimum permissions needed
3. **Department scoping**: HR Managers should only access assigned departments
4. **Audit logging**: Log all permission-based actions
5. **Frontend + Backend**: Always enforce permissions on both sides
6. **Token validation**: Verify JWT tokens contain correct role information

## Testing Permissions

### Backend Testing
```javascript
import { hasPermission } from '../config/rolePermissions.js';
import { ROLES, MODULES } from '../config/rolePermissions.js';

// Test if employee can create employees
console.log(hasPermission(ROLES.EMPLOYEE, MODULES.EMPLOYEE.CREATE)); // false

// Test if HR Admin can create employees
console.log(hasPermission(ROLES.HR_ADMIN, MODULES.EMPLOYEE.CREATE)); // true
```

### Frontend Testing
```javascript
import { hasPermission, ROLES, MODULES } from '@/utils/rolePermissions';

// Test permission
const canEdit = hasPermission(user.role, MODULES.EMPLOYEE.UPDATE_ANY);
```

## Migration Guide

If you're updating from the old role system:

1. Replace `authorize('HR Manager')` with `authorize(ROLES.HR_MANAGER)`
2. Replace role strings with `ROLES` constants
3. Use `checkPermission()` for granular control
4. Update frontend to use `PermissionGate` and `RoleGate`
5. Replace `useAuth().hasRole()` with `usePermissions().can.do()`

## API Endpoints by Role

### Employee Endpoints
- `GET /api/employee/profile` - View own profile
- `PUT /api/employee/profile` - Update own profile
- `GET /api/employee/attendance` - View own attendance
- `POST /api/employee/attendance/clock-in` - Clock in
- `GET /api/employee/leave` - View own leave
- `POST /api/employee/leave/apply` - Apply for leave

### Manager Endpoints
- `GET /api/manager/team` - View team members
- `GET /api/manager/team/attendance` - View team attendance
- `POST /api/manager/leave/approve` - Approve team leave
- `GET /api/manager/team/performance` - View team performance

### HR Manager Endpoints
- `GET /api/employees` - View all employees (department-scoped)
- `POST /api/employees` - Create employee
- `PUT /api/employees/:id` - Update employee
- `GET /api/admin/attendance` - View all attendance
- `POST /api/admin/leave/approve` - Approve any leave

### HR Administrator Endpoints
- All HR Manager endpoints (no department scope)
- `DELETE /api/employees/:id` - Delete employee
- `POST /api/admin/departments` - Create department
- `GET /api/users` - View users
- `POST /api/users` - Create user

### Payroll Officer Endpoints
- `GET /api/admin/payroll` - View all payroll
- `POST /api/admin/payroll/process` - Process payroll
- `GET /api/admin/payroll/reports` - Generate reports

### SuperAdmin Endpoints
- All endpoints
- `POST /api/users/:id/role` - Change user role
- `GET /api/system/config` - View system config
- `PUT /api/system/config` - Update system config
- `GET /api/system/audit-logs` - View audit logs

## Troubleshooting

### Permission Denied Errors

**Problem**: User gets 403 Forbidden error

**Solutions**:
1. Check user's role in JWT token
2. Verify role has required permission in `rolePermissions.js`
3. Check if HR Manager has assigned departments
4. Verify middleware order (authenticate before authorize)

### Department Access Issues

**Problem**: HR Manager can't access employees

**Solutions**:
1. Verify `assignedDepartments` array in user object
2. Check employee's department matches assigned departments
3. Use `canAccessDepartment()` helper function

### Frontend Not Showing Components

**Problem**: PermissionGate not rendering content

**Solutions**:
1. Verify user object has `role` property
2. Check permission string matches exactly
3. Ensure `useAuth()` returns authenticated user
4. Check browser console for errors

## Future Enhancements

- [ ] Dynamic permission assignment (not role-based)
- [ ] Permission inheritance and delegation
- [ ] Time-based permissions (temporary access)
- [ ] IP-based access restrictions
- [ ] Multi-factor authentication for sensitive operations
- [ ] Permission audit trail
- [ ] Custom role creation
- [ ] Permission templates
