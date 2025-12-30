import { lazy } from "react";

const LeaveManagement = lazy(() =>
  import("../modules/leave/hr/LeaveManagement")
);
const ManageAttendance = lazy(() =>
  import("../modules/attendance/components/ManageAttendance")
);

const DesignationsPage = lazy(() =>
  import("../modules/admin/pages/Designations/DesignationsPage")
);

export const hrRoutes = [
  {
    path: "admin/attendance",
    element: <ManageAttendance />,
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
