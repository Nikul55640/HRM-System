import { lazy } from "react";

// This file is now integrated into adminRoutes.jsx
// Keeping for backward compatibility but routes are handled in adminRoutes

const LeadManagement = lazy(() =>
  import("../modules/leads/pages/LeadManagement")
);

export const leadRoutes = [
  // This route is now handled in adminRoutes.jsx as /admin/leads
  // Keeping this for any legacy references
  {
    path: "leads",
    element: <LeadManagement />,
    roles: ["SuperAdmin", "HR"],
  },
];