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
  {
    path: "departments",
    element: <DepartmentPage />,
    roles: ["HR Administrator", "HR Manager", "SuperAdmin"],
  },
  
];
