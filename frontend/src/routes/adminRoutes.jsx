import { lazy } from "react";

const AuditLogsPage = lazy(() =>
  import("../modules/admin/pages/Dashboard/AuditLogsPage")
);
const AnnouncementsPage = lazy(() =>
  import("../modules/admin/pages/Dashboard/AnnouncementsPage")
);
const AttendanceSettings = lazy(() =>
  import("../modules/attendance/admin/AttendanceSettings")
);
const LiveAttendanceDashboard = lazy(() =>
  import("../modules/attendance/admin/LiveAttendanceDashboard")
);
const UserManagement = lazy(() => import("../modules/organization/admin/UserManagement"));
const SystemConfig = lazy(() => import("../modules/organization/admin/SystemConfig"));
const LeaveTypesPage = lazy(() => import("../modules/admin/pages/LeaveTypes/LeaveTypesPage"));
const EmployeeManagementPage = lazy(() => import("../modules/admin/pages/EmployeeManagementPage"));
const LeaveApprovalsPage = lazy(() => import("../modules/admin/pages/LeaveApprovalsPage"));
const AttendanceAdminList = lazy(() => import("../modules/attendance/admin/AttendanceAdminList"));
const AttendanceCorrections = lazy(() => import("../modules/attendance/admin/AttendanceCorrections"));
const CalendarManagement = lazy(() => import("../modules/calendar/admin/CalendarManagement"));

export const adminRoutes = [
  { path: "announcements", element: <AnnouncementsPage />, roles: ["SuperAdmin"] },
  { path: "admin/logs", element: <AuditLogsPage />, roles: ["SuperAdmin"] },
  {
    path: "attendance-settings",
    element: <AttendanceSettings />,
    roles: ["SuperAdmin", "Admin", "HR", "HR Manager"],
  },
  {
    path: "admin/attendance",
    element: <AttendanceAdminList />,
    roles: ["SuperAdmin", "Admin", "HR", "HR Manager"],
  },
  {
    path: "admin/attendance/live",
    element: <LiveAttendanceDashboard />,
    roles: ["SuperAdmin", "Admin", "HR", "HR Manager"],
  },
  {
    path: "admin/attendance/corrections",
    element: <AttendanceCorrections />,
    roles: ["SuperAdmin", "Admin", "HR", "HR Manager"],
  },
  {
    path: "admin/leave-requests",
    element: <LeaveApprovalsPage />,
    roles: ["SuperAdmin", "Admin", "HR", "HR Manager"],
  },
  { path: "users", element: <UserManagement />, roles: ["SuperAdmin"] },
  { path: "settings", element: <SystemConfig />, roles: ["SuperAdmin"] },
  { path: "admin/leave-types", element: <LeaveTypesPage />, roles: ["SuperAdmin", "Admin", "HR", "HR Manager"] },
  {
    path: "admin/calendar",
    element: <CalendarManagement />,
    roles: ["SuperAdmin", "HR Administrator", "HR Manager"],
  },
];
