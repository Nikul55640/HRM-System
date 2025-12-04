# RBAC Quick Reference Card

## Quick Import Guide

### Backend
```javascript
// Middleware
import { authenticate } from '../middleware/authenticate.js';
import { authorize } from '../middleware/authorize.js';
import { checkPermission, checkAnyPermission, checkAllPermissions } from '../middleware/checkPermission.js';

// Config
import { ROLES, MODULES, hasPermission, canAccessDepartment } from '../config/rolePermissions.js';
```

### Frontend
```javascript
// Components
import { PermissionGate, RoleGate } from '@/components/common';

// Hooks
import { usePermissions } from '@/hooks';

// Utils
import { ROLES, MODULES, hasPermission } from '@/utils/rolePermissions';
```

## Roles Quick Reference

| Role | Code | Description |
|------|------|-------------|
| Employee | `ROLES.EMPLOYEE` | Basic user |
| Manager | `ROLES.MANAGER` | Team supervisor |
| HR Manager | `ROLES.HR_MANAGER` | Department HR |
| HR Administrator | `ROLES.HR_ADMIN` | Full HR access |
| Payroll Officer | `ROLES.PAYROLL_OFFICER` | Payroll specialist |
| SuperAdmin | `ROLES.SUPER_ADMIN` | System admin |

## Common Permissions

### Attendance
```javascript
MODULES.ATTENDANCE.VIEW_OWN          // View own attendance
MODULES.ATTENDANCE.VIEW_TEAM         // View team attendance
MODULES.ATTENDANCE.VIEW_ALL          // View all attendance
MODULES.ATTENDANCE.CLOCK_IN_OUT      // Clock in/out
MODULES.ATTENDANCE.APPROVE_CORRECTION // Approve corrections
```

### Leave
```javascript
MODULES.LEAVE.VIEW_OWN        // View own leave
MODULES.LEAVE.VIEW_TEAM       // View team leave
MODULES.LEAVE.VIEW_ALL        // View all leave
MODULES.LEAVE.APPLY           // Apply for leave
MODULES.LEAVE.APPROVE_TEAM    // Approve team leave
MODULES.LEAVE.APPROVE_ANY     // Approve any leave
MODULES.LEAVE.MANAGE_POLICIES // Manage policies
```

### Employee
```javascript
MODULES.EMPLOYEE.VIEW_OWN     // View own profile
MODULES.EMPLOYEE.VIEW_TEAM    // View team profiles
MODULES.EMPLOYEE.VIEW_ALL     // View all employees
MODULES.EMPLOYEE.CREATE       // Create employee
MODULES.EMPLOYEE.UPDATE_OWN   // Update own profile
MODULES.EMPLOYEE.UPDATE_ANY   // Update any employee
MODULES.EMPLOYEE.DELETE       // Delete employee
```

### Payroll
```javascript
MODULES.PAYROLL.VIEW_OWN      // View own payslip
MODULES.PAYROLL.VIEW_ALL      // View all payroll
MODULES.PAYROLL.PROCESS       // Process payroll
MODULES.PAYROLL.APPROVE       // Approve payroll
```

## Backend Patterns

### Pattern 1: Single Permission
```javascript
router.post(
  '/employees',
  authenticate,
  checkPermission(MODULES.EMPLOYEE.CREATE),
  controller.createEmployee
);
```

### Pattern 2: Any Permission (OR logic)
```javascript
router.get(
  '/attendance',
  authenticate,
  checkAnyPermission([
    MODULES.ATTENDANCE.VIEW_OWN,
    MODULES.ATTENDANCE.VIEW_TEAM,
    MODULES.ATTENDANCE.VIEW_ALL,
  ]),
  controller.getAttendance
);
```

### Pattern 3: All Permissions (AND logic)
```javascript
router.post(
  '/sensitive-action',
  authenticate,
  checkAllPermissions([
    MODULES.SYSTEM.MANAGE_CONFIG,
    MODULES.SYSTEM.BACKUP_DATA,
  ]),
  controller.sensitiveAction
);
```

### Pattern 4: Role-Based (Legacy)
```javascript
router.get(
  '/admin',
  authenticate,
  authorize(ROLES.SUPER_ADMIN, ROLES.HR_ADMIN),
  controller.adminAction
);
```

## Frontend Patterns

### Pattern 1: PermissionGate - Single Permission
```jsx
<PermissionGate permission={MODULES.EMPLOYEE.CREATE}>
  <Button>Create Employee</Button>
</PermissionGate>
```

### Pattern 2: PermissionGate - Any Permission
```jsx
<PermissionGate 
  anyPermissions={[
    MODULES.EMPLOYEE.UPDATE_OWN,
    MODULES.EMPLOYEE.UPDATE_ANY
  ]}
>
  <Button>Edit</Button>
</PermissionGate>
```

### Pattern 3: PermissionGate - All Permissions
```jsx
<PermissionGate 
  allPermissions={[
    MODULES.SYSTEM.MANAGE_CONFIG,
    MODULES.SYSTEM.BACKUP_DATA
  ]}
>
  <Button>Backup System</Button>
</PermissionGate>
```

### Pattern 4: PermissionGate - With Fallback
```jsx
<PermissionGate 
  permission={MODULES.EMPLOYEE.VIEW_ALL}
  fallback={<p>Access Denied</p>}
>
  <EmployeeList />
</PermissionGate>
```

### Pattern 5: RoleGate - Single Role
```jsx
<RoleGate roles={ROLES.SUPER_ADMIN}>
  <AdminPanel />
</RoleGate>
```

### Pattern 6: RoleGate - Multiple Roles
```jsx
<RoleGate roles={[ROLES.SUPER_ADMIN, ROLES.HR_ADMIN]}>
  <HRTools />
</RoleGate>
```

### Pattern 7: usePermissions Hook
```jsx
function MyComponent() {
  const { can, is, user } = usePermissions();

  // Check permission
  if (can.do(MODULES.EMPLOYEE.CREATE)) {
    // Show create button
  }

  // Check any permission
  if (can.doAny([MODULES.LEAVE.APPROVE_TEAM, MODULES.LEAVE.APPROVE_ANY])) {
    // Show approval interface
  }

  // Check role
  if (is.hrManager()) {
    // Show HR manager tools
  }

  // Check admin role
  if (is.adminRole()) {
    // Show admin features
  }

  return <div>...</div>;
}
```

### Pattern 8: Conditional Rendering
```jsx
function EmployeeCard({ employee }) {
  const { can, user } = usePermissions();

  const canEdit = can.do(MODULES.EMPLOYEE.UPDATE_ANY) || 
                  (can.do(MODULES.EMPLOYEE.UPDATE_OWN) && 
                   user.employeeId === employee.id);

  return (
    <div>
      <h3>{employee.name}</h3>
      {canEdit && <Button>Edit</Button>}
    </div>
  );
}
```

## Controller Patterns

### Pattern 1: Role-Based Filtering
```javascript
export const getEmployees = async (req, res) => {
  const { role, assignedDepartments, employeeId } = req.user;
  let query = {};

  if (role === ROLES.HR_MANAGER) {
    query['jobInfo.department'] = { $in: assignedDepartments };
  } else if (role === ROLES.EMPLOYEE) {
    query._id = employeeId;
  }

  const employees = await Employee.find(query);
  res.json({ success: true, data: employees });
};
```

### Pattern 2: Permission Check in Controller
```javascript
import { hasPermission, MODULES } from '../config/rolePermissions.js';

export const updateEmployee = async (req, res) => {
  const { role } = req.user;

  // Additional permission check
  if (!hasPermission(role, MODULES.EMPLOYEE.UPDATE_ANY)) {
    return res.status(403).json({
      success: false,
      error: { message: 'Permission denied' }
    });
  }

  // Update logic...
};
```

### Pattern 3: Department Access Check
```javascript
import { canAccessDepartment } from '../config/rolePermissions.js';

export const getEmployeesByDepartment = async (req, res) => {
  const { departmentId } = req.params;

  if (!canAccessDepartment(req.user, departmentId)) {
    return res.status(403).json({
      success: false,
      error: { message: 'Department access denied' }
    });
  }

  // Fetch employees...
};
```

## Common Use Cases

### Use Case 1: Navigation Menu
```jsx
function Sidebar() {
  const { can, is } = usePermissions();

  return (
    <nav>
      <Link to="/dashboard">Dashboard</Link>
      
      {can.do(MODULES.ATTENDANCE.VIEW_OWN) && (
        <Link to="/attendance">Attendance</Link>
      )}
      
      {can.do(MODULES.EMPLOYEE.VIEW_ALL) && (
        <Link to="/employees">Employees</Link>
      )}
      
      {is.adminRole() && (
        <Link to="/admin">Admin</Link>
      )}
    </nav>
  );
}
```

### Use Case 2: Action Buttons
```jsx
function EmployeeActions({ employee }) {
  const { can, user } = usePermissions();

  return (
    <div>
      <PermissionGate 
        anyPermissions={[
          MODULES.EMPLOYEE.UPDATE_ANY,
          MODULES.EMPLOYEE.UPDATE_OWN
        ]}
      >
        <Button>Edit</Button>
      </PermissionGate>

      <PermissionGate permission={MODULES.EMPLOYEE.DELETE}>
        <Button variant="destructive">Delete</Button>
      </PermissionGate>
    </div>
  );
}
```

### Use Case 3: Conditional Tabs
```jsx
function EmployeeDetail() {
  const { can } = usePermissions();

  return (
    <Tabs>
      <TabsList>
        <TabsTrigger value="profile">Profile</TabsTrigger>
        
        {can.do(MODULES.ATTENDANCE.VIEW_ALL) && (
          <TabsTrigger value="attendance">Attendance</TabsTrigger>
        )}
        
        {can.do(MODULES.PAYROLL.VIEW_ALL) && (
          <TabsTrigger value="payroll">Payroll</TabsTrigger>
        )}
      </TabsList>
    </Tabs>
  );
}
```

### Use Case 4: Form Field Visibility
```jsx
function EmployeeForm({ employee }) {
  const { can } = usePermissions();

  return (
    <form>
      <Input name="name" label="Name" />
      <Input name="email" label="Email" />
      
      {can.do(MODULES.PAYROLL.MANAGE_STRUCTURE) && (
        <Input name="salary" label="Salary" type="number" />
      )}
      
      {can.do(MODULES.EMPLOYEE.UPDATE_ANY) && (
        <Select name="department" label="Department" />
      )}
    </form>
  );
}
```

## Testing Snippets

### Backend Test
```javascript
import { hasPermission, ROLES, MODULES } from '../src/config/rolePermissions.js';

test('Employee can view own attendance', () => {
  expect(hasPermission(ROLES.EMPLOYEE, MODULES.ATTENDANCE.VIEW_OWN)).toBe(true);
});

test('Employee cannot delete employees', () => {
  expect(hasPermission(ROLES.EMPLOYEE, MODULES.EMPLOYEE.DELETE)).toBe(false);
});
```

### Frontend Test
```javascript
import { render, screen } from '@testing-library/react';
import { PermissionGate } from '@/components/common';

test('PermissionGate hides content without permission', () => {
  const mockUser = { role: 'Employee' };
  
  render(
    <PermissionGate permission={MODULES.EMPLOYEE.DELETE}>
      <button>Delete</button>
    </PermissionGate>
  );
  
  expect(screen.queryByText('Delete')).not.toBeInTheDocument();
});
```

## Troubleshooting

### Issue: Permission Denied
```javascript
// Check 1: Verify user role
console.log('User role:', req.user.role);

// Check 2: Verify permission exists
console.log('Has permission:', hasPermission(req.user.role, MODULES.EMPLOYEE.CREATE));

// Check 3: Check assigned departments (for HR Manager)
console.log('Assigned departments:', req.user.assignedDepartments);
```

### Issue: Component Not Showing
```javascript
// Check 1: Verify user object
const { user } = usePermissions();
console.log('User:', user);

// Check 2: Check permission
const { can } = usePermissions();
console.log('Can create:', can.do(MODULES.EMPLOYEE.CREATE));

// Check 3: Verify permission constant
console.log('Permission:', MODULES.EMPLOYEE.CREATE);
```

## Best Practices

1. **Always authenticate first**: `authenticate` before `checkPermission`
2. **Use constants**: Never hardcode permission strings
3. **Backend is primary**: Always enforce on backend
4. **Frontend is secondary**: Use for UI/UX only
5. **Test thoroughly**: Test each role with each feature
6. **Document changes**: Update docs when adding permissions
7. **Audit logs**: Log permission checks for security
8. **Least privilege**: Grant minimum permissions needed

## Quick Decision Tree

**Need to protect a route?**
- Single role → `authorize(ROLES.X)`
- Multiple roles → `authorize(ROLES.X, ROLES.Y)`
- Specific permission → `checkPermission(MODULES.X.Y)`
- Any permission → `checkAnyPermission([...])`

**Need to show/hide UI?**
- Based on role → `<RoleGate roles={...}>`
- Based on permission → `<PermissionGate permission={...}>`
- Complex logic → `usePermissions()` hook

**Need to check in code?**
- Backend → `hasPermission(role, permission)`
- Frontend → `can.do(permission)` or `is.roleName()`

## Support

- Full docs: `docs/ROLE_BASED_ACCESS_CONTROL.md`
- Examples: `docs/RBAC_IMPLEMENTATION_EXAMPLES.md`
- Summary: `RBAC_IMPLEMENTATION_COMPLETE.md`
