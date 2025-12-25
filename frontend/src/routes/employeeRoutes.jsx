import { lazy } from "react";

const EmployeeList = lazy(() =>
  import("../modules/employees/pages/EmployeeList")
);
const EmployeeForm = lazy(() =>
  import("../modules/employees/pages/EmployeeForm")
);
const EmployeeProfile = lazy(() =>
  import("../modules/employees/pages/EmployeeProfile")
);
// EmployeeDirectory doesn't exist, using EmployeeList for directory functionality
// const EmployeeDirectory = lazy(() =>
//   import("../modules/employees/EmployeeDirectory")
// );

export const employeeRoutes = [
  {
    path: "employees",
    element: <EmployeeList />,
    roles: ["HR", "SuperAdmin"],
  },
  {
    path: "employees/new",
    element: <EmployeeForm />,
    roles: ["HR", "SuperAdmin"],
  },
  {
    path: "employees/:id",
    element: <EmployeeProfile />,
    roles: ["HR", "SuperAdmin"],
  },
  {
    path: "employees/:id/edit",
    element: <EmployeeForm />,
    roles: ["HR", "SuperAdmin"],
  },
  {
    path: "directory",
    element: <EmployeeList />, // Using EmployeeList for directory functionality
    roles: ["HR", "SuperAdmin"],
  },
];
