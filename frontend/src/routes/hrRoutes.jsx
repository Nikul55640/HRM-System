import { lazy } from "react";

const LeaveManagement = lazy(() =>
  import("../features/admin/dashboard/pages/LeaveManagement.jsx")
);
const AttendanceAdminList = lazy(() =>
  import("../features/admin/attendance/AttendanceAdminList.jsx")
);
const AttendanceAdminDetail = lazy(() =>
  import("../features/admin/attendance/AttendanceAdminDetail.jsx")
);

export const hrRoutes = [
  {
    path: "admin/attendance",
    element: AttendanceAdminList,
    roles: ["HR Administrator", "HR Manager", "SuperAdmin"],
  },
  {
    path: "admin/attendance/:id",
    element: AttendanceAdminDetail,
    roles: ["HR Administrator", "HR Manager", "SuperAdmin"],
  },
  {
    path: "admin/leave-requests",
    element: LeaveManagement,
    roles: ["HR Administrator", "HR Manager", "SuperAdmin"],
  },
];
