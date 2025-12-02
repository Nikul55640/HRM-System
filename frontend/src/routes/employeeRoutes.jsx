import { lazy } from "react";

const EmployeeList = lazy(() => import("../features/employees/EmployeeList"));
const EmployeeForm = lazy(() => import("../features/employees/EmployeeForm"));
const EmployeeProfile = lazy(() =>
  import("../features/employees/EmployeeProfile")
);
const EmployeeDirectory = lazy(() =>
  import("../features/employees/EmployeeDirectory")
);

export const employeeRoutes = [
  { path: "employees", element: EmployeeList, roles: ["HR Administrator", "HR Manager", "SuperAdmin"] },
  { path: "employees/new", element: EmployeeForm, roles: ["HR Administrator", "HR Manager", "SuperAdmin"] },
  { path: "employees/:id", element: EmployeeProfile, roles: ["HR Administrator", "HR Manager", "SuperAdmin"] },
  { path: "employees/:id/edit", element: EmployeeForm, roles: ["HR Administrator", "HR Manager", "SuperAdmin"] },
  { path: "directory", element: EmployeeDirectory, roles: ["HR Administrator", "HR Manager", "SuperAdmin"] },
];
