import { lazy } from "react";

// Feature 8: Audit Log Management
const AuditLogsPage = lazy(() =>
  import("../modules/admin/pages/Auditlogs/AuditLogsPage")
);

// Feature 2: Attendance Management (Admin)
const AttendanceAdminList = lazy(() => import("../modules/attendance/admin/AttendanceAdminList"));
const AttendanceCorrections = lazy(() => import("../modules/attendance/admin/AttendanceCorrections"));
const LiveAttendanceDashboard = lazy(() => import("../modules/attendance/admin/LiveAttendanceDashboard"));
const AttendanceSummaryPage = lazy(() => import("../modules/attendance/pages/AttendanceSummaryPage"));
const AttendanceDashboard = lazy(() => import("../modules/attendance/employee/AttendanceDashboard"));
const AttendanceInsights = lazy(() => import("../modules/attendance/employee/AttendanceInsights"));

// Feature 3: Leave Management (Admin)
const LeaveManagement = lazy(() => import("../modules/leave/hr/LeaveManagement"));
const LeaveBalancesPage = lazy(() => import("../modules/leave/Admin/LeaveBalancesPage"));
const HRLeaveApprovals = lazy(() => import("../modules/leave/hr/HRLeaveApprovals"));

// Feature 4: Employee Management (Admin)
const EmployeeList = lazy(() => import("../modules/employees/pages/EmployeeList"));
const DepartmentsPage = lazy(() => import("../modules/admin/pages/Departments/DepartmentsPage"));
const EmployeeForm = lazy(() => import("../modules/employees/pages/EmployeeForm"));

// Feature 5: Lead Management (Admin)
const LeadManagement = lazy(() => import("../modules/leads/pages/LeadManagement"));

// Feature 6: Shift Management (Admin)
const ShiftManagement = lazy(() => import("../modules/attendance/admin/ShiftManagement"));

// Feature 7: Calendar & Events (Admin)
const HolidaysPage = lazy(() => import("../modules/admin/pages/Holidays/HolidaysPage"));
const EventsPage = lazy(() => import("../modules/admin/pages/Events/EventsPage"));
const CalendarManagement = lazy(() => import("../modules/calendar/admin/CalendarManagement"))

// System Configuration
const UserManagement = lazy(() => import("../modules/organization/admin/UserManagement"));
const SystemConfig = lazy(() => import("../modules/organization/admin/SystemConfig"));

export const adminRoutes = [
  // Feature 4: Employee Management
  { path: "admin/employees", element: <EmployeeList />, roles: ["SuperAdmin", "HR Administrator", "HR Manager"] },
  { path: "admin/departments", element: <DepartmentsPage />, roles: ["SuperAdmin", "HR Administrator", "HR Manager"] },
  { path: "admin/employees/new", element: <EmployeeForm />, roles: ["SuperAdmin", "HR Administrator", "HR Manager"] },
  
  // Feature 2: Attendance Management
  { path: "admin/attendance", element: <AttendanceAdminList />, roles: ["SuperAdmin", "HR Administrator", "HR Manager"] },
  { path: "admin/attendance/corrections", element: <AttendanceCorrections />, roles: ["SuperAdmin", "HR Administrator", "HR Manager"] },
  { path: "admin/attendance/live", element: <LiveAttendanceDashboard />, roles: ["SuperAdmin", "HR Administrator", "HR Manager"] },
  { path: "admin/attendance/summary", element: <AttendanceSummaryPage />, roles: ["SuperAdmin", "HR Administrator", "HR Manager"] },
  { path: "admin/attendance/dashboard", element: <AttendanceDashboard />, roles: ["SuperAdmin", "HR Administrator", "HR Manager"] },
  { path: "admin/attendance/insights", element: <AttendanceInsights />, roles: ["SuperAdmin", "HR Administrator", "HR Manager"] },
  
  // Feature 3: Leave Management
  { path: "admin/leave", element: <LeaveManagement />, roles: ["SuperAdmin", "HR Administrator", "HR Manager"] },
  { path: "admin/leave-balances", element: <LeaveBalancesPage />, roles: ["SuperAdmin", "HR Administrator", "HR Manager"] },
  { path: "admin/leave/approvals", element: <HRLeaveApprovals />, roles: ["SuperAdmin", "HR Administrator", "HR Manager"] },
  
  // Feature 5: Lead Management
  { path: "admin/leads", element: <LeadManagement />, roles: ["SuperAdmin", "HR Administrator", "HR Manager"] },
  
  // Feature 6: Shift Management
  { path: "admin/shifts", element: <ShiftManagement />, roles: ["SuperAdmin", "HR Administrator", "HR Manager"] },
  
  // Feature 7: Calendar & Events
  { path: "admin/holidays", element: <HolidaysPage />, roles: ["SuperAdmin", "HR Administrator", "HR Manager"] },
  { path: "admin/events", element: <EventsPage />, roles: ["SuperAdmin", "HR Administrator", "HR Manager"] },
  { path: "admin/calendar/management", element: <CalendarManagement />, roles: ["SuperAdmin", "HR Administrator", "HR Manager"] },
  
  // System Administration
  { path: "admin/users", element: <UserManagement />, roles: ["SuperAdmin"] },
  { path: "admin/system-policies", element: <SystemConfig />, roles: ["SuperAdmin"] },
  
  // Feature 8: Audit Log Management
  { path: "admin/audit-logs", element: <AuditLogsPage />, roles: ["SuperAdmin"] },
];
