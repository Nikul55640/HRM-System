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
const LeaveBalanceRolloverPage = lazy(() => import("../modules/leave/Admin/LeaveBalanceRolloverPage"));

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
const SmartCalendarManagement = lazy(() => import("../modules/calendar/admin/SmartCalendarManagement"))

// Feature 9: Bank Details Verification (Admin)
const BankVerificationPage = lazy(() => import("../modules/admin/pages/BankVerification/BankVerificationPage"));

// System Configuration
const UserManagement = lazy(() => import("../modules/organization/admin/UserManagement"));
const SystemConfig = lazy(() => import("../modules/organization/admin/SystemConfig"));

export const adminRoutes = [
  // Employee Management
  { path: "/admin/employees", element: <EmployeeList />, roles: ["SuperAdmin", "HR"] },
  { path: "/admin/employees/new", element: <EmployeeForm />, roles: ["SuperAdmin", "HR"] },
  { path: "/admin/employees/:id", element: <EmployeeProfile />, roles: ["SuperAdmin", "HR"] },
  { path: "/admin/employees/:id/edit", element: <EmployeeForm />, roles: ["SuperAdmin", "HR"] },

  // Department Management
  { path: "/admin/departments", element: <DepartmentsPage />, roles: ["SuperAdmin", "HR"] },

  // Designation Management
  { path: "/admin/designations", element: <DesignationsPage />, roles: ["SuperAdmin", "HR"] },

  // Attendance Management
  { path: "/admin/attendance", element: <ManageAttendance />, roles: ["SuperAdmin", "HR"] },
  { path: "/admin/attendance/corrections", element: <AttendanceCorrections />, roles: ["SuperAdmin", "HR"] },
  { path: "/admin/attendance/live", element: <LiveAttendanceDashboard />, roles: ["SuperAdmin", "HR"] },

  // Leave Management
  { path: "/admin/leave", element: <LeaveManagement />, roles: ["SuperAdmin", "HR"] },
  { path: "/admin/leave-balances", element: <LeaveBalancesPage />, roles: ["SuperAdmin", "HR"] },
  { path: "/admin/leave-balance-rollover", element: <LeaveBalanceRolloverPage />, roles: ["SuperAdmin", "HR"] },

  // Lead Management
  { path: "/admin/leads", element: <LeadManagement />, roles: ["SuperAdmin", "HR"] },

  // Shift Management
  { path: "/admin/shifts", element: <ShiftManagement />, roles: ["SuperAdmin", "HR"] },

  // Calendar Management
  { path: "/admin/calendar/management", element: <CalendarManagement />, roles: ["SuperAdmin", "HR"] },
  { path: "/admin/calendar/smart", element: <SmartCalendarManagement />, roles: ["SuperAdmin", "HR"] },
  
  {
    path: "/admin/policies",
    element: <PolicyPage />,
    roles: ["SuperAdmin", "HR"],
  },
  {
    path: "/admin/documents",
    element: <CompanyDocumentsPage />,
    roles: ["SuperAdmin", "HR"],
  },

  // System Administration
  { path: "/admin/users", element: <UserManagement />, roles: ["SuperAdmin"] },
  { path: "/admin/system-policies", element: <SystemConfig />, roles: ["SuperAdmin"] },

  // Bank Details Verification
  { path: "/admin/bank-verification", element: <BankVerificationPage />, roles: ["SuperAdmin", "HR"] },

  // Audit Logs
  { path: "/admin/audit-logs", element: <AuditLogsPage />, roles: ["SuperAdmin"] },
];
