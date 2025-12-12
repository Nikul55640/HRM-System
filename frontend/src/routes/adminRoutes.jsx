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

export const adminRoutes = [
  { path: "announcements", element: <AnnouncementsPage />, roles: ["SuperAdmin"] },
  { path: "admin/logs", element: <AuditLogsPage />, roles: ["SuperAdmin"] },
  {
    path: "attendance-settings",
    element: <AttendanceSettings />,
    roles: ["SuperAdmin", "Admin", "HR", "HR Manager"],
  },
  {
    path: "attendance/live",
    element: <LiveAttendanceDashboard />,
    roles: ["SuperAdmin", "Admin", "HR", "HR Manager"],
  },
  { path: "users", element: <UserManagement />, roles: ["SuperAdmin"] },
  { path: "settings", element: <SystemConfig />, roles: ["SuperAdmin"] },
];
