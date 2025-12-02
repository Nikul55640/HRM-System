import { lazy } from "react";

const PayrollDashboard = lazy(() => import("../features/payroll/PayrollDashboard"));
const PayrollEmployees = lazy(() => import("../features/payroll/PayrollEmployees"));
const PayrollStructures = lazy(() => import("../features/payroll/PayrollStructures"));
const PayrollPayslips = lazy(() => import("../features/payroll/PayrollPayslips"));

export const payrollRoutes = [
  { path: "payroll", element: PayrollDashboard, roles: ["SuperAdmin"] },
  { path: "payroll/employees", element: PayrollEmployees, roles: ["SuperAdmin"] },
  { path: "payroll/structures", element: PayrollStructures, roles: ["SuperAdmin"] },
  { path: "payroll/payslips", element: PayrollPayslips, roles: ["SuperAdmin"] },
];
