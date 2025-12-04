# RBAC System Architecture

## System Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                         HRM RBAC System                          │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  ┌──────────────┐      ┌──────────────┐      ┌──────────────┐  │
│  │   Frontend   │◄────►│   Backend    │◄────►│   Database   │  │
│  │              │      │              │      │              │  │
│  │ - Components │      │ - Middleware │      │ - User Model │  │
│  │ - Hooks      │      │ - Routes     │      │ - Employee   │  │
│  │ - Utils      │      │ - Controllers│      │ - Dept Model │  │
│  └──────────────┘      └──────────────┘      └──────────────┘  │
│                                                                   │
└─────────────────────────────────────────────────────────────────┘
```

## Role Hierarchy

```
                    ┌──────────────┐
                    │  SuperAdmin  │ (Full System Access)
                    └──────┬───────┘
                           │
        ┌──────────────────┼──────────────────┐
        │                  │                  │
   ┌────▼─────┐    ┌──────▼──────┐   ┌──────▼────────┐
   │ HR Admin │    │   Payroll   │   │  HR Manager   │
   │          │    │   Officer   │   │ (Dept Scoped) │
   └────┬─────┘    └─────────────┘   └──────┬────────┘
        │                                    │
        │                              ┌─────▼─────┐
        │                              │  Manager  │
        │                              └─────┬─────┘
        │                                    │
        └────────────────┬───────────────────┘
                         │
                    ┌────▼────┐
                    │Employee │
                    └─────────┘
```

## Permission Flow

### Backend Request Flow

```
┌─────────────┐
│   Client    │
│  (Browser)  │
└──────┬──────┘
       │ HTTP Request + JWT Token
       │
       ▼
┌─────────────────────────────────────────┐
│         Express Middleware Chain         │
├─────────────────────────────────────────┤
│                                          │
│  1. ┌──────────────────┐                │
│     │  authenticate()  │                │
│     │  - Verify JWT    │                │
│     │  - Extract user  │                │
│     │  - Set req.user  │                │
│     └────────┬─────────┘                │
│              │                           │
│              ▼                           │
│  2. ┌──────────────────┐                │
│     │checkPermission() │                │
│     │  - Check role    │                │
│     │  - Verify perm   │                │
│     │  - Allow/Deny    │                │
│     └────────┬─────────┘                │
│              │                           │
│              ▼                           │
│  3. ┌──────────────────┐                │
│     │   Controller     │                │
│     │  - Business logic│                │
│     │  - DB operations │                │
│     │  - Response      │                │
│     └────────┬─────────┘                │
│              │                           │
└──────────────┼───────────────────────────┘
               │
               ▼
         ┌──────────┐
         │ Response │
         └──────────┘
```

### Frontend Rendering Flow

```
┌─────────────────┐
│  React Component│
└────────┬────────┘
         │
         ▼
┌─────────────────────────────────┐
│      usePermissions Hook         │
│  - Get user from Redux store     │
│  - Get role from user            │
│  - Return permission checkers    │
└────────┬────────────────────────┘
         │
         ▼
┌─────────────────────────────────┐
│     Permission Check             │
│  can.do(MODULES.EMPLOYEE.CREATE) │
└────────┬────────────────────────┘
         │
    ┌────┴────┐
    │         │
    ▼         ▼
┌───────┐ ┌───────┐
│ TRUE  │ │ FALSE │
│ Render│ │ Hide  │
└───────┘ └───────┘
```

## Module Permission Structure

```
MODULES
├── ATTENDANCE
│   ├── VIEW_OWN
│   ├── VIEW_TEAM
│   ├── VIEW_ALL
│   ├── CLOCK_IN_OUT
│   ├── REQUEST_CORRECTION
│   ├── APPROVE_CORRECTION
│   ├── EDIT_ANY
│   ├── MANAGE_SHIFTS
│   ├── VIEW_ANALYTICS
│   └── APPROVE_OVERTIME
│
├── LEAVE
│   ├── VIEW_OWN
│   ├── VIEW_TEAM
│   ├── VIEW_ALL
│   ├── APPLY
│   ├── CANCEL_OWN
│   ├── APPROVE_TEAM
│   ├── APPROVE_ANY
│   ├── MANAGE_POLICIES
│   ├── MANAGE_BALANCE
│   └── VIEW_CALENDAR
│
├── PAYROLL
│   ├── VIEW_OWN
│   ├── VIEW_ALL
│   ├── PROCESS
│   ├── APPROVE
│   ├── MANAGE_STRUCTURE
│   ├── MANAGE_DEDUCTIONS
│   ├── GENERATE_REPORTS
│   └── MANAGE_REIMBURSEMENT
│
├── EMPLOYEE
│   ├── VIEW_OWN
│   ├── VIEW_TEAM
│   ├── VIEW_ALL
│   ├── CREATE
│   ├── UPDATE_OWN
│   ├── UPDATE_ANY
│   ├── DELETE
│   ├── MANAGE_DOCUMENTS
│   ├── VIEW_DOCUMENTS
│   ├── ONBOARD
│   └── OFFBOARD
│
└── ... (11 total modules)
```

## Role Permission Matrix

```
┌──────────────────┬──────────┬─────────┬────────────┬──────────┬─────────────┬────────────┐
│    Permission    │ Employee │ Manager │ HR Manager │ HR Admin │   Payroll   │ SuperAdmin │
├──────────────────┼──────────┼─────────┼────────────┼──────────┼─────────────┼────────────┤
│ View Own Data    │    ✓     │    ✓    │     ✓      │    ✓     │      ✓      │     ✓      │
│ View Team Data   │    ✗     │    ✓    │     ✓*     │    ✓     │      ✗      │     ✓      │
│ View All Data    │    ✗     │    ✗    │     ✓*     │    ✓     │      ✓      │     ✓      │
│ Create Employee  │    ✗     │    ✗    │     ✓*     │    ✓     │      ✗      │     ✓      │
│ Delete Employee  │    ✗     │    ✗    │     ✗      │    ✓     │      ✗      │     ✓      │
│ Process Payroll  │    ✗     │    ✗    │     ✗      │    ✗     │      ✓      │     ✓      │
│ Manage Users     │    ✗     │    ✗    │     ✗      │    ✓     │      ✗      │     ✓      │
│ System Config    │    ✗     │    ✗    │     ✗      │    ✗     │      ✗      │     ✓      │
└──────────────────┴──────────┴─────────┴────────────┴──────────┴─────────────┴────────────┘

* HR Manager: Limited to assigned departments only
```

## Department Scoping (HR Manager)

```
┌─────────────────────────────────────────────────────────┐
│                    Organization                          │
├─────────────────────────────────────────────────────────┤
│                                                           │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  │
│  │ Engineering  │  │   Marketing  │  │     Sales    │  │
│  │              │  │              │  │              │  │
│  │ - Dev Team   │  │ - Content    │  │ - Sales Team │  │
│  │ - QA Team    │  │ - Design     │  │ - Support    │  │
│  └──────────────┘  └──────────────┘  └──────────────┘  │
│         ▲                  ▲                             │
│         │                  │                             │
│         └──────────────────┘                             │
│                    │                                     │
│         ┌──────────▼──────────┐                         │
│         │   HR Manager        │                         │
│         │   (John Doe)        │                         │
│         │                     │                         │
│         │ Assigned Depts:     │                         │
│         │ - Engineering       │                         │
│         │ - Marketing         │                         │
│         │                     │                         │
│         │ ✓ Can access Eng    │                         │
│         │ ✓ Can access Mkt    │                         │
│         │ ✗ Cannot access Sales│                        │
│         └─────────────────────┘                         │
│                                                           │
└─────────────────────────────────────────────────────────┘
```

## Authentication & Authorization Flow

```
┌──────────────────────────────────────────────────────────────┐
│                      Login Process                            │
└──────────────────────────────────────────────────────────────┘

1. User Login
   ┌──────────┐
   │  Client  │──► POST /api/auth/login
   └──────────┘    { email, password }
                           │
                           ▼
                   ┌───────────────┐
                   │   Verify      │
                   │   Credentials │
                   └───────┬───────┘
                           │
                           ▼
                   ┌───────────────┐
                   │  Generate JWT │
                   │  with role    │
                   └───────┬───────┘
                           │
                           ▼
                   ┌───────────────┐
                   │  Return Token │
                   │  + User Data  │
                   └───────────────┘

2. Subsequent Requests
   ┌──────────┐
   │  Client  │──► GET /api/employees
   └──────────┘    Authorization: Bearer <token>
                           │
                           ▼
                   ┌───────────────┐
                   │  Verify Token │
                   │  Extract Role │
                   └───────┬───────┘
                           │
                           ▼
                   ┌───────────────┐
                   │ Check         │
                   │ Permission    │
                   └───────┬───────┘
                           │
                      ┌────┴────┐
                      │         │
                      ▼         ▼
                  ┌──────┐  ┌──────┐
                  │ Allow│  │ Deny │
                  │ 200  │  │ 403  │
                  └──────┘  └──────┘
```

## Component Architecture

### Backend Structure

```
backend/
├── src/
│   ├── config/
│   │   └── rolePermissions.js ◄─── Central RBAC Config
│   │
│   ├── middleware/
│   │   ├── authenticate.js ◄─────── JWT Verification
│   │   ├── authorize.js ◄────────── Role Check
│   │   └── checkPermission.js ◄─── Permission Check
│   │
│   ├── models/
│   │   ├── User.js ◄──────────────── role, assignedDepartments
│   │   └── Employee.js ◄───────────── department
│   │
│   ├── routes/
│   │   ├── employeeRoutes.js
│   │   ├── attendanceRoutes.js
│   │   └── leaveRoutes.js
│   │
│   └── controllers/
│       ├── employeeController.js
│       ├── attendanceController.js
│       └── leaveController.js
```

### Frontend Structure

```
frontend/
├── src/
│   ├── utils/
│   │   └── rolePermissions.js ◄─── Permission Utils
│   │
│   ├── hooks/
│   │   ├── useAuth.js ◄──────────── Auth Hook
│   │   └── usePermissions.js ◄──── Permission Hook
│   │
│   ├── components/
│   │   └── common/
│   │       ├── PermissionGate.jsx ◄─ Permission Component
│   │       └── RoleGate.jsx ◄─────── Role Component
│   │
│   ├── features/
│   │   ├── employees/
│   │   ├── attendance/
│   │   └── leave/
│   │
│   └── store/
│       └── slices/
│           └── authSlice.js ◄────── User State
```

## Data Flow Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                    User Authentication                       │
└─────────────────────────────────────────────────────────────┘

Login ──► JWT Token ──► Redux Store ──► Components
                │
                ├─► Contains:
                │   - id
                │   - email
                │   - role ◄────────────── Used for permissions
                │   - employeeId
                │   - assignedDepartments ◄─ Used for scoping
                │
                └─► Sent with every request
                    Authorization: Bearer <token>


┌─────────────────────────────────────────────────────────────┐
│                  Permission Checking                         │
└─────────────────────────────────────────────────────────────┘

Component
    │
    ├─► usePermissions()
    │       │
    │       ├─► Get user from Redux
    │       │
    │       ├─► Get role from user
    │       │
    │       └─► Check permission
    │               │
    │               ├─► hasPermission(role, permission)
    │               │       │
    │               │       └─► ROLE_PERMISSIONS[role].includes(permission)
    │               │
    │               └─► Return true/false
    │
    └─► Render based on result
```

## Security Layers

```
┌─────────────────────────────────────────────────────────────┐
│                     Security Layers                          │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  Layer 1: Authentication                                     │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ JWT Token Verification                               │   │
│  │ - Valid signature                                    │   │
│  │ - Not expired                                        │   │
│  │ - User exists and active                             │   │
│  └─────────────────────────────────────────────────────┘   │
│                          │                                   │
│                          ▼                                   │
│  Layer 2: Authorization (Role)                              │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ Role-Based Access Control                            │   │
│  │ - Check user role                                    │   │
│  │ - Verify role has access                             │   │
│  └─────────────────────────────────────────────────────┘   │
│                          │                                   │
│                          ▼                                   │
│  Layer 3: Authorization (Permission)                        │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ Permission-Based Access Control                      │   │
│  │ - Check specific permission                          │   │
│  │ - Verify role has permission                         │   │
│  └─────────────────────────────────────────────────────┘   │
│                          │                                   │
│                          ▼                                   │
│  Layer 4: Data Scoping                                      │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ Department/Resource Scoping                          │   │
│  │ - Check department access (HR Manager)               │   │
│  │ - Check resource ownership (Employee)                │   │
│  └─────────────────────────────────────────────────────┘   │
│                          │                                   │
│                          ▼                                   │
│  Layer 5: Business Logic                                    │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ Controller Logic                                     │   │
│  │ - Additional validation                              │   │
│  │ - Business rules                                     │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                               │
└─────────────────────────────────────────────────────────────┘
```

## Example: Employee Creation Flow

```
┌─────────────────────────────────────────────────────────────┐
│          Create Employee Request Flow                        │
└─────────────────────────────────────────────────────────────┘

Frontend:
┌──────────────────────────────────────────────────────┐
│ 1. User clicks "Create Employee" button              │
│    ┌────────────────────────────────────────┐       │
│    │ <PermissionGate                        │       │
│    │   permission={MODULES.EMPLOYEE.CREATE}>│       │
│    │   <Button>Create</Button>              │       │
│    │ </PermissionGate>                      │       │
│    └────────────────────────────────────────┘       │
│                     │                                 │
│                     ▼                                 │
│ 2. Check permission in frontend                      │
│    - hasPermission(user.role, MODULES.EMPLOYEE.CREATE)│
│    - If false, button is hidden                      │
│    - If true, button is shown                        │
│                     │                                 │
│                     ▼                                 │
│ 3. User fills form and submits                       │
│    POST /api/employees                               │
│    Authorization: Bearer <token>                     │
└──────────────────┬───────────────────────────────────┘
                   │
                   ▼
Backend:
┌──────────────────────────────────────────────────────┐
│ 4. authenticate() middleware                         │
│    - Verify JWT token                                │
│    - Extract user: { id, role, email, ... }         │
│    - Set req.user                                    │
│                     │                                 │
│                     ▼                                 │
│ 5. checkPermission(MODULES.EMPLOYEE.CREATE)         │
│    - Get role from req.user                          │
│    - Check: hasPermission(role, permission)          │
│    - If false, return 403 Forbidden                  │
│    - If true, continue                               │
│                     │                                 │
│                     ▼                                 │
│ 6. employeeController.createEmployee()              │
│    - Validate input                                  │
│    - Check department access (if HR Manager)         │
│    - Create employee in database                     │
│    - Log audit trail                                 │
│    - Return success response                         │
└──────────────────┬───────────────────────────────────┘
                   │
                   ▼
┌──────────────────────────────────────────────────────┐
│ 7. Response sent to frontend                         │
│    { success: true, data: { employee } }            │
└──────────────────────────────────────────────────────┘
```

## Permission Inheritance

```
SuperAdmin
    │
    ├─► Has ALL permissions
    │
    └─► Includes permissions from:
            ├─► HR Administrator
            │       │
            │       └─► Includes permissions from:
            │               └─► HR Manager
            │
            ├─► Payroll Officer
            │
            └─► Manager
                    │
                    └─► Includes permissions from:
                            └─► Employee
```

## Best Practices Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                    RBAC Best Practices                       │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  ✓ DO                              ✗ DON'T                  │
│  ────────────────────────────────────────────────────────   │
│                                                               │
│  Backend:                          Backend:                  │
│  • Always authenticate first       • Skip authentication     │
│  • Use permission middleware       • Hardcode role checks    │
│  • Check in controller too         • Trust frontend only     │
│  • Log permission checks           • Ignore audit logs       │
│                                                               │
│  Frontend:                         Frontend:                 │
│  • Use PermissionGate              • Hardcode role strings   │
│  • Use usePermissions hook         • Check roles manually    │
│  • Hide unauthorized UI            • Show disabled buttons   │
│  • Provide good UX                 • Show confusing errors   │
│                                                               │
│  General:                          General:                  │
│  • Use constants (ROLES, MODULES)  • Use string literals     │
│  • Document permissions            • Leave undocumented      │
│  • Test all roles                  • Test only happy path    │
│  • Follow least privilege          • Grant excessive access  │
│                                                               │
└─────────────────────────────────────────────────────────────┘
```

## Scalability Considerations

```
Current System:
┌────────────────────────────────────────┐
│ Static Role-Permission Mapping         │
│ - Defined in code                      │
│ - 6 predefined roles                   │
│ - 100+ permissions                     │
└────────────────────────────────────────┘

Future Enhancements:
┌────────────────────────────────────────┐
│ Dynamic Permission System              │
│ - Store in database                    │
│ - Custom role creation                 │
│ - Permission delegation                │
│ - Time-based permissions               │
│ - IP-based restrictions                │
└────────────────────────────────────────┘
```

## Summary

This RBAC system provides:

1. **Clear Role Hierarchy**: 6 well-defined roles
2. **Granular Permissions**: 100+ specific permissions
3. **Department Scoping**: HR Manager restrictions
4. **Security Layers**: Multiple validation points
5. **Easy Integration**: Simple APIs and components
6. **Scalability**: Ready for future enhancements

The architecture ensures security, maintainability, and excellent developer experience.
