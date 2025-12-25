import { lazy } from "react";

// Feature 4: Employee Management (for HR/Admin access to employee records)
const EmployeeList = lazy(() =>
  import("../modules/employees/pages/EmployeeList")
);
const EmployeeForm = lazy(() =>
  import("../modules/employees/pages/EmployeeForm")
);
const EmployeeProfile = lazy(() =>
  import("../modules/employees/pages/EmployeeProfile")
);

export const employeeRoutes = [
  // These routes are for HR/Admin to manage employees, not employee self-service
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
];
