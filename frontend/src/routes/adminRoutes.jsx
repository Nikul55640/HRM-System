import { lazy } from "react";

const AuditLogsPage = lazy(() =>
  import("../features/admin/dashboard/pages/AuditLogsPage")
);
const AnnouncementsPage = lazy(() =>
  import("../features/admin/dashboard/pages/AnnouncementsPage")
);
const AttendanceSettings = lazy(() =>
  import("../features/admin/dashboard/pages/AttendanceSettings")
);
const LiveAttendanceDashboard = lazy(() =>
  import("../features/admin/dashboard/LiveAttendanceDashboard")
);
const UserManagement = lazy(() => import("../components/admin/UserManagement"));
const SystemConfig = lazy(() => import("../components/admin/SystemConfig"));

export const adminRoutes = [
  { path: "announcements", element: AnnouncementsPage, roles: ["SuperAdmin"] },
  { path: "admin/logs", element: AuditLogsPage, roles: ["SuperAdmin"] },
  {
    path: "attendance-settings",
    element: AttendanceSettings,
    roles: ["SuperAdmin", "Admin", "HR", "HR Manager"],
  },
  {
    path: "attendance/live",
    element: LiveAttendanceDashboard,
    roles: ["SuperAdmin", "Admin", "HR", "HR Manager"],
  },
  { path: "users", element: UserManagement, roles: ["SuperAdmin"] },
  { path: "settings", element: SystemConfig, roles: ["SuperAdmin"] },
];
