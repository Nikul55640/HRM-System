import { lazy } from "react";

const Dashboard = lazy(() =>
  import("../features/employee/dashboard/pages/Dashboard")
);

export const dashboardRoutes = [
  {
    path: "dashboard",
    element: Dashboard,
    label: "Dashboard",
    icon: "LayoutDashboard",
    group: "General",
    roles: ["Employee", "HR Administrator", "HR Manager", "SuperAdmin"],
    sidebar: true,
  },
];
