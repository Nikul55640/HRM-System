# Import Path Fixes Summary

## Issues Found

### 1. Extra "ui" in shared/ui paths
Many files have `shared/ui/ui/component` instead of `shared/ui/component`

### 2. Wrong components/common paths  
Files importing from `components/common` should import from `shared/components`

## Files Fixed So Far
- ✅ `frontend/src/core/layout/Header.jsx` - Fixed Button and Icon imports
- ✅ `frontend/src/core/layout/Sidebar.jsx` - Fixed Icon import  
- ✅ `frontend/src/core/layout/Navbar.jsx` - Fixed Button and Icon imports
- ✅ `frontend/src/modules/manager/pages/Dashboard/ManagerTeam.jsx` - Fixed UI imports
- ✅ `frontend/src/modules/manager/pages/Dashboard/ManagerReports.jsx` - Fixed UI imports
- ✅ `frontend/src/modules/manager/pages/Dashboard/ManagerApprovals.jsx` - Fixed UI imports

## Remaining Files to Fix

### UI Path Issues (shared/ui/ui/ → shared/ui/)
- frontend/src/modules/organization/components/DesignationModal.jsx
- frontend/src/modules/organization/components/DocumentList.jsx  
- frontend/src/modules/organization/components/DocumentUpload.jsx
- frontend/src/modules/organization/components/HolidayModal.jsx
- frontend/src/modules/organization/components/HolidayTable.jsx
- frontend/src/modules/payroll/employee/PayslipDetail.jsx
- frontend/src/modules/organization/components/PolicyModal.jsx
- frontend/src/modules/organization/components/DepartmentModal.jsx
- frontend/src/modules/organization/components/PolicyTable.jsx
- frontend/src/modules/leave/employee/MyLeave.jsx
- frontend/src/modules/leave/hr/HRLeaveApprovals.jsx
- frontend/src/modules/leave/components/LeaveHistoryTable.jsx

### Components Path Issues (components/common → shared/components)
- frontend/src/routes/applyRoutes.jsx
- frontend/src/modules/payroll/employee/PayslipsPage.jsx
- frontend/src/modules/payroll/admin/PayrollDashboard.jsx
- frontend/src/modules/leave/employee/LeavePage.jsx
- frontend/src/modules/documents/components/DocumentsTab.jsx
- frontend/src/modules/employees/pages/EmployeeProfile.jsx
- frontend/src/modules/employees/pages/EmployeeForm.jsx
- frontend/src/modules/employees/pages/EmployeeList.jsx
- frontend/src/core/guards/ProtectedRoute.jsx
- frontend/src/modules/employees/components/ActivityTab.jsx
- frontend/src/modules/admin/pages/Dashboard/AdminDashboard.jsx

## Strategy
Due to the large number of files, I'll focus on the most critical ones that are likely causing build errors.