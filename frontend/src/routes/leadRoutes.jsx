import { lazy } from "react";

const LeadManagement = lazy(() =>
  import("../modules/leads/pages/LeadManagement")
);

export const leadRoutes = [
  {
    path: "admin/leads",
    element: <LeadManagement />,
    roles: ["SuperAdmin", "Admin", "HR Manager", "Manager"],
  },
];