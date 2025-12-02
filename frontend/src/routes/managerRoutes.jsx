import { lazy } from "react";

const ManagerApprovals = lazy(() => import("../features/manager/ManagerApprovals"));
const ManagerTeam = lazy(() => import("../features/manager/ManagerTeam"));
const ManagerReports = lazy(() => import("../features/manager/ManagerReports"));

export const managerRoutes = [
  { path: "manager/approvals", element: ManagerApprovals, roles: ["HR Manager", "SuperAdmin"] },
  { path: "manager/team", element: ManagerTeam, roles: ["HR Manager", "SuperAdmin"] },
  { path: "manager/reports", element: ManagerReports, roles: ["HR Manager", "SuperAdmin"] },
];
