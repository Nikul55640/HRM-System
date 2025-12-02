import { lazy } from "react";

const AuditLogsPage = lazy(() => import("../features/admin/AuditLogsPage"));
const AnnouncementsPage = lazy(() => import("../features/admin/AnnouncementsPage"));
const UserManagement = lazy(() => import("../components/admin/UserManagement"));
const SystemConfig = lazy(() => import("../components/admin/SystemConfig"));

export const adminRoutes = [
  { path: "announcements", element: AnnouncementsPage, roles: ["SuperAdmin"] },
  { path: "admin/logs", element: AuditLogsPage, roles: ["SuperAdmin"] },
  { path: "users", element: UserManagement, roles: ["SuperAdmin"] },
  { path: "settings", element: SystemConfig, roles: ["SuperAdmin"] },
];
