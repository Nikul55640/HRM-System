import { lazy } from "react";

const Dashboard = lazy(() => import("../features/dashboard/Dashboard"));
const ManagerDashboard = lazy(() => import("../features/dashboard/ManagerDashboard"));

export const dashboardRoutes = [
  {
    path: "dashboard",
    element: Dashboard,
    label: "Dashboard",
    icon: "LayoutDashboard",
    group: "General",
    roles: ["Employee", "HR Administrator", "HR Manager", "SuperAdmin"],
    sidebar: true
  },
  {
    path: "manager-dashboard",
    element: ManagerDashboard,
    label: "Manager Dashboard",
    icon: "UserCog",
    group: "General",
    roles: ["HR Manager", "SuperAdmin"],
    sidebar: false // hide from sidebar (you already have a separate Manager Tools section)
  }
];
