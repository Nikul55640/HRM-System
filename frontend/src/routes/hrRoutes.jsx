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
    roles: ["HR Administrator", "HR Manager", "SuperAdmin"],
  },
  {
    path: "admin/attendance/:id",
    element: <AttendanceAdminDetail />,
    roles: ["HR Administrator", "HR Manager", "SuperAdmin"],
  },
  {
    path: "admin/leave-requests",
    element: <LeaveManagement />,
    roles: ["HR Administrator", "HR Manager", "SuperAdmin"],
  },
  {
    path: "hr/designations",
    element: <DesignationsPage />,
    roles: ["HR Administrator", "HR Manager", "SuperAdmin"],
  },
];
