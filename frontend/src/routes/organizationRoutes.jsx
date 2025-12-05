import { lazy } from "react";

const DepartmentPage = lazy(() =>
  import("../features/admin/organization/DepartmentPage")
);
const DesignationPage = lazy(() =>
  import("../features/admin/organization/DesignationPage")
);
const PolicyPage = lazy(() =>
  import("../features/admin/organization/PolicyPage")
);
const HolidayPage = lazy(() =>
  import("../features/admin/organization/HolidayPage")
);
const CompanyDocumentsPage = lazy(() =>
  import("../features/admin/organization/CompanyDocumentsPage")
);

export const organizationRoutes = [
  {
    path: "hr/departments",
    element: DepartmentPage,
    roles: ["HR Manager", "SuperAdmin"],
  },
  {
    path: "hr/designations",
    element: DesignationPage,
    roles: ["HR Manager", "SuperAdmin"],
  },
  {
    path: "hr/policies",
    element: PolicyPage,
    roles: ["HR Manager", "SuperAdmin"],
  },
  {
    path: "hr/holidays",
    element: HolidayPage,
    roles: ["HR Manager", "SuperAdmin"],
  },
  {
    path: "hr/documents",
    element: CompanyDocumentsPage,
    roles: ["HR Manager", "SuperAdmin"],
  },
];
