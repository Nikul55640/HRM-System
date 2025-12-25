import { lazy } from "react";

// Feature 8: Audit Log Management
const AuditLogsPage = lazy(() =>
  import("../modules/admin/pages/Dashboard/AuditLogsPage")
);

// Feature 2: Attendance Management (Admin)
const AttendanceAdminList = lazy(() => import("../modules/attendance/admin/AttendanceAdminList"));
const AttendanceCorrections = lazy(() => import("../modules/attendance/admin/AttendanceCorrections"));

// Feature 3: Leave Management (Admin)
const LeaveApprovalsPage = lazy(() => import("../modules/admin/pages/LeaveApprovalsPage"));
const LeaveBalancesPage = lazy(() => import("../modules/admin/pages/LeaveBalancesPage"));

// Feature 4: Employee Management (Admin)
const EmployeeManagementPage = lazy(() => import("../modules/admin/pages/EmployeeManagementPage"));
const DepartmentsPage = lazy(() => import("../modules/admin/pages/DepartmentsPage"));

// Feature 5: Lead Management (Admin)
const LeadManagement = lazy(() => import("../modules/leads/pages/LeadManagement"));

// Feature 6: Shift Management (Admin)
const ShiftsPage = lazy(() => import("../modules/admin/pages/ShiftsPage"));

// Feature 7: Calendar & Events (Admin)
const HolidaysPage = lazy(() => import("../modules/admin/pages/Holidays/HolidaysPage"));
const EventsPage = lazy(() => import("../modules/admin/pages/EventsPage"));

// System Configuration
const UserManagement = lazy(() => import("../modules/organization/admin/UserManagement"));
const SystemConfig = lazy(() => import("../modules/organization/admin/SystemConfig"));

export const adminRoutes = [
  // Feature 4: Employee Management
  { path: "admin/employees", element: <EmployeeManagementPage />, roles: ["SuperAdmin", "HR"] },
  { path: "admin/departments", element: <DepartmentsPage />, roles: ["SuperAdmin", "HR"] },
  
  // Feature 2: Attendance Management
  { path: "admin/attendance", element: <AttendanceAdminList />, roles: ["SuperAdmin", "HR"] },
  { path: "admin/attendance/corrections", element: <AttendanceCorrections />, roles: ["SuperAdmin", "HR"] },
  
  // Feature 3: Leave Management
  { path: "admin/leave", element: <LeaveApprovalsPage />, roles: ["SuperAdmin", "HR"] },
  { path: "admin/leave-balances", element: <LeaveBalancesPage />, roles: ["SuperAdmin", "HR"] },
  
  // Feature 5: Lead Management
  { path: "admin/leads", element: <LeadManagement />, roles: ["SuperAdmin", "HR"] },
  
  // Feature 6: Shift Management
  { path: "admin/shifts", element: <ShiftsPage />, roles: ["SuperAdmin", "HR"] },
  
  // Feature 7: Calendar & Events
  { path: "admin/holidays", element: <HolidaysPage />, roles: ["SuperAdmin", "HR"] },
  { path: "admin/events", element: <EventsPage />, roles: ["SuperAdmin", "HR"] },
  
  // System Administration
  { path: "admin/users", element: <UserManagement />, roles: ["SuperAdmin"] },
  { path: "admin/system-policies", element: <SystemConfig />, roles: ["SuperAdmin"] },
  
  // Feature 8: Audit Log Management
  { path: "admin/audit-logs", element: <AuditLogsPage />, roles: ["SuperAdmin"] },
];
