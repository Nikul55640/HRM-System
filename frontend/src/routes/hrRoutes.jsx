import { lazy } from "react";

const LeaveManagement = lazy(() =>
  import("../features/admin/LeaveManagement.jsx")
);
const AttendanceAdminList = lazy(() =>
  import("../features/hr/attendance/AttendanceAdminList")
);
const AttendanceAdminDetail = lazy(() =>
  import("../features/hr/attendance/AttendanceAdminDetail")
);

export const hrRoutes = [
  { path: "admin/attendance", element: AttendanceAdminList, roles: ["HR Administrator", "HR Manager", "SuperAdmin"] },
  { path: "admin/attendance/:id", element: AttendanceAdminDetail, roles: ["HR Administrator", "HR Manager", "SuperAdmin"] },
  { path: "admin/leave-requests", element: LeaveManagement, roles: ["HR Administrator", "HR Manager", "SuperAdmin"] },
];
