import { lazy } from "react";

const Dashboard = lazy(() =>
  import("../modules/employee/pages/Dashboard/Dashboard")
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
