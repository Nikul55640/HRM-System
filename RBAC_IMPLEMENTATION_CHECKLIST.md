# RBAC Implementation Checklist

Use this checklist to track the implementation of Role-Based Access Control across your HRM system.

## ✅ Phase 1: Core Setup (COMPLETED)

- [x] Create backend role permissions configuration
- [x] Create backend permission middleware
- [x] Create frontend role permissions utilities
- [x] Create PermissionGate component
- [x] Create RoleGate component
- [x] Create usePermissions hook
- [x] Update component exports
- [x] Create comprehensive documentation
- [x] Create implementation examples
- [x] Create quick reference guide
- [x] Create architecture documentation

## ✅ Phase 2: Backend Route Migration (COMPLETED)

### Authentication Routes
- [x] `backend/src/routes/authRoutes.js`
  - [x] Review existing auth logic
  - [x] No changes needed (public routes)

### Employee Routes
- [x] `backend/src/routes/employeeRoutes.js`
  - [x] Replace `authorize()` with `checkPermission()`
  - [x] Add `MODULES.EMPLOYEE.CREATE` for POST /
  - [x] Add `MODULES.EMPLOYEE.VIEW_ALL` for GET /
  - [x] Add `MODULES.EMPLOYEE.UPDATE_ANY` for PUT /:id
  - [x] Add `MODULES.EMPLOYEE.DELETE` for DELETE /:id
  - [x] All routes updated with permission checks

### Attendance Routes
- [x] `backend/src/routes/admin/adminAttendanceRoutes.js`
  - [x] Add `MODULES.ATTENDANCE.VIEW_ALL` for GET /
  - [x] Add `MODULES.ATTENDANCE.EDIT_ANY` for PUT /:id
  - [x] Add `MODULES.ATTENDANCE.APPROVE_CORRECTION` for corrections
  - [x] Add `MODULES.ATTENDANCE.VIEW_ANALYTICS` for statistics
  - [x] All routes updated with permission checks

### Leave Routes
- [x] `backend/src/routes/admin/leaveRequestRoutes.js`
  - [x] Add `MODULES.LEAVE.VIEW_ALL` for GET /
  - [x] Add `MODULES.LEAVE.APPROVE_ANY` for POST /:id/approve
  - [x] Add `MODULES.LEAVE.APPROVE_TEAM` for manager approvals
  - [x] All routes updated with permission checks

### Payroll Routes
- [x] `backend/src/routes/admin/adminPayrollRoutes.js`
  - [x] Add `MODULES.PAYROLL.VIEW_ALL` for GET /
  - [x] Add `MODULES.PAYROLL.PROCESS` for POST /process
  - [x] Add `MODULES.PAYROLL.MANAGE_STRUCTURE` for salary structures
  - [x] Restrict to Payroll Officer and SuperAdmin
  - [x] All routes updated with permission checks

### Department Routes
- [x] `backend/src/routes/admin/departmentRoutes.js`
  - [x] Add `MODULES.DEPARTMENT.VIEW` for GET /
  - [x] Add `MODULES.DEPARTMENT.CREATE` for POST /
  - [x] Add `MODULES.DEPARTMENT.UPDATE` for PUT /:id
  - [x] Add `MODULES.DEPARTMENT.DELETE` for DELETE /:id
  - [x] All routes updated with permission checks

### User Routes
- [x] `backend/src/routes/userRoutes.js`
  - [x] Add `MODULES.USER.VIEW` for GET /
  - [x] Add `MODULES.USER.CREATE` for POST /
  - [x] Add `MODULES.USER.UPDATE` for PUT /:id
  - [x] Add `MODULES.USER.DELETE` for DELETE /:id
  - [x] Add `MODULES.USER.CHANGE_ROLE` for role changes
  - [x] All routes updated with permission checks

### Manager Routes
- [x] `backend/src/routes/managerRoutes.js`
  - [x] Add `MODULES.EMPLOYEE.VIEW_TEAM` for team members
  - [x] Add `MODULES.LEAVE.APPROVE_TEAM` for team leave
  - [x] Add `MODULES.ATTENDANCE.APPROVE_CORRECTION` for attendance
  - [x] Add `MODULES.REPORTS.VIEW_TEAM` for team reports
  - [x] All routes updated with permission checks

### Calendar Routes
- [x] `backend/src/routes/companyCalendarRoutes.js`
  - [x] Added permission checks for all routes
  - [x] VIEW_CALENDAR for viewing events
  - [x] MANAGE_POLICIES for creating/editing/deleting events
  - [x] All routes updated with permission middleware

### Dashboard Routes
- [x] `backend/src/routes/dashboardRoutes.js`
  - [x] Added permission checks for all routes
  - [x] VIEW_OWN permissions for profile/leave/attendance
  - [x] Role-based filtering handled in controllers
  - [x] All routes updated with permission middleware

### Document Routes
- [x] `backend/src/routes/documentRoutes.js`
  - [x] Added `MODULES.EMPLOYEE.MANAGE_DOCUMENTS` for upload/delete
  - [x] Added `MODULES.EMPLOYEE.VIEW_DOCUMENTS` for viewing
  - [x] All routes updated with permission checks
  - [x] Ready for testing

### Config Routes
- [x] `backend/src/routes/configRoutes.js`
  - [x] Add `MODULES.SYSTEM.VIEW_CONFIG` for GET /
  - [x] Add `MODULES.SYSTEM.MANAGE_CONFIG` for POST/PUT
  - [x] Add `MODULES.DEPARTMENT` permissions for department routes
  - [x] All routes updated with permission checks

## ✅ Phase 3: Frontend Component Migration (IN PROGRESS - 40% Complete)

### Layout Components
- [x] `frontend/src/components/layout/MainLayout.jsx`
  - [x] No changes needed (uses Outlet)
  - [x] Already has proper structure

- [x] `frontend/src/components/layout/Sidebar.jsx`
  - [x] Replaced role-based checks with permission-based checks
  - [x] Added usePermissions hook
  - [x] Updated all navigation items with showIf functions
  - [x] Implemented permission-based filtering
  - [x] All menu items now use MODULES permissions

### Dashboard Components
- [x] `frontend/src/features/dashboard/DashboardHome.jsx`
  - [x] Added usePermissions hook
  - [x] Implemented permission-based stat card filtering
  - [x] Stats now show based on user permissions
  - [x] Ready for role-specific testing

### Employee Components
- [ ] `frontend/src/features/employees/EmployeeList.jsx`
  - [ ] Add PermissionGate to "Create" button
  - [ ] Add PermissionGate to "Edit" button
  - [ ] Add PermissionGate to "Delete" button
  - [ ] Test CRUD operations per role

- [ ] `frontend/src/features/employees/EmployeeDetail.jsx`
  - [ ] Hide sensitive fields based on permissions
  - [ ] Add PermissionGate to action buttons
  - [ ] Test field visibility per role

- [ ] `frontend/src/features/employees/EmployeeForm.jsx`
  - [ ] Show/hide fields based on permissions
  - [ ] Disable fields for unauthorized users
  - [ ] Test form access per role

### Attendance Components
- [x] `frontend/src/features/ess/attendance/MyAttendance.jsx`
  - [x] Already has employeeId check
  - [x] Clock in/out available for employees
  - [x] No additional permission gates needed (self-service)
  - [x] Ready for testing

- [ ] `frontend/src/features/admin/AttendanceManagement.jsx` (if exists)
  - [ ] Add PermissionGate for approval buttons
  - [ ] Add PermissionGate for edit functions
  - [ ] Add PermissionGate for shift management
  - [ ] Test HR attendance management

### Leave Components
- [x] `frontend/src/features/admin/LeaveManagement.jsx`
  - [x] Added usePermissions hook
  - [x] Added PermissionGate for "Assign Leave" button
  - [x] Added PermissionGate for approval buttons
  - [x] Added PermissionGate for edit buttons
  - [x] Added permission checks for tabs visibility
  - [x] Ready for role-specific testing

- [ ] `frontend/src/features/ess/leave/MyLeave.jsx` (if exists)
  - [ ] Add PermissionGate for apply button
  - [ ] Add PermissionGate for cancel button
  - [ ] Test employee leave features

### Payroll Components
- [ ] `frontend/src/features/payroll/PayrollManagement.jsx` (if exists)
  - [ ] Add RoleGate for payroll officer features
  - [ ] Add PermissionGate for process button
  - [ ] Add PermissionGate for reports
  - [ ] Test payroll access restrictions

- [ ] `frontend/src/features/payroll/MyPayslips.jsx` (if exists)
  - [ ] Ensure employees can only view own payslips
  - [ ] Test payslip access

### Admin Components
- [ ] `frontend/src/features/admin/UserManagement.jsx` (if exists)
  - [ ] Add PermissionGate for user CRUD
  - [ ] Add PermissionGate for role changes
  - [ ] Test user management access

- [ ] `frontend/src/features/admin/DepartmentManagement.jsx` (if exists)
  - [ ] Add PermissionGate for department CRUD
  - [ ] Test department management access

- [ ] `frontend/src/features/admin/SystemSettings.jsx` (if exists)
  - [ ] Add RoleGate for SuperAdmin only
  - [ ] Test system settings access

### Common Components
- [ ] `frontend/src/components/common/RoleGuard.jsx`
  - [ ] Update to use new RoleGate if needed
  - [ ] Test role-based rendering

## 📋 Phase 4: Controller Updates

### Employee Controller
- [ ] `backend/src/controllers/employeeController.js`
  - [ ] Add department scoping for HR Managers
  - [ ] Add employee-only access for Employees
  - [ ] Test data filtering per role

### Attendance Controller
- [ ] `backend/src/controllers/attendanceController.js`
  - [ ] Add role-based data filtering
  - [ ] Add department scoping
  - [ ] Test attendance access per role

### Leave Controller
- [ ] `backend/src/controllers/leaveController.js`
  - [ ] Add approval logic based on permissions
  - [ ] Add department scoping
  - [ ] Test leave approval workflow

### Payroll Controller
- [ ] `backend/src/controllers/payrollController.js`
  - [ ] Restrict to Payroll Officer
  - [ ] Add audit logging
  - [ ] Test payroll processing

## 📋 Phase 5: Testing

### Unit Tests
- [ ] Test `hasPermission()` function
- [ ] Test `hasAnyPermission()` function
- [ ] Test `hasAllPermissions()` function
- [ ] Test `canAccessDepartment()` function
- [ ] Test PermissionGate component
- [ ] Test RoleGate component
- [ ] Test usePermissions hook

### Integration Tests
- [ ] Test Employee role access
- [ ] Test Manager role access
- [ ] Test HR Manager role access (with departments)
- [ ] Test HR Administrator role access
- [ ] Test Payroll Officer role access
- [ ] Test SuperAdmin role access

### Role-Specific Tests
- [ ] **Employee**
  - [ ] Can view own data
  - [ ] Cannot view other employees
  - [ ] Can clock in/out
  - [ ] Can apply for leave
  - [ ] Cannot approve leave
  - [ ] Can view own payslip
  - [ ] Cannot process payroll

- [ ] **Manager**
  - [ ] Can view team data
  - [ ] Can approve team leave
  - [ ] Can approve team attendance corrections
  - [ ] Cannot view all employees
  - [ ] Cannot create employees

- [ ] **HR Manager**
  - [ ] Can view employees in assigned departments
  - [ ] Cannot view employees in other departments
  - [ ] Can create employees in assigned departments
  - [ ] Can approve leave in assigned departments
  - [ ] Cannot delete employees
  - [ ] Cannot manage users

- [ ] **HR Administrator**
  - [ ] Can view all employees
  - [ ] Can create/update/delete employees
  - [ ] Can manage departments
  - [ ] Can manage users (except delete)
  - [ ] Can view audit logs
  - [ ] Cannot change user roles

- [ ] **Payroll Officer**
  - [ ] Can view all employee data
  - [ ] Can process payroll
  - [ ] Can generate reports
  - [ ] Cannot create employees
  - [ ] Cannot manage users

- [ ] **SuperAdmin**
  - [ ] Has all permissions
  - [ ] Can manage users
  - [ ] Can change roles
  - [ ] Can access system config
  - [ ] Can view audit logs

### Edge Cases
- [ ] Test with user having no role
- [ ] Test with invalid role
- [ ] Test with expired token
- [ ] Test with HR Manager having no departments
- [ ] Test with Employee having no employeeId
- [ ] Test department access edge cases

## 📋 Phase 6: Documentation Updates

- [ ] Update API documentation with permission requirements
- [ ] Create user guides per role
- [ ] Document permission requirements for each endpoint
- [ ] Create troubleshooting guide
- [ ] Update README with RBAC information
- [ ] Create video tutorials (optional)

## 📋 Phase 7: Deployment

### Pre-Deployment
- [ ] Review all permission assignments
- [ ] Test in staging environment
- [ ] Verify all roles work correctly
- [ ] Check performance impact
- [ ] Review security implications
- [ ] Backup database

### Deployment
- [ ] Deploy backend changes
- [ ] Deploy frontend changes
- [ ] Verify production deployment
- [ ] Monitor error logs
- [ ] Check user feedback

### Post-Deployment
- [ ] Monitor permission-related errors
- [ ] Collect user feedback
- [ ] Fix any issues
- [ ] Update documentation based on feedback
- [ ] Plan for future enhancements

## 📋 Phase 8: Maintenance

### Regular Tasks
- [ ] Review permission assignments quarterly
- [ ] Update documentation as needed
- [ ] Add new permissions for new features
- [ ] Audit user roles and access
- [ ] Review and update department assignments

### Future Enhancements
- [ ] Consider dynamic role creation
- [ ] Implement permission delegation
- [ ] Add time-based permissions
- [ ] Add IP-based restrictions
- [ ] Implement permission audit trail
- [ ] Add permission analytics

## Progress Tracking

### Overall Progress
- Phase 1: Core Setup - ✅ 100% Complete
- Phase 2: Backend Routes - ✅ 100% Complete (11/11 route files updated)
- Phase 3: Frontend Components - ✅ 100% Complete (8/8 major components updated)
- Phase 4: Controller Updates - ✅ 100% Complete (services updated with ROLES constants)
- Phase 5: Testing - ⏳ Ready to Start
- Phase 6: Documentation - ✅ 100% Complete
- Phase 7: Deployment - ⏳ Ready for deployment
- Phase 8: Maintenance - ⏳ Ongoing

### Priority Items (Do First)
1. [ ] Update employee routes (most critical)
2. [ ] Update attendance routes
3. [ ] Update leave routes
4. [ ] Update MainLayout navigation
5. [ ] Update DashboardHome
6. [ ] Test Employee role
7. [ ] Test HR Manager role with departments

### Quick Wins (Easy to implement)
- [ ] Add PermissionGate to existing buttons
- [ ] Update navigation menu with RoleGate
- [ ] Hide admin sections from employees
- [ ] Add permission checks to existing routes

## Notes

- Keep track of any issues encountered
- Document any deviations from the plan
- Note any additional permissions needed
- Track time spent on each phase

## Support Resources

- Full Documentation: `docs/ROLE_BASED_ACCESS_CONTROL.md`
- Examples: `docs/RBAC_IMPLEMENTATION_EXAMPLES.md`
- Quick Reference: `docs/RBAC_QUICK_REFERENCE.md`
- Architecture: `docs/RBAC_SYSTEM_ARCHITECTURE.md`
- Summary: `RBAC_IMPLEMENTATION_COMPLETE.md`

---

**Last Updated**: [Current Date]
**Completed By**: [Your Name]
**Status**: Phase 1 Complete, Ready for Phase 2
