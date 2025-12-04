# RBAC Implementation Examples

This document provides practical examples of implementing role-based access control in your HRM system.

## Backend Route Examples

### Example 1: Employee Management Routes

```javascript
// backend/src/routes/employeeRoutes.js
import express from 'express';
import { authenticate } from '../middleware/authenticate.js';
import { checkPermission, checkAnyPermission } from '../middleware/checkPermission.js';
import { MODULES } from '../config/rolePermissions.js';
import employeeController from '../controllers/employeeController.js';

const router = express.Router();

// Get all employees - requires view permission
router.get(
  '/',
  authenticate,
  checkAnyPermission([
    MODULES.EMPLOYEE.VIEW_ALL,
    MODULES.EMPLOYEE.VIEW_TEAM,
    MODULES.EMPLOYEE.VIEW_OWN,
  ]),
  employeeController.getEmployees
);

// Create employee - requires create permission
router.post(
  '/',
  authenticate,
  checkPermission(MODULES.EMPLOYEE.CREATE),
  employeeController.createEmployee
);

// Update employee - requires update permission
router.put(
  '/:id',
  authenticate,
  checkAnyPermission([
    MODULES.EMPLOYEE.UPDATE_ANY,
    MODULES.EMPLOYEE.UPDATE_OWN,
  ]),
  employeeController.updateEmployee
);

// Delete employee - requires delete permission
router.delete(
  '/:id',
  authenticate,
  checkPermission(MODULES.EMPLOYEE.DELETE),
  employeeController.deleteEmployee
);

export default router;
```

### Example 2: Attendance Routes

```javascript
// backend/src/routes/attendanceRoutes.js
import express from 'express';
import { authenticate } from '../middleware/authenticate.js';
import { checkPermission, checkAnyPermission } from '../middleware/checkPermission.js';
import { MODULES } from '../config/rolePermissions.js';
import attendanceController from '../controllers/attendanceController.js';

const router = express.Router();

// Clock in/out - all employees can do this
router.post(
  '/clock-in',
  authenticate,
  checkPermission(MODULES.ATTENDANCE.CLOCK_IN_OUT),
  attendanceController.clockIn
);

router.post(
  '/clock-out',
  authenticate,
  checkPermission(MODULES.ATTENDANCE.CLOCK_IN_OUT),
  attendanceController.clockOut
);

// View attendance - different levels
router.get(
  '/',
  authenticate,
  checkAnyPermission([
    MODULES.ATTENDANCE.VIEW_OWN,
    MODULES.ATTENDANCE.VIEW_TEAM,
    MODULES.ATTENDANCE.VIEW_ALL,
  ]),
  attendanceController.getAttendance
);

// Request correction - employees can request
router.post(
  '/correction',
  authenticate,
  checkPermission(MODULES.ATTENDANCE.REQUEST_CORRECTION),
  attendanceController.requestCorrection
);

// Approve correction - managers and HR
router.post(
  '/correction/:id/approve',
  authenticate,
  checkPermission(MODULES.ATTENDANCE.APPROVE_CORRECTION),
  attendanceController.approveCorrection
);

// Manage shifts - HR only
router.post(
  '/shifts',
  authenticate,
  checkPermission(MODULES.ATTENDANCE.MANAGE_SHIFTS),
  attendanceController.createShift
);

export default router;
```

### Example 3: Leave Management Routes

```javascript
// backend/src/routes/leaveRoutes.js
import express from 'express';
import { authenticate } from '../middleware/authenticate.js';
import { checkPermission, checkAnyPermission } from '../middleware/checkPermission.js';
import { MODULES } from '../config/rolePermissions.js';
import leaveController from '../controllers/leaveController.js';

const router = express.Router();

// Apply for leave - all employees
router.post(
  '/apply',
  authenticate,
  checkPermission(MODULES.LEAVE.APPLY),
  leaveController.applyLeave
);

// View leave requests
router.get(
  '/',
  authenticate,
  checkAnyPermission([
    MODULES.LEAVE.VIEW_OWN,
    MODULES.LEAVE.VIEW_TEAM,
    MODULES.LEAVE.VIEW_ALL,
  ]),
  leaveController.getLeaveRequests
);

// Approve leave - managers and HR
router.post(
  '/:id/approve',
  authenticate,
  checkAnyPermission([
    MODULES.LEAVE.APPROVE_TEAM,
    MODULES.LEAVE.APPROVE_ANY,
  ]),
  leaveController.approveLeave
);

// Manage leave policies - HR Admin only
router.post(
  '/policies',
  authenticate,
  checkPermission(MODULES.LEAVE.MANAGE_POLICIES),
  leaveController.createPolicy
);

// Manage leave balance - HR
router.put(
  '/:employeeId/balance',
  authenticate,
  checkPermission(MODULES.LEAVE.MANAGE_BALANCE),
  leaveController.updateBalance
);

export default router;
```

### Example 4: Payroll Routes

```javascript
// backend/src/routes/payrollRoutes.js
import express from 'express';
import { authenticate } from '../middleware/authenticate.js';
import { checkPermission } from '../middleware/checkPermission.js';
import { MODULES } from '../config/rolePermissions.js';
import payrollController from '../controllers/payrollController.js';

const router = express.Router();

// View own payslip - all employees
router.get(
  '/my-payslips',
  authenticate,
  checkPermission(MODULES.PAYROLL.VIEW_OWN),
  payrollController.getMyPayslips
);

// View all payroll - payroll officer and admins
router.get(
  '/all',
  authenticate,
  checkPermission(MODULES.PAYROLL.VIEW_ALL),
  payrollController.getAllPayroll
);

// Process payroll - payroll officer only
router.post(
  '/process',
  authenticate,
  checkPermission(MODULES.PAYROLL.PROCESS),
  payrollController.processPayroll
);

// Manage salary structure - payroll officer
router.put(
  '/structure/:employeeId',
  authenticate,
  checkPermission(MODULES.PAYROLL.MANAGE_STRUCTURE),
  payrollController.updateSalaryStructure
);

// Generate reports - payroll officer
router.get(
  '/reports',
  authenticate,
  checkPermission(MODULES.PAYROLL.GENERATE_REPORTS),
  payrollController.generateReports
);

export default router;
```

## Frontend Component Examples

### Example 1: Employee List with Permissions

```jsx
// frontend/src/features/employees/EmployeeList.jsx
import React, { useState, useEffect } from 'react';
import { PermissionGate } from '@/components/common';
import { usePermissions } from '@/hooks';
import { MODULES } from '@/utils/rolePermissions';
import { Button } from '@/components/ui/button';
import { employeeService } from '@/services';

function EmployeeList() {
  const [employees, setEmployees] = useState([]);
  const { can } = usePermissions();

  useEffect(() => {
    loadEmployees();
  }, []);

  const loadEmployees = async () => {
    const data = await employeeService.getAll();
    setEmployees(data);
  };

  const handleDelete = async (id) => {
    if (confirm('Are you sure?')) {
      await employeeService.delete(id);
      loadEmployees();
    }
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Employees</h1>
        
        {/* Only show create button if user has permission */}
        <PermissionGate permission={MODULES.EMPLOYEE.CREATE}>
          <Button onClick={() => navigate('/employees/create')}>
            Create Employee
          </Button>
        </PermissionGate>
      </div>

      <div className="grid gap-4">
        {employees.map((employee) => (
          <div key={employee.id} className="border p-4 rounded">
            <h3>{employee.name}</h3>
            <p>{employee.email}</p>
            
            <div className="flex gap-2 mt-2">
              {/* Show edit button if user can update */}
              <PermissionGate 
                anyPermissions={[
                  MODULES.EMPLOYEE.UPDATE_ANY,
                  MODULES.EMPLOYEE.UPDATE_OWN,
                ]}
              >
                <Button 
                  variant="outline" 
                  onClick={() => navigate(`/employees/${employee.id}/edit`)}
                >
                  Edit
                </Button>
              </PermissionGate>

              {/* Show delete button only for HR Admin and SuperAdmin */}
              <PermissionGate permission={MODULES.EMPLOYEE.DELETE}>
                <Button 
                  variant="destructive" 
                  onClick={() => handleDelete(employee.id)}
                >
                  Delete
                </Button>
              </PermissionGate>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default EmployeeList;
```

### Example 2: Attendance Dashboard

```jsx
// frontend/src/features/attendance/AttendanceDashboard.jsx
import React from 'react';
import { PermissionGate, RoleGate } from '@/components/common';
import { usePermissions } from '@/hooks';
import { MODULES, ROLES } from '@/utils/rolePermissions';
import MyAttendance from './MyAttendance';
import TeamAttendance from './TeamAttendance';
import AllAttendance from './AllAttendance';
import AttendanceAnalytics from './AttendanceAnalytics';

function AttendanceDashboard() {
  const { can, is } = usePermissions();

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Attendance</h1>

      {/* All employees see their own attendance */}
      <PermissionGate permission={MODULES.ATTENDANCE.VIEW_OWN}>
        <MyAttendance />
      </PermissionGate>

      {/* Managers see team attendance */}
      <PermissionGate permission={MODULES.ATTENDANCE.VIEW_TEAM}>
        <div className="mt-6">
          <h2 className="text-xl font-semibold mb-4">Team Attendance</h2>
          <TeamAttendance />
        </div>
      </PermissionGate>

      {/* HR and admins see all attendance */}
      <PermissionGate permission={MODULES.ATTENDANCE.VIEW_ALL}>
        <div className="mt-6">
          <h2 className="text-xl font-semibold mb-4">All Employees</h2>
          <AllAttendance />
        </div>
      </PermissionGate>

      {/* Analytics for HR roles */}
      <PermissionGate permission={MODULES.ATTENDANCE.VIEW_ANALYTICS}>
        <div className="mt-6">
          <h2 className="text-xl font-semibold mb-4">Analytics</h2>
          <AttendanceAnalytics />
        </div>
      </PermissionGate>

      {/* Shift management for HR */}
      <PermissionGate permission={MODULES.ATTENDANCE.MANAGE_SHIFTS}>
        <div className="mt-6">
          <Button onClick={() => navigate('/attendance/shifts')}>
            Manage Shifts
          </Button>
        </div>
      </PermissionGate>
    </div>
  );
}

export default AttendanceDashboard;
```

### Example 3: Leave Management

```jsx
// frontend/src/features/leave/LeaveManagement.jsx
import React, { useState } from 'react';
import { PermissionGate } from '@/components/common';
import { usePermissions } from '@/hooks';
import { MODULES } from '@/utils/rolePermissions';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

function LeaveManagement() {
  const { can } = usePermissions();

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Leave Management</h1>

      <Tabs defaultValue="my-leave">
        <TabsList>
          {/* All employees can see their leave */}
          <TabsTrigger value="my-leave">My Leave</TabsTrigger>

          {/* Managers can see team leave */}
          {can.do(MODULES.LEAVE.VIEW_TEAM) && (
            <TabsTrigger value="team-leave">Team Leave</TabsTrigger>
          )}

          {/* HR can see all leave */}
          {can.do(MODULES.LEAVE.VIEW_ALL) && (
            <TabsTrigger value="all-leave">All Leave</TabsTrigger>
          )}

          {/* HR Admin can manage policies */}
          {can.do(MODULES.LEAVE.MANAGE_POLICIES) && (
            <TabsTrigger value="policies">Policies</TabsTrigger>
          )}
        </TabsList>

        <TabsContent value="my-leave">
          <MyLeave />
        </TabsContent>

        {can.do(MODULES.LEAVE.VIEW_TEAM) && (
          <TabsContent value="team-leave">
            <TeamLeave />
          </TabsContent>
        )}

        {can.do(MODULES.LEAVE.VIEW_ALL) && (
          <TabsContent value="all-leave">
            <AllLeave />
          </TabsContent>
        )}

        {can.do(MODULES.LEAVE.MANAGE_POLICIES) && (
          <TabsContent value="policies">
            <LeavePolicies />
          </TabsContent>
        )}
      </Tabs>
    </div>
  );
}

export default LeaveManagement;
```

### Example 4: Navigation Menu with Permissions

```jsx
// frontend/src/components/layout/Sidebar.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import { PermissionGate, RoleGate } from '@/components/common';
import { usePermissions } from '@/hooks';
import { MODULES, ROLES } from '@/utils/rolePermissions';

function Sidebar() {
  const { can, is } = usePermissions();

  return (
    <aside className="w-64 bg-gray-800 text-white">
      <nav className="p-4">
        <ul className="space-y-2">
          {/* Dashboard - everyone */}
          <li>
            <Link to="/dashboard">Dashboard</Link>
          </li>

          {/* My Profile - everyone */}
          <li>
            <Link to="/profile">My Profile</Link>
          </li>

          {/* Attendance */}
          <PermissionGate permission={MODULES.ATTENDANCE.VIEW_OWN}>
            <li>
              <Link to="/attendance">Attendance</Link>
            </li>
          </PermissionGate>

          {/* Leave */}
          <PermissionGate permission={MODULES.LEAVE.VIEW_OWN}>
            <li>
              <Link to="/leave">Leave</Link>
            </li>
          </PermissionGate>

          {/* Payroll */}
          <PermissionGate permission={MODULES.PAYROLL.VIEW_OWN}>
            <li>
              <Link to="/payroll">Payslips</Link>
            </li>
          </PermissionGate>

          {/* Employee Management - HR only */}
          <PermissionGate 
            anyPermissions={[
              MODULES.EMPLOYEE.VIEW_ALL,
              MODULES.EMPLOYEE.VIEW_TEAM,
            ]}
          >
            <li>
              <Link to="/employees">Employees</Link>
            </li>
          </PermissionGate>

          {/* Recruitment - HR only */}
          <PermissionGate permission={MODULES.RECRUITMENT.VIEW}>
            <li>
              <Link to="/recruitment">Recruitment</Link>
            </li>
          </PermissionGate>

          {/* Reports */}
          <PermissionGate 
            anyPermissions={[
              MODULES.REPORTS.VIEW_OWN,
              MODULES.REPORTS.VIEW_TEAM,
              MODULES.REPORTS.VIEW_ALL,
            ]}
          >
            <li>
              <Link to="/reports">Reports</Link>
            </li>
          </PermissionGate>

          {/* Admin Section */}
          <RoleGate roles={[ROLES.SUPER_ADMIN, ROLES.HR_ADMIN]}>
            <li className="mt-4 pt-4 border-t border-gray-700">
              <p className="text-xs uppercase text-gray-400 mb-2">Admin</p>
              <ul className="space-y-2">
                <li><Link to="/admin/users">Users</Link></li>
                <li><Link to="/admin/departments">Departments</Link></li>
                <li><Link to="/admin/settings">Settings</Link></li>
              </ul>
            </li>
          </RoleGate>

          {/* System Admin Section */}
          <RoleGate roles={ROLES.SUPER_ADMIN}>
            <li className="mt-4 pt-4 border-t border-gray-700">
              <p className="text-xs uppercase text-gray-400 mb-2">System</p>
              <ul className="space-y-2">
                <li><Link to="/system/config">Configuration</Link></li>
                <li><Link to="/system/audit">Audit Logs</Link></li>
                <li><Link to="/system/backup">Backup</Link></li>
              </ul>
            </li>
          </RoleGate>
        </ul>
      </nav>
    </aside>
  );
}

export default Sidebar;
```

### Example 5: Using usePermissions Hook

```jsx
// frontend/src/features/employees/EmployeeDetail.jsx
import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { usePermissions } from '@/hooks';
import { MODULES } from '@/utils/rolePermissions';
import { Button } from '@/components/ui/button';
import { employeeService } from '@/services';

function EmployeeDetail() {
  const { id } = useParams();
  const [employee, setEmployee] = useState(null);
  const { can, is, user } = usePermissions();

  useEffect(() => {
    loadEmployee();
  }, [id]);

  const loadEmployee = async () => {
    const data = await employeeService.getById(id);
    setEmployee(data);
  };

  // Check if user can edit this employee
  const canEdit = () => {
    // SuperAdmin and HR Admin can edit anyone
    if (can.do(MODULES.EMPLOYEE.UPDATE_ANY)) {
      return true;
    }

    // Employee can edit own profile
    if (can.do(MODULES.EMPLOYEE.UPDATE_OWN) && user.employeeId === id) {
      return true;
    }

    return false;
  };

  // Check if user can delete
  const canDelete = () => {
    return can.do(MODULES.EMPLOYEE.DELETE);
  };

  if (!employee) return <div>Loading...</div>;

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">{employee.name}</h1>
        
        <div className="flex gap-2">
          {canEdit() && (
            <Button onClick={() => navigate(`/employees/${id}/edit`)}>
              Edit
            </Button>
          )}

          {canDelete() && (
            <Button variant="destructive" onClick={handleDelete}>
              Delete
            </Button>
          )}
        </div>
      </div>

      <div className="grid gap-4">
        <div>
          <label className="font-semibold">Email:</label>
          <p>{employee.email}</p>
        </div>

        <div>
          <label className="font-semibold">Department:</label>
          <p>{employee.department}</p>
        </div>

        {/* Show salary only if user has permission */}
        {can.do(MODULES.PAYROLL.VIEW_ALL) && (
          <div>
            <label className="font-semibold">Salary:</label>
            <p>${employee.salary}</p>
          </div>
        )}

        {/* Show documents only if user has permission */}
        {can.doAny([
          MODULES.EMPLOYEE.MANAGE_DOCUMENTS,
          MODULES.EMPLOYEE.VIEW_DOCUMENTS,
        ]) && (
          <div>
            <label className="font-semibold">Documents:</label>
            <DocumentList employeeId={id} />
          </div>
        )}
      </div>
    </div>
  );
}

export default EmployeeDetail;
```

## Controller Examples with Permission Checks

### Example: Employee Controller

```javascript
// backend/src/controllers/employeeController.js
import { hasPermission, canAccessEmployee, MODULES, ROLES } from '../config/rolePermissions.js';
import Employee from '../models/Employee.js';

export const getEmployees = async (req, res) => {
  try {
    const { role, assignedDepartments, employeeId } = req.user;
    let query = {};

    // Apply role-based filtering
    if (role === ROLES.HR_MANAGER) {
      // HR Manager can only see employees in assigned departments
      if (!assignedDepartments || assignedDepartments.length === 0) {
        return res.status(403).json({
          success: false,
          error: {
            code: 'NO_DEPARTMENTS_ASSIGNED',
            message: 'You do not have any departments assigned.',
          },
        });
      }
      query['jobInfo.department'] = { $in: assignedDepartments };
    } else if (role === ROLES.EMPLOYEE) {
      // Employees can only see their own profile
      if (!employeeId) {
        return res.status(403).json({
          success: false,
          error: {
            code: 'NO_EMPLOYEE_PROFILE',
            message: 'You do not have an employee profile.',
          },
        });
      }
      query._id = employeeId;
    }
    // SuperAdmin, HR Admin, Payroll Officer can see all

    const employees = await Employee.find(query);

    res.json({
      success: true,
      data: employees,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: {
        code: 'SERVER_ERROR',
        message: error.message,
      },
    });
  }
};

export const updateEmployee = async (req, res) => {
  try {
    const { id } = req.params;
    const { role, employeeId, assignedDepartments } = req.user;

    // Find employee
    const employee = await Employee.findById(id);
    if (!employee) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'EMPLOYEE_NOT_FOUND',
          message: 'Employee not found.',
        },
      });
    }

    // Check if user can update this employee
    const canUpdate = canAccessEmployee(
      req.user,
      id,
      employee.jobInfo.department
    );

    if (!canUpdate) {
      return res.status(403).json({
        success: false,
        error: {
          code: 'FORBIDDEN',
          message: 'You do not have permission to update this employee.',
        },
      });
    }

    // Update employee
    Object.assign(employee, req.body);
    await employee.save();

    res.json({
      success: true,
      data: employee,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: {
        code: 'SERVER_ERROR',
        message: error.message,
      },
    });
  }
};
```

## Testing Examples

### Backend Permission Tests

```javascript
// backend/tests/permissions.test.js
import { hasPermission, hasAnyPermission, ROLES, MODULES } from '../src/config/rolePermissions.js';

describe('Role Permissions', () => {
  test('Employee can view own attendance', () => {
    expect(hasPermission(ROLES.EMPLOYEE, MODULES.ATTENDANCE.VIEW_OWN)).toBe(true);
  });

  test('Employee cannot view all attendance', () => {
    expect(hasPermission(ROLES.EMPLOYEE, MODULES.ATTENDANCE.VIEW_ALL)).toBe(false);
  });

  test('HR Manager can create employees', () => {
    expect(hasPermission(ROLES.HR_MANAGER, MODULES.EMPLOYEE.CREATE)).toBe(true);
  });

  test('Manager can approve team leave', () => {
    expect(hasPermission(ROLES.MANAGER, MODULES.LEAVE.APPROVE_TEAM)).toBe(true);
  });

  test('Payroll Officer can process payroll', () => {
    expect(hasPermission(ROLES.PAYROLL_OFFICER, MODULES.PAYROLL.PROCESS)).toBe(true);
  });

  test('SuperAdmin has all permissions', () => {
    expect(hasPermission(ROLES.SUPER_ADMIN, MODULES.SYSTEM.MANAGE_CONFIG)).toBe(true);
    expect(hasPermission(ROLES.SUPER_ADMIN, MODULES.USER.DELETE)).toBe(true);
  });
});
```

### Frontend Permission Tests

```javascript
// frontend/src/utils/__tests__/rolePermissions.test.js
import { hasPermission, ROLES, MODULES } from '../rolePermissions';

describe('Frontend Role Permissions', () => {
  test('Employee permissions', () => {
    expect(hasPermission(ROLES.EMPLOYEE, MODULES.ATTENDANCE.CLOCK_IN_OUT)).toBe(true);
    expect(hasPermission(ROLES.EMPLOYEE, MODULES.EMPLOYEE.CREATE)).toBe(false);
  });

  test('HR Manager permissions', () => {
    expect(hasPermission(ROLES.HR_MANAGER, MODULES.EMPLOYEE.CREATE)).toBe(true);
    expect(hasPermission(ROLES.HR_MANAGER, MODULES.ATTENDANCE.VIEW_ALL)).toBe(true);
  });

  test('Permission gate logic', () => {
    const userRole = ROLES.MANAGER;
    const canApproveLeave = hasPermission(userRole, MODULES.LEAVE.APPROVE_TEAM);
    expect(canApproveLeave).toBe(true);
  });
});
```

## Summary

This implementation provides:

1. **Granular Permissions**: Fine-grained control over features
2. **Role-Based Access**: Clear role definitions with specific permissions
3. **Department Scoping**: HR Managers limited to assigned departments
4. **Frontend Components**: Easy-to-use permission gates
5. **Backend Middleware**: Secure API endpoint protection
6. **Type Safety**: Consistent permission constants
7. **Maintainability**: Centralized permission configuration

Use these examples as templates for implementing RBAC throughout your HRM system.
