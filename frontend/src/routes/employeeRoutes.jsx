import { lazy } from "react";

const EmployeeList = lazy(() =>
  import("../features/admin/employees/pages/EmployeeList")
);
const EmployeeForm = lazy(() =>
  import("../features/admin/employees/pages/EmployeeForm")
);
const EmployeeProfile = lazy(() =>
  import("../features/admin/employees/pages/EmployeeProfile")
);
const EmployeeDirectory = lazy(() =>
  import("../features/admin/employees/EmployeeDirectory")
);

export const employeeRoutes = [
  {
    path: "employees",
    element: EmployeeList,
    roles: ["HR Administrator", "HR Manager", "SuperAdmin"],
  },
  {
    path: "employees/new",
    element: EmployeeForm,
    roles: ["HR Administrator", "HR Manager", "SuperAdmin"],
  },
  {
    path: "employees/:id",
    element: EmployeeProfile,
    roles: ["HR Administrator", "HR Manager", "SuperAdmin"],
  },
  {
    path: "employees/:id/edit",
    element: EmployeeForm,
    roles: ["HR Administrator", "HR Manager", "SuperAdmin"],
  },
  {
    path: "directory",
    element: EmployeeDirectory,
    roles: ["HR Administrator", "HR Manager", "SuperAdmin"],
  },
];
