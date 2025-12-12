import { lazy } from "react";

const ManagerApprovals = lazy(() => import("../modules/manager/pages/Dashboard/ManagerApprovals"));
const ManagerTeam = lazy(() => import("../modules/manager/pages/Dashboard/ManagerTeam"));
const ManagerReports = lazy(() => import("../modules/manager/pages/Dashboard/ManagerReports"));

export const managerRoutes = [
  { path: "manager/approvals", element: ManagerApprovals, roles: ["HR Manager", "SuperAdmin"] },
  { path: "manager/team", element: ManagerTeam, roles: ["HR Manager", "SuperAdmin"] },
  { path: "manager/reports", element: ManagerReports, roles: ["HR Manager", "SuperAdmin"] },
];
