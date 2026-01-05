import { lazy } from "react";

// Note: Organization routes have been consolidated into adminRoutes
// This file is kept for legacy compatibility

const PolicyPage = lazy(() =>
  import("../modules/organization/pages/PolicyPage")
);
const CompanyDocumentsPage = lazy(() =>
  import("../modules/organization/pages/CompanyDocumentsPage")
);

export const organizationRoutes = [
  // Organization routes are now consolidated into adminRoutes
  // This file is kept for legacy compatibility but routes are empty
];
