import { lazy } from "react";

// Feature 8: Audit Log Management
const AuditLogsPage = lazy(() =>
  import("../modules/admin/pages/Dashboard/AuditLogsPage")
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
const LeaveBalancesPage = lazy(() => import("../modules/admin/pages/LeaveBalancesPage"));
const HRLeaveApprovals = lazy(() => import("../modules/leave/hr/HRLeaveApprovals"));

// Feature 4: Employee Management (Admin)
const EmployeeList = lazy(() => import("../modules/employees/pages/EmployeeList"));
const DepartmentsPage = lazy(() => import("../modules/admin/pages/DepartmentsPage"));
const EmployeeForm = lazy(() => import("../modules/employees/pages/EmployeeForm"));

// Feature 5: Lead Management (Admin)
const LeadManagement = lazy(() => import("../modules/leads/pages/LeadManagement"));

// Feature 6: Shift Management (Admin)
const ShiftManagement = lazy(() => import("../modules/attendance/admin/ShiftManagement"));

// Feature 7: Calendar & Events (Admin)
const HolidaysPage = lazy(() => import("../modules/admin/pages/Holidays/HolidaysPage"));
const EventsPage = lazy(() => import("../modules/admin/pages/EventsPage"));
const CalendarManagement = lazy(() => import("../modules/calendar/admin/CalendarManagement"))

// System Configuration
const UserManagement = lazy(() => import("../modules/organization/admin/UserManagement"));
const SystemConfig = lazy(() => import("../modules/organization/admin/SystemConfig"));

export const adminRoutes = [
  // Feature 4: Employee Management
  { path: "admin/employees", element: <EmployeeList />, roles: ["SuperAdmin", "HR"] },
  { path: "admin/departments", element: <DepartmentsPage />, roles: ["SuperAdmin", "HR"] },
  { path: "admin/employees/new", element: <EmployeeForm />, roles: ["SuperAdmin", "HR"] },
  
  // Feature 2: Attendance Management
  { path: "admin/attendance", element: <AttendanceAdminList />, roles: ["SuperAdmin", "HR"] },
  { path: "admin/attendance/corrections", element: <AttendanceCorrections />, roles: ["SuperAdmin", "HR"] },
  { path: "admin/attendance/live", element: <LiveAttendanceDashboard />, roles: ["SuperAdmin", "HR"] },
  { path: "admin/attendance/summary", element: <AttendanceSummaryPage />, roles: ["SuperAdmin", "HR"] },
  { path: "admin/attendance/dashboard", element: <AttendanceDashboard />, roles: ["SuperAdmin", "HR"] },
  { path: "admin/attendance/insights", element: <AttendanceInsights />, roles: ["SuperAdmin", "HR"] },
  
  // Feature 3: Leave Management
  { path: "admin/leave", element: <LeaveManagement />, roles: ["SuperAdmin", "HR"] },
  { path: "admin/leave-balances", element: <LeaveBalancesPage />, roles: ["SuperAdmin", "HR"] },
  { path: "admin/leave/approvals", element: <HRLeaveApprovals />, roles: ["SuperAdmin", "HR"] },
  
  // Feature 5: Lead Management
  { path: "admin/leads", element: <LeadManagement />, roles: ["SuperAdmin", "HR"] },
  
  // Feature 6: Shift Management
  { path: "admin/shifts", element: <ShiftManagement />, roles: ["SuperAdmin", "HR"] },
  
  // Feature 7: Calendar & Events
  { path: "admin/holidays", element: <HolidaysPage />, roles: ["SuperAdmin", "HR"] },
  { path: "admin/events", element: <EventsPage />, roles: ["SuperAdmin", "HR"] },
  { path: "admin/calendar/management", element: <CalendarManagement />, roles: ["SuperAdmin", "HR"] },
  
  // System Administration
  { path: "admin/users", element: <UserManagement />, roles: ["SuperAdmin"] },
  { path: "admin/system-policies", element: <SystemConfig />, roles: ["SuperAdmin"] },
  
  // Feature 8: Audit Log Management
  { path: "admin/audit-logs", element: <AuditLogsPage />, roles: ["SuperAdmin"] },
];
