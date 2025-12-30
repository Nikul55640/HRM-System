import { lazy } from "react";

// Feature 8: Audit Log Management
const AuditLogsPage = lazy(() =>
  import("../modules/admin/pages/Auditlogs/AuditLogsPage")
);

// Feature 2: Attendance Management (Admin)
const AttendanceCorrections = lazy(() => import("../modules/attendance/admin/AttendanceCorrections"));
const LiveAttendanceDashboard = lazy(() => import("../modules/attendance/admin/LiveAttendanceDashboard"));
const ManageAttendance = lazy(() => import("../modules/attendance/components/ManageAttendance"));
const  PolicyPage = lazy(() => import("../modules/organization/pages/PolicyPage"));
const  CompanyDocumentsPage = lazy(() => import("../modules/organization/pages/CompanyDocumentsPage"));
// Feature 3: Leave Management (Admin)
const LeaveManagement = lazy(() => import("../modules/leave/hr/LeaveManagement"));
const LeaveBalancesPage = lazy(() => import("../modules/leave/Admin/LeaveBalancesPage"));

// Feature 4: Employee Management (Admin)
const EmployeeList = lazy(() => import("../modules/employees/pages/EmployeeList"));
const DepartmentsPage = lazy(() => import("../modules/admin/pages/Departments/DepartmentsPage"));
const EmployeeProfile = lazy(() => import("../modules/employees/pages/EmployeeProfile"));
const DesignationsPage = lazy(() => import("../modules/admin/pages/Designations/DesignationsPage"));
const EmployeeForm = lazy(() => import("../modules/employees/pages/EmployeeForm"));

// Feature 5: Lead Management (Admin)
const LeadManagement = lazy(() => import("../modules/leads/pages/LeadManagement"));

// Feature 6: Shift Management (Admin)
const ShiftManagement = lazy(() => import("../modules/Shift/admin/ShiftManagement"));

// Feature 7: Calendar & Events (Admin)
const CalendarManagement = lazy(() => import("../modules/calendar/admin/CalendarManagement"))

// System Configuration
const UserManagement = lazy(() => import("../modules/organization/admin/UserManagement"));
const SystemConfig = lazy(() => import("../modules/organization/admin/SystemConfig"));

export const adminRoutes = [
  // Employee Management
  { path: "admin/employees", element: <EmployeeList />, roles: ["SuperAdmin", "HR Administrator", "HR Manager"] },
  { path: "admin/employees/new", element: <EmployeeForm />, roles: ["SuperAdmin", "HR Administrator", "HR Manager"] },
{ path: "admin/employees/:id", element: <EmployeeProfile />, roles: ["SuperAdmin", "HR Administrator", "HR Manager"] },
{ path: "admin/employees/:id/edit", element: <EmployeeForm />, roles: ["SuperAdmin", "HR Administrator", "HR Manager"] },

  // Department Management
  { path: "admin/departments", element: <DepartmentsPage />, roles: ["SuperAdmin", "HR Administrator", "HR Manager"] },

  // Designation Management
  { path: "admin/designations", element: <DesignationsPage />, roles: ["SuperAdmin", "HR Administrator", "HR Manager"] },

  // Attendance Management
  { path: "admin/attendance", element: <ManageAttendance />, roles: ["SuperAdmin", "HR Administrator", "HR Manager"] },
  { path: "admin/attendance/manage", element: <ManageAttendance />, roles: ["SuperAdmin", "HR Administrator", "HR Manager"] },
  { path: "admin/attendance/corrections", element: <AttendanceCorrections />, roles: ["SuperAdmin", "HR Administrator", "HR Manager"] },
  { path: "admin/attendance/live", element: <LiveAttendanceDashboard />, roles: ["SuperAdmin", "HR Administrator", "HR Manager"] },

  // Leave Management
  { path: "admin/leave", element: <LeaveManagement />, roles: ["SuperAdmin", "HR Administrator", "HR Manager"] },
  { path: "admin/leave-balances", element: <LeaveBalancesPage />, roles: ["SuperAdmin", "HR Administrator", "HR Manager"] },

  // Lead Management
  { path: "admin/leads", element: <LeadManagement />, roles: ["SuperAdmin", "HR Administrator", "HR Manager"] },

  // Shift Management
  { path: "admin/shifts", element: <ShiftManagement />, roles: ["SuperAdmin", "HR Administrator", "HR Manager"] },

  // Calendar Management
  { path: "admin/calendar/management", element: <CalendarManagement />, roles: ["SuperAdmin", "HR Administrator", "HR Manager"] },
  
  {
    path: "admin/policies",
    element: <PolicyPage />,
    roles: ["HR Administrator", "HR Manager", "SuperAdmin"],
  },
  {
    path: "admin/documents",
    element: <CompanyDocumentsPage />,
    roles: ["HR Administrator", "HR Manager", "SuperAdmin"],
  },

  // System Administration
  { path: "users", element: <UserManagement />, roles: ["SuperAdmin"] },
  { path: "system-policies", element: <SystemConfig />, roles: ["SuperAdmin"] },

  // Audit Logs
  { path: "audit-logs", element: <AuditLogsPage />, roles: ["SuperAdmin"] },
];
