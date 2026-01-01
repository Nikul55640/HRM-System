import { lazy } from "react";

const DepartmentPage = lazy(() =>
  import("../modules/organization/pages/DepartmentPage")
);
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
