import { lazy } from "react";

const PayrollDashboard = lazy(() =>
  import("../modules/payroll/admin/PayrollDashboard")
);
const PayrollEmployees = lazy(() =>
  import("../modules/payroll/admin/PayrollEmployees")
);
const PayrollStructures = lazy(() =>
  import("../modules/payroll/admin/PayrollStructures")
);
// const PayrollPayslips = lazy(() =>
//   import("../modules/payroll/admin/PayrollPayslips")
// );

export const payrollRoutes = [
  { path: "admin/payroll", element: <PayrollDashboard />, roles: ["SuperAdmin"] },
  {
    path: "admin/payroll/employees",
    element: <PayrollEmployees />,
    roles: ["SuperAdmin"],
  },
  {
    path: "admin/payroll/structures",
    element: <PayrollStructures />,
    roles: ["SuperAdmin"],
  },
  // { path: "admin/payroll/payslips", element: <PayrollPayslips />, roles: ["SuperAdmin"] },
];
