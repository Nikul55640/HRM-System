import { lazy } from "react";

const DepartmentPage = lazy(() =>
  import("../modules/organization/pages/DepartmentPage")
);
const DesignationPage = lazy(() =>
  import("../modules/organization/pages/DesignationPage")
);
const PolicyPage = lazy(() =>
  import("../modules/organization/pages/PolicyPage")
);
const HolidayPage = lazy(() =>
  import("../modules/organization/pages/HolidayPage")
);
const CompanyDocumentsPage = lazy(() =>
  import("../modules/organization/pages/CompanyDocumentsPage")
);

export const organizationRoutes = [
  {
    path: "hr/departments",
    element: <DepartmentPage />,
    roles: ["HR", "SuperAdmin"],
  },
  {
    path: "hr/designations",
    element: <DesignationPage />,
    roles: ["HR", "SuperAdmin"],
  },
  {
    path: "hr/policies",
    element: <PolicyPage />,
    roles: ["HR", "SuperAdmin"],
  },
  {
    path: "hr/holidays",
    element: <HolidayPage />,
    roles: ["HR", "SuperAdmin"],
  },
  {
    path: "hr/documents",
    element: <CompanyDocumentsPage />,
    roles: ["HR", "SuperAdmin"],
  },
];
