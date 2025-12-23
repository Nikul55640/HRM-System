import { lazy } from "react";

// Manager routes will be handled through the existing modules
// Manager can access attendance and leave approval through their respective modules
const ManagerDashboard = lazy(() => import("../modules/employee/pages/Dashboard/EmployeeDashboard"));

export const managerRoutes = [
  // Dashboard is the primary manager interface
  { path: "manager", element: <ManagerDashboard />, roles: ["Manager", "HR Manager", "SuperAdmin"] },
];
