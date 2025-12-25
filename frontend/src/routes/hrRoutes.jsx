import { lazy } from "react";

const LeaveManagement = lazy(() =>
  import("../modules/leave/hr/LeaveManagement")
);
const AttendanceAdminList = lazy(() =>
  import("../modules/attendance/admin/AttendanceAdminList.jsx")
);
const AttendanceAdminDetail = lazy(() =>
  import("../modules/attendance/admin/AttendanceAdminDetail.jsx")
);
const DesignationsPage = lazy(() =>
  import("../modules/admin/pages/DesignationsPage")
);

export const hrRoutes = [
  {
    path: "admin/attendance",
    element: <AttendanceAdminList />,
    roles: ["HR", "SuperAdmin"],
  },
  {
    path: "admin/attendance/:id",
    element: <AttendanceAdminDetail />,
    roles: ["HR", "SuperAdmin"],
  },
  {
    path: "admin/leave-requests",
    element: <LeaveManagement />,
    roles: ["HR", "SuperAdmin"],
  },
  {
    path: "hr/designations",
    element: <DesignationsPage />,
    roles: ["HR", "SuperAdmin"],
  },
];
